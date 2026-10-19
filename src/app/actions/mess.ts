"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRoles, isMealLocked, REBATE_AMOUNT_PER_MEAL } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// 1. UPDATE MESS MENU (Staff)
// ---------------------------------------------------------------------------
export async function updateMessMenuAction(data: {
  dayOfWeek: number;
  mealType: string;
  itemsList: string;
}) {
  await requireAuth([UserRoles.SUPER_ADMIN, UserRoles.WARDEN]);

  if (!data.itemsList.trim()) {
    return { success: false, message: "Menu items description cannot be empty." };
  }

  const existing = await prisma.messMenu.findFirst({
    where: {
      dayOfWeek: data.dayOfWeek,
      mealType: data.mealType,
    },
  });

  if (existing) {
    await prisma.messMenu.update({
      where: { id: existing.id },
      data: { itemsList: data.itemsList.trim() },
    });
  } else {
    await prisma.messMenu.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        mealType: data.mealType,
        itemsList: data.itemsList.trim(),
      },
    });
  }

  revalidatePath("/dashboard/mess");
  revalidatePath("/dashboard");

  return { success: true, message: "Menu updated successfully!" };
}

// ---------------------------------------------------------------------------
// 2. TOGGLE MEAL OPT-OUT (Resident)
// ---------------------------------------------------------------------------
export async function toggleMealOptOutAction(data: {
  dateString: string; // YYYY-MM-DD
  mealType: string;
  isOptedOut: boolean;
}) {
  const user = await requireAuth([UserRoles.RESIDENT]);

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { success: false, message: "Resident profile not found." };
  }

  const [year, month, day] = data.dateString.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);

  // Check 2-hour cutoff enforcement
  if (isMealLocked(targetDate, data.mealType)) {
    return {
      success: false,
      message: `Kitchen preparation has locked for ${data.mealType.toLowerCase()} on this date. Opt-out must be submitted at least 2 hours before meal time.`,
    };
  }

  // Set date to midnight for unique constraint
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));

  const rebateCredit = data.isOptedOut ? REBATE_AMOUNT_PER_MEAL : 0.0;

  await prisma.messAttendance.upsert({
    where: {
      residentId_date_mealType: {
        residentId: profile.id,
        date: normalizedDate,
        mealType: data.mealType,
      },
    },
    create: {
      residentId: profile.id,
      date: normalizedDate,
      mealType: data.mealType,
      isOptedOut: data.isOptedOut,
      optedOutAt: data.isOptedOut ? new Date() : null,
      rebateCredit,
    },
    update: {
      isOptedOut: data.isOptedOut,
      optedOutAt: data.isOptedOut ? new Date() : null,
      rebateCredit,
    },
  });

  revalidatePath("/dashboard/mess");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: data.isOptedOut
      ? `Opted out of ${data.mealType}. A $${REBATE_AMOUNT_PER_MEAL.toFixed(2)} rebate has been credited to your dining balance.`
      : `Re-enrolled for ${data.mealType}. See you in the dining hall!`,
  };
}

// ---------------------------------------------------------------------------
// 3. BULK DAY OPT-OUT (Resident - e.g. weekend getaway)
// ---------------------------------------------------------------------------
export async function bulkDayOptOutAction(data: {
  dateString: string;
  isOptedOut: boolean;
}) {
  const user = await requireAuth([UserRoles.RESIDENT]);

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { success: false, message: "Resident profile not found." };
  }

  const [year, month, day] = data.dateString.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));

  const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"];
  let updatedCount = 0;

  for (const meal of mealTypes) {
    // Only update if not yet past the cutoff window
    if (!isMealLocked(targetDate, meal)) {
      const rebateCredit = data.isOptedOut ? REBATE_AMOUNT_PER_MEAL : 0.0;
      await prisma.messAttendance.upsert({
        where: {
          residentId_date_mealType: {
            residentId: profile.id,
            date: normalizedDate,
            mealType: meal,
          },
        },
        create: {
          residentId: profile.id,
          date: normalizedDate,
          mealType: meal,
          isOptedOut: data.isOptedOut,
          optedOutAt: data.isOptedOut ? new Date() : null,
          rebateCredit,
        },
        update: {
          isOptedOut: data.isOptedOut,
          optedOutAt: data.isOptedOut ? new Date() : null,
          rebateCredit,
        },
      });
      updatedCount++;
    }
  }

  revalidatePath("/dashboard/mess");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Updated ${updatedCount} meal(s) for ${data.dateString}.`,
  };
}
