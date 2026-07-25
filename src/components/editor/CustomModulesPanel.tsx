"use client";

import { Editor } from "@tiptap/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Info,
  Heading as HeadingIcon,
  Link2,
  MessageCircleQuestion,
  Minus,
  BookOpen,
  Table2,
} from "lucide-react";

interface CustomModulesPanelProps {
  editor: Editor;
}

export default function CustomModulesPanel({
  editor,
}: CustomModulesPanelProps) {
  if (!editor) {
    return null;
  }

  const handleInsertHeading = () => {
    editor.chain().focus().setCustomHeading({
      level: 2,
    }).run();
  };

  const handleInsertCtaBlock = () => {
    const title = window.prompt("CTA title", "Start your ATI TEAS practice");
    if (title === null) return;
    const description = window.prompt(
      "CTA description",
      "Choose a subject and begin with available practice questions."
    );
    if (description === null) return;
    const buttonLabel = window.prompt("Button label", "Start Practice");
    if (buttonLabel === null) return;
    const buttonHref = window.prompt("Button URL", "#");
    if (buttonHref === null) return;

    editor.chain().focus().setCtaBlock({
      title,
      description,
      buttonLabel,
      buttonHref,
    }).run();
  };

  const handleInsertInternalLinkCard = () => {
    const title = window.prompt("Exact page name", "ATI TEAS Math Practice Test");
    if (title === null) return;
    const description = window.prompt(
      "Short description",
      "Practice math questions, formats, and explanations for ATI TEAS preparation."
    );
    if (description === null) return;
    const linkLabel = window.prompt("Link label", title);
    if (linkLabel === null) return;
    const linkHref = window.prompt("Page URL", "#");
    if (linkHref === null) return;

    editor.chain().focus().setInternalLinkCard({
      title,
      description,
      linkLabel,
      linkHref,
    }).run();
  };

  const handleInsertFaqContentBlock = () => {
    const question = window.prompt("Question", "What should students know before starting?");
    if (question === null) return;
    const answer = window.prompt(
      "Answer",
      "Students should choose one subject, complete available questions, and review explanations before moving to another topic."
    );
    if (answer === null) return;

    editor.chain().focus().setFaqContentBlock({
      question,
      answer,
    }).run();
  };

  const handleInsertComparisonTableBlock = () => {
    const title = window.prompt("Table title", "ATI TEAS practice formats");
    if (title === null) return;
    const columnOneHeading = window.prompt("Column 1 heading", "Format");
    if (columnOneHeading === null) return;
    const columnTwoHeading = window.prompt("Column 2 heading", "How it helps");
    if (columnTwoHeading === null) return;

    editor.chain().focus().setComparisonTableBlock({
      title,
      columnOneHeading,
      columnTwoHeading,
    }).run();
  };

  return (
    <>
      <aside className="admin-module-panel">
        <div className="mb-2 flex items-center justify-between">
          <div className="admin-card-title">
            Modules Library
          </div>
          <div className="admin-status-badge admin-status-badge-purple">
            Custom
          </div>
        </div>
        <p className="admin-helper mb-3">
          These blocks are not part of the normal text editor. Drag them into the editor to insert structured content.
        </p>

        <div className="admin-module-list">
          <button
            type="button"
            onClick={handleInsertHeading}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-custom-heading", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <HeadingIcon className="admin-module-icon" />
              <span className="label">Section Heading</span>
            </span>
            <span className="admin-module-badge">
              H2
            </span>
          </button>

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
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <Info className="admin-module-icon" />
              <span className="label">Callout / Tip Box</span>
            </span>
            <span className="admin-module-badge">
              Note
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setDottedSeparator().run()}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-dotted-separator", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <Minus className="admin-module-icon" />
              <span className="label">Dotted Separator</span>
            </span>
            <span className="admin-module-badge">
              Line
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setQuizCard({}).run()}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-quiz-card", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <BookOpen className="admin-module-icon" />
              <span className="label">Quiz Card</span>
            </span>
            <span className="admin-module-badge">
              Quiz
            </span>
          </button>

          <button
            type="button"
            onClick={handleInsertCtaBlock}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-cta-block", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <ArrowUpRight className="admin-module-icon" />
              <span className="label">CTA Block</span>
            </span>
            <span className="admin-module-badge">
              Action
            </span>
          </button>

          <button
            type="button"
            onClick={handleInsertInternalLinkCard}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-internal-link-card", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <Link2 className="admin-module-icon" />
              <span className="label">Internal Link Card</span>
            </span>
            <span className="admin-module-badge">
              SEO
            </span>
          </button>

          <button
            type="button"
            onClick={handleInsertFaqContentBlock}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-faq-content-block", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <MessageCircleQuestion className="admin-module-icon" />
              <span className="label">FAQ Content Block</span>
            </span>
            <span className="admin-module-badge">
              Q&A
            </span>
          </button>

          <button
            type="button"
            onClick={handleInsertComparisonTableBlock}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-comparison-table-block", "true");
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="admin-module-button"
          >
            <span className="pointer-events-none flex items-center gap-2">
              <Table2 className="admin-module-icon" />
              <span className="label">Comparison Table</span>
            </span>
            <span className="admin-module-badge">
              Table
            </span>
          </button>
        </div>

        <div className="admin-info-tile mt-3 p-3">
          <div className="admin-field-label mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--admin-accent)]" />
            Public Page Guardrails
          </div>
          <ul className="space-y-1">
            <li>Use H2 for main article sections; the page already has one H1.</li>
            <li>Keep paragraphs short enough to scan on mobile.</li>
            <li>Use exact page names for internal links.</li>
            <li>Avoid fixed-width tables unless the content truly needs them.</li>
          </ul>
        </div>
      </aside>
    </>
  );
}


