"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { DevRoleSwitcher } from "@/components/DevRoleSwitcher";
import { Building2, KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink text-white shadow-card mb-4">
          <Building2 className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-[-0.03em] leading-tight">
          Kamix HMS
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Hostel Management, Bed Allocations &amp; Ledger System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-card border border-slate-200/80 rounded-2xl space-y-7">
          {/* Quick Dev Switcher Section */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-start gap-2.5 mb-3">
              <div className="w-8 h-8 grid place-items-center rounded-lg bg-white border border-slate-200/80 shadow-subtle shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 tracking-[-0.01em]">
                  Instant Dev Persona Switcher (1-Click Login)
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Select any role below to instantly log in as that seeded persona:
                </p>
              </div>
            </div>
            <DevRoleSwitcher variant="grid" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 font-medium">
                Or Sign In with Credentials
              </span>
            </div>
          </div>

          {/* Traditional Login Form */}
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-[13px] text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-[0.16em] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@hms.com"
                  defaultValue="admin@hms.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 text-slate-900 bg-white placeholder:text-slate-400 hover:border-slate-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-[0.16em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  defaultValue="admin123"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 text-slate-900 bg-white placeholder:text-slate-400 hover:border-slate-400 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Default demo passwords: <code className="font-mono text-slate-700 font-medium text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">admin123</code>, <code className="font-mono text-slate-700 font-medium text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">warden123</code>, <code className="font-mono text-slate-700 font-medium text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">resident123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? "Authenticating..." : "Sign In with Email"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* System Architecture Note */}
        <div className="text-center mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
          <p>
            Kamix HMS &bull; Enterprise Hostel Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
