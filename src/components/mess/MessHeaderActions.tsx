"use client";

import { useState } from "react";
import { WeeklyMenuEditorModal } from "./WeeklyMenuEditorModal";
import { Edit3 } from "lucide-react";

interface MessHeaderActionsProps {
  menus: any[];
}

export function MessHeaderActions({ menus }: MessHeaderActionsProps) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setEditorOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
        <span>Edit Weekly Menu</span>
      </button>

      <WeeklyMenuEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialMenus={menus}
      />
    </>
  );
}

