import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { UserRoles } from "@/lib/constants";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { PrintButton } from "@/components/billing/PrintButton";
import { Building2, ArrowLeft, CheckCircle2, ShieldCheck, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface InvoiceVoucherPageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function InvoiceVoucherPage({ params }: InvoiceVoucherPageProps) {
  const { invoiceId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
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
                  roomType: true,
                  floor: { include: { building: true } },
                },
              },
            },
          },
        },
      },
      items: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!invoice) notFound();

  // RBAC check: residents can only see their own invoice
  if (user.role === UserRoles.RESIDENT) {
    if (invoice.allocation.resident.userId !== user.id) {
      redirect("/dashboard/billing");
    }
  }

  const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);

  return (
    <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Billing Ledger
          </Link>

          <PrintButton />
        </div>

        {/* Printable Invoice Container */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:bg-white print:text-black print:border-b print:border-gray-200 print:p-0 print:pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg text-white print:border print:border-gray-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em]">
                    Kamix Hostel Management
                  </h1>
                  <p className="text-[12px] text-slate-300 print:text-gray-600">
                    Grand Greenwood Central Campus Residence
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 print:text-gray-500 block">
                Official Billing Voucher
              </span>
              <p className="text-xl font-mono font-medium tracking-[-0.02em] tabular-nums text-blue-400 print:text-gray-900">
                {invoice.invoiceNumber}
              </p>
              <div className="pt-1">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            {/* Meta Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-[13px] pb-6 border-b border-slate-100">
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block mb-1">
                  Billed To
                </span>
                <p className="font-semibold text-slate-900 text-[13px]">
                  {invoice.allocation.resident.user.fullName}
                </p>
                <p className="text-slate-500 text-[12px]">
                  {invoice.allocation.resident.user.email}
                </p>
                {invoice.allocation.resident.user.phoneNumber && (
                  <p className="text-slate-500 text-[12px]">
                    {invoice.allocation.resident.user.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block mb-1">
                  Accommodation
                </span>
                <p className="font-semibold text-slate-900">
                  {invoice.allocation.bed.room.floor.building.name}
                </p>
                <p className="text-slate-600 font-mono tabular-nums">
                  Room {invoice.allocation.bed.room.roomNumber} &bull; Bed{" "}
                  {invoice.allocation.bed.bedNumber}
                </p>
                <p className="text-slate-500 text-[12px]">
                  {invoice.allocation.bed.room.roomType.name}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
                    Billing Period
                  </span>
                  <p className="font-semibold text-slate-900">
                    {new Date(invoice.billingMonth).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
                    Payment Due Date
                  </span>
                  <p className="font-semibold font-mono tabular-nums text-rose-600">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-3">
                Itemized Charges
              </h3>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-700">
                            {item.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] font-medium tabular-nums text-slate-900">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Reconciliation */}
            <div className="flex flex-col sm:flex-row justify-end">
              <div className="w-full sm:w-72 bg-slate-50/70 rounded-lg p-4 border border-slate-200 space-y-2 text-[13px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium tabular-nums">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.taxOrDiscount !== 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax / Adjustment</span>
                    <span className="font-mono font-medium tabular-nums">${invoice.taxOrDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-semibold border-t border-slate-200 pt-2">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums">${invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Paid</span>
                  <span className="font-mono tabular-nums">-${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-semibold border-t border-dashed border-slate-300 pt-2 text-[15px]">
                  <span>Balance Due</span>
                  <span className="font-mono tabular-nums">${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Transactions History */}
            {invoice.payments.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Recorded Payment History
                </h3>
                <div className="space-y-2">
                  {invoice.payments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 flex items-center justify-between text-[13px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium tabular-nums text-slate-900">
                            ${pmt.amount.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-800">
                            {pmt.paymentMethod.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[12px] font-mono tabular-nums text-slate-500 mt-0.5">
                          {new Date(pmt.paidAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          &bull; Verified by {pmt.verifiedBy || "System"}
                        </p>
                        {pmt.referenceCode && (
                          <p className="text-[12px] font-mono text-slate-400 mt-0.5">
                            Ref: {pmt.referenceCode}
                          </p>
                        )}
                      </div>

                      {pmt.receiptUrl && (
                        <a
                          href={pmt.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 text-[12px]"
                        >
                          View Receipt Slip &rarr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hostel Footer Stamp */}
            <div className="pt-6 border-t border-slate-200 text-center text-[12px] text-slate-400 space-y-1">
              <p className="font-medium text-slate-500">
                Thank you for staying at Kamix Hostel.
              </p>
              <p>
                Computer-generated invoice voucher. For queries, contact Accounts Department at accounts@kamixhms.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

