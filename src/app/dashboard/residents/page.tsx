import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRoles, AllocationStatuses } from "@/lib/constants";
import { getAvailableBedsForGender } from "@/app/actions/residents";
import { ResidentActions } from "@/components/residents/ResidentActions";
import { Navbar } from "@/components/Navbar";
import { UserPlus, Users, Search, Building2, BedDouble, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ResidentDirectoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const canView = [
    UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.ACCOUNTANT,
  ].includes(user.role as any);
  if (!canView) redirect("/dashboard");

  const canActAsStaff =
    user.role === UserRoles.SUPER_ADMIN || user.role === UserRoles.WARDEN;

  // Fetch all residents with their active or recent allocation
  const residents = await prisma.residentProfile.findMany({
    include: {
      user: true,
      allocations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          bed: {
            include: {
              room: {
                include: {
                  roomType: true,
                  floor: { include: { building: true } },
                },
              },
            },
          },
          invoices: {
            select: {
              invoiceNumber: true,
              totalAmount: true,
              paidAmount: true,
              status: true,
            },
          },
          damageReports: true,
        },
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  // Pre-load all buildings for swap modals
  const maleBuildings = await getAvailableBedsForGender("MALE");
  const femaleBuildings = await getAvailableBedsForGender("FEMALE");
  const coedBuildings = await getAvailableBedsForGender("COED");
  const allBuildingsRaw = [...maleBuildings, ...femaleBuildings, ...coedBuildings];
  const seen = new Set<string>();
  const allBuildings = allBuildingsRaw.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });

  // Compute stats
  const activeCount = residents.filter(
    (r) => r.allocations[0]?.status === AllocationStatuses.ACTIVE
  ).length;
  const completedCount = residents.filter(
    (r) => r.allocations[0]?.status === AllocationStatuses.COMPLETED
  ).length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      UPCOMING: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-slate-50 text-slate-500 border-slate-200",
      TERMINATED: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return map[status] || "bg-slate-50 text-slate-500";
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Residents Directory</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" /> Residents Directory
            </h1>
            <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1.5">
              {residents.length} total resident{residents.length !== 1 ? "s" : ""} &bull;{" "}
              <strong className="text-emerald-700 font-medium">{activeCount} active</strong> &bull;{" "}
              {completedCount} checked out
            </p>
          </div>

          {canActAsStaff && (
            <Link
              href="/dashboard/residents/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              <UserPlus className="w-4 h-4" /> Onboard New Resident
            </Link>
          )}
        </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Residents", value: residents.length, color: "text-slate-900" },
          { label: "Active", value: activeCount, color: "text-emerald-700" },
          { label: "Checked Out", value: completedCount, color: "text-slate-500" },
          {
            label: "Terminated",
            value: residents.filter((r) => r.allocations[0]?.status === AllocationStatuses.TERMINATED).length,
            color: "text-rose-700",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">{kpi.label}</p>
            <p className={`font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none mt-2 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">All Residents</h2>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Search className="w-3.5 h-3.5" />
            <span>Use Ctrl+F to search in page</span>
          </div>
        </div>

        {residents.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-[13px] font-semibold text-slate-400">No residents found</p>
            {canActAsStaff && (
              <Link
                href="/dashboard/residents/new"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
              >
                <UserPlus className="w-3.5 h-3.5" /> Onboard your first resident
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">Resident</th>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">Room / Bed</th>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">Status</th>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">Monthly Rent</th>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-left">Check-In</th>
                  <th className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {residents.map((resident) => {
                  const alloc = resident.allocations[0];
                  return (
                    <tr key={resident.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Resident Info */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-[10px] shrink-0">
                            {resident.user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{resident.user.fullName}</p>
                            <p className="text-slate-400 text-[12px]">{resident.user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Room Info */}
                      <td className="px-5 py-3.5 text-slate-600">
                        {alloc ? (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono tabular-nums font-medium text-slate-900">
                              {alloc.bed.room.floor.building.name.split(" ")[0]}{" "}
                              &bull; Room {alloc.bed.room.roomNumber} &bull; {alloc.bed.bedNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No allocation</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-slate-600">
                        {alloc ? (
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${statusBadge(alloc.status)}`}>
                            {alloc.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Rent */}
                      <td className="px-5 py-3.5 text-[13px] font-mono tabular-nums font-medium text-slate-900">
                        {alloc ? `$${alloc.monthlyRent.toFixed(2)}` : "—"}
                      </td>

                      {/* Check-in Date */}
                      <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">
                        {alloc?.checkedInAt
                          ? new Date(alloc.checkedInAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : alloc
                          ? new Date(alloc.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        {alloc ? (
                          <ResidentActions
                            row={{ resident, allocation: alloc }}
                            canActAsStaff={canActAsStaff}
                            availableBuildings={allBuildings}
                          />
                        ) : (
                          <Link
                            href={`/dashboard/residents/${resident.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-block"
                          >
                            <span className="text-[12px] font-medium">View</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}

