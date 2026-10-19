"use client";

import { useState, useTransition } from "react";
import { checkoutResidentAction } from "@/app/actions/residents";
import { DollarSign, Plus, Trash2, X, AlertCircle, CheckCircle2, Loader2, ClipboardCheck } from "lucide-react";

interface CheckoutModalProps {
  allocation: {
    id: string;
    securityDeposit: number;
    bed: {
      bedNumber: string;
      room: { roomNumber: string };
    };
    resident: {
      user: { fullName: string; email: string };
    };
    invoices: Array<{
      invoiceNumber: string;
      totalAmount: number;
      paidAmount: number;
      status: string;
    }>;
  };
  onClose: () => void;
}

interface DamageItem {
  description: string;
  repairCost: string;
}

export function CheckoutModal({ allocation, onClose }: CheckoutModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [settlement, setSettlement] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState({
    keyReturned: false,
    roomCleared: false,
    bedLinen: false,
    noPropertyDamage: false,
  });
  const [damageItems, setDamageItems] = useState<DamageItem[]>([
    { description: "", repairCost: "" },
  ]);

  // Live settlement calculation
  const outstandingBalance = allocation.invoices
    .filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED")
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const totalDamageCost = damageItems.reduce((sum, item) => {
    const cost = parseFloat(item.repairCost) || 0;
    return sum + cost;
  }, 0);

  const totalDeductions = outstandingBalance + totalDamageCost;
  const refundAmount = Math.max(0, allocation.securityDeposit - totalDeductions);
  const amountDue = Math.max(0, totalDeductions - allocation.securityDeposit);

  const allChecked = Object.values(checklist).every(Boolean);

  const handleCheckout = () => {
    if (!allChecked) {
      setError("Please confirm all checklist items before proceeding.");
      return;
    }
    setError(null);
    const items = damageItems
      .filter((d) => d.description.trim() && parseFloat(d.repairCost) > 0)
      .map((d) => ({ description: d.description, repairCost: parseFloat(d.repairCost) }));

    startTransition(async () => {
      const res = await checkoutResidentAction(allocation.id, items, notes);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSettlement(res.settlement);
      }
    });
  };

  if (settlement) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
        <div className="animate-in fade-in zoom-in-95 bg-white rounded-2xl max-w-md w-full px-6 py-5 shadow-2xl border border-slate-200/80 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">Checkout Complete</h3>
            <p className="text-[12px] text-slate-500">
              {allocation.resident.user.fullName} has been successfully checked out.
              Bed {allocation.bed.bedNumber} is now VACANT.
            </p>
          </div>

          {/* Settlement Table */}
          <div className="bg-slate-50 rounded-lg border border-slate-200/80 divide-y divide-slate-200/80">
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-slate-600">Security Deposit Held</span>
              <span className="font-medium font-mono tabular-nums text-slate-900">+${settlement.depositPaid.toFixed(2)}</span>
            </div>
            {settlement.outstandingBalance > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
                <span className="text-slate-600">Outstanding Invoice Balance</span>
                <span className="font-medium font-mono tabular-nums text-rose-700">−${settlement.outstandingBalance.toFixed(2)}</span>
              </div>
            )}
            {settlement.totalDamageCost > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
                <span className="text-slate-600">Damage Repair Costs</span>
                <span className="font-medium font-mono tabular-nums text-rose-700">−${settlement.totalDamageCost.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex items-center justify-between px-4 py-3 text-[13px] font-semibold rounded-b-lg ${settlement.refundAmount > 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              <span>{settlement.refundAmount > 0 ? "Refund Due to Resident" : "Amount Still Owed"}</span>
              <span className="font-mono tabular-nums">${(settlement.refundAmount || settlement.amountDue).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="animate-in fade-in zoom-in-95 bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto px-6 py-5 shadow-2xl border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between -mx-6 -mt-5 px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-rose-600">Checkout</span>
            <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-slate-900 mt-0.5">
              {allocation.resident.user.fullName}
            </h3>
            <p className="text-[12px] font-mono tabular-nums text-slate-500">
              Room {allocation.bed.room.roomNumber} — {allocation.bed.bedNumber}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[12px] text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Room Handover Checklist</h4>
          </div>
          {Object.entries({
            keyReturned: "Room key / access card returned",
            roomCleared: "Personal belongings fully removed",
            bedLinen: "Bed linen and towels returned",
            noPropertyDamage: "No additional unreported property damage",
          }).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-[13px] font-medium text-slate-700 shadow-2xs">
              <input
                type="checkbox"
                checked={checklist[key as keyof typeof checklist]}
                onChange={(e) => setChecklist((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Damage Items */}
        <div className="space-y-2.5">
          <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Property Damage Assessment
          </h4>
          {damageItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <input
                type="text"
                placeholder="Describe damage (e.g. Broken wardrobe hinge)"
                value={item.description}
                onChange={(e) => {
                  const updated = [...damageItems];
                  updated[idx].description = e.target.value;
                  setDamageItems(updated);
                }}
                className="flex-1 px-3.5 py-2 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
              />
              <div className="relative w-32 shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={item.repairCost}
                  onChange={(e) => {
                    const updated = [...damageItems];
                    updated[idx].repairCost = e.target.value;
                    setDamageItems(updated);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 font-mono font-medium tabular-nums"
                />
              </div>
              {damageItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDamageItems(damageItems.filter((_, i) => i !== idx))}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDamageItems([...damageItems, { description: "", repairCost: "" }])}
            className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer pt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Damage Item
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
            Checkout Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional comments for the record..."
            className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Live Settlement Preview */}
        <div className="bg-slate-50 rounded-lg border border-slate-200/80 divide-y divide-slate-200/80 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="text-slate-600 font-medium">Security Deposit</span>
            <span className="font-medium font-mono tabular-nums text-slate-900">+${allocation.securityDeposit.toFixed(2)}</span>
          </div>
          {outstandingBalance > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-slate-600 font-medium">Outstanding Invoice Balance</span>
              <span className="font-medium font-mono tabular-nums text-rose-700">−${outstandingBalance.toFixed(2)}</span>
            </div>
          )}
          {totalDamageCost > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-slate-600 font-medium">Damage Costs (Live)</span>
              <span className="font-medium font-mono tabular-nums text-rose-700">−${totalDamageCost.toFixed(2)}</span>
            </div>
          )}
          <div className={`flex items-center justify-between px-4 py-3 text-[13px] font-semibold ${refundAmount > 0 ? "bg-emerald-50 text-emerald-800" : amountDue > 0 ? "bg-rose-50 text-rose-800" : "bg-slate-100 text-slate-800"}`}>
            <span>{refundAmount > 0 ? "Estimated Refund" : amountDue > 0 ? "Amount Still Owed" : "Full Settlement (Break Even)"}</span>
            <span className="font-mono tabular-nums">${(refundAmount || amountDue).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 -mx-6 -mb-5 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending || !allChecked}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-4 focus:ring-rose-600/20"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? "Processing Checkout..." : "Confirm & Checkout"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

