"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { updateTicketStatusAction } from "@/app/actions/tickets";
import { TicketStatusBadge } from "@/components/maintenance/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/maintenance/TicketPriorityBadge";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bed,
  Play,
  CheckCheck,
  User,
  Home,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface MaintenanceDashboardViewProps {
  tickets: any[];
  maintenanceBeds: any[];
  currentUser: {
    id: string;
    fullName: string;
    staffProfile?: {
      id: string;
      department: string;
    } | null;
  };
}

export function MaintenanceDashboardView({
  tickets,
  maintenanceBeds = [],
  currentUser,
}: MaintenanceDashboardViewProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const staffId = currentUser.staffProfile?.id;
  const department = currentUser.staffProfile?.department || "GENERAL";

  // Filter tickets
  const myAssignedTickets = tickets.filter((t) => t.staffId === staffId);
  const myActiveWorkOrders = myAssignedTickets.filter(
    (t) => t.status === "ASSIGNED" || t.status === "IN_PROGRESS"
  );
  const urgentTickets = tickets.filter(
    (t) => t.priority === "URGENT" && t.status !== "RESOLVED" && t.status !== "CLOSED"
  );
  const departmentOpenQueue = tickets.filter(
    (t) =>
      (t.category === department || department === "GENERAL") &&
      (t.status === "OPEN" || !t.staffId)
  );
  const resolvedCount = tickets.filter(
    (t) => (t.staffId === staffId && t.status === "RESOLVED") || t.status === "CLOSED"
  ).length;

  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    setActiveTicketId(ticketId);
    startTransition(async () => {
      await updateTicketStatusAction({
        ticketId,
        status: newStatus,
      });
      setActiveTicketId(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Technician KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: My Active Work Orders */}
        <div className="bg-white rounded-2xl border border-blue-200/90 bg-blue-50/20 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-blue-700">
                My Active Queue
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 grid place-items-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-blue-800">
                {myActiveWorkOrders.length}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-100/80 text-blue-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Active
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-blue-600 font-medium pt-2 border-t border-blue-100">
            Assigned directly to you
          </p>
        </div>

        {/* KPI 2: Department Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                {department} Queue
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 grid place-items-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {departmentOpenQueue.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100 text-slate-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Unclaimed
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Available to claim
          </p>
        </div>

        {/* KPI 3: Urgent Alerts */}
        <div className="bg-white rounded-2xl border border-rose-200/90 bg-rose-50/20 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-rose-700">
                Urgent Issues
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 grid place-items-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-rose-600">
                {urgentTickets.length}
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-100 text-rose-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Priority
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-rose-600 font-medium pt-2 border-t border-rose-100">
            Immediate attention needed
          </p>
        </div>

        {/* KPI 4: Resolved */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Completed Repairs
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 grid place-items-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {resolvedCount}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Done
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Resolved successfully
          </p>
        </div>

        {/* KPI 5: Beds Under Maintenance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Beds In Repair
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80 grid place-items-center">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {maintenanceBeds.length}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Offline
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Property maintenance status
          </p>
        </div>
      </div>

      {/* Main Technician Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Work Orders & Department Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work Orders */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  My Active Work Orders
                </h3>
                <p className="text-[12px] text-slate-500 mt-1">
                  Tickets dispatched to your specialty queue
                </p>
              </div>
              <Link
                href="/dashboard/maintenance"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                Kanban Dispatch &rarr;
              </Link>
            </div>

            {myActiveWorkOrders.length > 0 ? (
              <div className="space-y-3">
                {myActiveWorkOrders.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2.5 text-[12px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[13px] text-slate-900 truncate">{t.title}</span>
                        <TicketPriorityBadge priority={t.priority} />
                      </div>
                      <TicketStatusBadge status={t.status} />
                    </div>

                    <p className="text-[13px] text-slate-600 leading-relaxed">{t.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80">
                      <div className="flex items-center gap-3 text-slate-500 text-[12px]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {t.resident.user.fullName}
                        </span>
                        <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Category: {t.category}
                        </span>
                      </div>

                      {/* 1-Click Status Progression */}
                      <div className="flex items-center gap-2">
                        {t.status === "ASSIGNED" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                            disabled={isPending && activeTicketId === t.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
                          >
                            {isPending && activeTicketId === t.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-3 h-3" /> Start Repair
                              </>
                            )}
                          </button>
                        )}

                        {t.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(t.id, "RESOLVED")}
                            disabled={isPending && activeTicketId === t.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-emerald-600/20"
                          >
                            {isPending && activeTicketId === t.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-[13px]">
                No tickets currently in progress for you. Check the open queue below to claim new repairs!
              </div>
            )}
          </div>

          {/* Department Unclaimed Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Unclaimed {department} Work Orders
                </h3>
                <p className="text-[12px] text-slate-500 mt-1">
                  Open requests submitted by residents matching your trade
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 text-slate-600 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                {departmentOpenQueue.length} Available
              </span>
            </div>

            {departmentOpenQueue.length > 0 ? (
              <div className="space-y-3">
                {departmentOpenQueue.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-slate-900 truncate">{t.title}</span>
                        <TicketPriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-[13px] text-slate-600 line-clamp-1 mt-1 leading-relaxed">{t.description}</p>
                      <p className="text-[12px] text-slate-500 font-mono mt-1">
                        By {t.resident.user.fullName} &bull; {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                      disabled={isPending && activeTicketId === t.id}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] shadow-xs transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
                    >
                      {isPending && activeTicketId === t.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Claim &amp; Start &rarr;</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-3 text-center">
                No unclaimed tickets in your department.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Quick Facilities Links & Beds in Maintenance */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-3">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Facilities Operations</h3>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/dashboard/maintenance"
                className="p-3.5 rounded-lg bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 flex items-center justify-between gap-3 text-[13px] font-medium text-amber-900 transition-colors"
              >
                <span>Interactive Kanban Board</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/properties"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Campus Rooms &amp; Beds Matrix</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Beds Under Maintenance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Beds In Maintenance</h3>
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 text-amber-700 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                {maintenanceBeds.length}
              </span>
            </div>

            {maintenanceBeds.length > 0 ? (
              <div className="space-y-2">
                {maintenanceBeds.map((bed: any) => (
                  <div
                    key={bed.id}
                    className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/20 text-[12px] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[13px] font-medium text-slate-900">
                        {bed.bedNumber}
                      </span>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Room {bed.room?.roomNumber} ({bed.room?.floor?.building?.name || "Campus"})
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-300 bg-amber-200 text-amber-900 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                      Offline
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-2 text-center">
                No beds currently flagged under repair.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

