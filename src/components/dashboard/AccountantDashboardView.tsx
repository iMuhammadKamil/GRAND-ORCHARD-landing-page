"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { verifyPaymentAction, rejectPaymentAction } from "@/app/actions/billing";
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  Receipt,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";

interface AccountantDashboardViewProps {
  invoices: any[];
  allocations: any[];
  pendingPayments: any[];
  recentPayments: any[];
  stats: {
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
  };
}

export function AccountantDashboardView({
  invoices,
  allocations,
  pendingPayments = [],
  recentPayments = [],
  stats,
}: AccountantDashboardViewProps) {
  const [isPending, startTransition] = useTransition();

  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "OVERDUE" || (inv.status === "ISSUED" && new Date(inv.dueDate) < new Date())
  );

  const handleVerify = (paymentId: string) => {
    startTransition(async () => {
      await verifyPaymentAction(paymentId);
    });
  };

  const handleReject = (paymentId: string) => {
    const reason = window.prompt("Reason for rejecting this payment submission:");
    if (!reason) return;
    startTransition(async () => {
      await rejectPaymentAction(paymentId, reason);
    });
  };

  return (
    <div className="space-y-8">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Total Invoiced */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Total Invoiced
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 grid place-items-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                ${stats.totalInvoiced.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            {invoices.length} total generated bills
          </p>
        </div>

        {/* KPI 2: Total Collected */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Total Collected
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 grid place-items-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-emerald-600">
                ${stats.totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-emerald-600 font-medium pt-2 border-t border-slate-100">
            Verified in bank / cash
          </p>
        </div>

        {/* KPI 3: Outstanding Receivables */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Pending Balance
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-50 text-amber-700 border border-amber-100/80 grid place-items-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-amber-600">
                ${stats.totalPending.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-amber-600 font-medium pt-2 border-t border-slate-100">
            Unsettled student dues
          </p>
        </div>

        {/* KPI 4: Overdue Invoices */}
        <div className="bg-white rounded-2xl border border-rose-200/90 bg-rose-50/20 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-rose-700">
                Overdue Invoices
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 grid place-items-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-rose-600">
                {overdueInvoices.length}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-rose-600 font-medium pt-2 border-t border-rose-100">
            Past payment deadline
          </p>
        </div>

        {/* KPI 5: Active Leases */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Active Leases
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {allocations.length}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            Paying student base
          </p>
        </div>
      </div>

      {/* Main Accounting Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Offline Payment Verification Queue & Outstanding Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Verification Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Payment Verification Queue
                </h3>
              </div>
              <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                {pendingPayments.length} Awaiting Review
              </span>
            </div>

            {pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[15px] font-medium tabular-nums text-slate-900">
                          ${p.amount.toFixed(2)}
                        </span>
                        <span className="rounded-full border border-blue-200 bg-blue-100 text-blue-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                          {p.paymentMethod}
                        </span>
                        <span className="font-mono text-slate-500 text-[12px] tabular-nums">
                          Ref: {p.referenceCode || "N/A"}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-600 mt-1.5">
                        Invoice: <strong className="font-mono font-medium text-slate-900">{p.invoice.invoiceNumber}</strong> &bull; {p.invoice.allocation.resident.user.fullName}
                      </p>
                      {p.notes && <p className="text-slate-500 text-[12px] mt-1">{p.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReject(p.id)}
                        disabled={isPending}
                        className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-rose-500/15"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(p.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] transition-colors focus:outline-hidden focus:ring-4 focus:ring-emerald-600/20"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 py-4 text-center">
                All submitted offline payment slips have been verified.
              </p>
            )}
          </div>

          {/* Outstanding & Overdue Invoices Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  Outstanding &amp; Overdue Invoices
                </h3>
                <p className="text-[12px] text-slate-500 mt-1">
                  Priority list of residents with pending balances
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Full Billing Ledger &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {invoices
                .filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED")
                .slice(0, 6)
                .map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-[12px] hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/billing/${inv.id}`}
                          className="font-mono text-[13px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                            inv.status === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-600 mt-1.5 font-medium">
                        {inv.allocation.resident.user.fullName} &bull; Room {inv.allocation.bed.room.roomNumber}
                      </p>
                      <p className="text-[12px] text-slate-500 font-mono mt-0.5">
                        Due: {new Date(inv.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-medium text-[15px] text-slate-900 font-mono block tabular-nums">
                        ${(inv.totalAmount - inv.paidAmount).toFixed(2)}
                      </span>
                      <span className="text-[12px] text-slate-500 font-mono block tabular-nums mt-0.5">
                        of ${inv.totalAmount.toFixed(2)}
                      </span>
                      <Link
                        href={`/dashboard/billing/${inv.id}`}
                        className="inline-block mt-1 font-medium text-blue-600 hover:text-blue-700 hover:underline text-[12px]"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Col: Accounting Actions & Confirmed Transactions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-3">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Accounting Operations</h3>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/dashboard/billing"
                className="p-3.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-[13px] font-medium text-emerald-900 transition-colors"
              >
                <span>Batch Generate Invoices</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/billing"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Sub-meter Electricity Ledger</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/dashboard/residents"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700 transition-colors"
              >
                <span>Security Deposit Refunds</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Confirmed Transactions Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Recent Collections</h3>
              <span className="text-[12px] text-slate-500 font-medium shrink-0">
                {recentPayments.length} Recorded
              </span>
            </div>

            <div className="space-y-2.5">
              {recentPayments.slice(0, 5).map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 text-[12px] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-[15px] text-slate-900 block font-mono tabular-nums">
                      ${pay.amount.toFixed(2)}
                    </span>
                    <span className="text-[12px] text-slate-500 block mt-0.5 truncate">
                      {pay.invoice?.allocation?.resident?.user?.fullName || "Resident"} &bull; {pay.paymentMethod}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

