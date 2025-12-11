"use client";

import { Editor } from "@tiptap/react";
import { Info } from "lucide-react";

interface CustomModulesPanelProps {
  editor: Editor;
}

export default function CustomModulesPanel({
  editor,
}: CustomModulesPanelProps) {
  if (!editor) {
    return null;
  }

  return (
    <aside className="w-[280px] min-w-[220px] rounded-2xl border border-dashed border-[#e2e4f0] bg-gradient-to-br from-[#eef0ff] via-[#f9fafb] to-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-[#202437]">
          Modules Library
        </div>
        <div className="rounded-full border border-[#d7daf7] bg-[#eef0ff] px-2 py-0.5 text-[11px] uppercase tracking-wider text-[#4c4f70]">
          Custom
        </div>
      </div>
      <p className="mb-2 text-[13px] text-[#a0a5bf]">
        These blocks are not part of the normal text editor. Drag them into the editor to insert structured content.
      </p>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setCallout({ type: "info" }).run()
          }
          draggable={true}
          onDragStart={(e) => {
            // Set custom data type to identify this as a callout module
            e.dataTransfer.setData("application/x-callout", "info");
            e.dataTransfer.effectAllowed = "copy";
          }}
          className="flex items-center justify-between rounded-xl border border-dashed border-[#c7cbff] bg-white p-2.5 text-left text-[13px] text-[#202437] transition-all hover:border-[#6a5cff] hover:bg-gradient-to-r hover:from-[#eef0ff] hover:via-[#e0f2fe] hover:to-white hover:shadow-lg hover:shadow-[#4c3dff]/25 hover:-translate-y-0.5 active:cursor-grabbing active:shadow-md active:translate-y-0"
        >
          <span className="pointer-events-none flex items-center gap-2">
            <Info className="w-4 h-4 text-[#6a5cff]" />
            <span className="label">Callout / Tip Box</span>
          </span>
          <span className="pointer-events-none rounded-full border border-[#dee0ff] bg-[#f7f7ff] px-1.5 py-0.5 text-[11px] text-[#4c4f70]">
            Note
          </span>
        </button>
      </div>
    </aside>
  );
}
