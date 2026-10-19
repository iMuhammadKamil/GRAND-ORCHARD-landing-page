"use client";

import { useState, useTransition, useRef } from "react";
import { recordPaymentAction } from "@/app/actions/billing";
import { PaymentMethods } from "@/lib/constants";
import { CreditCard, DollarSign, Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    allocation: {
      resident: {
        user: { fullName: string };
      };
      bed: {
        bedNumber: string;
        room: {
          roomNumber: string;
          floor: { building: { name: string } };
        };
      };
    };
  } | null;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
}: RecordPaymentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethods.CASH);
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen || !invoice) return null;

  const remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const [amount, setAmount] = useState<string>(remainingBalance.toFixed(2));

  const handlePayRemaining = () => {
    setAmount(remainingBalance.toFixed(2));
  };

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
      const res = await recordPaymentAction(formData);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-100 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">
                Record Payment
              </h3>
              <p className="text-[12px] text-slate-500 font-mono tabular-nums">
                {invoice.invoiceNumber} &bull; {invoice.allocation.resident.user.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-slate-50/70 px-6 py-3 border-b border-slate-100 flex items-center justify-between text-[13px]">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Accommodation</span>
            <span className="font-medium text-slate-900">
              {invoice.allocation.bed.room.floor.building.name} - Rm {invoice.allocation.bed.room.roomNumber} ({invoice.allocation.bed.bedNumber})
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Remaining Due</span>
            <span className="font-mono text-[15px] font-medium tracking-[-0.02em] tabular-nums text-rose-600">
              ${remainingBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-[13px]">
          {/* Amount input & Quick Pay Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Payment Amount ($)
              </label>
              <button
                type="button"
                onClick={handlePayRemaining}
                className="text-[12px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Full Balance (${remainingBalance.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-mono">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-7 pr-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium tabular-nums hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
              >
                <option value={PaymentMethods.CASH} className="bg-white text-slate-900 font-medium">Cash (In-Person)</option>
                <option value={PaymentMethods.BANK_TRANSFER} className="bg-white text-slate-900 font-medium">Bank Transfer</option>
                <option value={PaymentMethods.CREDIT_CARD} className="bg-white text-slate-900 font-medium">Debit / Credit Card</option>
                <option value={PaymentMethods.UPI_OR_WALLET} className="bg-white text-slate-900 font-medium">UPI / Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Transaction / Ref #
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="e.g. TXN-8921829"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-mono tabular-nums placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          {/* Receipt Attachment */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Receipt Attachment (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                className="w-full text-[12px] text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 hover:file:bg-slate-200 file:text-[12px] file:font-medium file:text-slate-800 cursor-pointer transition-colors focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12"
              />
            </div>
            <p className="text-[12px] text-slate-500 mt-1">
              Supports PDF, PNG, JPG bank slips or receipt photos.
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Accountant Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at reception counter"
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 text-[12px] ${
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
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || parseFloat(amount) <= 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

