"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  UserRoles,
  GatePassStatuses,
  GatePassTypes,
  STANDARD_CURFEW_HOUR,
  STANDARD_DAY_START_HOUR,
} from "@/lib/constants";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// 1. REQUEST GATE PASS (Resident or Warden on resident's behalf)
// ---------------------------------------------------------------------------
export async function requestGatePassAction(formData: FormData) {
  const user = await requireAuth([
    UserRoles.RESIDENT,
    UserRoles.WARDEN,
    UserRoles.SUPER_ADMIN,
  ]);

  const passType =
    (formData.get("passType") as string) || GatePassTypes.DAY_OUTING;
  const reasonText = (formData.get("reason") as string) || "";
  const destination = (formData.get("destination") as string) || "";
  const expectedOutStr = (formData.get("expectedOutTime") as string) || "";
  const expectedInStr = (formData.get("expectedInTime") as string) || "";

  if (!reasonText.trim()) {
    return { success: false, message: "Please specify a reason for leaving campus." };
  }

  if (!destination.trim()) {
    return { success: false, message: "Please provide your destination address or location." };
  }

  if (!expectedOutStr || !expectedInStr) {
    return { success: false, message: "Please specify both expected departure and return times." };
  }

  const expectedOutTime = new Date(expectedOutStr);
  const expectedInTime = new Date(expectedInStr);

  if (isNaN(expectedOutTime.getTime()) || isNaN(expectedInTime.getTime())) {
    return { success: false, message: "Invalid departure or return timestamp format." };
  }

  if (expectedInTime <= expectedOutTime) {
    return { success: false, message: "Return time must be after departure time." };
  }

  // Determine Resident Profile
  let residentProfileId: string | null = null;

  if (user.role === UserRoles.RESIDENT) {
    const profile = await prisma.residentProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return { success: false, message: "Resident profile not found." };
    }
    residentProfileId = profile.id;
  } else {
    const targetResidentId = formData.get("residentId") as string;
    if (!targetResidentId) {
      return { success: false, message: "Please select a resident for this gate pass." };
    }
    residentProfileId = targetResidentId;
  }

  // Check for existing active pass (PENDING, APPROVED, or CHECKED_OUT)
  const existingActivePass = await prisma.gatePass.findFirst({
    where: {
      residentId: residentProfileId,
      status: {
        in: [
          GatePassStatuses.PENDING,
          GatePassStatuses.APPROVED,
          GatePassStatuses.CHECKED_OUT,
          GatePassStatuses.OVERDUE,
        ],
      },
    },
  });

  if (existingActivePass) {
    return {
      success: false,
      message: `Resident already has an active gate pass (${existingActivePass.status}). Please conclude or cancel it first.`,
    };
  }

  // Determine auto-approval rule:
  // Day Outings returning same-day on or before 10:00 PM are auto-approved!
  let initialStatus: string = GatePassStatuses.PENDING;
  const isSameDay =
    expectedOutTime.getFullYear() === expectedInTime.getFullYear() &&
    expectedOutTime.getMonth() === expectedInTime.getMonth() &&
    expectedOutTime.getDate() === expectedInTime.getDate();

  const departureHour = expectedOutTime.getHours();
  const returnHour = expectedInTime.getHours();
  const returnMinutes = expectedInTime.getMinutes();

  const isWithinDaytime =
    departureHour >= STANDARD_DAY_START_HOUR &&
    (returnHour < STANDARD_CURFEW_HOUR ||
      (returnHour === STANDARD_CURFEW_HOUR && returnMinutes === 0));

  if (user.role === UserRoles.WARDEN || user.role === UserRoles.SUPER_ADMIN) {
    // Staff direct issuance
    initialStatus = GatePassStatuses.APPROVED;
  } else if (passType === GatePassTypes.DAY_OUTING && isSameDay && isWithinDaytime) {
    // Auto-approve Day Outing
    initialStatus = GatePassStatuses.APPROVED;
  } else {
    // Night Out or overnight pass requires Warden approval
    initialStatus = GatePassStatuses.PENDING;
  }

  // Compose formatted reason string with tag and destination
  const typeTag = passType === GatePassTypes.NIGHT_OUT ? "[NIGHT_OUT]" : "[DAY_OUTING]";
  const formattedReason = `${typeTag} ${reasonText.trim()} | Destination: ${destination.trim()}`;

  const staffProfile = user.staffProfile;

  const newPass = await prisma.gatePass.create({
    data: {
      residentId: residentProfileId,
      reason: formattedReason,
      expectedOutTime,
      expectedInTime,
      status: initialStatus,
      approvedById: initialStatus === GatePassStatuses.APPROVED && staffProfile ? staffProfile.id : null,
    },
  });

  revalidatePath("/dashboard/gate");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${residentProfileId}`);

  const approvalNote =
    initialStatus === GatePassStatuses.APPROVED
      ? "Pass has been automatically APPROVED. You may present your QR code at the gate."
      : "Night out request submitted. Waiting for Warden review and approval.";

  return {
    success: true,
    message: `Gate Pass #${newPass.id.slice(-6).toUpperCase()} created successfully. ${approvalNote}`,
    passId: newPass.id,
    status: initialStatus,
  };
}

