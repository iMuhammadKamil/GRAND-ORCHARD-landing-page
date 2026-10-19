import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { FloorPlanView } from "@/components/properties/FloorPlanView";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default async function PropertiesPage() {
  const user = await requireAuth();

  const [branch, buildings, roomTypes] = await Promise.all([
    prisma.branch.findFirst({
      select: {
        id: true,
        name: true,
        city: true,
      },
    }),
    prisma.building.findMany({
      include: {
        floors: {
          orderBy: { floorNumber: "asc" },
          include: {
            rooms: {
              orderBy: { roomNumber: "asc" },
              include: {
                roomType: true,
                beds: {
                  orderBy: { bedNumber: "asc" },
                  include: {
                    allocations: {
                      where: { status: "ACTIVE" },
                      include: {
                        resident: {
                          include: {
                            user: {
                              select: {
                                fullName: true,
                                email: true,
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
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.roomType.findMany({
      include: {
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { baseRent: "asc" },
    }),
  ]);

  const defaultBranch = branch || {
    id: "default-branch",
    name: "Main Campus",
    city: "Metro City",
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Property & Bed Management</span>
        </div>

        {/* Main Floor Plan & Room Matrix View */}
        <FloorPlanView
          buildings={buildings}
          roomTypes={roomTypes}
          branch={defaultBranch}
          currentUserRole={user.role}
        />
      </main>
    </div>
  );
}

