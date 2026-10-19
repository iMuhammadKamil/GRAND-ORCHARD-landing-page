"use client";

import { useState, useTransition } from "react";
import { swapResidentRoomAction } from "@/app/actions/residents";
import { SmartBedPicker } from "./SmartBedPicker";
import { ArrowRightLeft, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface RoomSwapModalProps {
  allocation: {
    id: string;
    bed: {
      bedNumber: string;
      room: {
        roomNumber: string;
        floor: {
          building: { name: string };
        };
      };
    };
    resident: {
      gender: string;
      user: { fullName: string };
    };
  };
  availableBuildings: any[];
  onClose: () => void;
}

export function RoomSwapModal({ allocation, availableBuildings, onClose }: RoomSwapModalProps) {
  const [targetBedId, setTargetBedId] = useState("");
  const [targetBedLabel, setTargetBedLabel] = useState("");
  const [targetRoomInfo, setTargetRoomInfo] = useState<{ roomNumber: string; buildingName: string; baseRent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentBedLabel = `${allocation.bed.room.floor.building.name} — Room ${allocation.bed.room.roomNumber} — ${allocation.bed.bedNumber}`;

  const handleSwap = () => {
    if (!targetBedId) {
      setError("Please select a target bed first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await swapResidentRoomAction(allocation.id, targetBedId);
      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="animate-in fade-in zoom-in-95 bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto px-6 py-5 shadow-2xl border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between -mx-6 -mt-5 px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-blue-600">Room Swap</span>
            <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-slate-900 mt-0.5">
              Relocate {allocation.resident.user.fullName.split(" ")[0]}
            </h3>
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

        {/* Current Bed */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-[13px]">
          <div className="flex-1">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-blue-600">Current Bed</p>
            <p className="font-medium font-mono tabular-nums text-blue-900">{currentBedLabel}</p>
          </div>
          <ArrowRightLeft className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1 text-right">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-600">New Bed</p>
            <p className="font-medium font-mono tabular-nums text-slate-900">
              {targetRoomInfo
                ? `${targetRoomInfo.buildingName} — Room ${targetRoomInfo.roomNumber} — ${targetBedLabel}`
                : "Not selected yet"}
            </p>
          </div>
        </div>

        {/* Bed Picker */}
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-2">
            Select a Vacant Bed for Relocation:
          </p>
          <SmartBedPicker
            buildings={availableBuildings}
            selectedBedId={targetBedId}
            onSelect={(bedId, bedLabel, roomInfo) => {
              setTargetBedId(bedId);
              setTargetBedLabel(bedLabel);
              setTargetRoomInfo(roomInfo);
            }}
          />
        </div>

        {/* Confirmation summary */}
        {targetBedId && targetRoomInfo && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>{allocation.resident.user.fullName}</strong> will be atomically moved from{" "}
              <strong>Room {allocation.bed.room.roomNumber}</strong> to{" "}
              <strong>Room {targetRoomInfo.roomNumber} — {targetBedLabel}</strong>.
              New monthly rent: <strong className="font-mono tabular-nums">${targetRoomInfo.baseRent.toFixed(2)}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 -mx-6 -mb-5 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSwap}
            disabled={isPending || !targetBedId}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? "Swapping Rooms..." : "Confirm Room Swap"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

