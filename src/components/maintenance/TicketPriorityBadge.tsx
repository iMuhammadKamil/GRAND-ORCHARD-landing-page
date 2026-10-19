import { TicketPriorities } from "@/lib/constants";
import { AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";

interface TicketPriorityBadgeProps {
  priority: string;
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  switch (priority) {
    case TicketPriorities.URGENT:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-rose-100 text-rose-800 border-rose-300 animate-pulse">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Urgent
        </span>
      );
    case TicketPriorities.MEDIUM:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-amber-100 text-amber-800 border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Medium
        </span>
      );
    case TicketPriorities.LOW:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-100 text-slate-700 border-slate-200">
          <ArrowDown className="w-3 h-3 text-slate-500" />
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-slate-100 text-slate-600 border-slate-200">
          {priority}
        </span>
      );
  }
}

