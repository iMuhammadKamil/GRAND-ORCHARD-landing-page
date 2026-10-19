"use client";

import { useState, useTransition } from "react";
import { createAdHocInvoiceAction, AdHocItemInput } from "@/app/actions/billing";
import { InvoiceItemTypes } from "@/lib/constants";
import { FilePlus, Plus, Trash2, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface AllocationOption {
  id: string;
  monthlyRent: number;
  resident: {
    user: { fullName: string; email: string };
  };
  bed: {
    bedNumber: string;
    room: {
      roomNumber: string;
      floor: { building: { name: string } };
    };
  };
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAllocations: AllocationOption[];
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  activeAllocations,
}: CreateInvoiceModalProps) {
  const [allocationId, setAllocationId] = useState(activeAllocations[0]?.id || "");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState<AdHocItemInput[]>([
    {
      type: InvoiceItemTypes.ELECTRICITY_SUBMETER,
      description: "Electricity Sub-Meter Consumption",
      amount: 45,
    },
  ]);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        type: InvoiceItemTypes.DAMAGE_FEE,
        description: "Miscellaneous / Maintenance Fee",
        amount: 20,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof AdHocItemInput,
    val: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await createAdHocInvoiceAction({
        allocationId,
        dueDate,
        billingMonth: new Date().toISOString(),
        items,
      });
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
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">
                Create Ad-Hoc Invoice
              </h3>
              <p className="text-[12px] text-slate-500">
                Custom billing for utilities, damages, or fines
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-[13px] overflow-y-auto flex-1">
          {/* Target resident */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Select Resident Lease
            </label>
            <select
              value={allocationId}
              onChange={(e) => setAllocationId(e.target.value)}
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
            >
              {activeAllocations.map((alloc) => (
                <option key={alloc.id} value={alloc.id} className="bg-white text-slate-900 font-medium">
                  {alloc.resident.user.fullName} &bull; Room {alloc.bed.room.roomNumber} ({alloc.bed.bedNumber}) - {alloc.bed.room.floor.building.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-mono tabular-nums hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/70"
                >
                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateItem(idx, "type", e.target.value)}
                    className="w-36 px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
                  >
                    <option value={InvoiceItemTypes.ELECTRICITY_SUBMETER} className="bg-white text-slate-900">Electricity</option>
                    <option value={InvoiceItemTypes.DAMAGE_FEE} className="bg-white text-slate-900">Damage Fee</option>
                    <option value={InvoiceItemTypes.LATE_PENALTY} className="bg-white text-slate-900">Late Penalty</option>
                    <option value={InvoiceItemTypes.MESS_FEE} className="bg-white text-slate-900">Mess Fee</option>
                    <option value={InvoiceItemTypes.RENT} className="bg-white text-slate-900">Rent Adjustment</option>
                  </select>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                    placeholder="Item description"
                    required
                    className="flex-1 px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                  />

                  <div className="relative w-24">
                    <span className="absolute left-2.5 top-1.5 text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={item.amount}
                      onChange={(e) =>
                        handleUpdateItem(idx, "amount", parseFloat(e.target.value) || 0)
                      }
                      required
                      className="w-full pl-6 pr-2 py-1.5 text-[12px] rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium tabular-nums hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Preview */}
            <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Total Invoiced</span>
              <span className="font-mono text-[17px] font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Feedback */}
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
              disabled={isPending || totalAmount <= 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <FilePlus className="w-3.5 h-3.5" />
                  Issue Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

