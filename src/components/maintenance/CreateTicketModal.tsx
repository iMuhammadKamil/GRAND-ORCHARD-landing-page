"use client";

import { useState, useTransition, useRef } from "react";
import { createTicketAction } from "@/app/actions/tickets";
import { TicketCategories, TicketPriorities } from "@/lib/constants";
import { Wrench, Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentsList?: {
    id: string;
    fullName: string;
    roomInfo: string;
  }[];
  isStaffMode?: boolean;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  residentsList,
  isStaffMode = false,
}: CreateTicketModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(TicketCategories.PLUMBING);
  const [priority, setPriority] = useState<string>(TicketPriorities.MEDIUM);
  const [description, setDescription] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState(residentsList?.[0]?.id || "");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("priority", priority);
    formData.append("description", description);
    if (isStaffMode && selectedResidentId) {
      formData.append("residentId", selectedResidentId);
    }
    if (fileInputRef.current?.files?.[0]) {
      formData.append("photoFile", fileInputRef.current.files[0]);
    }

    startTransition(async () => {
      const res = await createTicketAction(formData);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px]">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-100 text-blue-700 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[13px] tracking-[-0.01em] text-slate-900">
                Report Maintenance Issue
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Submit facilities complaint with photo and priority level
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-xs sm:text-sm">
          {/* Staff Mode: Select Resident */}
          {isStaffMode && residentsList && residentsList.length > 0 && (
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Resident / Room
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                required
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
              >
                {residentsList.map((r) => (
                  <option key={r.id} value={r.id} className="bg-white text-slate-900 font-medium">
                    {r.fullName} &bull; {r.roomInfo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Issue Title */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom faucet leaking or ceiling fan noise"
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
              >
                <option value={TicketCategories.PLUMBING} className="bg-white text-slate-900 font-medium">Plumbing</option>
                <option value={TicketCategories.ELECTRICAL} className="bg-white text-slate-900 font-medium">Electrical</option>
                <option value={TicketCategories.CARPENTRY} className="bg-white text-slate-900 font-medium">Carpentry / Furniture</option>
                <option value={TicketCategories.WIFI_NETWORK} className="bg-white text-slate-900 font-medium">Wi-Fi / Internet</option>
                <option value={TicketCategories.CLEANING} className="bg-white text-slate-900 font-medium">Cleaning / Housekeeping</option>
                <option value={TicketCategories.OTHER} className="bg-white text-slate-900 font-medium">Other / General</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 cursor-pointer transition-colors"
              >
                <option value={TicketPriorities.LOW} className="bg-white text-slate-900 font-medium">Low (Non-urgent)</option>
                <option value={TicketPriorities.MEDIUM} className="bg-white text-slate-900 font-medium">Medium (Standard)</option>
                <option value={TicketPriorities.URGENT} className="bg-white text-slate-900 font-medium">Urgent (Requires immediate fix)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, where in the room, and when it started..."
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 transition-colors"
            />
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
              Attach Photo Proof (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="w-full text-[13px] text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-[12px] file:font-medium file:bg-slate-100 hover:file:bg-slate-200 file:text-slate-800 cursor-pointer transition-colors focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                feedback.success
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="-mx-6 -mb-5 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

