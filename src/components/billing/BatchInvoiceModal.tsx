"use client";

import { useState, useTransition } from "react";
import { generateMonthlyBatchInvoicesAction } from "@/app/actions/billing";
import { Zap, Calendar, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface BatchInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLeasesCount: number;
}

export function BatchInvoiceModal({
  isOpen,
  onClose,
  activeLeasesCount,
}: BatchInvoiceModalProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Default due date: 10th of target month
  const defaultDueDate = new Date(selectedYear, selectedMonth - 1, 10)
    .toISOString()
    .split("T")[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const handleGenerate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await generateMonthlyBatchInvoicesAction(
        selectedMonth,
        selectedYear,
        dueDate
      );
      setResult(res);
      if (res.success && res.count && res.count > 0) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">
                Batch Generate Monthly Invoices
              </h3>
              <p className="text-[12px] text-slate-500">
                Automated rent billing for all active resident leases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 text-[13px]">
          {/* Active count notice */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[12px] text-blue-900">
              <span className="font-semibold">{activeLeasesCount} active resident lease{activeLeasesCount !== 1 ? "s" : ""}</span> are currently eligible.
              Duplicate invoices for the selected month will be automatically skipped to prevent double-billing.
            </div>
          </div>

          {/* Month / Year selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Billing Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value);
                  setSelectedMonth(m);
                  setDueDate(new Date(selectedYear, m - 1, 10).toISOString().split("T")[0]);
                }}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Billing Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  setSelectedYear(y);
                  setDueDate(new Date(y, selectedMonth - 1, 10).toISOString().split("T")[0]);
                }}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date picker */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-mono tabular-nums hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
            <p className="text-[12px] text-slate-500 mt-1">
              Residents will be notified to settle their rent before this date.
            </p>
          </div>

          {/* Feedback banner */}
          {result && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 text-[12px] ${
                result.success
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || activeLeasesCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating Invoices...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run Batch Generation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

