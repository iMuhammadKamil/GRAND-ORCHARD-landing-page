"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRoles, BedStatuses } from "@/lib/constants";

export async function createBuildingAction(prevState: any, formData: FormData) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN]);

    const branchId = formData.get("branchId") as string;
    const name = (formData.get("name") as string)?.trim();
    const gender = (formData.get("gender") as string) || "COED";
    const floorCount = Math.max(1, Math.min(20, parseInt(formData.get("floorCount") as string, 10) || 1));

    if (!name || !branchId) {
      return { error: "Building name and campus branch are required." };
    }

    await prisma.$transaction(async (tx) => {
      const building = await tx.building.create({
        data: {
          branchId,
          name,
          gender,
        },
      });

      // Automatically provision floors 1..floorCount
      for (let i = 1; i <= floorCount; i++) {
        await tx.floor.create({
          data: {
            buildingId: building.id,
            floorNumber: i,
          },
        });
      }
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create building." };
  }
}

export async function createRoomTypeAction(prevState: any, formData: FormData) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN]);

    const name = (formData.get("name") as string)?.trim();
    const capacity = parseInt(formData.get("capacity") as string, 10) || 1;
    const baseRent = parseFloat(formData.get("baseRent") as string) || 0;
    const depositAmount = parseFloat(formData.get("depositAmount") as string) || 0;
    const hasAC = formData.get("hasAC") === "on" || formData.get("hasAC") === "true";
    const hasAttachedBath =
      formData.get("hasAttachedBath") === "on" || formData.get("hasAttachedBath") === "true";

    if (!name) {
      return { error: "Room type name is required." };
    }

    if (capacity < 1 || capacity > 6) {
      return { error: "Capacity must be between 1 and 6 beds." };
    }

    await prisma.roomType.create({
      data: {
        name,
        capacity,
        baseRent,
        depositAmount,
        hasAC,
        hasAttachedBath,
      },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create room type." };
  }
}

export async function createRoomAction(prevState: any, formData: FormData) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

    const floorId = formData.get("floorId") as string;
    const roomTypeId = formData.get("roomTypeId") as string;
    const roomNumber = (formData.get("roomNumber") as string)?.trim();

    if (!floorId || !roomTypeId || !roomNumber) {
      return { error: "Floor, Room Type, and Room Number are required." };
    }

    // Check if room number already exists on this floor
    const existing = await prisma.room.findFirst({
      where: { floorId, roomNumber },
    });

    if (existing) {
      return { error: `Room "${roomNumber}" already exists on this floor.` };
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return { error: "Invalid Room Type selected." };
    }

    // Atomic room creation + automatic bed provisioning
    await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          floorId,
          roomTypeId,
          roomNumber,
        },
      });

      // Auto-provision beds A, B, C, D...
      const bedLetters = ["A", "B", "C", "D", "E", "F"];
      for (let i = 0; i < roomType.capacity; i++) {
        const letter = bedLetters[i] || `${i + 1}`;
        await tx.bed.create({
          data: {
            roomId: room.id,
            bedNumber: `Bed ${roomNumber}-${letter}`,
            status: BedStatuses.VACANT,
          },
        });
      }
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create room." };
  }
}

export async function updateBedStatusAction(
  bedId: string,
  newStatus: string
) {
  try {
    const user = await requireAuth();

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            resident: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!bed) {
      return { error: "Bed not found." };
    }

    // Guardrail: OCCUPIED beds cannot be manually altered without formal tenant offboarding
    if (bed.status === BedStatuses.OCCUPIED) {
      const tenantName = bed.allocations[0]?.resident?.user?.fullName || "a resident";
      return {
        error: `Bed is currently occupied by ${tenantName}. To change its status, please perform a tenant checkout or room swap in Tenant Lifecycle.`,
      };
    }

    // RBAC validation for status changes
    if (user.role === UserRoles.MAINTENANCE_STAFF) {
      if (bed.status === BedStatuses.MAINTENANCE && newStatus === BedStatuses.VACANT) {
        // Permitted: Maintenance staff finishing repairs
      } else {
        return {
          error: "Maintenance staff can only release serviced beds from MAINTENANCE to VACANT.",
        };
      }
    } else if (
      user.role !== UserRoles.SUPER_ADMIN &&
      user.role !== UserRoles.WARDEN
    ) {
      return { error: "You do not have permission to modify bed statuses." };
    }

    await prisma.bed.update({
      where: { id: bedId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update bed status." };
  }
}

export async function deleteRoomAction(roomId: string) {
  try {
    await requireAuth([UserRoles.SUPER_ADMIN]);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        beds: {
          include: {
            allocations: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!room) {
      return { error: "Room not found." };
    }

    const hasOccupiedBed = room.beds.some(
      (b) => b.status === BedStatuses.OCCUPIED || b.allocations.length > 0
    );

    if (hasOccupiedBed) {
      return {
        error: "Cannot delete a room that has active residents. Please relocate residents first.",
      };
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete room." };
  }
}

