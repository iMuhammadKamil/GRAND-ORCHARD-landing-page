"use client";

import React, { useState, useTransition } from "react";
import { requestGatePassAction } from "@/app/actions/gatepass";
import { GatePassTypes } from "@/lib/constants";
import {
  X,
  ShieldCheck,
  Sun,
  Moon,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface ResidentOption {
  id: string;
  fullName: string;
  roomNumber?: string;
}

interface RequestPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
  residentsList?: ResidentOption[];
  myResidentProfileId?: string;
}

export function RequestPassModal({
  isOpen,
  onClose,
  currentUserRole,
  residentsList = [],
  myResidentProfileId,
}: RequestPassModalProps) {
  const [passType, setPassType] = useState<string>(GatePassTypes.DAY_OUTING);
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    myResidentProfileId || (residentsList[0]?.id ?? "")
  );
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");

  // Default times: today out in 30 mins, back by 9:00 PM
  const now = new Date();
  const defaultOut = new Date(now.getTime() + 30 * 60 * 1000);
  const defaultIn = new Date(now);
  defaultIn.setHours(21, 0, 0, 0); // 9:00 PM today

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [expectedOutTime, setExpectedOutTime] = useState(formatDateTimeLocal(defaultOut));
  const [expectedInTime, setExpectedInTime] = useState(formatDateTimeLocal(defaultIn));

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickReasons = [
    "Library Study",
    "Doctor / Medical",
    "Weekend Home Visit",
    "Grocery & Supplies",
    "Family Event",
    "Academic Project",
  ];

  const handlePassTypeChange = (type: string) => {
    setPassType(type);
    if (type === GatePassTypes.DAY_OUTING) {
      // Set expected in to 9:00 PM today
      const todayCurfew = new Date(expectedOutTime ? new Date(expectedOutTime) : now);
      todayCurfew.setHours(21, 0, 0, 0);
      setExpectedInTime(formatDateTimeLocal(todayCurfew));
    } else {
      // Set expected in to tomorrow 6:00 PM
      const tomorrow = new Date(expectedOutTime ? new Date(expectedOutTime) : now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      setExpectedInTime(formatDateTimeLocal(tomorrow));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("passType", passType);
    formData.append("reason", reason);
    formData.append("destination", destination);
    formData.append("expectedOutTime", expectedOutTime);
    formData.append("expectedInTime", expectedInTime);

    if (currentUserRole !== "RESIDENT") {
      formData.append("residentId", selectedResidentId);
    }

    startTransition(async () => {
      const res = await requestGatePassAction(formData);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setReason("");
          setDestination("");
        }, 1500);
      } else {
        setErrorMessage(res.message || "Failed to create gate pass.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Request Gate Pass</h3>
              <p className="text-[12px] text-slate-500">Digital movement authorization &amp; curfew clearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-[12px] text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Pass Type Selector */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-2">
              Select Pass Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePassTypeChange(GatePassTypes.DAY_OUTING)}
                className={`flex flex-col p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  passType === GatePassTypes.DAY_OUTING
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-subtle"
                    : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-[13px]">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Day Outing
                </div>
                <p className="text-[12px] text-slate-500 mt-1">
                  Same-day return before 10:00 PM curfew
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md w-fit">
                  <Sparkles className="w-2.5 h-2.5" /> Auto-Approved
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePassTypeChange(GatePassTypes.NIGHT_OUT)}
                className={`flex flex-col p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  passType === GatePassTypes.NIGHT_OUT
                    ? "bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-900 shadow-subtle"
                    : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-[13px]">
                  <Moon className="w-4 h-4 text-purple-600" />
                  Night Out / Leave
                </div>
                <p className="text-[12px] text-slate-500 mt-1">
                  Overnight stay or multi-day extended leave
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md w-fit">
                  <Clock className="w-2.5 h-2.5" /> Requires Warden Review
                </span>
              </button>
            </div>
          </div>

          {/* Resident Selector (Staff only) */}
          {currentUserRole !== "RESIDENT" && residentsList.length > 0 && (
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1">
                Select Resident
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full text-[13px] rounded-lg border border-slate-300 bg-white p-2.5 font-medium text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
                required
              >
                {residentsList.map((res) => (
                  <option key={res.id} value={res.id} className="bg-white text-slate-900 font-medium">
                    {res.fullName} {res.roomNumber ? `(${res.roomNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Outing Reason & Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Reason for Outing
              </label>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Study session at central library"
              className="w-full text-[13px] rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              required
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickReasons.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReason(chip)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1">
              Destination Location / Address
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. City Public Library, North Block"
                className="w-full text-[13px] rounded-lg border border-slate-300 bg-white p-2.5 pl-8 text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                required
              />
            </div>
          </div>

          {/* Time Bounds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1">
                Departure Time
              </label>
              <input
                type="datetime-local"
                value={expectedOutTime}
                onChange={(e) => setExpectedOutTime(e.target.value)}
                className="w-full text-[13px] font-mono tabular-nums rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1">
                Expected Return (Curfew)
              </label>
              <input
                type="datetime-local"
                value={expectedInTime}
                onChange={(e) => setExpectedInTime(e.target.value)}
                className="w-full text-[13px] font-mono tabular-nums rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
                required
              />
            </div>
          </div>

          {/* Curfew Info Notice */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[12px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Standard Hostel Curfew: 10:00 PM</p>
              <p className="text-amber-800 mt-0.5">
                Students returning past their declared return time or after 10:00 PM without prior
                Night Out approval will be logged as overdue.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Issue Gate Pass
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
