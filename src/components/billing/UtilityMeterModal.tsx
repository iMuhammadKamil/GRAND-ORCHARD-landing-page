"use client";

import { useState, useTransition } from "react";
import { recordRoomUtilityMeterAction } from "@/app/actions/billing";
import { Gauge, Users, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface RoomOption {
  id: string;
  roomNumber: string;
  floor: {
    building: { name: string };
  };
  beds: {
    allocations: {
      id: string;
      resident: { user: { fullName: string } };
    }[];
  }[];
}

interface UtilityMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomOption[];
}

export function UtilityMeterModal({
  isOpen,
  onClose,
  rooms,
}: UtilityMeterModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || "");
  const [previousUnits, setPreviousUnits] = useState(120);
  const [currentUnits, setCurrentUnits] = useState(185);
  const [ratePerUnit, setRatePerUnit] = useState(0.18);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId);
  const activeOccupants = currentRoom
    ? currentRoom.beds.flatMap((b) => b.allocations)
    : [];

  const unitsConsumed = Math.max(0, currentUnits - previousUnits);
  const totalCost = unitsConsumed * ratePerUnit;
  const perPersonCost = activeOccupants.length > 0 ? totalCost / activeOccupants.length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await recordRoomUtilityMeterAction({
        roomId: selectedRoomId,
        previousUnits,
        currentUnits,
        ratePerUnit,
        dueDate,
      });
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-amber-100 text-amber-700">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">
                Sub-Meter Utility Calculator
              </h3>
              <p className="text-[12px] text-slate-500">
                Auto-split electricity units across room occupants
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-[13px]">
          {/* Room Selection */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Select Room
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
            >
              {rooms.map((room) => {
                const occupantsCount = room.beds.flatMap((b) => b.allocations).length;
                return (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} ({room.floor.building.name}) &bull; {occupantsCount} active occupant{occupantsCount !== 1 ? "s" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Occupants Indicator */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
            <Users className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[12px] text-amber-950 font-medium">
              <span className="font-semibold">{activeOccupants.length} Resident Occupant(s):</span>{" "}
              {activeOccupants.length > 0
                ? activeOccupants.map((o) => o.resident.user.fullName).join(", ")
                : "No active occupants currently registered in this room"}
            </div>
          </div>

          {/* Meter Readings Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Previous Units (kWh)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={previousUnits}
                onChange={(e) => setPreviousUnits(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono font-medium tabular-nums text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Current Units (kWh)
              </label>
              <input
                type="number"
                step="0.1"
                min={previousUnits}
                value={currentUnits}
                onChange={(e) => setCurrentUnits(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono font-medium tabular-nums text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          {/* Rate per Unit & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Rate / Unit ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono font-medium tabular-nums text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 font-mono tabular-nums text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          {/* Calculation summary */}
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between text-[13px] text-slate-600">
              <span>Units Consumed</span>
              <span className="font-mono font-medium tabular-nums text-slate-900">{unitsConsumed.toFixed(1)} kWh</span>
            </div>
            <div className="flex justify-between text-[13px] text-slate-600">
              <span>Total Room Cost</span>
              <span className="font-mono font-medium tabular-nums text-slate-900">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-amber-900 font-semibold pt-2 border-t border-slate-200">
              <span>Split Per Occupant ({activeOccupants.length})</span>
              <span className="font-mono text-[15px] font-semibold tracking-[-0.02em] tabular-nums text-amber-800">${perPersonCost.toFixed(2)} / person</span>
            </div>
          </div>

          {/* Feedback */}
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

          {/* Footer Actions */}
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
              disabled={isPending || activeOccupants.length === 0 || unitsConsumed <= 0}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-amber-500/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Bills...
                </>
              ) : (
                <>
                  <Gauge className="w-3.5 h-3.5" />
                  Bill Utility &amp; Split
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

