"use client";

import { useState } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";

interface PublicContentPreviewProps {
  content: string;
  publicPath?: string;
}

const normalizePublicPath = (value?: string) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return "";
  return `/${trimmedValue.replace(/^\/+/, "")}`;
};

export default function PublicContentPreview({
  content,
  publicPath,
}: PublicContentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const routePreviewPath = normalizePublicPath(publicPath);
  const hasContent = Boolean(content?.trim());
  const canPreview = hasContent || Boolean(routePreviewPath);

  return (
    <div className="admin-info-tile mb-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="admin-card-title">
            Public Content Preview
          </div>
          <p className="admin-helper mt-1 max-w-2xl">
            Preview the saved public route using the same layout students see on the live page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          disabled={!canPreview}
          className="admin-button-secondary min-h-[36px] px-3 py-1.5 text-xs"
        >
          {isOpen ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {isOpen ? "Hide Preview" : "Preview Public Content"}
        </button>
      </div>

      {!canPreview && (
        <div className="admin-empty-state mt-3">
          <div className="admin-empty-state-icon" aria-hidden="true">
            +
          </div>
          <div>
            <p className="admin-card-title">No Preview Available</p>
            <p className="admin-helper mt-1">
              Add body content to enable the public preview.
            </p>
          </div>
        </div>
      )}

      {isOpen && canPreview && (
        <div className="admin-card mt-3 overflow-hidden p-4">
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-[rgba(79,70,229,0.08)] p-3">
            <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--admin-accent)]" />
            <p className="admin-helper">
              {routePreviewPath
                ? "This preview loads the saved public route, including hero, guide sections, modules, quiz cards, FAQs, and route-level layout."
                : "This fallback preview shows article body styling only because no public route slug is available yet."}
            </p>
          </div>
          {routePreviewPath ? (
            <div className="overflow-hidden rounded-2xl border border-[#e3e5f0] bg-white">
              <iframe
                key={routePreviewPath}
                src={routePreviewPath}
                title={`Public preview for ${routePreviewPath}`}
                className="h-[760px] w-full bg-white"
              />
            </div>
          ) : (
            <div className="public-tiptap-content">
              <TiptapContentRenderer content={content} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
