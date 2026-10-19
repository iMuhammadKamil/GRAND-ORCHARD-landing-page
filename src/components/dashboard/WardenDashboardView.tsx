"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { reviewGatePassAction } from "@/app/actions/gatepass";
import {
  Bed,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Building,
  Check,
  X,
  Phone,
  Home,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface WardenDashboardViewProps {
  buildings: any[];
  rooms: any[];
  allocations: any[];
  gatePasses: any[];
  tickets: any[];
  stats: {
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
    occupancyRate: number;
  };
}

export function WardenDashboardView({
  buildings,
  rooms,
  allocations,
  gatePasses,
  tickets,
  stats,
}: WardenDashboardViewProps) {
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const outsideCount = gatePasses.filter(
    (p) => p.status === "CHECKED_OUT" || p.status === "OVERDUE"
  ).length;

  // Overdue students past curfew
  const overduePasses = gatePasses.filter(
    (p) =>
      p.status === "OVERDUE" ||
      (p.status === "CHECKED_OUT" && new Date(p.expectedInTime) < now)
  );

  // Pending Night Out gate passes
  const pendingNightOutPasses = gatePasses.filter((p) => p.status === "PENDING");

  // Open resident complaints
  const openComplaints = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "ASSIGNED" || t.status === "IN_PROGRESS"
  );

  const handleApprove = (passId: string) => {
    startTransition(async () => {
      await reviewGatePassAction(passId, "APPROVED");
    });
  };

  const handleReject = (passId: string) => {
    const reason = window.prompt("Reason for declining this leave request:");
    if (!reason) return;
    startTransition(async () => {
      await reviewGatePassAction(passId, "REJECTED", reason);
    });
  };

  return (
    <div className="space-y-8">
      {/* Warden Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Occupancy */}
        <Link
          href="/dashboard/properties"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-blue-600 transition-colors">
                Hostel Occupancy &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {stats.occupancyRate}%
              </span>
              <span className="text-[12px] font-mono tabular-nums text-slate-500">
                ({stats.vacantBeds} vacant)
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            {stats.occupiedBeds} occupied of {stats.totalBeds} beds
          </p>
        </Link>

        {/* KPI 2: Active Residents */}
        <Link
          href="/dashboard/residents"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-indigo-600 transition-colors">
                Headcount &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80 grid place-items-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {allocations.length}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Students
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Across {buildings.length} residential blocks
          </p>
        </Link>

        {/* KPI 3: Outside Campus */}
        <Link
          href="/dashboard/gate"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-blue-600 transition-colors">
                Outside Campus &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {outsideCount}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 text-blue-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Checked Out
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Active day outings &amp; leaves
          </p>
        </Link>

        {/* KPI 4: Curfew Breaches */}
        <Link
          href="/dashboard/gate"
          className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-card hover:shadow-card-hover bg-rose-50/20 transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-rose-600 group-hover:text-rose-700 transition-colors">
                Curfew Breaches &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 grid place-items-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-rose-600">
                {overduePasses.length}
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-100 text-rose-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Past Due
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-rose-600 font-medium pt-2 border-t border-rose-100">
            Urgent late arrival watchlist
          </p>
        </Link>

        {/* KPI 5: Pending Leave Reviews */}
        <Link
          href="/dashboard/gate"
          className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-card hover:shadow-card-hover bg-amber-50/20 transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-amber-700 group-hover:text-amber-800 transition-colors">
                Pending Reviews &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 grid place-items-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {pendingNightOutPasses.length}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-100 text-amber-700 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Awaiting
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-amber-100">
            Night out &amp; leave requests
          </p>
        </Link>
      </div>

      {/* Warden Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Curfew & Security Queues + Bed Allocations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Curfew Alert Box */}
          {overduePasses.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-300/80 rounded-2xl p-5 text-rose-950 space-y-3 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-rose-600 text-white animate-pulse grid place-items-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-rose-900">
                    Hostel Curfew Breaches ({overduePasses.length})
                  </h3>
                </div>
                <Link
                  href="/dashboard/gate"
                  className="shrink-0 text-[13px] font-medium text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1"
                >
                  Manage at Gate Desk &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {overduePasses.slice(0, 4).map((pass) => (
                  <div
                    key={pass.id}
                    className="p-3.5 bg-white rounded-lg border border-rose-200/80 text-[12px] shadow-subtle space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[13px] text-slate-900 truncate">
                        {pass.resident.user.fullName}
                      </span>
                      <span className="shrink-0 rounded-full border border-rose-200 bg-rose-100 text-rose-700 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                        Overdue
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500">
                      Curfew was:{" "}
                      <strong className="font-mono font-semibold text-rose-700">
                        {new Date(pass.expectedInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </p>
                    {pass.resident.emergencyPhone && (
                      <a
                        href={`tel:${pass.resident.emergencyPhone}`}
                        className="inline-flex items-center gap-1 text-[12px] font-medium font-mono text-rose-700 hover:text-rose-800 hover:underline pt-1"
                      >
                        <Phone className="w-3 h-3" /> Call: {pass.resident.emergencyPhone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Night Out Approvals Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Night Out &amp; Leave Approvals Queue
                </h3>
              </div>
              <span className="shrink-0 rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                {pendingNightOutPasses.length} Pending
              </span>
            </div>

            {pendingNightOutPasses.length > 0 ? (
              <div className="space-y-3">
                {pendingNightOutPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-slate-900 truncate">
                          {pass.resident.user.fullName}
                        </span>
                        <span className="shrink-0 rounded-full border border-purple-200 bg-purple-100 text-purple-800 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                          🌙 Night Out
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-700 font-medium line-clamp-1">
                        {pass.reason.replace(/\[(DAY_OUTING|NIGHT_OUT)\]\s*/g, "")}
                      </p>
                      <div className="flex items-center gap-3 text-[12px] text-slate-500 font-mono">
                        <span>
                          Out: {new Date(pass.expectedOutTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <span>&bull;</span>
                        <span>
                          Return: {new Date(pass.expectedInTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReject(pass.id)}
                        disabled={isPending}
                        className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-rose-500/15"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(pass.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-emerald-600/20"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Approve Leave
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-4 text-center">
                All leave applications have been reviewed. No pending requests.
              </p>
            )}
          </div>

          {/* Room Occupancy Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Campus Blocks &amp; Bed Occupancy
                </h3>
                <p className="text-[12px] text-slate-500 mt-1">
                  Floor-by-floor occupancy status across Boys and Girls halls
                </p>
              </div>
              <Link
                href="/dashboard/properties"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Full Room Grid &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {buildings.map((b) => (
                <div key={b.id} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-[13px] tracking-[-0.01em] text-slate-900 truncate">{b.name}</span>
                      <span className="rounded-full border border-blue-200 bg-blue-100 text-blue-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                        {b.gender}
                      </span>
                    </div>
                    <span className="text-[12px] text-slate-500 font-medium shrink-0">{b.floors.length} Floors</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {b.floors.flatMap((f: any) => f.rooms).slice(0, 6).map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 text-[12px] shadow-subtle"
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-[12px] font-medium text-slate-900">
                          <span>Room {r.roomNumber}</span>
                          <span className="text-slate-500 tabular-nums">
                            {r.beds.filter((bd: any) => bd.status === "OCCUPIED").length}/
                            {r.beds.length} beds
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Warden Quick Links & Open Student Issues */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-3">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Warden Operations</h3>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/dashboard/gate"
                className="p-3.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 border border-blue-200/80 flex items-center justify-between gap-3 text-[13px] font-medium text-blue-900 transition-colors"
              >
                <span>Digital Gate &amp; Curfew Desk</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/residents"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Resident Student Directory</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/properties"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Interactive Property Floor Plans</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/maintenance"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Hostel Maintenance Board</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Open Student Complaints */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Open Resident Issues</h3>
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                {openComplaints.length} Open
              </span>
            </div>

            <div className="space-y-2.5">
              {openComplaints.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-amber-50/20 text-[12px] space-y-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[13px] text-slate-900 truncate">{ticket.title}</span>
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 text-amber-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-600 line-clamp-1 leading-relaxed">{ticket.description}</p>
                  <p className="text-[12px] text-slate-500 pt-1">
                    By: {ticket.resident.user.fullName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

