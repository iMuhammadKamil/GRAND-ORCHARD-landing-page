import Link from "next/link";
import {
  Building,
  Bed,
  Users,
  CreditCard,
  Wrench,
  UtensilsCrossed,
  Receipt,
  ShieldCheck,
  Grid3X3,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface AdminDashboardViewProps {
  buildings: any[];
  rooms: any[];
  beds: any[];
  allocations: any[];
  invoices: any[];
  tickets: any[];
  gatePasses: any[];
  todayMenu: any[];
  stats: {
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
    reservedBeds: number;
    maintenanceBeds: number;
    occupancyRate: number;
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
  };
}

export function AdminDashboardView({
  buildings,
  rooms,
  allocations,
  invoices,
  tickets,
  gatePasses,
  todayMenu,
  stats,
}: AdminDashboardViewProps) {
  const openTickets = tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED");
  const outsideCount = gatePasses.filter(
    (p) => p.status === "CHECKED_OUT" || p.status === "OVERDUE"
  ).length;
  const pendingPassesCount = gatePasses.filter((p) => p.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Bed Occupancy */}
        <Link
          href="/dashboard/properties"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-blue-600 transition-colors">
                Bed Occupancy &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {stats.occupancyRate}%
              </span>
              <span className="text-[12px] font-mono tabular-nums text-slate-500">
                ({stats.occupiedBeds}/{stats.totalBeds} beds)
              </span>
            </div>
          </div>
          <div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex shadow-inner">
              <div
                className="bg-blue-600 h-full rounded-l-full"
                style={{ width: `${(stats.occupiedBeds / (stats.totalBeds || 1)) * 100}%` }}
                title={`Occupied: ${stats.occupiedBeds}`}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(stats.reservedBeds / (stats.totalBeds || 1)) * 100}%` }}
                title={`Reserved: ${stats.reservedBeds}`}
              />
              <div
                className="bg-rose-400 h-full"
                style={{ width: `${(stats.maintenanceBeds / (stats.totalBeds || 1)) * 100}%` }}
                title={`Maintenance: ${stats.maintenanceBeds}`}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vacant: {stats.vacantBeds}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Occupied: {stats.occupiedBeds}
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Active Residents */}
        <Link
          href="/dashboard/residents"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-indigo-600 transition-colors">
                Active Residents &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80 grid place-items-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {allocations.length}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Active
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-slate-500 leading-relaxed">
            Spread across {buildings.length} residential halls (Male &amp; Female).
          </p>
        </Link>

        {/* Card 3: Financial Overview */}
        <Link
          href="/dashboard/billing"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-emerald-600 transition-colors">
                Collected Revenue &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 grid place-items-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-1.5">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-emerald-600">
                ${stats.totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="text-amber-600 font-medium">${stats.totalPending.toFixed(2)} due</span>
            <span className="font-mono tabular-nums">{invoices.length} bills</span>
          </div>
        </Link>

        {/* Card 4: Maintenance Work Orders */}
        <Link
          href="/dashboard/maintenance"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-amber-600 transition-colors">
                Maintenance &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80 grid place-items-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {openTickets.length}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Open
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            <span>{tickets.length} total logged</span>
            <span className="text-blue-600 font-medium">Kanban &rarr;</span>
          </div>
        </Link>

        {/* Card 5: Gate & Curfew Desk */}
        <Link
          href="/dashboard/gate"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap text-slate-500 group-hover:text-blue-600 transition-colors">
                Gate &amp; Curfew &rarr;
              </span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-[26px] leading-none font-mono font-medium tracking-[-0.02em] tabular-nums text-slate-900">
                {outsideCount}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 text-blue-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Out
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-2 border-t border-slate-100">
            <span>{gatePasses.length} total passes</span>
            <span className="text-amber-600 font-medium">{pendingPassesCount} pending</span>
          </div>
        </Link>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Bed Allocation Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
                Live Bed Status &amp; Room Allocations
              </h3>
              <p className="text-[12px] text-slate-500 mt-1">
                Full property and room inventory across campus halls
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-lg border border-slate-200 bg-slate-100 text-slate-700 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em]">
                {rooms.length} Rooms
              </span>
              <Link
                href="/dashboard/properties"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 font-medium text-[12px] transition-colors"
              >
                <span>Floor Plan &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {buildings.map((b) => (
              <div key={b.id} className="border border-slate-200/80 rounded-xl p-4.5 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-[13px] tracking-[-0.01em] text-slate-900">{b.name}</span>
                    <span className="rounded-full border border-blue-200 bg-blue-100 text-blue-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                      {b.gender}
                    </span>
                  </div>
                  <span className="text-[12px] text-slate-500 font-medium">
                    {b.floors.length} Floors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {b.floors.flatMap((f: any) => f.rooms).map((r: any) => (
                    <div
                      key={r.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-subtle space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[13px] font-medium text-slate-900">
                          Room {r.roomNumber}
                        </span>
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {r.roomType.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.beds.map((bed: any) => {
                          const statusColor =
                            bed.status === "OCCUPIED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : bed.status === "VACANT"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : bed.status === "RESERVED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200";

                          return (
                            <span
                              key={bed.id}
                              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${statusColor}`}
                              title={`${bed.bedNumber}: ${bed.status}`}
                            >
                              {bed.bedNumber} ({bed.status[0]})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Operations Overview */}
        <div className="space-y-6">
          {/* Today's Mess Menu */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <UtensilsCrossed className="w-4 h-4 text-orange-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Today&apos;s Mess Menu</h3>
              </div>
              <Link
                href="/dashboard/mess"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {todayMenu.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 space-y-1.5">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-orange-700">
                    {m.mealType}
                  </span>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{m.itemsList}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Recent Invoices</h3>
              </div>
              <Link
                href="/dashboard/billing"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All ({invoices.length}) &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {invoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[13px] font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                        inv.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[13px] text-slate-600">
                    <span className="font-medium truncate">{inv.allocation.resident.user.fullName}</span>
                    <span className="font-mono font-medium tabular-nums text-slate-900">
                      ${inv.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Maintenance Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Maintenance Dispatch</h3>
              </div>
              <Link
                href="/dashboard/maintenance"
                className="shrink-0 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Kanban ({tickets.length}) &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {tickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-amber-50/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-slate-900">{t.title}</span>
                    <span className="rounded-full border border-amber-200 bg-amber-100 text-amber-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] shrink-0">
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed">{t.description}</p>
                  <div className="flex items-center justify-between gap-3 text-[12px] text-slate-500 pt-1.5 border-t border-amber-100/60">
                    <span className="truncate">By: {t.resident.user.fullName}</span>
                    <span className="font-medium text-blue-600 shrink-0">
                      {t.staff?.user.fullName || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

