import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRoles } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { InvoiceActions } from "@/components/billing/InvoiceActions";
import { BillingHeaderActions } from "@/components/billing/BillingHeaderActions";
import { PendingPaymentsBanner } from "@/components/billing/PendingPaymentsBanner";
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  Receipt,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface BillingPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isResident = user.role === UserRoles.RESIDENT;
  const canManageBilling = [
    UserRoles.SUPER_ADMIN,
    UserRoles.WARDEN,
    UserRoles.ACCOUNTANT,
  ].includes(user.role as any);

  if (!canManageBilling && !isResident) {
    redirect("/dashboard");
  }

  const { status: statusFilter, search: searchQuery } = await searchParams;

  // Build query filters
  const whereClause: any = {};

  if (isResident) {
    const profile = await prisma.residentProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      whereClause.allocation = { residentId: profile.id };
    }
  }

  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  if (searchQuery) {
    whereClause.OR = [
      { invoiceNumber: { contains: searchQuery } },
      {
        allocation: {
          resident: {
            user: { fullName: { contains: searchQuery } },
          },
        },
      },
    ];
  }

  // Fetch invoices, active allocations, rooms for utility calculation, pending verifications, and metrics
  const [invoices, activeAllocations, allInvoices, rooms, pendingPayments] = await Promise.all([
    prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        allocation: {
          include: {
            resident: {
              include: { user: true },
            },
            bed: {
              include: {
                room: {
                  include: {
                    floor: { include: { building: true } },
                  },
                },
              },
            },
          },
        },
        items: true,
        payments: true,
      },
    }),
    prisma.allocation.findMany({
      where: { status: "ACTIVE" },
      include: {
        resident: { include: { user: true } },
        bed: {
          include: {
            room: {
              include: {
                floor: { include: { building: true } },
              },
            },
          },
        },
      },
    }),
    prisma.invoice.findMany({
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
      },
    }),
    prisma.room.findMany({
      include: {
        floor: { include: { building: true } },
        beds: {
          include: {
            allocations: {
              where: { status: "ACTIVE" },
              include: { resident: { include: { user: true } } },
            },
          },
        },
      },
    }),
    canManageBilling
      ? prisma.paymentTransaction.findMany({
          where: { status: "PENDING_VERIFICATION" },
          include: {
            invoice: {
              include: {
                allocation: {
                  include: {
                    resident: { include: { user: true } },
                    bed: { include: { room: true } },
                  },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Financial aggregates
  const totalInvoiced = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = allInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);
  const overdueCount = allInvoices.filter(
    (inv) => inv.status === "OVERDUE" || (inv.paidAmount < inv.totalAmount && new Date(inv.dueDate) < new Date())
  ).length;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
                {isResident ? "My Invoices & Dues" : "Billing & Financial Ledger"}
              </h1>
              {!isResident && (
                <span className="hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600">
                  Live Ledger
                </span>
              )}
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
              {isResident
                ? "View your room invoices, upload payment receipts, and download official vouchers"
                : "Track invoices, record resident payments, calculate sub-meters, and verify receipts"}
            </p>
          </div>

          {canManageBilling && (
            <BillingHeaderActions
              activeLeasesCount={activeAllocations.length}
              activeAllocations={activeAllocations}
              rooms={rooms}
            />
          )}
        </div>

        {/* Pending Payments Alert for Accountants */}
        {canManageBilling && pendingPayments.length > 0 && (
          <PendingPaymentsBanner payments={pendingPayments as any} />
        )}

        {/* Financial KPI Strip (Hidden for resident) */}
        {!isResident && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invoiced */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Total Invoiced
                </span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 grid place-items-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[26px] leading-none font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                    ${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-[12px] font-medium text-slate-500">
                    Across {allInvoices.length} generated bills
                  </p>
                </div>
              </div>
            </div>

            {/* Total Collected */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Total Collected
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 grid place-items-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[26px] leading-none font-medium tracking-[-0.02em] tabular-nums text-emerald-600">
                    ${totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-700">
                    {totalInvoiced > 0
                      ? `${Math.round((totalCollected / totalInvoiced) * 100)}% recovery rate`
                      : "0% recovery"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Receivables */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Pending Receivables
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 grid place-items-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[26px] leading-none font-medium tracking-[-0.02em] tabular-nums text-amber-600">
                    ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <p className="text-[12px] font-medium text-slate-500">
                    Unsettled resident balances
                  </p>
                </div>
              </div>
            </div>

            {/* Overdue Invoices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Overdue Invoices
                </span>
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 grid place-items-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[26px] leading-none font-medium tracking-[-0.02em] tabular-nums text-rose-600">
                    {overdueCount}
                  </span>
                  <span className="text-[12px] font-medium text-rose-500">
                    {overdueCount === 1 ? "invoice past due" : "invoices past due"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <p className="text-[12px] font-medium text-slate-500">
                    Action required on past due bills
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1 text-slate-400 mr-1 hidden sm:flex">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]">Status:</span>
            </div>
            {["ALL", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((st) => {
              const active = (statusFilter || "ALL") === st;
              return (
                <Link
                  key={st}
                  href={`/dashboard/billing?status=${st}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg font-mono font-medium uppercase tracking-[0.08em] text-[10px] transition-colors ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {st.replace("_", " ")}
                </Link>
              );
            })}
          </div>

          {/* Search form */}
          <form method="GET" className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ""}
              placeholder="Search invoice # or resident..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-[13px] bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </form>
        </div>

        {/* Invoice Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-[13px] tracking-[-0.01em]">No Invoices Found</h3>
              <p className="text-[13px] text-slate-500 mt-1 max-w-sm mx-auto">
                No billing records match your selected filter criteria. Try clearing search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Invoice #
                    </th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Resident &amp; Unit
                    </th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Billing Period
                    </th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Due Date
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Total
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Paid
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Balance
                    </th>
                    <th className="px-5 py-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => {
                    const balance = Math.max(0, inv.totalAmount - inv.paidAmount);
                    const isOverdue =
                      inv.status === "OVERDUE" ||
                      (inv.paidAmount < inv.totalAmount && new Date(inv.dueDate) < new Date());

                    return (
                      <tr
                        key={inv.id}
                        className={`transition-colors border-l-4 ${
                          isOverdue
                            ? "border-l-rose-500 bg-rose-50/20 hover:bg-rose-50/40"
                            : "border-l-transparent hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[13px] font-medium tabular-nums text-slate-900">
                          <Link
                            href={`/dashboard/billing/${inv.id}`}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium group"
                          >
                            <span>{inv.invoiceNumber}</span>
                          </Link>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-medium text-[10px] flex items-center justify-center shrink-0">
                              {inv.allocation.resident.user.fullName
                                ? inv.allocation.resident.user.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                : "R"}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-slate-900 leading-tight">
                                {inv.allocation.resident.user.fullName}
                              </p>
                              <p className="text-[12px] text-slate-500 mt-0.5">
                                {inv.allocation.bed.room.floor.building.name} &bull; Rm{" "}
                                <span className="font-mono font-medium tabular-nums text-slate-700">
                                  {inv.allocation.bed.room.roomNumber}
                                </span>{" "}
                                ({inv.allocation.bed.bedNumber})
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-[13px] font-mono tabular-nums text-slate-600">
                          {new Date(inv.billingMonth).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={
                              isOverdue
                                ? "inline-flex items-center gap-1 text-[13px] font-mono tabular-nums font-medium text-rose-600"
                                : "inline-flex items-center gap-1 text-[13px] font-mono tabular-nums text-slate-600"
                            }
                          >
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500 inline shrink-0" />}
                            {new Date(inv.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right text-[13px] font-mono font-medium tabular-nums text-slate-900">
                          ${inv.totalAmount.toFixed(2)}
                        </td>

                        <td className="px-5 py-3.5 text-right text-[13px] font-mono font-medium tabular-nums text-emerald-600">
                          ${inv.paidAmount.toFixed(2)}
                        </td>

                        <td className="px-5 py-3.5 text-right text-[13px] font-mono font-medium tabular-nums text-slate-900">
                          ${balance.toFixed(2)}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <InvoiceStatusBadge status={inv.status} />
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <InvoiceActions
                            invoice={inv}
                            canCollectPayment={canManageBilling}
                            isResidentUser={isResident}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
