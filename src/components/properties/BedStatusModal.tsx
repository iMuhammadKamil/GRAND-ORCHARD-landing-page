"use client";

import { useState, useTransition } from "react";
import { updateBedStatusAction } from "@/app/actions/properties";
import { BedStatuses, UserRoles } from "@/lib/constants";
import { Wrench, ShieldAlert, CheckCircle2, Bookmark, AlertCircle, Loader2, X } from "lucide-react";

interface BedWithContext {
  id: string;
  bedNumber: string;
  status: string;
  room: {
    roomNumber: string;
    roomType: {
      name: string;
      baseRent: number;
    };
  };
  allocations?: Array<{
    resident: {
      user: {
        fullName: string;
        email: string;
      };
    };
  }>;
}

interface BedStatusModalProps {
  bed: BedWithContext | null;
  userRole: string;
  onClose: () => void;
}

export function BedStatusModal({ bed, userRole, onClose }: BedStatusModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!bed) return null;

  const activeTenant = bed.allocations && bed.allocations.length > 0 ? bed.allocations[0].resident.user : null;
  const isOccupied = bed.status === BedStatuses.OCCUPIED;

  const handleStatusChange = (newStatus: string) => {
    setError(null);
    startTransition(async () => {
      const res = await updateBedStatusAction(bed.id, newStatus);
      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  const isMaintStaff = userRole === UserRoles.MAINTENANCE_STAFF;
  const isAdminOrWarden = userRole === UserRoles.SUPER_ADMIN || userRole === UserRoles.WARDEN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Manage Bed Status
            </span>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mt-0.5">
              Room {bed.room.roomNumber} &bull; {bed.bedNumber}
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

        {error && (
          <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {isOccupied && activeTenant ? (
          <div className="mx-6 my-5 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-[13px]">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Bed Currently Occupied</span>
            </div>
            <p className="text-[12px] text-blue-900">
              Assigned to: <strong className="font-semibold">{activeTenant.fullName}</strong> ({activeTenant.email})
            </p>
            <p className="text-[12px] text-blue-700">
              Safety Guardrail: Occupied beds are locked to protect active lease contracts. To liberate this bed, process a formal resident checkout.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-3">
            <p className="text-[13px] text-slate-600 font-medium">
              Select a new operational status for this bed:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option: VACANT */}
              {(isAdminOrWarden || (isMaintStaff && bed.status === BedStatuses.MAINTENANCE)) && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(BedStatuses.VACANT)}
                  disabled={isPending || bed.status === BedStatuses.VACANT}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    bed.status === BedStatuses.VACANT
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Mark as Vacant</p>
                      <p className="text-[12px] text-slate-500">Available for student bookings</p>
                    </div>
                  </div>
                  {bed.status === BedStatuses.VACANT && (
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              )}

              {/* Option: RESERVED */}
              {isAdminOrWarden && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(BedStatuses.RESERVED)}
                  disabled={isPending || bed.status === BedStatuses.RESERVED}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    bed.status === BedStatuses.RESERVED
                      ? "border-amber-400 bg-amber-50 text-amber-950 font-semibold shadow-xs"
                      : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Mark as Reserved</p>
                      <p className="text-[12px] text-slate-500">Held for an incoming resident</p>
                    </div>
                  </div>
                  {bed.status === BedStatuses.RESERVED && (
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              )}

              {/* Option: MAINTENANCE */}
              {isAdminOrWarden && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(BedStatuses.MAINTENANCE)}
                  disabled={isPending || bed.status === BedStatuses.MAINTENANCE}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    bed.status === BedStatuses.MAINTENANCE
                      ? "border-rose-500 bg-rose-50 text-rose-950 font-semibold shadow-xs"
                      : "border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Mark for Maintenance</p>
                      <p className="text-[12px] text-slate-500">Requires repairs or deep cleaning</p>
                    </div>
                  </div>
                  {bed.status === BedStatuses.MAINTENANCE && (
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
