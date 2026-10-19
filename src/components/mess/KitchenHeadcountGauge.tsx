import { Users, Utensils } from "lucide-react";

interface MealHeadcount {
  mealType: string;
  totalActive: number;
  optedOutCount: number;
  expectedDiners: number;
}

interface KitchenHeadcountGaugeProps {
  headcounts: MealHeadcount[];
}

export function KitchenHeadcountGauge({ headcounts }: KitchenHeadcountGaugeProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-orange-100 text-orange-700">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
              Today&apos;s Live Kitchen Headcount
            </h3>
            <p className="text-[13px] text-slate-500">
              Expected diners per meal service based on resident opt-outs
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          Live Tracking
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {headcounts.map((hc) => {
          const attendancePercent =
            hc.totalActive > 0 ? Math.round((hc.expectedDiners / hc.totalActive) * 100) : 0;

          return (
            <div
              key={hc.mealType}
              className="p-4 rounded-lg border border-slate-200/70 bg-slate-50/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {hc.mealType}
                </span>
                <span className="font-mono text-[12px] font-medium tabular-nums text-orange-600">
                  {hc.expectedDiners} / {hc.totalActive} Diners
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${attendancePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[12px] font-mono tabular-nums text-slate-500">
                <span className="text-emerald-700 font-medium">
                  {hc.optedOutCount} portions saved
                </span>
                <span>{attendancePercent}% turnout</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

