import { InvoiceStatuses } from "@/lib/constants";

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  switch (status) {
    case InvoiceStatuses.PAID:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      );
    case InvoiceStatuses.PARTIALLY_PAID:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Partial
        </span>
      );
    case InvoiceStatuses.OVERDUE:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Overdue
        </span>
      );
    case InvoiceStatuses.ISSUED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Issued
        </span>
      );
    case InvoiceStatuses.DRAFT:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Draft
        </span>
      );
    case InvoiceStatuses.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 line-through">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-700">
          {status}
        </span>
      );
  }
}


