"use client";

import { useState } from "react";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketDetailModal } from "./TicketDetailModal";
import { TicketStatuses } from "@/lib/constants";
import { Clock, User, MapPin, Eye } from "lucide-react";

interface TicketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  photoUrl: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  resident: {
    user: { fullName: string; email: string };
    allocations: {
      bed: {
        bedNumber: string;
        room: {
          roomNumber: string;
          floor: { building: { name: string } };
        };
      };
    }[];
  };
  staff: {
    id: string;
    department: string;
    user: { fullName: string };
  } | null;
}

interface TicketKanbanBoardProps {
  tickets: TicketItem[];
  currentRole: string;
  techniciansList: {
    id: string;
    fullName: string;
    department: string;
  }[];
}

const COLUMNS = [
  { key: TicketStatuses.OPEN, label: "Open / Unassigned", bg: "bg-blue-50/60", border: "border-blue-200" },
  { key: TicketStatuses.ASSIGNED, label: "Assigned", bg: "bg-indigo-50/60", border: "border-indigo-200" },
  { key: TicketStatuses.IN_PROGRESS, label: "In Progress", bg: "bg-amber-50/60", border: "border-amber-200" },
  { key: TicketStatuses.RESOLVED, label: "Resolved", bg: "bg-emerald-50/60", border: "border-emerald-200" },
  { key: TicketStatuses.CLOSED, label: "Closed", bg: "bg-slate-100/60", border: "border-slate-200" },
];

export function TicketKanbanBoard({
  tickets,
  currentRole,
  techniciansList,
}: TicketKanbanBoardProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              className={`rounded-2xl border ${col.border} ${col.bg} p-3 flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/70">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {col.label}
                </span>
                <span className="font-mono text-[10px] font-medium tabular-nums px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200/80 shadow-subtle">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTickets.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-[12px] text-slate-400 font-medium">
                    No tickets
                  </div>
                ) : (
                  colTickets.map((t) => {
                    const activeAlloc = t.resident.allocations[0];
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-subtle hover:shadow-card transition-shadow cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-medium text-slate-400">
                            #{t.id.slice(-5).toUpperCase()}
                          </span>
                          <TicketPriorityBadge priority={t.priority} />
                        </div>

                        <h4 className="text-[13px] font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {t.title}
                        </h4>

                        <div className="space-y-1 font-mono text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                          {activeAlloc && (
                            <p className="truncate">
                              Rm {activeAlloc.bed.room.roomNumber} ({activeAlloc.bed.bedNumber}) &bull; {activeAlloc.bed.room.floor.building.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-600">
                              {t.category}
                            </span>
                            <span className="text-slate-400">
                              {t.staff ? t.staff.user.fullName.split(" ")[0] : "Unassigned"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TicketDetailModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        currentRole={currentRole}
        techniciansList={techniciansList}
      />
    </>
  );
}

