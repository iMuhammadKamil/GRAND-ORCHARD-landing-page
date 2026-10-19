import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRoles, GatePassStatuses } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import { GateDeskClientContainer } from "@/components/gate/GateDeskClientContainer";
import { ShieldCheck, ArrowUpRight, AlertTriangle, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Gate & Curfew Desk | Hostel Management System",
  description: "Monitor campus movement, gate passes, and curfew compliance in real time.",
};

export default async function GateDeskPage() {
  const user = await requireAuth();

  const isResident = user.role === UserRoles.RESIDENT;

  // Query Gate Passes
  const gatePasses = await prisma.gatePass.findMany({
    where: isResident
      ? {
          resident: {
            userId: user.id,
          },
        }
      : undefined,
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
                      floor: {
                        include: {
                          building: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      approvedBy: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Query Residents list for staff issuance
  let residentsList: Array<{ id: string; fullName: string; roomNumber?: string }> = [];
  if (!isResident) {
    const rawResidents = await prisma.residentProfile.findMany({
      include: {
        user: true,
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            bed: {
              include: {
                room: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          fullName: "asc",
        },
      },
    });

    residentsList = rawResidents.map((r) => ({
      id: r.id,
      fullName: r.user.fullName,
      roomNumber: r.allocations[0]?.bed.room.roomNumber,
    }));
  }

  // Calculate top KPI metrics
  const now = new Date();
  const currentlyOutsideCount = gatePasses.filter(
    (p) =>
      p.status === GatePassStatuses.CHECKED_OUT ||
      (p.status === GatePassStatuses.CHECKED_OUT && new Date(p.expectedInTime) < now) ||
      p.status === GatePassStatuses.OVERDUE
  ).length;

  const overdueCount = gatePasses.filter((p) => {
    return (
      p.status === GatePassStatuses.OVERDUE ||
      (p.status === GatePassStatuses.CHECKED_OUT && new Date(p.expectedInTime) < now)
    );
  }).length;

  const pendingApprovalsCount = gatePasses.filter(
    (p) => p.status === GatePassStatuses.PENDING
  ).length;

  const totalReturnedCount = gatePasses.filter(
    (p) => p.status === GatePassStatuses.RETURNED
  ).length;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </Link>
          <span>/</span>
          <span className="text-slate-500">Gate &amp; Curfew Desk</span>
        </div>

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-600 border border-blue-200/80">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-blue-600">
              Security &amp; Movement Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900 mt-2">
            {isResident ? "My Gate Passes & Curfew" : "Gate Passes & Curfew Desk"}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">
            {isResident
              ? "Submit day outing and night leave requests, download your digital QR verification pass, and check your curfew timeline."
              : "Monitor student departures and returns, enforce night curfews, approve leave requests, and stamp real-time gate movements."}
          </p>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Outside Campus
            </span>
            <div className="w-8 h-8 rounded-lg grid place-items-center bg-blue-50 text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-slate-900">{currentlyOutsideCount}</span>
            <span className="text-[12px] text-slate-500 font-medium">Checked Out</span>
          </div>
          <p className="text-[12px] text-slate-400 mt-1">Currently off campus</p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-card bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-rose-500">
              Curfew Breaches
            </span>
            <div className="w-8 h-8 rounded-lg grid place-items-center bg-rose-100 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-rose-600">{overdueCount}</span>
            <span className="text-[12px] text-rose-600 font-medium">Past Curfew</span>
          </div>
          <p className="text-[12px] text-rose-500 mt-1">Late return alert</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Pending Reviews
            </span>
            <div className="w-8 h-8 rounded-lg grid place-items-center bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-slate-900">{pendingApprovalsCount}</span>
            <span className="text-[12px] text-amber-600 font-medium">Warden Action</span>
          </div>
          <p className="text-[12px] text-slate-400 mt-1">Night leave requests</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Safely Returned
            </span>
            <div className="w-8 h-8 rounded-lg grid place-items-center bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-slate-900">{totalReturnedCount}</span>
            <span className="text-[12px] text-emerald-600 font-medium">Completed</span>
          </div>
          <p className="text-[12px] text-slate-400 mt-1">Passes concluded</p>
        </div>
      </div>

      {/* Main Interactive Gate Desk Container */}
      <GateDeskClientContainer
        initialPasses={gatePasses}
        currentUser={{
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          residentProfileId: user.residentProfile?.id,
        }}
        residentsList={residentsList}
      />
      </main>
    </div>
  );
}
