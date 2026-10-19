"use client";

import { useState, useTransition, useRef } from "react";
import { residentSubmitPaymentAction } from "@/app/actions/billing";
import { PaymentMethods } from "@/lib/constants";
import { Upload, DollarSign, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface ResidentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
  };
}

export function ResidentPaymentModal({
  isOpen,
  onClose,
  invoice,
}: ResidentPaymentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethods.BANK_TRANSFER);
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("invoiceId", invoice.id);
    formData.append("amount", amount);
    formData.append("paymentMethod", paymentMethod);
    if (referenceCode) formData.append("referenceCode", referenceCode);
    if (notes) formData.append("notes", notes);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("receiptFile", fileInputRef.current.files[0]);
    }

    startTransition(async () => {
      const res = await residentSubmitPaymentAction(formData);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">
                Submit Payment Proof
              </h3>
              <p className="text-[12px] text-slate-500 font-mono tabular-nums">
                {invoice.invoiceNumber} &bull; Due: ${remaining.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-[13px]">
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Amount Paid ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono font-medium tabular-nums text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
              >
                <option value={PaymentMethods.BANK_TRANSFER}>Bank Transfer</option>
                <option value={PaymentMethods.UPI_OR_WALLET}>UPI / Mobile Wallet</option>
                <option value={PaymentMethods.CREDIT_CARD}>Card Slip</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                UTR / Reference #
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="Transaction ID"
                required
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono tabular-nums text-slate-900 placeholder:text-slate-400 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Upload Screenshot or Receipt Slip
            </label>
            <div className="p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                required
                className="w-full text-[12px] text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-[12px] text-slate-500 mt-1.5">
                Upload bank transfer confirmation screenshot or scan (JPG, PNG, PDF).
              </p>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-[12px] ${
                feedback.success
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

