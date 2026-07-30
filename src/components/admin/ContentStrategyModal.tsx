"use client";

import {
  AdminFieldGroup,
  AdminModal,
  AdminModalFooter,
} from "@/components/admin/AdminUi";

export type ContentStrategy = {
  pageRole?: string;
  primaryIntent?: string;
  contextualVector?: string;
  contextualHeader?: string;
  contextualStructure?: string;
  contextualConnection?: string;
  queryTerms?: string;
  volume?: string;
  mustCover?: string;
  mustNotCover?: string;
  internalLinksIn?: string;
  internalLinksOut?: string;
  ctaRole?: string;
  publicationPhase?: string;
};

type ContentStrategyModalProps = {
  value: ContentStrategy;
  onChange: (value: ContentStrategy) => void;
  onClose: () => void;
  onReset: () => void;
  onSave: (value: ContentStrategy) => void | Promise<void>;
  saving?: boolean;
};

const FIELD_HELPERS: Record<keyof ContentStrategy, string> = {
  pageRole: "Example: Core overview page, practice hub page, subject practice page, quiz set page.",
  primaryIntent: "The exact user intent this page should satisfy.",
  contextualVector: "The semantic direction of the page or section, such as ATI TEAS Practice Test.",
  contextualHeader: "The H1/H2/H3 label that expresses the vector in human-readable form.",
  contextualStructure: "Required facts, subtopics, entity attributes, and section boundaries.",
  contextualConnection: "How this page connects to other pages and what it should link to or avoid repeating.",
  queryTerms: "Supporting query variants. These support the vector; they should not redefine the page intent.",
  volume: "Use for prioritization only, not for deciding page meaning.",
  mustCover: "The facts and subtopics this page must include.",
  mustNotCover: "Topics owned by another page that should not be explained in depth here.",
  internalLinksIn: "Pages that should link into this page.",
  internalLinksOut: "Pages this page should link out to.",
  ctaRole: "The conversion action for this page, such as Start practice test or Choose subject practice.",
  publicationPhase: "Example: Phase 1, Phase 2, Phase 3, Later / Hold.",
};

const TEXTAREA_FIELDS: Array<keyof ContentStrategy> = [
  "contextualStructure",
  "contextualConnection",
  "queryTerms",
  "mustCover",
  "mustNotCover",
  "internalLinksIn",
  "internalLinksOut",
];

function normalizeStrategy(value: ContentStrategy) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => String(fieldValue || "").trim())
  ) as ContentStrategy;
}

export default function ContentStrategyModal({
  value,
  onChange,
  onClose,
  onReset,
  onSave,
  saving = false,
}: ContentStrategyModalProps) {
  const updateField = (field: keyof ContentStrategy, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <AdminModal
      title="Content Strategy"
      description="Define the Koray-style semantic controls before generating briefs or page content. These fields are internal admin planning data."
      maxWidthClassName="max-w-[1120px]"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
          <h3 className="admin-card-title text-purple-950">How This Is Used</h3>
          <p className="admin-helper mt-2 text-purple-900">
            Content should be generated from source context, central entity,
            page role, contextual vector, structure, connection, and explicit
            coverage boundaries. Query terms and volume support prioritization;
            they should not override the page intent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminFieldGroup label="Page Role" helper={FIELD_HELPERS.pageRole}>
            <input
              type="text"
              value={value.pageRole || ""}
              onChange={(event) => updateField("pageRole", event.target.value)}
              className="admin-field"
              placeholder="Practice hub page"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="Primary Intent" helper={FIELD_HELPERS.primaryIntent}>
            <input
              type="text"
              value={value.primaryIntent || ""}
              onChange={(event) => updateField("primaryIntent", event.target.value)}
              className="admin-field"
              placeholder="Start and understand an ATI TEAS practice test"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="Contextual Vector" helper={FIELD_HELPERS.contextualVector}>
            <input
              type="text"
              value={value.contextualVector || ""}
              onChange={(event) => updateField("contextualVector", event.target.value)}
              className="admin-field"
              placeholder="ATI TEAS Practice Test"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="Contextual Header" helper={FIELD_HELPERS.contextualHeader}>
            <input
              type="text"
              value={value.contextualHeader || ""}
              onChange={(event) => updateField("contextualHeader", event.target.value)}
              className="admin-field"
              placeholder="ATI TEAS Practice Test"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="CTA Role" helper={FIELD_HELPERS.ctaRole}>
            <input
              type="text"
              value={value.ctaRole || ""}
              onChange={(event) => updateField("ctaRole", event.target.value)}
              className="admin-field"
              placeholder="Start full practice test"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="Publication Phase" helper={FIELD_HELPERS.publicationPhase}>
            <input
              type="text"
              value={value.publicationPhase || ""}
              onChange={(event) => updateField("publicationPhase", event.target.value)}
              className="admin-field"
              placeholder="Phase 1"
            />
          </AdminFieldGroup>

          <AdminFieldGroup label="Volume" helper={FIELD_HELPERS.volume}>
            <input
              type="text"
              value={value.volume || ""}
              onChange={(event) => updateField("volume", event.target.value)}
              className="admin-field"
              placeholder="14800"
            />
          </AdminFieldGroup>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {TEXTAREA_FIELDS.map((field) => (
            <AdminFieldGroup
              key={field}
              label={field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (letter) => letter.toUpperCase())}
              helper={FIELD_HELPERS[field]}
            >
              <textarea
                value={value[field] || ""}
                onChange={(event) => updateField(field, event.target.value)}
                rows={4}
                className="admin-field min-h-[112px] resize-y"
              />
            </AdminFieldGroup>
          ))}
        </div>
      </div>

      <AdminModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="admin-button-cancel"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="admin-button-secondary"
        >
          Clear Strategy
        </button>
        <button
          type="button"
          onClick={async () => {
            const normalizedValue = normalizeStrategy(value);
            onChange(normalizedValue);
            await onSave(normalizedValue);
          }}
          disabled={saving}
          className="admin-button-primary"
        >
          {saving ? "Saving..." : "Save Strategy"}
        </button>
      </AdminModalFooter>
    </AdminModal>
  );
}
