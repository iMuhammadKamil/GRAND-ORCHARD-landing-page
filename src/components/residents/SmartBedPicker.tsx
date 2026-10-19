"use client";

import { useState } from "react";
import { Users, Bed, Building2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { BedStatuses } from "@/lib/constants";

interface AllocationPreview {
  resident: {
    user: { fullName: string };
  };
}

interface BedWithAllocations {
  id: string;
  bedNumber: string;
  status: string;
  allocations: AllocationPreview[];
}

interface RoomOption {
  id: string;
  roomNumber: string;
  roomType: {
    name: string;
    capacity: number;
    baseRent: number;
    hasAC: boolean;
    hasAttachedBath: boolean;
  };
  beds: BedWithAllocations[];
}

interface FloorOption {
  id: string;
  floorNumber: number;
  rooms: RoomOption[];
}

interface BuildingOption {
  id: string;
  name: string;
  gender: string;
  floors: FloorOption[];
}

interface SmartBedPickerProps {
  buildings: BuildingOption[];
  selectedBedId: string;
  onSelect: (
    bedId: string,
    bedLabel: string,
    roomInfo: { roomNumber: string; buildingName: string; baseRent: number }
  ) => void;
}

export function SmartBedPicker({
  buildings,
  selectedBedId,
  onSelect,
}: SmartBedPickerProps) {
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(
    buildings[0]?.id || null
  );

  // Count total vacant beds across all buildings
  const totalVacant = buildings.reduce(
    (sum, b) =>
      sum +
      b.floors.reduce(
        (fs, f) =>
          fs +
          f.rooms.reduce(
            (rs, r) =>
              rs + r.beds.filter((bed) => bed.status === BedStatuses.VACANT).length,
            0
          ),
        0
      ),
    0
  );

  if (totalVacant === 0) {
    return (
      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl">
        <Bed className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h4 className="font-semibold text-amber-900 text-[13px] tracking-[-0.01em]">No Vacant Beds Available</h4>
        <p className="text-[12px] text-amber-700 mt-1">
          No compatible beds match this resident&apos;s gender. Please check the floor
          plan or adjust building gender policies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {buildings.map((building) => {
        // Count vacant beds in this building
        const buildingVacantCount = building.floors.reduce(
          (fs, f) =>
            fs +
            f.rooms.reduce(
              (rs, r) =>
                rs + r.beds.filter((bed) => bed.status === BedStatuses.VACANT).length,
              0
            ),
          0
        );
        if (buildingVacantCount === 0) return null;

        const isExpanded = expandedBuilding === building.id;

        return (
          <div
            key={building.id}
            className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-card"
          >
            {/* Building Header */}
            <button
              type="button"
              onClick={() =>
                setExpandedBuilding(isExpanded ? null : building.id)
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                  {building.name}
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {building.gender}
                </span>
                <span className="text-[12px] text-slate-500 font-mono tabular-nums">
                  {buildingVacantCount} vacant bed
                  {buildingVacantCount !== 1 ? "s" : ""}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Rooms & Beds */}
            {isExpanded && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                {building.floors.flatMap((floor) =>
                  floor.rooms
                    .filter(
                      (r) =>
                        r.beds.filter((b) => b.status === BedStatuses.VACANT).length > 0
                    )
                    .map((room) => {
                      const vacantBeds = room.beds.filter(
                        (b) => b.status === BedStatuses.VACANT
                      );
                      // Roommates = occupants from non-vacant beds' active allocations
                      const roommates = room.beds
                        .filter((b) => b.status === BedStatuses.OCCUPIED)
                        .flatMap((b) => b.allocations);

                      return (
                        <div
                          key={room.id}
                          className="border border-slate-200/80 rounded-xl p-3 space-y-2.5 bg-white"
                        >
                          {/* Room Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono tabular-nums text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                                Room {room.roomNumber}
                              </span>
                              <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                Floor {floor.floorNumber}
                              </span>
                              <p className="text-[12px] font-mono tabular-nums text-slate-500 mt-0.5">
                                {room.roomType.name} &bull; $
                                {room.roomType.baseRent.toFixed(2)}/mo
                              </p>
                            </div>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {room.roomType.hasAC && (
                                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  AC
                                </span>
                              )}
                              {room.roomType.hasAttachedBath && (
                                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  Bath
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Roommate Preview */}
                          {roommates.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-amber-50 border border-amber-200/70 rounded-lg px-2 py-1">
                              <Users className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>
                                <strong className="font-semibold">Roommates:</strong>{" "}
                                {roommates
                                  .map((a) =>
                                    a.resident.user.fullName.split(" ")[0]
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          {/* Vacant Beds */}
                          <div className="flex flex-wrap gap-1.5">
                            {vacantBeds.map((bed) => {
                              const isSelected = selectedBedId === bed.id;
                              return (
                                <button
                                  key={bed.id}
                                  type="button"
                                  onClick={() =>
                                    onSelect(bed.id, bed.bedNumber, {
                                      roomNumber: room.roomNumber,
                                      buildingName: building.name,
                                      baseRent: room.roomType.baseRent,
                                    })
                                  }
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-xl border transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/25"
                                      : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Bed className="w-3 h-3" />
                                  )}
                                  {bed.bedNumber}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
