"use client";

import { useTransition } from "react";
import { devQuickLoginAction } from "@/app/actions/auth";
import { UserRoles, UserRole } from "@/lib/constants";
import { ShieldAlert, UserCheck, Calculator, Wrench, GraduationCap, Loader2 } from "lucide-react";

interface DevRoleSwitcherProps {
  currentRole?: string;
  variant?: "horizontal" | "compact" | "grid";
}

const ROLES_META: Record<
  UserRole,
  { label: string; icon: any; color: string; desc: string; email: string }
> = {
  [UserRoles.SUPER_ADMIN]: {
    label: "Super Admin",
    icon: ShieldAlert,
    color: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200",
    desc: "Full system config & master analytics",
    email: "admin@hms.com",
  },
  [UserRoles.WARDEN]: {
    label: "Chief Warden",
    icon: UserCheck,
    color: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
    desc: "Room allocation, check-ins, gate passes",
    email: "warden@hms.com",
  },
  [UserRoles.ACCOUNTANT]: {
    label: "Accountant",
    icon: Calculator,
    color: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
    desc: "Invoicing, utility submeters, offline receipts",
    email: "accountant@hms.com",
  },
  [UserRoles.MAINTENANCE_STAFF]: {
    label: "Maintenance",
    icon: Wrench,
    color: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
    desc: "Repairs, plumbing, SLA tickets",
    email: "maintenance@hms.com",
  },
  [UserRoles.RESIDENT]: {
    label: "Resident Student",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200",
    desc: "Pay rent, mess meal opt-outs, complaints",
    email: "resident@hms.com",
  },
};

export function DevRoleSwitcher({ currentRole, variant = "grid" }: DevRoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleSelect = (role: string) => {
    startTransition(async () => {
      const res = await devQuickLoginAction(role);
      if (res?.success) {
        window.location.href = "/dashboard";
      }
    });
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-mono font-medium text-slate-500 uppercase tracking-[0.16em] mr-1">
          Role Persona:
        </span>
        {Object.entries(ROLES_META).map(([role, meta]) => {
          const Icon = meta.icon;
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                isActive
                  ? "bg-white text-slate-950 border-white font-semibold"
                  : "bg-white/[0.05] text-slate-400 border-white/10 hover:bg-white/[0.1] hover:text-white hover:border-white/20"
              } ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              title={`Switch simulation to ${meta.label}`}
            >
              {isPending && isActive ? (
                <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
              ) : (
                <Icon className={`w-3 h-3 ${isActive ? "text-blue-600" : "text-slate-500"}`} strokeWidth={2} />
              )}
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {Object.entries(ROLES_META).map(([role, meta]) => {
          const Icon = meta.icon;
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              disabled={isPending}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? "border-blue-500 bg-white shadow-card ring-2 ring-blue-500/15"
                  : "border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 hover:shadow-card"
              } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`w-9 h-9 grid place-items-center rounded-lg shrink-0 ${meta.color.split(" ")[0]} border border-slate-200/60`}>
                <Icon className="w-4 h-4 text-slate-700" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-slate-900 tracking-[-0.01em]">{meta.label}</span>
                  {isActive && (
                    <span className="text-[9px] font-mono font-medium uppercase tracking-[0.12em] bg-blue-600 text-white px-1.5 py-[2px] rounded-md">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">{meta.desc}</p>
                <p className="text-[10.5px] text-slate-400 font-mono mt-1 leading-tight">{meta.email}</p>
              </div>
            </button>
          );
        })}
      </div>
  );
}

