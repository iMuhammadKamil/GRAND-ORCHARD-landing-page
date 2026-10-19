"use client";

import { useState } from "react";
import { BatchInvoiceModal } from "./BatchInvoiceModal";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { UtilityMeterModal } from "./UtilityMeterModal";
import { Zap, Plus, Gauge } from "lucide-react";

interface BillingHeaderActionsProps {
  activeLeasesCount: number;
  activeAllocations: any[];
  rooms: any[];
}

export function BillingHeaderActions({
  activeLeasesCount,
  activeAllocations,
  rooms,
}: BillingHeaderActionsProps) {
  const [batchOpen, setBatchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [meterOpen, setMeterOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={() => setMeterOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors focus:outline-hidden focus:ring-4 focus:ring-amber-500/12 cursor-pointer"
          title="Split electricity units across room occupants"
        >
          <Gauge className="w-4 h-4 text-amber-700" />
          <span>Sub-Meter Utility</span>
        </button>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>New Invoice</span>
        </button>

        <button
          onClick={() => setBatchOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-slate-300" />
          <span>Generate Monthly Rent</span>
        </button>
      </div>

      <BatchInvoiceModal
        isOpen={batchOpen}
        onClose={() => setBatchOpen(false)}
        activeLeasesCount={activeLeasesCount}
      />

      <CreateInvoiceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        activeAllocations={activeAllocations}
      />

      <UtilityMeterModal
        isOpen={meterOpen}
        onClose={() => setMeterOpen(false)}
        rooms={rooms}
      />
    </>
  );
}
