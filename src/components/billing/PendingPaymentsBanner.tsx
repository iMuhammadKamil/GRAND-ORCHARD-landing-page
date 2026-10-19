"use client";

import { useTransition } from "react";
import { verifyPaymentAction, rejectPaymentAction } from "@/app/actions/billing";
import { CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";

interface PendingPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  referenceCode: string | null;
  receiptUrl: string | null;
  paidAt: Date;
  invoice: {
    invoiceNumber: string;
    allocation: {
      resident: {
        user: { fullName: string };
      };
      bed: {
        bedNumber: string;
        room: { roomNumber: string };
      };
    };
  };
}

interface PendingPaymentsBannerProps {
  payments: PendingPayment[];
}

export function PendingPaymentsBanner({ payments }: PendingPaymentsBannerProps) {
  const [isPending, startTransition] = useTransition();

  if (!payments || payments.length === 0) return null;

  const handleApprove = (paymentId: string) => {
    startTransition(async () => {
      await verifyPaymentAction(paymentId);
    });
  };

  const handleReject = (paymentId: string) => {
    const reason = window.prompt("Reason for rejecting payment submission:") || "";
    startTransition(async () => {
      await rejectPaymentAction(paymentId, reason);
    });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-amber-900">
            {payments.length} Pending Resident Payment Submission{payments.length > 1 ? "s" : ""}
          </h3>
        </div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-amber-700">
          Requires Accountant Verification
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {payments.map((p) => (
          <div
            key={p.id}
            className="p-3 bg-white rounded-lg border border-amber-200/80 shadow-subtle flex items-center justify-between gap-3 text-[12px]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[15px] font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                  ${p.amount.toFixed(2)}
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-amber-800">
                  {p.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <p className="text-[13px] font-medium text-slate-700 mt-0.5">
                {p.invoice.allocation.resident.user.fullName} &bull; {p.invoice.invoiceNumber}
              </p>
              <p className="text-[12px] font-mono tabular-nums text-slate-500">
                {p.referenceCode ? `Ref: ${p.referenceCode}` : "No Ref"} &bull;{" "}
                {new Date(p.paidAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {p.receiptUrl && (
                <a
                  href={p.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="View Receipt"
                >
                  <FileText className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => handleApprove(p.id)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                title="Confirm Payment"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleReject(p.id)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                title="Reject Submission"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

