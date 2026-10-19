"use client";

import { BedStatuses, UserRoles } from "@/lib/constants";
import { Bed, Wrench, Lock, CheckCircle2, Bookmark } from "lucide-react";

interface BedBadgeProps {
  bed: {
    id: string;
    bedNumber: string;
    status: string;
    allocations?: Array<{
      resident: {
        user: {
          fullName: string;
        };
      };
    }>;
  };
  userRole: string;
  onClick?: () => void;
}

export function BedStatusBadge({ bed, userRole, onClick }: BedBadgeProps) {
  const isOccupied = bed.status === BedStatuses.OCCUPIED;
  const isVacant = bed.status === BedStatuses.VACANT;
  const isReserved = bed.status === BedStatuses.RESERVED;
  const isMaintenance = bed.status === BedStatuses.MAINTENANCE;

  const tenantName = bed.allocations && bed.allocations.length > 0 ? bed.allocations[0].resident.user.fullName : null;

  const canEdit =
    userRole === UserRoles.SUPER_ADMIN ||
    userRole === UserRoles.WARDEN ||
    (userRole === UserRoles.MAINTENANCE_STAFF && isMaintenance);

  const styleMap: Record<string, string> = {
    [BedStatuses.OCCUPIED]: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    [BedStatuses.VACANT]: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    [BedStatuses.RESERVED]: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    [BedStatuses.MAINTENANCE]: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      onClick={canEdit ? onClick : undefined}
      disabled={!canEdit}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
        styleMap[bed.status] || "bg-slate-50 text-slate-600 border-slate-200"
      } ${canEdit ? "cursor-pointer" : "cursor-default opacity-90"}`}
      title={
        isOccupied
          ? `Occupied by: ${tenantName || "Active Resident"} (Locked)`
          : canEdit
          ? `Click to manage status (${bed.status})`
          : `Status: ${bed.status}`
      }
    >
      {isOccupied && <Lock className="w-3 h-3 text-blue-700" />}
      {isVacant && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
      {isReserved && <Bookmark className="w-3 h-3 text-amber-700" />}
      {isMaintenance && <Wrench className="w-3 h-3 text-rose-700" />}

      <span>{bed.bedNumber}</span>

      {isOccupied && tenantName && (
        <span className="text-[10px] text-blue-700 font-normal truncate max-w-[80px]">
          ({tenantName.split(" ")[0]})
        </span>
      )}
    </button>
  );
}
