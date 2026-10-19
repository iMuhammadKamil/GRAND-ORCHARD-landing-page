"use client";

import React, { useState, useTransition } from "react";
import { stampGateEntryAction } from "@/app/actions/gatepass";
import { AlertTriangle, Clock, Phone, Home, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface OverduePass {
  id: string;
  reason: string;
  expectedOutTime: Date | string;
  expectedInTime: Date | string;
  resident: {
    user: {
      fullName: string;
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
}

interface CurfewAlertBannerProps {
  overduePasses: OverduePass[];
  userRole: string;
}

export function CurfewAlertBanner({ overduePasses, userRole }: CurfewAlertBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeStampId, setActiveStampId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!overduePasses || overduePasses.length === 0) return null;

  const handleStampReturn = (passId: string) => {
    const remark = window.prompt("Optional remarks for late entry (e.g. traffic delay, warned):", "Late entry logged at gate");
    if (remark === null) return; // user cancelled

    setActiveStampId(passId);
    startTransition(async () => {
      await stampGateEntryAction(passId, remark);
      setActiveStampId(null);
    });
  };

  const getMinutesOverdue = (expectedIn: Date | string) => {
    const now = new Date();
    const expected = new Date(expectedIn);
    const diffMs = now.getTime() - expected.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));

    if (diffMins < 60) return `${diffMins}m late`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m late`;
  };

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-card text-rose-950 mb-6 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-rose-600 text-white shadow-subtle animate-bounce">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-rose-900">
                Curfew Breach Watchlist
              </h3>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] tabular-nums bg-rose-600 text-white px-2 py-0.5 rounded-full">
                {overduePasses.length} {overduePasses.length === 1 ? "Student" : "Students"} Overdue
              </span>
            </div>
            <p className="text-[12px] text-rose-700 mt-0.5">
              Active gate passes whose declared return curfew has passed without recorded entry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors flex items-center gap-1 text-[12px] font-medium"
        >
          {isExpanded ? (
            <>
              Hide <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View List <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded List */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-rose-200 grid grid-cols-1 md:grid-cols-2 gap-3">
          {overduePasses.map((pass) => {
            const alloc = pass.resident.allocations?.[0];
            const roomNumber = alloc ? alloc.bed.room.roomNumber : "N/A";
            const buildingName = alloc ? alloc.bed.room.floor.building.name : "";

            return (
              <div
                key={pass.id}
                className="bg-white/90 backdrop-blur-xs p-3.5 rounded-lg border border-rose-200/80 shadow-subtle flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[12px] text-slate-900">
                      {pass.resident.user.fullName}
                    </span>
                    <span className="font-mono text-[10px] font-medium tabular-nums bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getMinutesOverdue(pass.expectedInTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[12px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      Room {roomNumber} ({buildingName})
                    </span>
                    {pass.resident.emergencyPhone && (
                      <a
                        href={`tel:${pass.resident.emergencyPhone}`}
                        className="flex items-center gap-1 font-medium text-rose-700 hover:text-rose-800 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {pass.resident.emergencyPhone}
                      </a>
                    )}
                  </div>
                </div>

                {userRole !== "RESIDENT" && (
                  <button
                    type="button"
                    onClick={() => handleStampReturn(pass.id)}
                    disabled={isPending && activeStampId === pass.id}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
                  >
                    {isPending && activeStampId === pass.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stamp In
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
