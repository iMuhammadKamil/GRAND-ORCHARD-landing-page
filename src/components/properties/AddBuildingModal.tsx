"use client";

import { useActionState } from "react";
import { createBuildingAction } from "@/app/actions/properties";
import { Building2, X, AlertCircle, Loader2 } from "lucide-react";

interface AddBuildingModalProps {
  branchId: string;
  branchName: string;
  onClose: () => void;
}

export function AddBuildingModal({ branchId, branchName, onClose }: AddBuildingModalProps) {
  const [state, formAction, isPending] = useActionState(createBuildingAction, null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Campus: {branchName}
            </span>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 mt-0.5">
              Add Residential Building
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {state?.error && (
          <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="px-6 py-5 space-y-4">
          <input type="hidden" name="branchId" value={branchId} />

          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Building / Block Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                placeholder="e.g. East Wing (Graduate Residence)"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-medium rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Gender Policy
              </label>
              <select
                name="gender"
                defaultValue="COED"
                className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors cursor-pointer"
              >
                <option value="MALE">Male Only</option>
                <option value="FEMALE">Female Only</option>
                <option value="COED">Co-Ed (Mixed)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Total Floors
              </label>
              <input
                type="number"
                name="floorCount"
                defaultValue="3"
                min="1"
                max="15"
                required
                className="w-full px-3.5 py-2.5 text-[13px] font-semibold font-mono rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
              />
              <p className="text-[12px] text-slate-500 mt-1 font-medium">Auto-generates Floor 1 to N</p>
            </div>
          </div>

          <div className="-mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Creating Building..." : "Create Building & Floors"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
