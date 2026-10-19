import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRoles, isMealLocked } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import { MealOptOutCard } from "@/components/mess/MealOptOutCard";
import { KitchenHeadcountGauge } from "@/components/mess/KitchenHeadcountGauge";
import { FoodWasteSavingsCard } from "@/components/mess/FoodWasteSavingsCard";
import { MessHeaderActions } from "@/components/mess/MessHeaderActions";
import { UtensilsCrossed, Calendar, Sparkles, DollarSign } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEAL_TIMES: Record<string, string> = {
  BREAKFAST: "8:00 AM - 10:00 AM",
  LUNCH: "12:30 PM - 2:30 PM",
  DINNER: "7:30 PM - 9:30 PM",
};

export default async function MessPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isResident = user.role === UserRoles.RESIDENT;
  const canManageMess = [
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.ACCOUNTANT,
  ].includes(user.role as any);

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const todayDateString = now.toISOString().split("T")[0];

  // Midnight UTC for database querying
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  // 1. Fetch Weekly Menus
  const weeklyMenus = await prisma.messMenu.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
  });

  // 2. Fetch Active Allocations (total headcount eligible to eat)
  const activeAllocations = await prisma.allocation.findMany({
    where: { status: "ACTIVE" },
    select: { residentId: true },
  });
  const totalActiveResidents = activeAllocations.length;

  // 3. Fetch Today's Attendance Opt-Outs
  const todayAttendances = await prisma.messAttendance.findMany({
    where: {
      date: todayUtc,
    },
  });

  // 4. Calculate Live Kitchen Headcount per Meal
  const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"];
  const headcounts = mealTypes.map((meal) => {
    const optedOutCount = todayAttendances.filter(
      (a) => a.mealType === meal && a.isOptedOut
    ).length;
    return {
      mealType: meal,
      totalActive: totalActiveResidents,
      optedOutCount,
      expectedDiners: Math.max(0, totalActiveResidents - optedOutCount),
    };
  });

  // 5. Calculate Total Food Waste Prevention Metrics (All-time or this month)
  const allOptedOutAttendances = await prisma.messAttendance.findMany({
    where: { isOptedOut: true },
    select: { rebateCredit: true },
  });
  const totalPortionsSaved = allOptedOutAttendances.length;
  const totalRebateCredited = allOptedOutAttendances.reduce((s, a) => s + a.rebateCredit, 0);
  const estimatedIngredientCostSaved = totalPortionsSaved * 3.75; // Approx $3.75 saved per meal prepared

  // 6. Resident Specific Data (If resident logged in)
  let residentProfile = null;
  let residentAttendances: any[] = [];
  let residentEarnedRebates = 0;

  if (isResident) {
    residentProfile = await prisma.residentProfile.findUnique({
      where: { userId: user.id },
    });
    if (residentProfile) {
      residentAttendances = await prisma.messAttendance.findMany({
        where: {
          residentId: residentProfile.id,
          date: { gte: todayUtc },
        },
      });

      const allMyRebates = await prisma.messAttendance.findMany({
        where: {
          residentId: residentProfile.id,
          isOptedOut: true,
        },
        select: { rebateCredit: true },
      });
      residentEarnedRebates = allMyRebates.reduce((s, a) => s + a.rebateCredit, 0);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
              Mess &amp; Canteen Hub
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Weekly menu schedule, resident attendance opt-outs, and food waste reduction metrics
            </p>
          </div>

          {canManageMess && <MessHeaderActions menus={weeklyMenus} />}
        </div>

        {/* Top Operational Strips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Headcount Gauge */}
          <div className="lg:col-span-2">
            <KitchenHeadcountGauge headcounts={headcounts} />
          </div>

          {/* Eco Savings Card */}
          <div className="lg:col-span-1">
            <FoodWasteSavingsCard
              totalPortionsSaved={totalPortionsSaved}
              totalRebateCredited={totalRebateCredited}
              estimatedIngredientCostSaved={estimatedIngredientCostSaved}
            />
          </div>
        </div>

        {/* Resident-Specific Meal Opt-Out Section */}
        {isResident && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-orange-100 text-orange-700">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                    Today&apos;s Meal Attendance ({DAYS[currentDayOfWeek]})
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Toggle meals you won&apos;t be eating to earn a $2.50 rebate credit and prevent kitchen food waste
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-[12px] font-medium shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>My Rebates Earned: ${residentEarnedRebates.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealTypes.map((meal) => {
                const menuItem = weeklyMenus.find(
                  (m) => m.dayOfWeek === currentDayOfWeek && m.mealType === meal
                );
                const attendance = residentAttendances.find((a) => a.mealType === meal);
                const isOptedOut = !!attendance?.isOptedOut;
                const isLocked = isMealLocked(now, meal);

                return (
                  <MealOptOutCard
                    key={meal}
                    dateString={todayDateString}
                    mealType={meal}
                    mealTime={MEAL_TIMES[meal] || ""}
                    menuItems={menuItem?.itemsList || "Chef's daily special"}
                    isOptedOut={isOptedOut}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Weekly Menu Schedule Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Weekly Menu Timetable
                </h3>
                <p className="text-[12px] text-slate-500">
                  Full 7-day schedule published for hostel residents
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Rotational Catering
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DAYS.map((dayName, dayIndex) => {
              const isToday = dayIndex === currentDayOfWeek;
              const dayMenus = weeklyMenus.filter((m) => m.dayOfWeek === dayIndex);

              return (
                <div
                  key={dayIndex}
                  className={`rounded-lg border p-3.5 space-y-3 ${
                    isToday
                      ? "bg-orange-50/50 border-orange-300 ring-2 ring-orange-400/30"
                      : "bg-slate-50/60 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-semibold text-[12px] text-slate-900">
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-orange-600 text-white px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {mealTypes.map((meal) => {
                      const mealMenu = dayMenus.find((m) => m.mealType === meal);
                      return (
                        <div key={meal} className="space-y-0.5">
                          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-orange-700">
                            {meal}
                          </span>
                          <p className="text-[12px] text-slate-700 leading-snug">
                            {mealMenu?.itemsList || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
