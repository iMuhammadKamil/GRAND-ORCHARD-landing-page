"use client";

import { useState, useTransition } from "react";
import { updateTicketStatusAction, assignTicketStaffAction, residentCloseTicketAction } from "@/app/actions/tickets";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { TicketStatuses } from "@/lib/constants";
import {
  Wrench,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
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
  } | null;
  currentRole: string;
  techniciansList?: {
    id: string;
    fullName: string;
    department: string;
  }[];
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  currentRole,
  techniciansList = [],
}: TicketDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [reopenFeedback, setReopenFeedback] = useState("");
  const [showReopenInput, setShowReopenInput] = useState(false);

  if (!isOpen || !ticket) return null;

  const isResident = currentRole === "RESIDENT";
  const canDispatch = currentRole === "SUPER_ADMIN" || currentRole === "WARDEN";
  const canUpdateStatus = canDispatch || currentRole === "MAINTENANCE_STAFF";

  const activeAlloc = ticket.resident.allocations[0];

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await updateTicketStatusAction({
        ticketId: ticket.id,
        status,
      });
      onClose();
    });
  };

  const handleAssignStaff = () => {
    if (!selectedStaffId) return;
    startTransition(async () => {
      await assignTicketStaffAction(ticket.id, selectedStaffId);
      onClose();
    });
  };

  const handleResidentSignOff = (isSatisfied: boolean) => {
    startTransition(async () => {
      await residentCloseTicketAction({
        ticketId: ticket.id,
        isSatisfied,
        feedback: reopenFeedback,
      });
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium tabular-nums text-slate-500">
                  #{ticket.id.slice(-6).toUpperCase()}
                </span>
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </div>
              <h3 className="font-semibold text-[13px] tracking-[-0.01em] text-slate-900 mt-0.5 truncate">
                {ticket.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* Metadata Strip */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
            <div>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 block">
                Resident &amp; Room
              </span>
              <p className="font-medium text-[13px] text-slate-900 mt-1">
                {ticket.resident.user.fullName}
              </p>
              {activeAlloc && (
                <p className="font-mono text-slate-500 text-[12px]">
                  {activeAlloc.bed.room.floor.building.name} &bull; Room {activeAlloc.bed.room.roomNumber} ({activeAlloc.bed.bedNumber})
                </p>
              )}
            </div>

            <div>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 block">
                Assigned Technician
              </span>
              <p className="font-medium text-[13px] text-slate-900 mt-1">
                {ticket.staff ? ticket.staff.user.fullName : "Unassigned"}
              </p>
              <p className="text-slate-500">
                Category: <span className="font-medium text-slate-600">{ticket.category}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 mb-1.5">
              Issue Description
            </h4>
            <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">
              {ticket.description}
            </div>
          </div>

          {/* Attached Photo */}
          {ticket.photoUrl && (
            <div>
              <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 mb-1.5">
                Photo Proof
              </h4>
              <div className="rounded-lg overflow-hidden border border-slate-200/80 bg-slate-50 max-h-48 flex items-center justify-center relative group">
                <img
                  src={ticket.photoUrl}
                  alt="Ticket attachment"
                  className="max-h-48 object-cover w-full"
                />
                <a
                  href={ticket.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-slate-900/85 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-[3px] flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3" /> View Full
                </a>
              </div>
            </div>
          )}

          {/* Reassign Technician (Warden/Admin) */}
          {canDispatch && techniciansList.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Assign / Re-Route Technician
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedStaffId || ticket.staff?.id || ""}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-[13px] font-medium rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
                >
                  <option value="">Select Technician...</option>
                  {techniciansList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} &bull; {t.department}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignStaff}
                  disabled={isPending || !selectedStaffId}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] rounded-lg disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Resident Two-Step Sign-off Action */}
          {isResident && ticket.status === TicketStatuses.RESOLVED && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="font-semibold text-[13px] text-emerald-950">
                  Technician marked this repair as Resolved. Has the issue been fixed?
                </h4>
              </div>

              {showReopenInput ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={reopenFeedback}
                    onChange={(e) => setReopenFeedback(e.target.value)}
                    placeholder="Describe why the repair is incomplete..."
                    className="w-full p-3 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReopenInput(false)}
                      className="px-3 py-1.5 text-[13px] text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResidentSignOff(false)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                    >
                      Submit Reopen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResidentSignOff(true)}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm &amp; Close Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReopenInput(true)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-[12px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reopen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions for Staff */}
        {canUpdateStatus && ticket.status !== TicketStatuses.CLOSED && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50/70 border-t border-slate-100 text-xs">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Change Status:</span>
            <div className="flex items-center gap-2">
              {ticket.status !== TicketStatuses.IN_PROGRESS && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(TicketStatuses.IN_PROGRESS)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-lg font-medium text-[12px] text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              {ticket.status !== TicketStatuses.RESOLVED && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(TicketStatuses.RESOLVED)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-lg font-medium text-[12px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

