"use client";

import React, { useState, useMemo } from "react";
import { PassCard, GatePassData } from "./PassCard";
import { CurfewAlertBanner } from "./CurfewAlertBanner";
import { RequestPassModal } from "./RequestPassModal";
import { PassQRCodeModal } from "./PassQRCodeModal";
import { GatePassStatuses } from "@/lib/constants";
import {
  Search,
  Plus,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface ResidentOption {
  id: string;
  fullName: string;
  roomNumber?: string;
}

interface GateDeskClientContainerProps {
  initialPasses: GatePassData[];
  currentUser: {
    id: string;
    fullName: string;
    role: string;
    residentProfileId?: string;
  };
  residentsList?: ResidentOption[];
}

export function GateDeskClientContainer({
  initialPasses,
  currentUser,
  residentsList = [],
}: GateDeskClientContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "OUTSIDE" | "PENDING" | "OVERDUE" | "RETURNED"
  >("ALL");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedPassForQR, setSelectedPassForQR] = useState<GatePassData | null>(null);

  // Compute dynamic overdue passes (where status is CHECKED_OUT and now > expectedInTime, or status is already OVERDUE)
  const passesWithOverdue = useMemo(() => {
    const now = new Date();
    return initialPasses.map((p) => {
      const isPastExpectedIn = new Date(p.expectedInTime) < now;
      const isOverdue =
        p.status === GatePassStatuses.OVERDUE ||
        (p.status === GatePassStatuses.CHECKED_OUT && isPastExpectedIn);
      return {
        ...p,
        isOverdue,
      };
    });
  }, [initialPasses]);

  // Extract overdue list for the Curfew Watchlist Banner
  const overduePasses = useMemo(() => {
    return passesWithOverdue.filter((p) => p.isOverdue);
  }, [passesWithOverdue]);

  // Tab counters
  const counts = useMemo(() => {
    return {
      ALL: passesWithOverdue.length,
      OUTSIDE: passesWithOverdue.filter(
        (p) => p.status === GatePassStatuses.CHECKED_OUT || p.isOverdue
      ).length,
      PENDING: passesWithOverdue.filter((p) => p.status === GatePassStatuses.PENDING).length,
      OVERDUE: overduePasses.length,
      RETURNED: passesWithOverdue.filter(
        (p) => p.status === GatePassStatuses.RETURNED || p.status === GatePassStatuses.REJECTED
      ).length,
    };
  }, [passesWithOverdue, overduePasses]);

  // Filtered passes
  const filteredPasses = useMemo(() => {
    return passesWithOverdue.filter((p) => {
      // Tab filter
      if (activeTab === "OUTSIDE") {
        if (p.status !== GatePassStatuses.CHECKED_OUT && !p.isOverdue) return false;
      } else if (activeTab === "PENDING") {
        if (p.status !== GatePassStatuses.PENDING) return false;
      } else if (activeTab === "OVERDUE") {
        if (!p.isOverdue) return false;
      } else if (activeTab === "RETURNED") {
        if (p.status !== GatePassStatuses.RETURNED && p.status !== GatePassStatuses.REJECTED)
          return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const residentName = p.resident.user.fullName.toLowerCase();
        const roomNumber =
          p.resident.allocations?.[0]?.bed.room.roomNumber.toLowerCase() || "";
        const passId = p.id.toLowerCase();
        const reason = p.reason.toLowerCase();

        return (
          residentName.includes(query) ||
          roomNumber.includes(query) ||
          passId.includes(query) ||
          reason.includes(query)
        );
      }

      return true;
    });
  }, [passesWithOverdue, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Real-time Curfew Watchlist Banner */}
      <CurfewAlertBanner overduePasses={overduePasses} userRole={currentUser.role} />

      {/* Control Bar: Search & Request Action */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, room, pass ID or destination..."
            className="w-full text-[13px] rounded-lg border border-slate-300 pl-9 pr-8 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] shadow-xs transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          {currentUser.role === "RESIDENT" ? "Apply for Gate Pass" : "Issue New Gate Pass"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <span>All Movement Records</span>
          <span
            className={`font-mono text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {counts.ALL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("OUTSIDE")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === "OUTSIDE"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Currently Outside</span>
          <span
            className={`font-mono text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === "OUTSIDE" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
            }`}
          >
            {counts.OUTSIDE}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approvals</span>
          <span
            className={`font-mono text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === "PENDING" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"
            }`}
          >
            {counts.PENDING}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("OVERDUE")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === "OVERDUE"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue Curfew</span>
          <span
            className={`font-mono text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === "OVERDUE" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
            }`}
          >
            {counts.OVERDUE}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RETURNED")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === "RETURNED"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Returned &amp; Concluded</span>
          <span
            className={`font-mono text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === "RETURNED" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {counts.RETURNED}
          </span>
        </button>
      </div>

      {/* Grid of Passes */}
      {filteredPasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPasses.map((pass) => (
            <PassCard
              key={pass.id}
              pass={pass}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.id}
              onOpenQR={(p) => setSelectedPassForQR(p)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">No Gate Passes Found</h3>
          <p className="text-[13px] text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No movement records matching "${searchQuery}".`
              : "There are currently no gate passes under this category."}
          </p>
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-[13px] font-semibold transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
          >
            <Plus className="w-3.5 h-3.5" /> Apply for Pass
          </button>
        </div>
      )}

      {/* Request Modal */}
      <RequestPassModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUserRole={currentUser.role}
        residentsList={residentsList}
        myResidentProfileId={currentUser.residentProfileId}
      />

      {/* QR Ticket Modal */}
      <PassQRCodeModal
        isOpen={!!selectedPassForQR}
        onClose={() => setSelectedPassForQR(null)}
        pass={selectedPassForQR}
      />
    </div>
  );
}
