"use client";

import { useState } from "react";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketDetailModal } from "./TicketDetailModal";
import { Eye, ExternalLink } from "lucide-react";

interface TicketTableViewProps {
  tickets: any[];
  currentRole: string;
  techniciansList: any[];
}

export function TicketTableView({
  tickets,
  currentRole,
  techniciansList,
}: TicketTableViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-[13px]">
        No maintenance tickets match the selected criteria.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">
                Ticket #
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">
                Title &amp; Resident
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">
                Location
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">
                Category
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-center">
                Priority
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">
                Assigned Staff
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-center">
                Status
              </th>
              <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => {
              const alloc = t.resident.allocations[0];
              return (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono tabular-nums font-medium text-slate-900">
                    #{t.id.slice(-6).toUpperCase()}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{t.title}</p>
                    <p className="text-[12px] text-slate-500">
                      Reported by {t.resident.user.fullName}
                    </p>
                  </td>

                  <td className="px-5 py-3.5 text-[13px] text-slate-600">
                    {alloc ? (
                      <span>
                        Rm {alloc.bed.room.roomNumber} &bull; {alloc.bed.room.floor.building.name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-5 py-3.5 font-medium text-slate-600">
                    {t.category}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <TicketPriorityBadge priority={t.priority} />
                  </td>

                  <td className="px-5 py-3.5">
                    {t.staff ? (
                      <div>
                        <p className="font-medium text-slate-900">
                          {t.staff.user.fullName}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {t.staff.department}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <TicketStatusBadge status={t.status} />
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-medium text-[12px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

