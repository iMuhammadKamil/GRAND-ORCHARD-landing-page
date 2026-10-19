"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRoles, TicketStatuses, TicketCategories, TicketPriorities } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ---------------------------------------------------------------------------
// 1. CREATE MAINTENANCE TICKET (Resident)
// Smart auto-routes to a staff technician matching category department if available.
// ---------------------------------------------------------------------------
export async function createTicketAction(formData: FormData) {
  const user = await requireAuth([UserRoles.RESIDENT, UserRoles.WARDEN, UserRoles.SUPER_ADMIN]);

  const title = (formData.get("title") as string) || "";
  const category = (formData.get("category") as string) || TicketCategories.PLUMBING;
  const priority = (formData.get("priority") as string) || TicketPriorities.MEDIUM;
  const description = (formData.get("description") as string) || "";
  const photoFile = formData.get("photoFile") as File | null;

  if (!title.trim()) {
    return { success: false, message: "Please provide a summary title for the issue." };
  }

  if (!description.trim()) {
    return { success: false, message: "Please describe the problem in detail." };
  }

  // Determine resident profile
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
    // If Warden is creating ticket on behalf of a resident
    const targetResidentId = formData.get("residentId") as string;
    if (!targetResidentId) {
      return { success: false, message: "Please select a resident to file this ticket for." };
    }
    residentProfileId = targetResidentId;
  }

  // 1. Handle Photo Upload
  let photoUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    try {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "tickets");
      await mkdir(uploadsDir, { recursive: true });

      const safeName = `ticket_${Date.now()}_${path.extname(photoFile.name) || ".jpg"}`;
      const filePath = path.join(uploadsDir, safeName);
      await writeFile(filePath, buffer);
      photoUrl = `/uploads/tickets/${safeName}`;
    } catch (uploadErr) {
      console.error("Failed to save ticket photo attachment:", uploadErr);
    }
  }

  // 2. Smart Departmental Auto-Routing:
  // Look for a maintenance staff profile whose department matches the category
  const matchingStaff = await prisma.staffProfile.findFirst({
    where: {
      user: { role: UserRoles.MAINTENANCE_STAFF, isActive: true },
      department: category,
    },
  });

  const staffId = matchingStaff ? matchingStaff.id : null;
  const initialStatus = staffId ? TicketStatuses.ASSIGNED : TicketStatuses.OPEN;

  // 3. Create Ticket
  const createdTicket = await prisma.maintenanceTicket.create({
    data: {
      residentId: residentProfileId,
      staffId,
      category,
      priority,
      status: initialStatus,
      title: title.trim(),
      description: description.trim(),
      photoUrl,
    },
    include: {
      staff: { include: { user: true } },
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");

  const routeMsg = createdTicket.staff
    ? ` Automatically assigned to ${createdTicket.staff.user.fullName} (${category}).`
    : " Added to open queue for warden dispatch.";

  return {
    success: true,
    message: `Ticket #${createdTicket.id.slice(-6).toUpperCase()} logged successfully!${routeMsg}`,
    ticketId: createdTicket.id,
  };
}

// ---------------------------------------------------------------------------
// 2. UPDATE TICKET STATUS (Maintenance Staff & Wardens)
// Allows technician to transition status (IN_PROGRESS, RESOLVED).
// ---------------------------------------------------------------------------
export async function updateTicketStatusAction(data: {
  ticketId: string;
  status: string;
  notes?: string;
}) {
  const user = await requireAuth([
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.MAINTENANCE_STAFF,
  ]);

  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: data.ticketId },
    include: { staff: true },
  });

  if (!ticket) {
    return { success: false, message: "Ticket not found." };
  }

  // If maintenance staff is taking the ticket, claim it if not yet assigned
  let newStaffId = ticket.staffId;
  if (user.role === UserRoles.MAINTENANCE_STAFF && !ticket.staffId) {
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });
    if (staffProfile) newStaffId = staffProfile.id;
  }

  const resolvedAt = data.status === TicketStatuses.RESOLVED ? new Date() : ticket.resolvedAt;

  await prisma.maintenanceTicket.update({
    where: { id: data.ticketId },
    data: {
      status: data.status,
      staffId: newStaffId,
      resolvedAt,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Ticket status updated to ${data.status.replace("_", " ")}.`,
  };
}

// ---------------------------------------------------------------------------
// 3. REASSIGN TICKET (Warden / Super Admin)
// ---------------------------------------------------------------------------
export async function assignTicketStaffAction(ticketId: string, staffId: string) {
  await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

  const staff = await prisma.staffProfile.findUnique({
    where: { id: staffId },
    include: { user: true },
  });

  if (!staff) {
    return { success: false, message: "Staff member not found." };
  }

  await prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: {
      staffId,
      status: TicketStatuses.ASSIGNED,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Ticket assigned to ${staff.user.fullName} (${staff.department}).`,
  };
}

// ---------------------------------------------------------------------------
// 4. TWO-STEP RESIDENT RESOLUTION SIGN-OFF (Resident)
// Resident verifies repair and either confirms closure (CLOSED) or reopens.
// ---------------------------------------------------------------------------
export async function residentCloseTicketAction(data: {
  ticketId: string;
  isSatisfied: boolean;
  feedback?: string;
}) {
  const user = await requireAuth([UserRoles.RESIDENT]);

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: user.id },
  });

  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: data.ticketId },
  });

  if (!ticket) return { success: false, message: "Ticket not found." };
  if (!profile || ticket.residentId !== profile.id) {
    return { success: false, message: "Unauthorized to verify this ticket." };
  }

  if (data.isSatisfied) {
    await prisma.maintenanceTicket.update({
      where: { id: data.ticketId },
      data: { status: TicketStatuses.CLOSED },
    });
    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard");
    return { success: true, message: "Thank you! Ticket has been verified and marked as CLOSED." };
  } else {
    // Reopen ticket with resident notes
    const updatedDescription = data.feedback
      ? `${ticket.description}\n\n[Reopened by Resident]: ${data.feedback.trim()}`
      : ticket.description;

    await prisma.maintenanceTicket.update({
      where: { id: data.ticketId },
      data: {
        status: TicketStatuses.IN_PROGRESS,
        description: updatedDescription,
      },
    });
    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard");
    return { success: true, message: "Ticket has been reopened. Technician will revisit the issue." };
  }
}

