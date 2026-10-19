"use client";

import { useState, useTransition } from "react";
import { updateMessMenuAction } from "@/app/actions/mess";
import { Edit3, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

interface WeeklyMenuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMenus: {
    id?: string;
    dayOfWeek: number;
    mealType: string;
    itemsList: string;
  }[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEALS = ["BREAKFAST", "LUNCH", "DINNER"];

export function WeeklyMenuEditorModal({
  isOpen,
  onClose,
  initialMenus,
}: WeeklyMenuEditorModalProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedMeal, setSelectedMeal] = useState("BREAKFAST");

  // Lookup current items for selected day & meal
  const currentMenu = initialMenus.find(
    (m) => m.dayOfWeek === selectedDay && m.mealType === selectedMeal
  );
  const [itemsList, setItemsList] = useState(currentMenu?.itemsList || "");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleDayOrMealChange = (day: number, meal: string) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    const m = initialMenus.find((item) => item.dayOfWeek === day && item.mealType === meal);
    setItemsList(m?.itemsList || "");
    setFeedback(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateMessMenuAction({
        dayOfWeek: selectedDay,
        mealType: selectedMeal,
        itemsList,
      });
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-orange-100 text-orange-700">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                Edit Weekly Mess Menu
              </h3>
              <p className="text-[12px] text-slate-500">
                Update dish offerings for hostel kitchen preparation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4 text-xs sm:text-sm">
          {/* Day of Week Selector */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Select Day of Week
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayOrMealChange(idx, selectedMeal)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-[12px] transition-colors cursor-pointer ${
                    selectedDay === idx
                      ? "bg-slate-900 text-white shadow-subtle"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type Selector */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Select Meal
            </label>
            <div className="flex gap-2">
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => handleDayOrMealChange(selectedDay, meal)}
                  className={`flex-1 py-2 rounded-lg font-medium text-[12px] transition-colors cursor-pointer ${
                    selectedMeal === meal
                      ? "bg-orange-600 text-white shadow-subtle"
                      : "bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200"
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Items input */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Menu Items Description
            </label>
            <textarea
              rows={3}
              value={itemsList}
              onChange={(e) => setItemsList(e.target.value)}
              placeholder="e.g. Garlic Naan, Butter Chicken / Paneer, Jeera Rice, Salad, Gulab Jamun"
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 text-[12px] ${
                feedback.success
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !itemsList.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-orange-600/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Menu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

