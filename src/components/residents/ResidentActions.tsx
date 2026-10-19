"use client";

import { useState } from "react";
import { RoomSwapModal } from "./RoomSwapModal";
import { CheckoutModal } from "./CheckoutModal";
import { ArrowRightLeft, LogOut, Eye, User } from "lucide-react";
import Link from "next/link";

interface ResidentRow {
  resident: {
    id: string;
    gender: string;
    user: { fullName: string; email: string };
  };
  allocation: {
    id: string;
    status: string;
    monthlyRent: number;
    securityDeposit: number;
    checkedInAt: Date | null;
    bed: {
      bedNumber: string;
      room: { roomNumber: string; floor: { building: { name: string } } };
    };
    invoices: any[];
    damageReports: any[];
  };
}

interface ResidentActionsProps {
  row: ResidentRow;
  canActAsStaff: boolean;
  availableBuildings: any[];
}

export function ResidentActions({ row, canActAsStaff, availableBuildings }: ResidentActionsProps) {
  const [swapOpen, setSwapOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Link
          href={`/dashboard/residents/${row.resident.id}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="View Profile"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        {canActAsStaff && row.allocation.status === "ACTIVE" && (
          <>
            <button
              type="button"
              onClick={() => setSwapOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Swap Room"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Checkout Resident"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {swapOpen && (
        <RoomSwapModal
          allocation={{
            id: row.allocation.id,
            bed: row.allocation.bed,
            resident: { gender: row.resident.gender, user: row.resident.user },
          }}
          availableBuildings={availableBuildings.filter(
            (b) => b.gender === row.resident.gender || b.gender === "COED"
          )}
          onClose={() => setSwapOpen(false)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          allocation={{
            id: row.allocation.id,
            securityDeposit: row.allocation.securityDeposit,
            bed: row.allocation.bed,
            resident: row.resident,
            invoices: row.allocation.invoices,
          }}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}
