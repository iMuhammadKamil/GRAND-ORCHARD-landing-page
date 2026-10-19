"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/10"
    >
      <Printer className="w-3.5 h-3.5 text-slate-500" />
      <span>Print / Download PDF</span>
    </button>
  );
}

