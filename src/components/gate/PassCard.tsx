"use client";

import React, { useState, useTransition } from "react";
import {
  reviewGatePassAction,
  stampGateExitAction,
  stampGateEntryAction,
  cancelGatePassAction,
} from "@/app/actions/gatepass";
import { GatePassStatuses } from "@/lib/constants";
import { PassStatusBadge } from "./PassStatusBadge";
import {
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  X,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Home,
  User,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";

export interface GatePassData {
  id: string;
  reason: string;
  expectedOutTime: Date | string;
  expectedInTime: Date | string;
  actualOutTime?: Date | string | null;
  actualInTime?: Date | string | null;
  status: string;
  isOverdue?: boolean;
  createdAt: Date | string;
  resident: {
    id: string;
    userId: string;
    emergencyPhone: string;
    user: {
      fullName: string;
      email: string;
    };
    allocations?: Array<{
      bed: {
        bedNumber: string;
        room: {
          roomNumber: string;
          floor: {
            building: {
              name: string;
            };
          };
        };
      };
    }>;
  };
  approvedBy?: {
    user: {
      fullName: string;
    };
  } | null;
}

interface PassCardProps {
  pass: GatePassData;
  currentUserRole: string;
  currentUserId: string;
  onOpenQR: (pass: GatePassData) => void;
}

export function PassCard({
  pass,
  currentUserRole,
  currentUserId,
  onOpenQR,
}: PassCardProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const isNightOut = pass.reason.includes("[NIGHT_OUT]");
  const cleanReason = pass.reason.replace(/\[(DAY_OUTING|NIGHT_OUT)\]\s*/g, "");

  const activeAlloc = pass.resident.allocations?.[0];
  const roomInfo = activeAlloc
    ? `Room ${activeAlloc.bed.room.roomNumber} (${activeAlloc.bed.room.floor.building.name})`
    : "Campus Resident";

  const isWardenOrAdmin =
    currentUserRole === "WARDEN" || currentUserRole === "SUPER_ADMIN";
  const isSecurityOrStaff =
    isWardenOrAdmin || currentUserRole === "MAINTENANCE_STAFF";
  const isOwner = pass.resident.userId === currentUserId;

  const handleApprove = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await reviewGatePassAction(pass.id, "APPROVED");
      if (!res.success) setActionError(res.message);
    });
  };

  const handleReject = () => {
    const reason = window.prompt("Reason for declining this gate pass request:");
    if (reason === null) return;

    setActionError(null);
    startTransition(async () => {
      const res = await reviewGatePassAction(pass.id, "REJECTED", reason);
      if (!res.success) setActionError(res.message);
    });
  };

  const handleStampExit = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await stampGateExitAction(pass.id);
      if (!res.success) setActionError(res.message);
    });
  };

  const handleStampEntry = () => {
    let remark: string | null = "";
    if (pass.isOverdue) {
      remark = window.prompt("Overdue entry detected. Enter optional guard remarks:", "Returned past curfew");
      if (remark === null) return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await stampGateEntryAction(pass.id, remark || undefined);
      if (!res.success) setActionError(res.message);
    });
  };

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this gate pass request?")) return;

    setActionError(null);
    startTransition(async () => {
      const res = await cancelGatePassAction(pass.id);
      if (!res.success) setActionError(res.message);
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow ${
        pass.isOverdue
          ? "border-rose-300/80 ring-1 ring-rose-200/60"
          : pass.status === GatePassStatuses.CHECKED_OUT
          ? "border-blue-200/80 hover:border-blue-300"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-[0.08em] ${
                isNightOut
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {isNightOut ? "🌙 Night Out" : "☀️ Day Outing"}
            </span>
            <span className="font-mono tabular-nums text-[11px] font-medium text-slate-400">
              #{pass.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <PassStatusBadge status={pass.status} isOverdue={pass.isOverdue} />
        </div>

        {/* Resident Info */}
        <div className="flex items-center gap-3 mt-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white grid place-items-center font-medium text-[13px] shadow-subtle shrink-0">
            {pass.resident.user.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-[13px] text-slate-900 truncate">
              {pass.resident.user.fullName}
            </h4>
            <p className="text-[12px] text-slate-500 truncate flex items-center gap-1">
              <Home className="w-3 h-3 text-slate-400 shrink-0" />
              {roomInfo}
            </p>
          </div>
        </div>

        {/* Destination & Reason */}
        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-[12px]">
          <div className="flex items-start gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <p className="font-medium line-clamp-2 leading-snug">{cleanReason}</p>
          </div>
        </div>

        {/* Time Bounds Matrix */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 block">
              Expected Departure
            </span>
            <span className="font-mono tabular-nums text-[12px] font-medium text-slate-700 block mt-0.5">
              {new Date(pass.expectedOutTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {pass.actualOutTime && (
              <span className="font-mono tabular-nums text-[11px] text-blue-600 font-medium mt-1 block">
                Out: {new Date(pass.actualOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <div
            className={`p-2.5 rounded-lg border ${
              pass.isOverdue
                ? "bg-rose-50 border-rose-200/80 text-rose-900"
                : "bg-slate-50/80 border-slate-200/70"
            }`}
          >
            <span
              className={`font-mono text-[10px] font-medium uppercase tracking-[0.16em] block ${
                pass.isOverdue ? "text-rose-600" : "text-slate-400"
              }`}
            >
              Curfew / Expected In
            </span>
            <span className="font-mono tabular-nums text-[12px] font-medium block mt-0.5 text-slate-900">
              {new Date(pass.expectedInTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {pass.actualInTime && (
              <span className="font-mono tabular-nums text-[11px] text-emerald-600 font-medium mt-1 block">
                In: {new Date(pass.actualInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {actionError && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 text-rose-600 text-[12px] flex items-center gap-1.5 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2.5">
        {/* QR Code Ticket Button */}
        <button
          type="button"
          onClick={() => onOpenQR(pass)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors hover:border-slate-300 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-600" /> Pass QR
        </button>

        {/* Contextual Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Warden Review Buttons for PENDING */}
          {pass.status === GatePassStatuses.PENDING && isWardenOrAdmin && (
            <>
              <button
                type="button"
                onClick={handleReject}
                disabled={isPending}
                className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                title="Decline Request"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[12px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </>
                )}
              </button>
            </>
          )}

          {/* Security Guard / Warden: Stamp Exit for APPROVED */}
          {pass.status === GatePassStatuses.APPROVED && isSecurityOrStaff && (
            <button
              type="button"
              onClick={handleStampExit}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" /> Stamp Exit
                </>
              )}
            </button>
          )}

          {/* Security Guard / Warden: Stamp Entry for CHECKED_OUT or OVERDUE */}
          {(pass.status === GatePassStatuses.CHECKED_OUT || pass.isOverdue) &&
            isSecurityOrStaff && (
              <button
                type="button"
                onClick={handleStampEntry}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-[12px] transition-colors disabled:opacity-50 text-white cursor-pointer ${
                  pass.isOverdue
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Stamp Return
                  </>
                )}
              </button>
            )}

          {/* Resident Cancel Button for PENDING */}
          {pass.status === GatePassStatuses.PENDING && (isOwner || isWardenOrAdmin) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Cancel Request"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
