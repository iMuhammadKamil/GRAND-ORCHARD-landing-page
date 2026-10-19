import { TicketStatuses } from "@/lib/constants";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  switch (status) {
    case TicketStatuses.OPEN:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-blue-50 text-blue-700 border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Open
        </span>
      );
    case TicketStatuses.ASSIGNED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-indigo-50 text-indigo-700 border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Assigned
        </span>
      );
    case TicketStatuses.IN_PROGRESS:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-amber-50 text-amber-800 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          In Progress
        </span>
      );
    case TicketStatuses.RESOLVED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-emerald-50 text-emerald-800 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Resolved
        </span>
      );
    case TicketStatuses.CLOSED:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-100 text-slate-600 border-slate-200">
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-100 text-slate-600 border-slate-200">
          {status}
        </span>
      );
  }
}

