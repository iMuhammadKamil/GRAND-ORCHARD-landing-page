"use client";

import { useActionState, useState } from "react";
import { createRoomAction } from "@/app/actions/properties";
import { DoorOpen, Layers, Bed, DollarSign, X, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface FloorOption {
  id: string;
  floorNumber: number;
}

interface RoomTypeOption {
  id: string;
  name: string;
  capacity: number;
  hasAC: boolean;
  hasAttachedBath: boolean;
  baseRent: number;
}

interface AddRoomModalProps {
  buildingName: string;
  floors: FloorOption[];
  roomTypes: RoomTypeOption[];
  onClose: () => void;
}

export function AddRoomModal({
  buildingName,
  floors,
  roomTypes,
  onClose,
}: AddRoomModalProps) {
  const [state, formAction, isPending] = useActionState(createRoomAction, null);
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id || "");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(roomTypes[0]?.id || "");
  const [roomNumber, setRoomNumber] = useState("");

  const selectedType = roomTypes.find((t) => t.id === selectedRoomTypeId);
  const capacity = selectedType ? selectedType.capacity : 1;
  const bedLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              {buildingName}
            </span>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mt-0.5">
              Add New Room
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
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

        <form action={formAction} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Target Floor
              </label>
              <select
                name="floorId"
                value={selectedFloorId}
                onChange={(e) => setSelectedFloorId(e.target.value)}
                required
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
              >
                {floors.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white text-slate-900 font-medium">
                    Floor {f.floorNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Room Number / Tag
              </label>
              <div className="relative">
                <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 104, 205"
                  required
                  className="w-full pl-9 pr-3 py-2 text-[13px] font-mono rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Room Type Template
            </label>
            <select
              name="roomTypeId"
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
            >
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id} className="bg-white text-slate-900 font-medium">
                  {t.name} ({t.capacity} Beds &bull; ${t.baseRent.toFixed(2)}/mo {t.hasAC ? "• AC" : ""})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Provisioning Preview Box */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-[12px]">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Atomic Bed Auto-Provisioning Preview</span>
            </div>
            <p className="text-[12px] text-blue-800">
              Based on <strong className="font-semibold">{selectedType?.name || "selected type"}</strong>, the system will automatically create the room and provision <strong>{capacity} Vacant bed(s)</strong> in an atomic transaction:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from({ length: capacity }).map((_, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium font-mono rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <Bed className="w-3 h-3 text-emerald-600" />
                  Bed {roomNumber || "..."}-{bedLetters[idx] || idx + 1} (VACANT)
                </span>
              ))}
            </div>
          </div>

          <div className="-mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Creating Room & Beds..." : "Create Room & Auto-Provision Beds"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
