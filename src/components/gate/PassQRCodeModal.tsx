"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, ShieldCheck, Printer, Calendar, Clock, MapPin, User, Home, AlertCircle } from "lucide-react";
import { PassStatusBadge } from "./PassStatusBadge";

interface PassQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pass: {
    id: string;
    reason: string;
    expectedOutTime: Date | string;
    expectedInTime: Date | string;
    actualOutTime?: Date | string | null;
    actualInTime?: Date | string | null;
    status: string;
    isOverdue?: boolean;
    resident: {
      user: {
        fullName: string;
        email: string;
      };
      emergencyPhone: string;
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
  } | null;
}

export function PassQRCodeModal({ isOpen, onClose, pass }: PassQRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!pass || !isOpen) return;

    const payload = JSON.stringify({
      passId: pass.id,
      resident: pass.resident.user.fullName,
      status: pass.status,
      expectedIn: pass.expectedInTime,
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1.5,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating pass QR code:", err));
  }, [pass, isOpen]);

  if (!isOpen || !pass) return null;

  const isNightOut = pass.reason.includes("[NIGHT_OUT]");
  const cleanReason = pass.reason.replace(/\[(DAY_OUTING|NIGHT_OUT)\]\s*/g, "");

  const activeAlloc = pass.resident.allocations?.[0];
  const roomInfo = activeAlloc
    ? `Room ${activeAlloc.bed.room.roomNumber} (${activeAlloc.bed.room.floor.building.name})`
    : "Resident";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Hostel Digital Gate Pass</h3>
              <p className="font-mono tabular-nums text-[11px] text-slate-400">Pass #{pass.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Content Body */}
        <div className="px-6 py-5 space-y-5 print:p-0">
          {/* Status & Type Bar */}
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-[0.08em] ${
                isNightOut
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {isNightOut ? "🌙 Night Out / Extended Leave" : "☀️ Day Outing Pass"}
            </span>
            <PassStatusBadge status={pass.status} isOverdue={pass.isOverdue} />
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200/80">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Gate Pass QR Code"
                className="w-48 h-48 rounded-lg shadow-xs border border-white"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-200 rounded-lg text-slate-400 text-[12px]">
                Generating QR...
              </div>
            )}
            <p className="text-[12px] text-slate-500 mt-2 font-medium">
              Present to Security Guard at Main Gate for Exit / Entry Stamping
            </p>
          </div>

          {/* Resident & Room Details */}
          <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/70 space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Resident Name
              </span>
              <span className="font-semibold text-slate-900">{pass.resident.user.fullName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400" /> Accommodation
              </span>
              <span className="font-medium text-slate-700">{roomInfo}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Expected Out
              </span>
              <span className="font-mono tabular-nums text-[12px] font-medium text-slate-700">
                {new Date(pass.expectedOutTime).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Curfew / Expected In
              </span>
              <span className="font-mono tabular-nums text-[12px] font-semibold text-blue-600">
                {new Date(pass.expectedInTime).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Purpose & Destination:
              </span>
              <p className="text-slate-700 font-medium pl-5 text-[12px] leading-relaxed">
                {cleanReason}
              </p>
            </div>
          </div>

          {/* Warden Approval Stamp */}
          {pass.approvedBy && (
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[12px] text-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Approved by Warden: <strong>{pass.approvedBy.user.fullName}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Pass
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
