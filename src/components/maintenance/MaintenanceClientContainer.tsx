"use client";

import { useState } from "react";
import { MaintenanceHeaderActions } from "./MaintenanceHeaderActions";
import { TicketKanbanBoard } from "./TicketKanbanBoard";
import { TicketTableView } from "./TicketTableView";
import { Filter, Search } from "lucide-react";
import Link from "next/link";

interface MaintenanceClientContainerProps {
  tickets: any[];
  currentRole: string;
  techniciansList: any[];
  residentsList: any[];
  categoryFilter?: string;
  priorityFilter?: string;
}

export function MaintenanceClientContainer({
  tickets,
  currentRole,
  techniciansList,
  residentsList,
  categoryFilter,
  priorityFilter,
}: MaintenanceClientContainerProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.resident.user.fullName.toLowerCase().includes(q) ||
      (t.staff && t.staff.user.fullName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, rooms, or technicians..."
            className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
          />
        </div>

        <MaintenanceHeaderActions
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          residentsList={residentsList}
          isStaffMode={currentRole !== "RESIDENT"}
        />
      </div>

      {/* Main Content Area */}
      {viewMode === "kanban" ? (
        <TicketKanbanBoard
          tickets={filteredTickets}
          currentRole={currentRole}
          techniciansList={techniciansList}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <TicketTableView
            tickets={filteredTickets}
            currentRole={currentRole}
            techniciansList={techniciansList}
          />
        </div>
      )}
    </div>
  );
}

