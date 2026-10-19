import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { UserRoles } from "@/lib/constants";
import { MapPin } from "lucide-react";

import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";
import { WardenDashboardView } from "@/components/dashboard/WardenDashboardView";
import { AccountantDashboardView } from "@/components/dashboard/AccountantDashboardView";
import { MaintenanceDashboardView } from "@/components/dashboard/MaintenanceDashboardView";
import { ResidentDashboardView } from "@/components/dashboard/ResidentDashboardView";

export default async function DashboardPage() {
  const user = await requireAuth();

  // 1. Fetch common datasets
  const [buildings, rooms, beds, allocations, invoices, tickets, gatePasses, todayMenu] =
    await Promise.all([
      prisma.building.findMany({
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  roomType: true,
                  beds: true,
                },
              },
            },
          },
        },
      }),
      prisma.room.findMany({
        include: {
          roomType: true,
          beds: true,
          floor: {
            include: {
              building: true,
            },
          },
        },
      }),
      prisma.bed.findMany({
        include: {
          room: {
            include: {
              roomType: true,
              floor: { include: { building: true } },
            },
          },
        },
      }),
      prisma.allocation.findMany({
        where: { status: "ACTIVE" },
        include: {
          bed: {
            include: {
              room: true,
            },
          },
          resident: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.invoice.findMany({
        include: {
          items: true,
          allocation: {
            include: {
              resident: {
                include: { user: true },
              },
              bed: {
                include: {
                  room: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenanceTicket.findMany({
        include: {
          resident: { include: { user: true } },
          staff: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.gatePass.findMany({
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
          approvedBy: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.messMenu.findMany({
        where: { dayOfWeek: new Date().getDay() },
      }),
    ]);

  // Compute status aggregates
  const bedStatusCounts = beds.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBeds = beds.length;
  const occupiedBeds = bedStatusCounts["OCCUPIED"] || 0;
  const vacantBeds = bedStatusCounts["VACANT"] || 0;
  const reservedBeds = bedStatusCounts["RESERVED"] || 0;
  const maintenanceBedsCount = bedStatusCounts["MAINTENANCE"] || 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Financial aggregates
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = totalInvoiced - totalPaid;

  // 2. Fetch Role-Specific Datasets
  // Accountant Data
  let pendingPayments: any[] = [];
  let recentPayments: any[] = [];
  if (user.role === UserRoles.ACCOUNTANT || user.role === UserRoles.SUPER_ADMIN) {
    [pendingPayments, recentPayments] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: { status: "PENDING_VERIFICATION" },
        include: {
          invoice: {
            include: {
              allocation: {
                include: {
                  resident: { include: { user: true } },
                },
              },
            },
          },
        },
        orderBy: { paidAt: "desc" },
      }),
      prisma.paymentTransaction.findMany({
        where: { status: "CONFIRMED" },
        include: {
          invoice: {
            include: {
              allocation: {
                include: {
                  resident: { include: { user: true } },
                },
              },
            },
          },
        },
        orderBy: { paidAt: "desc" },
        take: 6,
      }),
    ]);
  }

  // Maintenance Data
  let maintenanceBeds: any[] = [];
  if (user.role === UserRoles.MAINTENANCE_STAFF || user.role === UserRoles.SUPER_ADMIN) {
    maintenanceBeds = await prisma.bed.findMany({
      where: { status: "MAINTENANCE" },
      include: {
        room: {
          include: {
            floor: { include: { building: true } },
          },
        },
      },
    });
  }

  // Resident Student Data
  let myAllocation: any = null;
  let roommates: any[] = [];
  let myActivePass: any = null;
  let myInvoices: any[] = [];
  let myTickets: any[] = [];

  if (user.role === UserRoles.RESIDENT) {
    const residentProfile = await prisma.residentProfile.findUnique({
      where: { userId: user.id },
      include: {
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            resident: true,
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
          },
        },
      },
    });

    myAllocation = residentProfile?.allocations[0] || null;

    if (myAllocation) {
      // Find roommates in same room
      roommates = await prisma.allocation.findMany({
        where: {
          status: "ACTIVE",
          bed: { roomId: myAllocation.bed.roomId },
          id: { not: myAllocation.id },
        },
        include: {
          resident: { include: { user: true } },
          bed: true,
        },
      });

      myInvoices = await prisma.invoice.findMany({
        where: { allocationId: myAllocation.id },
        orderBy: { createdAt: "desc" },
      });
    }

    if (residentProfile) {
      myActivePass = await prisma.gatePass.findFirst({
        where: {
          residentId: residentProfile.id,
          status: { in: ["PENDING", "APPROVED", "CHECKED_OUT", "OVERDUE"] },
        },
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
          approvedBy: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      myTickets = await prisma.maintenanceTicket.findMany({
        where: { residentId: residentProfile.id },
        include: { staff: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Role Context Header */}
        <div className="bg-ink text-white rounded-2xl border border-white/10 p-6 sm:p-8 shadow-card-highlight flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white">
                Welcome back, {user.fullName.split(" ")[0]}!
              </h1>
              <span className="px-2.5 py-1 rounded-full border border-blue-400/30 bg-blue-500/15 text-blue-200 font-mono text-[10px] font-medium uppercase tracking-[0.14em]">
                {user.role === "WARDEN"
                  ? "Chief Warden"
                  : user.role === "RESIDENT"
                  ? "Resident Student"
                  : user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-[13px] text-slate-400">
              Logged in as <span className="font-mono text-slate-100">{user.email}</span> &bull; Campus Role:{" "}
              <strong className="font-mono font-medium text-white">{user.role}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.06] px-4 py-3 rounded-xl border border-white/10 shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Current Campus
              </p>
              <p className="text-[13px] font-semibold text-white">
                Grand Greenwood Central Campus
              </p>
            </div>
          </div>
        </div>

        {/* 3. Render Role-Specific Dashboard View */}
        {user.role === UserRoles.SUPER_ADMIN && (
          <AdminDashboardView
            buildings={buildings}
            rooms={rooms}
            beds={beds}
            allocations={allocations}
            invoices={invoices}
            tickets={tickets}
            gatePasses={gatePasses}
            todayMenu={todayMenu}
            stats={{
              totalBeds,
              occupiedBeds,
              vacantBeds,
              reservedBeds,
              maintenanceBeds: maintenanceBedsCount,
              occupancyRate,
              totalInvoiced,
              totalPaid,
              totalPending,
            }}
          />
        )}

        {user.role === UserRoles.WARDEN && (
          <WardenDashboardView
            buildings={buildings}
            rooms={rooms}
            allocations={allocations}
            gatePasses={gatePasses}
            tickets={tickets}
            stats={{
              totalBeds,
              occupiedBeds,
              vacantBeds,
              occupancyRate,
            }}
          />
        )}

        {user.role === UserRoles.ACCOUNTANT && (
          <AccountantDashboardView
            invoices={invoices}
            allocations={allocations}
            pendingPayments={pendingPayments}
            recentPayments={recentPayments}
            stats={{
              totalInvoiced,
              totalPaid,
              totalPending,
            }}
          />
        )}

        {user.role === UserRoles.MAINTENANCE_STAFF && (
          <MaintenanceDashboardView
            tickets={tickets}
            maintenanceBeds={maintenanceBeds}
            currentUser={{
              id: user.id,
              fullName: user.fullName,
              staffProfile: user.staffProfile,
            }}
          />
        )}

        {user.role === UserRoles.RESIDENT && (
          <ResidentDashboardView
            user={user}
            myAllocation={myAllocation}
            roommates={roommates}
            myInvoices={myInvoices}
            myActivePass={myActivePass}
            myTickets={myTickets}
            todayMenu={todayMenu}
          />
        )}
      </main>
    </div>
  );
}
