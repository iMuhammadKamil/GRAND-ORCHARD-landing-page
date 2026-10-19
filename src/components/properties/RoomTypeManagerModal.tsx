"use client";

import { useActionState, useState } from "react";
import { createRoomTypeAction } from "@/app/actions/properties";
import { Layers, Plus, Check, X, AlertCircle, Loader2 } from "lucide-react";

interface RoomTypeData {
  id: string;
  name: string;
  capacity: number;
  baseRent: number;
  depositAmount: number;
  hasAC: boolean;
  hasAttachedBath: boolean;
  _count?: {
    rooms: number;
  };
}

interface RoomTypeManagerModalProps {
  roomTypes: RoomTypeData[];
  onClose: () => void;
}

export function RoomTypeManagerModal({ roomTypes, onClose }: RoomTypeManagerModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createRoomTypeAction, null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Pricing Templates
            </span>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mt-0.5">
              Room Types & Pricing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {state?.error && (
          <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Existing Room Types List */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Configured Room Categories ({roomTypes.length})
            </h4>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Room Type</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomTypes.map((rt) => (
              <div
                key={rt.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-subtle space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-[13px] tracking-[-0.01em] text-slate-900">{rt.name}</h5>
                    <p className="text-[12px] text-slate-500">{rt.capacity} Beds per Room</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium tabular-nums text-[13px] text-emerald-700">
                      ${rt.baseRent.toFixed(2)}
                      <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                    </p>
                    <p className="font-mono text-[10px] tabular-nums text-slate-400">Dep: ${rt.depositAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className={`px-1.5 py-0.5 rounded-lg font-medium ${rt.hasAC ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                    {rt.hasAC ? "AC" : "Non-AC"}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-lg font-medium ${rt.hasAttachedBath ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-500"}`}>
                    {rt.hasAttachedBath ? "Attached Bath" : "Common Bath"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Room Type Form */}
        {showAddForm && (
          <form action={formAction} className="px-6 py-5 border-t border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-purple-700">
                Create New Pricing Template
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-[12px] text-slate-500 hover:text-slate-700 underline underline-offset-2 font-medium"
              >
                Hide Form
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Studio Suite AC"
                required
                className="w-full px-3.5 py-2.5 text-[13px] font-medium rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Bed Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue="2"
                  min="1"
                  max="6"
                  required
                  className="w-full px-3.5 py-2.5 text-[13px] font-semibold font-mono rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Monthly Rent ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="baseRent"
                  placeholder="400.00"
                  required
                  className="w-full px-3.5 py-2.5 text-[13px] font-semibold font-mono rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Deposit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="depositAmount"
                  placeholder="800.00"
                  required
                  className="w-full px-3.5 py-2.5 text-[13px] font-semibold font-mono rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="hasAC"
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Air Conditioned (AC)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="hasAttachedBath"
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Attached Bathroom</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isPending ? "Saving..." : "Save Room Type Template"}</span>
              </button>
            </div>
          </form>
        )}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
