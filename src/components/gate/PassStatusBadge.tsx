import React from "react";
import { GatePassStatuses, GatePassStatus } from "@/lib/constants";
import { Clock, CheckCircle2, XCircle, ArrowUpRight, CheckCheck, AlertTriangle } from "lucide-react";

interface PassStatusBadgeProps {
  status: GatePassStatus | string;
  isOverdue?: boolean;
}

export function PassStatusBadge({ status, isOverdue }: PassStatusBadgeProps) {
  if (isOverdue || status === GatePassStatuses.OVERDUE) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-rose-50 text-rose-700 border-rose-200 animate-pulse">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        Overdue Curfew
      </span>
    );
  }

  switch (status) {
    case GatePassStatuses.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 text-amber-500" />
          Pending Approval
        </span>
      );
    case GatePassStatuses.APPROVED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Approved / Ready
        </span>
      );
    case GatePassStatuses.CHECKED_OUT:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-blue-50 text-blue-700 border-blue-200">
          <ArrowUpRight className="w-3 h-3 text-blue-600" />
          Outside Campus
        </span>
      );
    case GatePassStatuses.RETURNED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-50 text-slate-700 border-slate-200">
          <CheckCheck className="w-3 h-3 text-slate-500" />
          Returned
        </span>
      );
    case GatePassStatuses.REJECTED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-rose-50 text-rose-700 border-rose-200">
          <XCircle className="w-3 h-3 text-rose-500" />
          Declined
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-50 text-slate-700 border-slate-200">
          {status}
        </span>
      );
  }
}
