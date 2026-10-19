"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { DevRoleSwitcher } from "./DevRoleSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Loader2, Sparkles, LayoutDashboard, Grid3X3, Users, Receipt, UtensilsCrossed, Wrench, ShieldCheck } from "lucide-react";

import { UserRoles } from "@/lib/constants";

interface NavbarProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const [isLoggingOut, startTransition] = useTransition();
  const pathname = usePathname();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const allNavLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ALL"] },
    { href: "/dashboard/properties", label: "Rooms & Beds", icon: Grid3X3, roles: [UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.MAINTENANCE_STAFF] },
    { href: "/dashboard/residents", label: "Residents", icon: Users, roles: [UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.ACCOUNTANT] },
    { href: "/dashboard/billing", label: "Billing & Finance", icon: Receipt, roles: [UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT, UserRoles.RESIDENT] },
    { href: "/dashboard/mess", label: "Mess & Canteen", icon: UtensilsCrossed, roles: [UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.RESIDENT] },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench, roles: [UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.MAINTENANCE_STAFF, UserRoles.RESIDENT] },
    { href: "/dashboard/gate", label: "Gate & Curfew", icon: ShieldCheck, roles: [UserRoles.SUPER_ADMIN, UserRoles.WARDEN, UserRoles.MAINTENANCE_STAFF, UserRoles.RESIDENT] },
  ];

  const navLinks = allNavLinks.filter(
    (link) => link.roles.includes("ALL") || link.roles.includes(user.role as any)
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
      {/* 1. Persona Sandbox Bar */}
      <div className="bg-slate-900/80 px-4 sm:px-6 lg:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Persona Sandbox
          </span>
          <span className="text-slate-400 hidden sm:inline text-xs font-medium">
            Test and preview role-based views and operational permissions
          </span>
        </div>
        <DevRoleSwitcher currentRole={user.role} variant="compact" />
      </div>

      {/* 2. Top Header Bar: Brand Logo & User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-500 transition-colors">
            <Building2 className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight leading-none">
                Kamix HMS
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Campus OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-none hidden sm:block">
              Hostel Residence &amp; Allocation Platform
            </p>
          </div>
        </Link>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs font-bold tracking-wide shadow-2xs">
              {user.fullName ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "U"}
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <p className="text-xs font-bold text-white leading-tight">{user.fullName}</p>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {user.role === "WARDEN" ? "Warden" : user.role === "RESIDENT" ? "Student" : user.role.replace("_", " ")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-400/30 rounded-xl transition-colors cursor-pointer"
            title="Sign out of current session"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 3. Dedicated Workspace Navigation Tab Bar */}
      <nav className="border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? "bg-white text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-500"}`} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

