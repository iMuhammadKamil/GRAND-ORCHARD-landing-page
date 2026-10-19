"use client";

import { useState } from "react";
import { BedStatusBadge } from "./BedStatusBadge";
import { BedStatusModal } from "./BedStatusModal";
import { AddRoomModal } from "./AddRoomModal";
import { AddBuildingModal } from "./AddBuildingModal";
import { RoomTypeManagerModal } from "./RoomTypeManagerModal";
import { deleteRoomAction } from "@/app/actions/properties";
import { BedStatuses, UserRoles } from "@/lib/constants";
import {
  Building2,
  DoorOpen,
  Plus,
  Layers,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Bed,
  CheckCircle2,
  Users,
} from "lucide-react";

interface FloorPlanViewProps {
  buildings: any[];
  roomTypes: any[];
  branch: {
    id: string;
    name: string;
    city: string;
  };
  currentUserRole: string;
}

export function FloorPlanView({
  buildings,
  roomTypes,
  branch,
  currentUserRole,
}: FloorPlanViewProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ""
  );
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Dialog States
  const [activeBedModal, setActiveBedModal] = useState<any | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isRoomTypesOpen, setIsRoomTypesOpen] = useState(false);

  const activeBuilding =
    buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  const isAdmin = currentUserRole === UserRoles.SUPER_ADMIN;
  const isWarden = currentUserRole === UserRoles.WARDEN;

  if (!activeBuilding) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-12 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">No Buildings Configured</h3>
        <p className="text-[13px] text-slate-500">Create your first residential block to get started.</p>
        {isAdmin && (
          <button
            onClick={() => setIsAddBuildingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Building
          </button>
        )}
      </div>
    );
  }

  // Filter rooms by floor, status, and search query
  const allBuildingRooms = activeBuilding.floors.flatMap((f: any) =>
    f.rooms.map((r: any) => ({ ...r, floorNumber: f.floorNumber }))
  );

  const filteredRooms = allBuildingRooms.filter((room: any) => {
    // Floor filter
    if (selectedFloorNumber !== "ALL" && room.floorNumber.toString() !== selectedFloorNumber) {
      return false;
    }
    // Search query filter (room number or tenant name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = room.roomNumber.toLowerCase().includes(q);
      const matchTenant = room.beds.some((b: any) =>
        b.allocations?.some((a: any) =>
          a.resident?.user?.fullName?.toLowerCase().includes(q)
        )
      );
      if (!matchRoom && !matchTenant) return false;
    }
    // Status filter
    if (selectedStatusFilter !== "ALL") {
      const hasMatchingBed = room.beds.some((b: any) => b.status === selectedStatusFilter);
      if (!hasMatchingBed) return false;
    }
    return true;
  });

  // Calculate building stats
  const allBeds = allBuildingRooms.flatMap((r: any) => r.beds);
  const totalBedsCount = allBeds.length;
  const occupiedBedsCount = allBeds.filter((b: any) => b.status === BedStatuses.OCCUPIED).length;
  const vacantBedsCount = allBeds.filter((b: any) => b.status === BedStatuses.VACANT).length;
  const maintBedsCount = allBeds.filter((b: any) => b.status === BedStatuses.MAINTENANCE).length;

  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (confirm(`Are you sure you want to delete Room ${roomNumber}? This cannot be undone.`)) {
      const res = await deleteRoomAction(roomId);
      if (res?.error) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-slate-900">
            Floor Plan & Visual Room Matrix
          </h2>
          <p className="text-[13px] text-slate-500 mt-1">
            Interactive spatial layout of {branch.name} ({branch.city})
          </p>
        </div>

        {/* Action Buttons based on RBAC */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin && (
            <button
              onClick={() => setIsRoomTypesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium rounded-lg text-[13px] transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Room Types & Rates</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsAddBuildingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Building</span>
            </button>
          )}

          {(isAdmin || isWarden) && (
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Building Switcher Tabs */}
      <div className="border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto pb-1">
        {buildings.map((b) => {
          const isSelected = b.id === activeBuilding.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuildingId(b.id);
                setSelectedFloorNumber("ALL");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? "border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{b.name}</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {b.gender}
              </span>
            </button>
          );
        })}
      </div>

      {/* Building Occupancy Summary Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap text-[12px]">
          <span className="font-semibold text-slate-900">
            {activeBuilding.name} Metrics:
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            Total: <strong>{totalBedsCount} Beds</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Vacant: <strong>{vacantBedsCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Occupied: <strong>{occupiedBedsCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Maintenance: <strong>{maintBedsCount}</strong>
          </span>
        </div>

        <div className="text-[12px] text-slate-500">
          Occupancy:{" "}
          <strong className="text-slate-900 font-semibold">
            {totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0}%
          </strong>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Floor Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 mr-1">
            Floor:
          </span>
          <button
            onClick={() => setSelectedFloorNumber("ALL")}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors cursor-pointer ${
              selectedFloorNumber === "ALL"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            All Floors
          </button>
          {activeBuilding.floors.map((f: any) => (
            <button
              key={f.id}
              onClick={() => setSelectedFloorNumber(f.floorNumber.toString())}
              className={`px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors cursor-pointer ${
                selectedFloorNumber === f.floorNumber.toString()
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              Floor {f.floorNumber}
            </button>
          ))}
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors cursor-pointer"
          >
            <option value="ALL">All Bed Statuses</option>
            <option value={BedStatuses.VACANT}>Vacant Beds Only</option>
            <option value={BedStatuses.OCCUPIED}>Occupied Beds Only</option>
            <option value={BedStatuses.RESERVED}>Reserved Only</option>
            <option value={BedStatuses.MAINTENANCE}>Maintenance Only</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search room or resident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Rooms & Beds Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-12 text-center space-y-3">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">No rooms match your filter</h4>
          <p className="text-[13px] text-slate-500">
            Try adjusting your search query, status selector, or floor filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room: any) => {
            const hasOccupied = room.beds.some((b: any) => b.status === BedStatuses.OCCUPIED);
            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow space-y-3"
              >
                {/* Room Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[15px] tracking-[-0.01em] text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Fl. {room.floorNumber}
                      </span>
                    </div>
                    <p className="font-mono text-[12px] tabular-nums text-slate-500 mt-1">
                      {room.roomType.name} &bull; ${room.roomType.baseRent.toFixed(2)}/mo
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                      disabled={hasOccupied}
                      className={`p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ${
                        hasOccupied ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                      }`}
                      title={hasOccupied ? "Cannot delete occupied room" : "Delete room"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span
                    className={`px-1.5 py-0.5 rounded-lg font-medium ${
                      room.roomType.hasAC
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {room.roomType.hasAC ? "AC" : "Non-AC"}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-lg font-medium ${
                      room.roomType.hasAttachedBath
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {room.roomType.hasAttachedBath ? "Attached Bath" : "Common"}
                  </span>
                  <span className="text-slate-400 ml-auto font-mono tabular-nums">
                    Cap: {room.roomType.capacity}
                  </span>
                </div>

                {/* Beds Status Badges */}
                <div className="pt-2.5 border-t border-slate-100">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 mb-2">
                    Beds ({room.beds.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.beds.map((bed: any) => (
                      <BedStatusBadge
                        key={bed.id}
                        bed={{ ...bed, room }}
                        userRole={currentUserRole}
                        onClick={() => setActiveBedModal({ ...bed, room })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialogs */}
      {activeBedModal && (
        <BedStatusModal
          bed={activeBedModal}
          userRole={currentUserRole}
          onClose={() => setActiveBedModal(null)}
        />
      )}

      {isAddRoomOpen && (
        <AddRoomModal
          buildingName={activeBuilding.name}
          floors={activeBuilding.floors}
          roomTypes={roomTypes}
          onClose={() => setIsAddRoomOpen(false)}
        />
      )}

      {isAddBuildingOpen && (
        <AddBuildingModal
          branchId={branch.id}
          branchName={branch.name}
          onClose={() => setIsAddBuildingOpen(false)}
        />
      )}

      {isRoomTypesOpen && (
        <RoomTypeManagerModal
          roomTypes={roomTypes}
          onClose={() => setIsRoomTypesOpen(false)}
        />
      )}
    </div>
  );
}
