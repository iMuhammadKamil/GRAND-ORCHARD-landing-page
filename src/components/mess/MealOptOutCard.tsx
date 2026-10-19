"use client";

import { useTransition } from "react";
import { toggleMealOptOutAction } from "@/app/actions/mess";
import { Utensils, Clock, Check, X, Lock, DollarSign, Loader2 } from "lucide-react";

interface MealOptOutCardProps {
  dateString: string;
  mealType: string;
  mealTime: string;
  menuItems: string;
  isOptedOut: boolean;
  isLocked: boolean;
}

export function MealOptOutCard({
  dateString,
  mealType,
  mealTime,
  menuItems,
  isOptedOut,
  isLocked,
}: MealOptOutCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isLocked) return;
    startTransition(async () => {
      await toggleMealOptOutAction({
        dateString,
        mealType,
        isOptedOut: !isOptedOut,
      });
    });
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isOptedOut
          ? "bg-slate-50 border-slate-200/80 opacity-80"
          : "bg-white border-slate-200/80 shadow-subtle hover:border-orange-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200/60">
              {mealType}
            </span>
            <span className="font-mono tabular-nums text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {mealTime}
            </span>
          </div>

          <p className="text-[12px] text-slate-700 font-medium mt-2 leading-relaxed">
            {menuItems || "Menu not announced yet"}
          </p>
        </div>

        {/* Status / Toggle button */}
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {isLocked ? (
            <span
              className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg"
              title="Locked for kitchen food preparation"
            >
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          ) : (
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                isOptedOut
                  ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isOptedOut ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Opted Out</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Attending</span>
                </>
              )}
            </button>
          )}

          {isOptedOut && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-medium tabular-nums text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
              <DollarSign className="w-2.5 h-2.5" /> +$2.50 Rebate
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

