"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { UserRoles, BedStatuses, AllocationStatuses } from "@/lib/constants";

// ---------------------------------------------------------------------------
// 1. ONBOARD RESIDENT — Atomic 3-step wizard submission
// ---------------------------------------------------------------------------
export async function onboardResidentAction(prevState: any, formData: FormData) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

    // Step 1 fields
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
    const password = (formData.get("password") as string) || "resident123";

    // Step 2 fields
    const gender = (formData.get("gender") as string) || "OTHER";
    const dob = formData.get("dob") as string;
    const idProofType = (formData.get("idProofType") as string) || "STUDENT_ID";
    const idProofNumber = (formData.get("idProofNumber") as string)?.trim();
    const emergencyName = (formData.get("emergencyName") as string)?.trim();
    const emergencyPhone = (formData.get("emergencyPhone") as string)?.trim();
    const emergencyRelation = (formData.get("emergencyRelation") as string)?.trim();
    const idProofFile = formData.get("idProofDocument") as File | null;

    // Step 3 fields
    const bedId = formData.get("bedId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string | null;

    // Validate required fields
    if (!fullName || !email || !bedId || !idProofNumber) {
      return { error: "Please complete all required fields across all steps." };
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: `An account with email "${email}" already exists.` };
    }

    // Handle KYC file upload
    let idProofDocumentPath: string | null = null;
    if (idProofFile && idProofFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");
      await mkdir(uploadDir, { recursive: true });
      const ext = idProofFile.name.split(".").pop() || "jpg";
      const safeEmail = email.replace(/[^a-z0-9]/gi, "_");
      const fileName = `${safeEmail}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await idProofFile.arrayBuffer());
      await writeFile(filePath, buffer);
      idProofDocumentPath = `/uploads/kyc/${fileName}`;
    }

    const passwordHash = await hashPassword(password);

    // Fetch bed to get room type rent/deposit
    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    if (!bed) {
      return { error: "Selected bed not found." };
    }

    // Atomic transaction: create user + profile + allocation + bed status update
    await prisma.$transaction(async (tx) => {
      // Re-verify bed is still VACANT inside transaction (concurrency guard)
      const freshBed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!freshBed || freshBed.status !== BedStatuses.VACANT) {
        throw new Error(
          `Bed "${bed.bedNumber}" is no longer available. Please select a different bed.`
        );
      }

      // Create user account
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          phoneNumber,
          role: UserRoles.RESIDENT,
          isActive: true,
        },
      });

      // Create resident profile
      const profile = await tx.residentProfile.create({
        data: {
          userId: user.id,
          gender,
          dob: dob ? new Date(dob) : null,
          idProofType,
          idProofNumber: idProofNumber || "",
          idProofDocument: idProofDocumentPath,
          emergencyName: emergencyName || "",
          emergencyPhone: emergencyPhone || "",
          emergencyRelation: emergencyRelation || "",
        },
      });

      // Create allocation
      await tx.allocation.create({
        data: {
          bedId,
          residentId: profile.id,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          monthlyRent: bed.room.roomType.baseRent,
          securityDeposit: bed.room.roomType.depositAmount,
          status: AllocationStatuses.ACTIVE,
          checkedInAt: new Date(),
        },
      });

      // Update bed status to OCCUPIED
      await tx.bed.update({
        where: { id: bedId },
        data: { status: BedStatuses.OCCUPIED },
      });
    });

    revalidatePath("/dashboard/residents");
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
  } catch (error: any) {
    return { error: error.message || "Failed to onboard resident. Please try again." };
  }

  redirect("/dashboard/residents");
}

// ---------------------------------------------------------------------------
// 2. SWAP ROOM — Atomic bed swap for existing resident
// ---------------------------------------------------------------------------
export async function swapResidentRoomAction(allocationId: string, targetBedId: string) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: {
        bed: true,
        resident: { include: { user: true } },
      },
    });

    if (!allocation || allocation.status !== AllocationStatuses.ACTIVE) {
      return { error: "Active allocation not found." };
    }

    const targetBed = await prisma.bed.findUnique({
      where: { id: targetBedId },
      include: { room: { include: { roomType: true, floor: { include: { building: true } } } } },
    });

    if (!targetBed) {
      return { error: "Target bed not found." };
    }

    const oldBedId = allocation.bedId;

    await prisma.$transaction(async (tx) => {
      // Re-verify target is still VACANT inside transaction
      const freshTarget = await tx.bed.findUnique({ where: { id: targetBedId } });
      if (!freshTarget || freshTarget.status !== BedStatuses.VACANT) {
        throw new Error(
          `${targetBed.bedNumber} is no longer available. Please select a different bed.`
        );
      }

      // Free the old bed
      await tx.bed.update({
        where: { id: oldBedId },
        data: { status: BedStatuses.VACANT },
      });

      // Occupy the new bed
      await tx.bed.update({
        where: { id: targetBedId },
        data: { status: BedStatuses.OCCUPIED },
      });

      // Update allocation to new bed and new rent
      await tx.allocation.update({
        where: { id: allocationId },
        data: {
          bedId: targetBedId,
          monthlyRent: targetBed.room.roomType.baseRent,
        },
      });
    });

    revalidatePath("/dashboard/residents");
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Room swap failed. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// 3. CHECKOUT RESIDENT — Checklist-driven offboarding with damage settlement
// ---------------------------------------------------------------------------
export async function checkoutResidentAction(
  allocationId: string,
  damageItems: Array<{ description: string; repairCost: number }>,
  checkoutNotes: string
) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: {
        bed: true,
        resident: { include: { user: true } },
        invoices: true,
        damageReports: true,
      },
    });

    if (!allocation || allocation.status !== AllocationStatuses.ACTIVE) {
      return { error: "Active allocation not found for this resident." };
    }

    // Calculate outstanding invoice balance
    const outstandingBalance = allocation.invoices.reduce((sum, inv) => {
      if (inv.status !== "PAID" && inv.status !== "CANCELLED") {
        return sum + (inv.totalAmount - inv.paidAmount);
      }
      return sum;
    }, 0);

    // Sum damage repair costs
    const totalDamageCost = damageItems.reduce((sum, item) => sum + item.repairCost, 0);

    // Calculate settlement
    const depositPaid = allocation.securityDeposit;
    const totalDeductions = outstandingBalance + totalDamageCost;
    const refundAmount = Math.max(0, depositPaid - totalDeductions);
    const amountDue = Math.max(0, totalDeductions - depositPaid);

    await prisma.$transaction(async (tx) => {
      // Create damage reports
      for (const item of damageItems) {
        if (item.description.trim() && item.repairCost > 0) {
          await tx.damageReport.create({
            data: {
              allocationId,
              itemDamaged: item.description,
              repairCost: item.repairCost,
              notes: checkoutNotes || null,
            },
          });
        }
      }

      // Mark allocation as completed
      await tx.allocation.update({
        where: { id: allocationId },
        data: {
          status: AllocationStatuses.COMPLETED,
          checkedOutAt: new Date(),
          endDate: new Date(),
        },
      });

      // Release bed back to VACANT
      await tx.bed.update({
        where: { id: allocation.bedId },
        data: { status: BedStatuses.VACANT },
      });
    });

    revalidatePath("/dashboard/residents");
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");

    return {
      success: true,
      settlement: {
        depositPaid,
        outstandingBalance,
        totalDamageCost,
        totalDeductions,
        refundAmount,
        amountDue,
      },
    };
  } catch (error: any) {
    return { error: error.message || "Checkout failed. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// 4. GET AVAILABLE BEDS FOR GENDER — Used by the smart bed picker
// ---------------------------------------------------------------------------
export async function getAvailableBedsForGender(gender: string) {
  // Buildings that are compatible: exact match OR COED
  const buildings = await prisma.building.findMany({
    where: {
      OR: [{ gender }, { gender: "COED" }],
    },
    include: {
      floors: {
        orderBy: { floorNumber: "asc" },
        include: {
          rooms: {
            orderBy: { roomNumber: "asc" },
            include: {
              roomType: true,
              // Fetch ALL beds so we can:
              //  - show VACANT ones for selection
              //  - extract roommates from OCCUPIED beds' active allocations
              beds: {
                orderBy: { bedNumber: "asc" },
                include: {
                  allocations: {
                    where: { status: AllocationStatuses.ACTIVE },
                    include: {
                      resident: {
                        include: { user: { select: { fullName: true } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return buildings;
}
