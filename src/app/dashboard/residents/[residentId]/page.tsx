import { getSessionUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRoles } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import {
  User, Mail, Phone, Calendar, BedDouble,
  Shield, AlertTriangle, FileText, ArrowLeft, CheckCircle2, Clock, ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ residentId: string }>;
}

export default async function ResidentProfilePage({ params }: Props) {
  const { residentId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const canView = [
    UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.ACCOUNTANT,
  ].includes(user.role as any);

  let resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
    include: {
      user: true,
      allocations: {
        orderBy: { createdAt: "desc" },
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
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          damageReports: true,
        },
      },
      // Correct relation name from schema: "tickets" not "maintenanceTickets"
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      gatePasses: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  // If not found by ResidentProfile.id, check if param was User.id
  if (!resident) {
    resident = await prisma.residentProfile.findUnique({
      where: { userId: residentId },
      include: {
        user: true,
        allocations: {
          orderBy: { createdAt: "desc" },
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
              orderBy: { createdAt: "desc" },
              take: 5,
            },
            damageReports: true,
          },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        gatePasses: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  if (!resident) notFound();

  // RBAC: residents can only see their own profile
  if (user.role === UserRoles.RESIDENT) {
    if (resident.userId !== user.id) redirect("/dashboard");
  } else if (!canView) {
    redirect("/dashboard");
  }

  const activeAllocation = resident.allocations.find((a) => a.status === "ACTIVE");
  const pastAllocations = resident.allocations.filter((a) => a.status !== "ACTIVE");

  const invoiceStatusStyle: Record<string, string> = {
    PAID: "text-emerald-700 bg-emerald-50 border-emerald-200",
    ISSUED: "text-blue-700 bg-blue-50 border-blue-200",
    OVERDUE: "text-rose-700 bg-rose-50 border-rose-200",
    PARTIALLY_PAID: "text-amber-700 bg-amber-50 border-amber-200",
    DRAFT: "text-slate-500 bg-slate-50 border-slate-200",
    CANCELLED: "text-slate-400 bg-slate-50 border-slate-200",
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
          <Link
            href="/dashboard/residents"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Residents Directory</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{resident.user.fullName}</span>
        </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xl">
              {resident.user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-900">
                {resident.user.fullName}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">{resident.user.email}</p>
              {activeAllocation && (
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Active Resident
                </span>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Personal & KYC */}
          <div className="lg:col-span-1 space-y-4">
            {/* Personal Info */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Personal Info
              </h3>
              <dl className="space-y-2.5 text-[13px]">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{resident.user.email}</span>
                </div>
                {resident.user.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums">{resident.user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Gender: {resident.gender}</span>
                </div>
                {resident.dob && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {new Date(resident.dob).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </dl>
            </div>

            {/* KYC */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> KYC &amp; Identity
              </h3>
              <dl className="space-y-2.5 text-[13px]">
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">ID Type</span>
                  <span className="font-medium text-slate-900">
                    {resident.idProofType || "—"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">ID Number</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {resident.idProofNumber || "—"}
                  </span>
                </div>
                {resident.idProofDocument && (
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block mb-1">Document</span>
                    <a
                      href={resident.idProofDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> View Document
                    </a>
                  </div>
                )}
              </dl>
            </div>

            {/* Emergency Contact */}
            {resident.emergencyName && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Emergency Contact
                </h3>
                <dl className="space-y-2.5 text-[13px]">
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Name</span>
                    <p className="font-medium text-slate-900">{resident.emergencyName}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Phone</span>
                    <p className="font-mono tabular-nums font-medium text-slate-900">{resident.emergencyPhone}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Relationship</span>
                    <p className="font-medium text-slate-900">{resident.emergencyRelation}</p>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Right Column: Allocation + Invoices */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Allocation */}
            {activeAllocation ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                  <BedDouble className="w-3.5 h-3.5 text-blue-600" /> Current Accommodation
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Building</span>
                    <p className="font-medium text-slate-900">
                      {activeAllocation.bed.room.floor.building.name}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Room / Bed</span>
                    <p className="font-mono tabular-nums font-medium text-slate-900">
                      Room {activeAllocation.bed.room.roomNumber} —{" "}
                      {activeAllocation.bed.bedNumber}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Room Type</span>
                    <p className="font-medium text-slate-900">
                      {activeAllocation.bed.room.roomType.name}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Monthly Rent</span>
                    <p className="font-mono tabular-nums font-medium text-slate-900">
                      ${activeAllocation.monthlyRent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Security Deposit</span>
                    <p className="font-mono tabular-nums font-medium text-slate-900">
                      ${activeAllocation.securityDeposit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Check-In</span>
                    <p className="font-mono tabular-nums font-medium text-slate-900">
                      {activeAllocation.checkedInAt
                        ? new Date(activeAllocation.checkedInAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "—"}
                    </p>
                  </div>
                  {activeAllocation.endDate && (
                    <div>
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 block">Lease Ends</span>
                      <p className="font-mono tabular-nums font-medium text-amber-700">
                        {new Date(activeAllocation.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-[13px] text-amber-800">
                <p className="font-semibold">No Active Allocation</p>
                <p className="mt-1 text-amber-700">
                  This resident is not currently assigned to any bed.
                </p>
              </div>
            )}

            {/* Recent Invoices */}
            {activeAllocation && activeAllocation.invoices.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Recent Invoices
                </h3>
                <div className="space-y-2">
                  {activeAllocation.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
                    >
                      <div className="text-[13px]">
                        <p className="font-medium text-slate-900 font-mono tabular-nums">
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-slate-500 font-mono tabular-nums text-[12px]">
                          {new Date(inv.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right text-[13px]">
                        <p className="font-medium font-mono tabular-nums text-slate-900">
                          ${inv.totalAmount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                            invoiceStatusStyle[inv.status] || ""
                          }`}
                        >
                          {inv.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance Tickets */}
            {resident.tickets.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recent Maintenance Tickets
                </h3>
                <div className="space-y-2">
                  {resident.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-[13px]"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{ticket.title}</p>
                        <p className="text-slate-500 text-[12px]">{ticket.category}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                          ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gate Passes & Movement History */}
            {resident.gatePasses.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Gate Passes &amp; Movement
                  </h3>
                  <Link
                    href="/dashboard/gate"
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Gate Desk &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {resident.gatePasses.map((pass) => (
                    <div
                      key={pass.id}
                      className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-[13px] flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-slate-900 truncate">
                          {pass.reason.replace(/\[(DAY_OUTING|NIGHT_OUT)\]\s*/g, "")}
                        </p>
                        <p className="text-[12px] font-mono tabular-nums text-slate-400">
                          Curfew: {new Date(pass.expectedInTime).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(pass.expectedInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] shrink-0 ${
                          pass.status === "APPROVED" || pass.status === "RETURNED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : pass.status === "CHECKED_OUT"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : pass.status === "OVERDUE"
                            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {pass.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allocation History */}
            {pastAllocations.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Allocation History
                </h3>
                <div className="space-y-2">
                  {pastAllocations.map((alloc) => (
                    <div
                      key={alloc.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-[13px]"
                    >
                      <div>
                        <p className="font-mono tabular-nums font-medium text-slate-900">
                          Room {alloc.bed.room.roomNumber} — {alloc.bed.bedNumber}
                        </p>
                        <p className="text-slate-500 text-[12px]">
                          {alloc.bed.room.floor.building.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                            alloc.status === "COMPLETED"
                              ? "bg-slate-50 text-slate-500 border-slate-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {alloc.status}
                        </span>
                        {alloc.checkedOutAt && (
                          <p className="text-slate-400 text-[12px] font-mono tabular-nums mt-1">
                            Out:{" "}
                            {new Date(alloc.checkedOutAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
