"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PassStatusBadge } from "@/components/gate/PassStatusBadge";
import { PassQRCodeModal } from "@/components/gate/PassQRCodeModal";
import { RequestPassModal } from "@/components/gate/RequestPassModal";
import { CreateTicketModal } from "@/components/maintenance/CreateTicketModal";
import { TicketStatusBadge } from "@/components/maintenance/TicketStatusBadge";
import {
  Bed,
  CreditCard,
  ShieldCheck,
  Wrench,
  UtensilsCrossed,
  Home,
  Users,
  QrCode,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Phone,
} from "lucide-react";

interface ResidentDashboardViewProps {
  user: any;
  myAllocation: any;
  roommates: any[];
  myInvoices: any[];
  myActivePass: any;
  myTickets: any[];
  todayMenu: any[];
}

export function ResidentDashboardView({
  user,
  myAllocation,
  roommates = [],
  myInvoices = [],
  myActivePass,
  myTickets = [],
  todayMenu = [],
}: ResidentDashboardViewProps) {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Compute unpaid balance
  const unpaidBalance = myInvoices.reduce((sum, inv) => {
    if (inv.status !== "PAID" && inv.status !== "CANCELLED") {
      return sum + (inv.totalAmount - inv.paidAmount);
    }
    return sum;
  }, 0);

  const activeTicketCount = myTickets.filter(
    (t) => t.status !== "CLOSED" && t.status !== "RESOLVED"
  ).length;

  const room = myAllocation?.bed?.room;
  const building = room?.floor?.building;

  return (
    <div className="space-y-8">
      {/* Student Welcome & Room Hero Banner */}
      <div className="bg-ink text-white rounded-2xl p-6 sm:p-8 shadow-card-highlight border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
              Resident Student Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white">
              {myAllocation
                ? `Room ${room?.roomNumber} — Bed ${myAllocation.bed.bedNumber}`
                : "No Active Accommodation"}
            </h2>
            <p className="text-[13px] text-slate-300">
              {myAllocation
                ? `${building?.name} (Floor ${room?.floor?.floorNumber}) • ${room?.roomType?.name}`
                : "You do not currently have an assigned room. Please contact your hostel warden."}
            </p>
            {myAllocation && (
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  href={`/dashboard/residents/${myAllocation.resident.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/15"
                >
                  My KYC &amp; Lease Profile &rarr;
                </Link>
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors focus:outline-hidden focus:ring-4 focus:ring-blue-500/25"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Request Gate Pass
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/[0.07] px-4 py-3 rounded-xl text-center backdrop-blur-xs border border-white/10">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
                Monthly Rent
              </span>
              <span className="text-xl font-medium font-mono tabular-nums tracking-[-0.02em] text-white block mt-1">
                ${myAllocation?.monthlyRent ? myAllocation.monthlyRent.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="bg-white/[0.07] px-4 py-3 rounded-xl text-center backdrop-blur-xs border border-white/10">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
                Deposit Held
              </span>
              <span className="text-xl font-medium font-mono tabular-nums tracking-[-0.02em] text-white block mt-1">
                ${myAllocation?.securityDeposit ? myAllocation.securityDeposit.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Room */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Accommodation
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {room ? `Room ${room.roomNumber}` : "Unassigned"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            {roommates.length} {roommates.length === 1 ? "roommate" : "roommates"} sharing
          </p>
        </div>

        {/* Card 2: Due Balance */}
        <Link
          href="/dashboard/billing"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-emerald-600 transition-colors">
                Outstanding Dues &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 grid place-items-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span
                className={`text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums ${
                  unpaidBalance > 0 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                ${unpaidBalance.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            {unpaidBalance > 0 ? "Click to view / pay invoice" : "All dues settled"}
          </p>
        </Link>

        {/* Card 3: Gate Pass Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Gate Pass Status
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80 grid place-items-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              {myActivePass ? (
                <PassStatusBadge status={myActivePass.status} />
              ) : (
                <span className="text-[13px] font-semibold text-slate-500">No Active Pass</span>
              )}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">Curfew: 10:00 PM</p>
        </div>

        {/* Card 4: Maintenance Tickets */}
        <Link
          href="/dashboard/maintenance"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow block group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-amber-600 transition-colors">
                My Issues &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80 grid place-items-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1.5">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {activeTicketCount}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Active
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            {myTickets.length} total reported
          </p>
        </Link>
      </div>

      {/* Main Resident Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Roommates & Gate Pass Widget + Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Gate Pass Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Campus Movement &amp; Gate Pass
                </h3>
              </div>
              <Link
                href="/dashboard/gate"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Pass History &rarr;
              </Link>
            </div>

            {myActivePass ? (
              <div className="p-4.5 rounded-xl bg-indigo-50/40 border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-[12px] min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[15px] font-medium text-slate-900 tabular-nums">
                      Pass #{myActivePass.id.slice(-6).toUpperCase()}
                    </span>
                    <PassStatusBadge status={myActivePass.status} />
                  </div>
                  <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                    {myActivePass.reason.replace(/\[(DAY_OUTING|NIGHT_OUT)\]\s*/g, "")}
                  </p>
                  <p className="text-slate-500 text-[12px]">
                    Expected Return:{" "}
                    <strong className="font-mono font-semibold text-slate-800">
                      {new Date(myActivePass.expectedInTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] shadow-xs transition-colors shrink-0 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
                >
                  <QrCode className="w-4 h-4 text-indigo-400" /> Digital QR Pass
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50/50 border border-slate-200/80 text-center space-y-3">
                <p className="text-[13px] text-slate-500">
                  You are currently inside campus with no active gate pass.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] shadow-xs transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Apply for Day Outing / Night Out
                </button>
              </div>
            )}
          </div>

          {/* Roommates Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">My Roommates</h3>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {room ? `Room ${room.roomNumber}` : ""}
              </span>
            </div>

            {roommates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roommates.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center gap-3 text-[12px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center font-medium text-[11px] shrink-0">
                      {rm.resident.user.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[13px] text-slate-900 truncate">
                        {rm.resident.user.fullName}
                      </p>
                      <p className="text-slate-500 text-[12px] truncate font-medium mt-0.5">
                        Bed: {rm.bed.bedNumber}
                      </p>
                      {rm.resident.user.phoneNumber && (
                        <p className="text-[12px] text-blue-600 truncate font-mono">
                          {rm.resident.user.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-3 text-center">
                No roommates currently assigned to your room.
              </p>
            )}
          </div>

          {/* My Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">My Invoices &amp; Receipts</h3>
              </div>
              <Link
                href="/dashboard/billing"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Payment Portal &rarr;
              </Link>
            </div>

            {myInvoices.length > 0 ? (
              <div className="space-y-3">
                {myInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-[12px] hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-medium text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 font-mono mt-1.5">
                        Due: {new Date(inv.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-medium text-[15px] text-slate-900 font-mono block tabular-nums">
                        ${inv.totalAmount.toFixed(2)}
                      </span>
                      <Link
                        href={`/dashboard/billing/${inv.id}`}
                        className="inline-block mt-1 font-medium text-blue-600 hover:text-blue-700 hover:underline text-[12px]"
                      >
                        {inv.status === "PAID" ? "View Voucher" : "Pay Now &rarr;"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-3 text-center">
                No invoices found on your account.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Today's Mess Menu & My Maintenance Tickets */}
        <div className="space-y-6">
          {/* Today's Mess Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <UtensilsCrossed className="w-4 h-4 text-orange-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Today&apos;s Canteen Menu</h3>
              </div>
              <Link
                href="/dashboard/mess"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Meal Opt-Out &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {todayMenu.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 text-[12px] space-y-1.5"
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-orange-700 block">
                    {m.mealType}
                  </span>
                  <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{m.itemsList}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Maintenance Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">My Maintenance Issues</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Report Issue
              </button>
            </div>

            {myTickets.length > 0 ? (
              <div className="space-y-2.5">
                {myTickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-[12px] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[13px] text-slate-900 truncate">{ticket.title}</span>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <p className="text-[13px] text-slate-600 line-clamp-1 leading-relaxed">{ticket.description}</p>
                    <p className="text-[12px] text-slate-500">
                      {ticket.staff ? `Assigned to: ${ticket.staff.user.fullName}` : "Awaiting assignment"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-3 text-center">
                No active maintenance requests.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        currentUserRole={user.role}
        myResidentProfileId={myAllocation?.resident?.id}
      />

      {myActivePass && (
        <PassQRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          pass={myActivePass}
        />
      )}

      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>
  );
}
