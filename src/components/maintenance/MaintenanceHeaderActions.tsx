"use client";

import { useState } from "react";
import { CreateTicketModal } from "./CreateTicketModal";
import { Plus, LayoutGrid, List } from "lucide-react";

interface MaintenanceHeaderActionsProps {
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  residentsList?: any[];
  isStaffMode?: boolean;
}

export function MaintenanceHeaderActions({
  viewMode,
  onViewModeChange,
  residentsList,
  isStaffMode = false,
}: MaintenanceHeaderActionsProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-subtle">
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
              viewMode === "kanban"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>

        {/* Report Issue Button */}
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>
      </div>

      <CreateTicketModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        residentsList={residentsList}
        isStaffMode={isStaffMode}
      />
    </>
  );
}

