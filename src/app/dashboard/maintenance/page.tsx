import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRoles } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import { MaintenanceClientContainer } from "@/components/maintenance/MaintenanceClientContainer";
import { Wrench, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface MaintenancePageProps {
  searchParams: Promise<{
    category?: string;
    priority?: string;
  }>;
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { category: categoryFilter, priority: priorityFilter } = await searchParams;

  // Build query filter
  const whereClause: any = {};

  // If user is resident, only show their own tickets
  if (user.role === UserRoles.RESIDENT) {
    const profile = await prisma.residentProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      whereClause.residentId = profile.id;
    }
  }

  // If user is maintenance staff, they see all or assigned tickets
  if (categoryFilter && categoryFilter !== "ALL") {
    whereClause.category = categoryFilter;
  }

  if (priorityFilter && priorityFilter !== "ALL") {
    whereClause.priority = priorityFilter;
  }

  // Fetch tickets, all technicians, active allocations
  const [tickets, allTickets, technicians, activeAllocations] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        resident: {
          include: {
            user: true,
            allocations: {
              where: { status: "ACTIVE" },
              include: {
                bed: {
                  include: {
                    room: {
                      include: {
                        floor: { include: { building: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        staff: {
          include: { user: true },
        },
      },
    }),
    prisma.maintenanceTicket.findMany({
      select: { status: true, priority: true, resolvedAt: true, createdAt: true },
    }),
    prisma.staffProfile.findMany({
      where: { user: { role: UserRoles.MAINTENANCE_STAFF, isActive: true } },
      include: { user: true },
    }),
    prisma.allocation.findMany({
      where: { status: "ACTIVE" },
      include: {
        resident: { include: { user: true } },
        bed: {
          include: {
            room: {
              include: { floor: { include: { building: true } } },
            },
          },
        },
      },
    }),
  ]);

  // Operational aggregates
  const openCount = allTickets.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED").length;
  const inProgressCount = allTickets.filter((t) => t.status === "IN_PROGRESS").length;
  const urgentCount = allTickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED").length;
  const resolvedCount = allTickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  // Format list of technicians for assignment dropdowns
  const techniciansList = technicians.map((t) => ({
    id: t.id,
    fullName: t.user.fullName,
    department: t.department,
  }));

  // Format list of residents for staff modal
  const residentsList = activeAllocations.map((a) => ({
    id: a.resident.id,
    fullName: a.resident.user.fullName,
    roomInfo: `Rm ${a.bed.room.roomNumber} (${a.bed.bedNumber}) - ${a.bed.room.floor.building.name}`,
  }));

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
            Facilities &amp; Maintenance Dispatch
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Track repairs, auto-route requests to maintenance technicians, and verify completed resolutions
          </p>
        </div>

        {/* Operational KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Open Requests
              </span>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900 text-[26px] leading-none">
                {openCount}
              </span>
              <span className="text-[12px] font-medium text-blue-600">Awaiting Action</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                In Progress
              </span>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900 text-[26px] leading-none">
                {inProgressCount}
              </span>
              <span className="text-[12px] font-medium text-amber-600">Active Work</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Urgent Alerts
              </span>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900 text-[26px] leading-none">
                {urgentCount}
              </span>
              <span className="text-[12px] font-medium text-rose-600">Priority SLA</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Resolved Repairs
              </span>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900 text-[26px] leading-none">
                {resolvedCount}
              </span>
              <span className="text-[12px] font-medium text-emerald-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Area (Kanban & Table) */}
        <MaintenanceClientContainer
          tickets={tickets}
          currentRole={user.role}
          techniciansList={techniciansList}
          residentsList={residentsList}
          categoryFilter={categoryFilter}
          priorityFilter={priorityFilter}
        />
      </main>
    </div>
  );
}