// ---------------------------------------------------------------------------
// 2. REVIEW GATE PASS (Warden / Super Admin)
// ---------------------------------------------------------------------------
export async function reviewGatePassAction(
  passId: string,
  decision: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  const user = await requireAuth([UserRoles.WARDEN, UserRoles.SUPER_ADMIN]);

  const pass = await prisma.gatePass.findUnique({
    where: { id: passId },
    include: { resident: { include: { user: true } } },
  });

  if (!pass) {
    return { success: false, message: "Gate pass not found." };
  }

  if (pass.status !== GatePassStatuses.PENDING) {
    return { success: false, message: `Pass is already in ${pass.status} state.` };
  }

  let staffProfileId: string | null = null;
  if (user.staffProfile) {
    staffProfileId = user.staffProfile.id;
  } else {
    // Super admin fallback if no staffProfile
    const fallbackStaff = await prisma.staffProfile.findFirst();
    staffProfileId = fallbackStaff ? fallbackStaff.id : null;
  }

  let updatedReason = pass.reason;
  if (decision === "REJECTED" && rejectionReason?.trim()) {
    updatedReason = `${pass.reason} [Declined: ${rejectionReason.trim()}]`;
  }

  const updated = await prisma.gatePass.update({
    where: { id: passId },
    data: {
      status: decision === "APPROVED" ? GatePassStatuses.APPROVED : GatePassStatuses.REJECTED,
      approvedById: staffProfileId,
      reason: updatedReason,
    },
  });

  revalidatePath("/dashboard/gate");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${pass.residentId}`);

  return {
    success: true,
    message: `Pass for ${pass.resident.user.fullName} has been ${decision.toLowerCase()}.`,
  };
}

// ---------------------------------------------------------------------------
// 3. STAMP GATE EXIT (Security Guard / Warden)
// ---------------------------------------------------------------------------
export async function stampGateExitAction(passId: string) {
  const user = await requireAuth([
    UserRoles.WARDEN,
    UserRoles.SUPER_ADMIN,
    UserRoles.MAINTENANCE_STAFF,
  ]);

  const pass = await prisma.gatePass.findUnique({
    where: { id: passId },
    include: { resident: { include: { user: true } } },
  });

  if (!pass) {
    return { success: false, message: "Gate pass not found." };
  }

  if (pass.status !== GatePassStatuses.APPROVED) {
    return {
      success: false,
      message: `Only APPROVED passes can be checked out. Current status: ${pass.status}.`,
    };
  }

  const now = new Date();

  await prisma.gatePass.update({
    where: { id: passId },
    data: {
      actualOutTime: now,
      status: GatePassStatuses.CHECKED_OUT,
    },
  });

  revalidatePath("/dashboard/gate");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${pass.residentId}`);

  return {
    success: true,
    message: `Exit stamped for ${pass.resident.user.fullName} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
  };
}

// ---------------------------------------------------------------------------
// 4. STAMP GATE ENTRY / RETURN (Security Guard / Warden)
// ---------------------------------------------------------------------------
export async function stampGateEntryAction(passId: string, remarks?: string) {
  const user = await requireAuth([
    UserRoles.WARDEN,
    UserRoles.SUPER_ADMIN,
    UserRoles.MAINTENANCE_STAFF,
  ]);

  const pass = await prisma.gatePass.findUnique({
    where: { id: passId },
    include: { resident: { include: { user: true } } },
  });

  if (!pass) {
    return { success: false, message: "Gate pass not found." };
  }

  if (
    pass.status !== GatePassStatuses.CHECKED_OUT &&
    pass.status !== GatePassStatuses.OVERDUE
  ) {
    return {
      success: false,
      message: `Pass is not currently checked out (status: ${pass.status}).`,
    };
  }

  const now = new Date();
  const isLate = now > pass.expectedInTime;

  let updatedReason = pass.reason;
  if (remarks?.trim()) {
    updatedReason = `${pass.reason} [Entry Note: ${remarks.trim()}]`;
  } else if (isLate) {
    const diffMinutes = Math.round(
      (now.getTime() - pass.expectedInTime.getTime()) / (1000 * 60)
    );
    updatedReason = `${pass.reason} [Returned ${diffMinutes}m past curfew]`;
  }

  await prisma.gatePass.update({
    where: { id: passId },
    data: {
      actualInTime: now,
      status: GatePassStatuses.RETURNED,
      reason: updatedReason,
    },
  });

  revalidatePath("/dashboard/gate");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${pass.residentId}`);

  return {
    success: true,
    message: `Entry stamped for ${pass.resident.user.fullName} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.${isLate ? " (Flagged Late Return)" : ""}`,
  };
}

// ---------------------------------------------------------------------------
// 5. CANCEL PASS (Resident if still pending)
// ---------------------------------------------------------------------------
export async function cancelGatePassAction(passId: string) {
  const user = await requireAuth([
    UserRoles.RESIDENT,
    UserRoles.WARDEN,
    UserRoles.SUPER_ADMIN,
  ]);

  const pass = await prisma.gatePass.findUnique({
    where: { id: passId },
  });

  if (!pass) {
    return { success: false, message: "Pass not found." };
  }

  if (pass.status !== GatePassStatuses.PENDING && pass.status !== GatePassStatuses.APPROVED) {
    return {
      success: false,
      message: "Cannot cancel a pass that has already departed or concluded.",
    };
  }

  await prisma.gatePass.delete({
    where: { id: passId },
  });

  revalidatePath("/dashboard/gate");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${pass.residentId}`);

  return {
    success: true,
    message: "Gate pass cancelled successfully.",
  };
}
