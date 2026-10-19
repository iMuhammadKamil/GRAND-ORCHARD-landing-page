"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRoles, InvoiceStatuses, InvoiceItemTypes, PaymentMethods } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ---------------------------------------------------------------------------
// 1. GENERATE MONTHLY BATCH INVOICES
// Generates rent invoices for all ACTIVE allocations for a given month/year.
// Includes deduplication check so duplicate bills are never generated.
// ---------------------------------------------------------------------------
export async function generateMonthlyBatchInvoicesAction(
  month: number, // 1 - 12
  year: number,
  dueDateString: string
) {
  const user = await requireAuth([
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.ACCOUNTANT,
  ]);

  const targetDate = new Date(Date.UTC(year, month - 1, 1));
  const dueDate = new Date(dueDateString);

  // 1. Find all active resident allocations
  const activeAllocations = await prisma.allocation.findMany({
    where: { status: "ACTIVE" },
    include: {
      resident: {
        include: { user: true },
      },
      bed: {
        include: {
          room: {
            include: {
              roomType: true,
              floor: { include: { building: true } },
            },
          },
        },
      },
    },
  });

  if (activeAllocations.length === 0) {
    return {
      success: false,
      message: "No active resident allocations found to generate invoices for.",
      count: 0,
    };
  }

  // 2. Fetch existing invoices for the target month to prevent duplicates
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const existingInvoices = await prisma.invoice.findMany({
    where: {
      billingMonth: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: { allocationId: true },
  });

  const existingAllocationIds = new Set(existingInvoices.map((inv) => inv.allocationId));

  // Filter allocations that do not yet have an invoice this month
  const eligibleAllocations = activeAllocations.filter(
    (alloc) => !existingAllocationIds.has(alloc.id)
  );

  if (eligibleAllocations.length === 0) {
    return {
      success: true,
      message: `All ${activeAllocations.length} active residents already have invoices generated for ${targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
      count: 0,
    };
  }

  // 3. Batch create invoices using a transaction
  let generatedCount = 0;
  const monthLabel = targetDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  await prisma.$transaction(async (tx) => {
    for (const alloc of eligibleAllocations) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-${year}${String(month).padStart(2, "0")}-${randomSuffix}`;
      const rentAmount = alloc.monthlyRent;

      await tx.invoice.create({
        data: {
          allocationId: alloc.id,
          invoiceNumber,
          billingMonth: targetDate,
          dueDate,
          subtotal: rentAmount,
          taxOrDiscount: 0,
          totalAmount: rentAmount,
          paidAmount: 0,
          status: InvoiceStatuses.ISSUED,
          items: {
            create: [
              {
                type: InvoiceItemTypes.RENT,
                description: `Monthly Room Rent - ${monthLabel} (Room ${alloc.bed.room.roomNumber}, Bed ${alloc.bed.bedNumber})`,
                amount: rentAmount,
              },
            ],
          },
        },
      });

      generatedCount++;
    }
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/residents");

  return {
    success: true,
    message: `Successfully generated ${generatedCount} invoice${generatedCount > 1 ? "s" : ""} for ${monthLabel}.`,
    count: generatedCount,
  };
}

// ---------------------------------------------------------------------------
// 2. CREATE AD-HOC INVOICE
// Allows accountants to create custom invoices with multiple custom line items
// (utilities, damages, late fines, custom charges).
// ---------------------------------------------------------------------------
export interface AdHocItemInput {
  type: string;
  description: string;
  amount: number;
}

export async function createAdHocInvoiceAction(data: {
  allocationId: string;
  dueDate: string;
  billingMonth: string;
  items: AdHocItemInput[];
}) {
  await requireAuth([
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.ACCOUNTANT,
  ]);

  if (!data.allocationId) {
    return { success: false, message: "Please select a resident allocation." };
  }

  if (!data.items || data.items.length === 0) {
    return { success: false, message: "At least one billing line item is required." };
  }

  const validItems = data.items.filter((item) => item.amount > 0 && item.description.trim());
  if (validItems.length === 0) {
    return { success: false, message: "Line items must have valid descriptions and amounts." };
  }

  const subtotal = validItems.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = subtotal;

  const now = new Date();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${randomSuffix}`;

  const created = await prisma.invoice.create({
    data: {
      allocationId: data.allocationId,
      invoiceNumber,
      billingMonth: new Date(data.billingMonth || now),
      dueDate: new Date(data.dueDate),
      subtotal,
      taxOrDiscount: 0,
      totalAmount,
      paidAmount: 0,
      status: InvoiceStatuses.ISSUED,
      items: {
        create: validItems.map((item) => ({
          type: item.type || InvoiceItemTypes.RENT,
          description: item.description.trim(),
          amount: item.amount,
        })),
      },
    },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Invoice ${created.invoiceNumber} created successfully.`,
    invoiceId: created.id,
  };
}

// ---------------------------------------------------------------------------
// 3. RECORD PAYMENT TRANSACTION
// Logs a payment (Cash, Bank Transfer, Card, UPI), handles optional receipt upload,
// updates paidAmount, and reconciles invoice status (PARTIALLY_PAID or PAID).
// ---------------------------------------------------------------------------
export async function recordPaymentAction(formData: FormData) {
  const user = await requireAuth([
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.ACCOUNTANT,
  ]);

  const invoiceId = formData.get("invoiceId") as string;
  const amountStr = formData.get("amount") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || PaymentMethods.CASH;
  const referenceCode = (formData.get("referenceCode") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const receiptFile = formData.get("receiptFile") as File | null;

  if (!invoiceId) {
    return { success: false, message: "Invoice ID is required." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Please provide a valid payment amount greater than 0." };
  }

  // 1. Fetch current invoice state
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) {
    return { success: false, message: "Invoice not found." };
  }

  const remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  if (amount > remainingBalance + 0.01) {
    return {
      success: false,
      message: `Payment amount ($${amount.toFixed(2)}) cannot exceed remaining dues ($${remainingBalance.toFixed(2)}).`,
    };
  }

  // 2. Handle optional receipt file upload
  let receiptUrl: string | null = null;
  if (receiptFile && receiptFile.size > 0) {
    try {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadsDir, { recursive: true });

      const safeName = `receipt_${invoice.invoiceNumber}_${Date.now()}${path.extname(receiptFile.name) || ".pdf"}`;
      const filePath = path.join(uploadsDir, safeName);
      await writeFile(filePath, buffer);
      receiptUrl = `/uploads/receipts/${safeName}`;
    } catch (uploadErr) {
      console.error("Failed to save receipt attachment:", uploadErr);
    }
  }

  // 3. Atomically create payment transaction and update invoice status
  await prisma.$transaction(async (tx) => {
    // Record payment entry
    await tx.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        amount,
        paymentMethod,
        status: "CONFIRMED",
        receiptUrl,
        referenceCode,
        notes,
        verifiedBy: user.fullName,
      },
    });

    const newPaidAmount = invoice.paidAmount + amount;
    const isFullyPaid = newPaidAmount >= invoice.totalAmount - 0.01;
    const newStatus = isFullyPaid
      ? InvoiceStatuses.PAID
      : InvoiceStatuses.PARTIALLY_PAID;

    // Update invoice record
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });
  });

  revalidatePath("/dashboard/billing");
  revalidatePath(`/dashboard/billing/${invoiceId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/residents");

  return {
    success: true,
    message: `Payment of $${amount.toFixed(2)} recorded successfully via ${paymentMethod.replace("_", " ")}.`,
  };
}

// ---------------------------------------------------------------------------
// 4. CANCEL / VOID INVOICE
// ---------------------------------------------------------------------------
export async function cancelInvoiceAction(invoiceId: string) {
  await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT]);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return { success: false, message: "Invoice not found." };
  }

  if (invoice.paidAmount > 0) {
    return {
      success: false,
      message: "Cannot cancel an invoice with payments already recorded against it.",
    };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: InvoiceStatuses.CANCELLED },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");

  return { success: true, message: `Invoice ${invoice.invoiceNumber} has been voided.` };
}

// ---------------------------------------------------------------------------
// 5. RESIDENT SUBMIT PAYMENT PROOF
// Allows residents to submit online/bank transfer slip for Accountant verification
// ---------------------------------------------------------------------------
export async function residentSubmitPaymentAction(formData: FormData) {
  const user = await requireAuth([UserRoles.RESIDENT]);

  const invoiceId = formData.get("invoiceId") as string;
  const amountStr = formData.get("amount") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || PaymentMethods.BANK_TRANSFER;
  const referenceCode = (formData.get("referenceCode") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const receiptFile = formData.get("receiptFile") as File | null;

  if (!invoiceId) {
    return { success: false, message: "Invoice ID is required." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Please enter a valid payment amount." };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      allocation: {
        include: { resident: true },
      },
    },
  });

  if (!invoice) {
    return { success: false, message: "Invoice not found." };
  }

  // Security check: resident can only pay for their own invoice
  if (invoice.allocation.resident.userId !== user.id) {
    return { success: false, message: "Unauthorized to pay for this invoice." };
  }

  let receiptUrl: string | null = null;
  if (receiptFile && receiptFile.size > 0) {
    try {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadsDir, { recursive: true });

      const safeName = `resident_${user.id}_${Date.now()}${path.extname(receiptFile.name) || ".pdf"}`;
      const filePath = path.join(uploadsDir, safeName);
      await writeFile(filePath, buffer);
      receiptUrl = `/uploads/receipts/${safeName}`;
    } catch (err) {
      console.error("Failed to upload resident receipt:", err);
    }
  }

  // Create payment transaction with status PENDING_VERIFICATION
  await prisma.paymentTransaction.create({
    data: {
      invoiceId: invoice.id,
      amount,
      paymentMethod,
      status: "PENDING_VERIFICATION",
      receiptUrl,
      referenceCode,
      notes,
    },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath(`/dashboard/billing/${invoiceId}`);

  return {
    success: true,
    message: "Payment receipt submitted successfully! It will be verified by the accounts team.",
  };
}

// ---------------------------------------------------------------------------
// 6. VERIFY / REJECT PAYMENT (Accountant)
// ---------------------------------------------------------------------------
export async function verifyPaymentAction(paymentId: string) {
  const user = await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT]);

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
    include: { invoice: true },
  });

  if (!payment) {
    return { success: false, message: "Payment transaction not found." };
  }

  if (payment.status === "CONFIRMED") {
    return { success: true, message: "Payment is already confirmed." };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Mark transaction as CONFIRMED
    await tx.paymentTransaction.update({
      where: { id: paymentId },
      data: {
        status: "CONFIRMED",
        verifiedBy: user.fullName,
      },
    });

    // 2. Recompute paidAmount on invoice
    const newPaidAmount = payment.invoice.paidAmount + payment.amount;
    const isFullyPaid = newPaidAmount >= payment.invoice.totalAmount - 0.01;

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? InvoiceStatuses.PAID : InvoiceStatuses.PARTIALLY_PAID,
      },
    });
  });

  revalidatePath("/dashboard/billing");
  revalidatePath(`/dashboard/billing/${payment.invoiceId}`);

  return { success: true, message: `Payment of $${payment.amount.toFixed(2)} confirmed.` };
}

export async function rejectPaymentAction(paymentId: string, reason: string) {
  const user = await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT]);

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    return { success: false, message: "Payment not found." };
  }

  await prisma.paymentTransaction.update({
    where: { id: paymentId },
    data: {
      status: "REJECTED",
      notes: reason ? `Rejected: ${reason}` : "Payment rejected by accounts",
      verifiedBy: user.fullName,
    },
  });

  revalidatePath("/dashboard/billing");
  return { success: true, message: "Payment submission marked as rejected." };
}

// ---------------------------------------------------------------------------
// 7. RECORD ROOM UTILITY METER & SPLIT CHARGES ACROSS OCCUPANTS
// ---------------------------------------------------------------------------
export async function recordRoomUtilityMeterAction(data: {
  roomId: string;
  previousUnits: number;
  currentUnits: number;
  ratePerUnit: number;
  dueDate: string;
}) {
  await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT, UserRoles.WARDEN]);

  if (data.currentUnits < data.previousUnits) {
    return { success: false, message: "Current units cannot be less than previous meter units." };
  }

  const unitsConsumed = data.currentUnits - data.previousUnits;
  const totalCost = unitsConsumed * data.ratePerUnit;

  // Find all active bed allocations in this room
  const activeAllocations = await prisma.allocation.findMany({
    where: {
      status: "ACTIVE",
      bed: { roomId: data.roomId },
    },
    include: {
      resident: { include: { user: true } },
      bed: { include: { room: true } },
    },
  });

  if (activeAllocations.length === 0) {
    return { success: false, message: "No active residents found in this room to bill." };
  }

  const splitCount = activeAllocations.length;
  const splitAmount = parseFloat((totalCost / splitCount).toFixed(2));

  await prisma.$transaction(async (tx) => {
    // 1. Record Utility Meter reading
    await tx.utilityMeterReading.create({
      data: {
        roomId: data.roomId,
        utilityType: "ELECTRICITY",
        billingPeriod: new Date(),
        previousUnits: data.previousUnits,
        currentUnits: data.currentUnits,
        unitsConsumed,
        ratePerUnit: data.ratePerUnit,
        totalCost,
        splitCount,
      },
    });

    // 2. Create sub-meter invoice for each occupant
    const now = new Date();
    for (const alloc of activeAllocations) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-UTIL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${randomSuffix}`;

      await tx.invoice.create({
        data: {
          allocationId: alloc.id,
          invoiceNumber,
          billingMonth: now,
          dueDate: new Date(data.dueDate),
          subtotal: splitAmount,
          taxOrDiscount: 0,
          totalAmount: splitAmount,
          paidAmount: 0,
          status: InvoiceStatuses.ISSUED,
          items: {
            create: [
              {
                type: InvoiceItemTypes.ELECTRICITY_SUBMETER,
                description: `Electricity Sub-Meter (${unitsConsumed} units @ $${data.ratePerUnit}/unit ÷ ${splitCount} occupants)`,
                amount: splitAmount,
              },
            ],
          },
        },
      });
    }
  });

  revalidatePath("/dashboard/billing");
  return {
    success: true,
    message: `Recorded ${unitsConsumed} units ($${totalCost.toFixed(2)}). Generated ${splitCount} utility bill(s) at $${splitAmount.toFixed(2)} each.`,
  };
}

// ---------------------------------------------------------------------------
// 8. APPLY LATE PENALTY (Accountant)
// ---------------------------------------------------------------------------
export async function applyLatePenaltyAction(invoiceId: string, penaltyAmount: number, reason?: string) {
  await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT]);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) return { success: false, message: "Invoice not found." };
  if (penaltyAmount <= 0) return { success: false, message: "Penalty amount must be greater than 0." };

  await prisma.$transaction(async (tx) => {
    // Add penalty item
    await tx.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        type: InvoiceItemTypes.LATE_PENALTY,
        description: reason || "Late Payment Administrative Penalty",
        amount: penaltyAmount,
      },
    });

    // Update invoice subtotal & total
    const newTotal = invoice.totalAmount + penaltyAmount;
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        subtotal: invoice.subtotal + penaltyAmount,
        totalAmount: newTotal,
        status: InvoiceStatuses.OVERDUE,
      },
    });
  });

  revalidatePath("/dashboard/billing");
  revalidatePath(`/dashboard/billing/${invoiceId}`);

  return { success: true, message: `Applied $${penaltyAmount.toFixed(2)} late penalty fee.` };
}


