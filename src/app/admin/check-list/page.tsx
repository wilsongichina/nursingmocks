"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  AdminCard,
  AdminDestructiveDialog,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

type ChecklistItem = {
  id: string;
  label: string;
  helper?: string;
  href?: string;
};

type ChecklistSection = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

type ChecklistConfig = {
  id: string;
  documentId: string;
  title: string;
  displayName: string;
  pluralName: string;
  adminPath: string;
  editPath: string;
  publicPath: string;
  productCopy: string;
};

type StoredChecklist = {
  checked?: Record<string, boolean>;
  changesComplete?: Record<string, boolean>;
  notes?: Record<string, string>;
  savedAt?: string;
  updatedAt?: {
    toDate?: () => Date;
    seconds?: number;
  };
};

const checklistConfigs: ChecklistConfig[] = [
  {
    id: "nursing-entrance-exam",
    documentId: "nursing-entrance-exam-full-test",
    title: "Nursing Entrance Exam Full Test",
    displayName: "Nursing Entrance Exam",
    pluralName: "Nursing Entrance Exams",
    adminPath: "/admin/nursing-entrance-exam",
    editPath: "/admin/nursing-entrance-exam/edit",
    publicPath: "/nursing-entrance-exam",
    productCopy: "ATI TEAS 7 and HESI A2",
  },
  {
    id: "nursing-test-bank",
    documentId: "nursing-test-bank-full-test",
    title: "Nursing Test Bank Full Test",
    displayName: "Nursing Test Bank",
    pluralName: "Nursing Test Bank",
    adminPath: "/admin/nursing-test-bank",
    editPath: "/admin/nursing-test-bank/edit",
    publicPath: "/nursing-test-bank",
    productCopy: "RN Exams and LPN Exams",
  },
  {
    id: "nursing-exit-exam",
    documentId: "nursing-exit-exam-full-test",
    title: "Nursing Exit Exam Full Test",
    displayName: "Nursing Exit Exam",
    pluralName: "Nursing Exit Exams",
    adminPath: "/admin/nursing-exit-exam",
    editPath: "/admin/nursing-exit-exam/edit",
    publicPath: "/nursing-exit-exam",
    productCopy: "RN Exit Exams and LPN Exit Exams",
  },
];

const DEFAULT_CHECKLIST_ID = checklistConfigs[0].id;

const baseChecklistSections: ChecklistSection[] = [
  {
    id: "main-listing",
    title: "Main Listing",
    description: "Confirm the primary Nursing Entrance Exam admin area loads and organizes content correctly.",
    items: [
      {
        id: "main-listing-loads",
        label: "Open the Nursing Entrance Exam admin page and confirm it loads without a stuck loader.",
        href: "/admin/nursing-entrance-exam",
      },
      {
        id: "main-listing-header",
        label: "Confirm the header, breadcrumbs, buttons, and cards match the admin UI standard.",
      },
      {
        id: "main-listing-loading-breadcrumb",
        label: "Refresh the main admin page and confirm the breadcrumb bar is visible while the initial content loader is showing.",
        href: "/admin/nursing-entrance-exam",
      },
      {
        id: "main-listing-tabs",
        label: "Test all tabs: Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata.",
      },
      {
        id: "main-listing-edit-main-page",
        label: "Confirm Edit Main Page opens the Nursing Entrance Exam settings editor.",
        href: "/admin/nursing-entrance-exam/edit",
      },
      {
        id: "main-listing-no-settings-duplicate",
        label: "Confirm Main Page Settings no longer appears as a duplicate Sub Pages tab.",
      },
      {
        id: "main-listing-search-filter",
        label: "Search and filter content by exam, Sub Page, Nested Sub Page, quiz, and Knowledge Base Article.",
      },
      {
        id: "main-listing-existing-records",
        label: "Confirm ATI TEAS 7 and HESI A2 records appear under the correct sections.",
      },
    ],
  },
  {
    id: "sub-pages",
    title: "Sub Pages",
    description: "Test creating, editing, publishing, and viewing public Sub Pages.",
    items: [
      {
        id: "sub-page-create",
        label: "Create a new Sub Page from the bottom form.",
        helper: "Use a realistic name, select ATI TEAS 7 or HESI A2, and confirm the slug is generated.",
        href: "/admin/nursing-entrance-exam",
      },
      {
        id: "sub-page-create-save",
        label: "Save the new Sub Page and confirm it appears without the reserved new record error or full page loading modal.",
      },
      {
        id: "sub-page-manage",
        label: "Open the Sub Page manage screen and confirm alerts, actions, and public links work.",
      },
      {
        id: "sub-page-manage-loading-breadcrumb",
        label: "Refresh the Sub Page manage screen and confirm the shared admin sidebar and breadcrumb bar remain visible during loading.",
      },
      {
        id: "sub-page-full-editor",
        label: "Open the full Sub Page editor and save H1, slug, status, description, SEO, schema, body content, and FAQs.",
      },
      {
        id: "sub-page-editor-loading-breadcrumb",
        label: "Refresh the full Sub Page editor and confirm the breadcrumb bar is visible while editor content loads.",
      },
      {
        id: "sub-page-public",
        label: "Open the public Sub Page and confirm hero, subject cards, article guide, FAQ, schema, and breadcrumbs render correctly.",
      },
      {
        id: "sub-page-public-initial-breadcrumb",
        label: "Refresh the public Sub Page on desktop and mobile and confirm the full breadcrumb appears immediately without being injected after the page loads.",
      },
    ],
  },
  {
    id: "nested-sub-pages",
    title: "Nested Sub Pages",
    description: "Confirm subject level pages can be created, edited, and exposed correctly.",
    items: [
      {
        id: "nested-create",
        label: "Create a Nested Sub Page from the Sub Page manage screen and confirm the list refreshes without leaving the screen.",
      },
      {
        id: "nested-slug-validation",
        label: "Confirm slug auto-generation and duplicate slug validation work.",
      },
      {
        id: "nested-full-editor",
        label: "Open the Nested Sub Page editor and save title, card description, slug, status, SEO, schema, content, and FAQs.",
      },
      {
        id: "nested-editor-loading-breadcrumb",
        label: "Refresh the Nested Sub Page editor and confirm the breadcrumb bar is visible while editor content loads.",
      },
      {
        id: "nested-public",
        label: "Open the public nested page and confirm saved content, breadcrumbs, metadata, and schema are correct.",
      },
      {
        id: "nested-public-initial-breadcrumb",
        label: "Refresh the public nested page on desktop and mobile and confirm the full breadcrumb appears immediately without waiting for client-side breadcrumb loading.",
      },
    ],
  },
  {
    id: "quizzes",
    title: "Quiz Metadata",
    description: "Test quiz creation, metadata editing, schema generation, and set display behavior.",
    items: [
      {
        id: "quiz-create",
        label: "Create a quiz under the correct nested sub-page and confirm the Quiz Metadata tab refreshes without a full page reload.",
      },
      {
        id: "quiz-required-fields",
        label: "Save quiz name, slug, exam access product, subject name, set number, preview percentage, estimated minutes, and status.",
      },
      {
        id: "quiz-metadata-editor",
        label: "Open quiz manager and confirm metadata fields can be typed into normally.",
      },
      {
        id: "quiz-manager-loading-breadcrumb",
        label: "Refresh the quiz manager and confirm the breadcrumb bar remains visible while quiz metadata and questions load.",
      },
      {
        id: "quiz-save-success",
        label: "Save quiz metadata and confirm success messages appear with no Firestore undefined-value errors or full page loading modal.",
      },
      {
        id: "quiz-schema",
        label: "Confirm schema markup fills/saves correctly and question count matches the real quiz questions.",
      },
    ],
  },
  {
    id: "bulk-upload",
    title: "Bulk Upload",
    description: "Confirm bulk question uploads work without breaking existing quiz data.",
    items: [
      {
        id: "bulk-valid-file",
        label: "Upload a valid question file and preview parsed questions before saving.",
      },
      {
        id: "bulk-loading-breadcrumb",
        label: "Refresh the bulk upload route and confirm the breadcrumb bar is visible while quiz details load.",
      },
      {
        id: "bulk-validation",
        label: "Confirm validation errors are readable when the file has missing or malformed fields.",
      },
      {
        id: "bulk-copyright",
        label: "Test copyright toggle behavior.",
      },
      {
        id: "bulk-save",
        label: "Save uploaded questions and confirm they appear in the quiz manager.",
      },
      {
        id: "bulk-existing-data",
        label: "Confirm existing questions are not removed unless the UI clearly indicates replacement.",
      },
    ],
  },
  {
    id: "questions",
    title: "Question Management",
    description: "Test individual question creation, editing, deletion, and fallback states.",
    items: [
      {
        id: "question-create",
        label: "Create a single question and save question text, options, correct answer, explanation, question type, metadata, schema, and status.",
      },
      {
        id: "question-create-loading-breadcrumb",
        label: "Refresh the create question route and confirm the breadcrumb bar is visible while quiz context and question types load.",
      },
      {
        id: "question-edit",
        label: "Edit an existing question and confirm it saves in place without redirecting away from the editor.",
      },
      {
        id: "question-edit-loading-breadcrumb",
        label: "Refresh the edit question route and confirm the breadcrumb bar is visible while saved question data loads.",
      },
      {
        id: "question-delete",
        label: "Delete a question and confirm the quiz manager stays visible while the question list refreshes.",
      },
      {
        id: "question-count",
        label: "Confirm quiz question count updates after create, upload, edit, or delete.",
      },
      {
        id: "question-missing-state",
        label: "Open a deleted or missing question route if possible and confirm the fallback screen links back to questions.",
      },
    ],
  },
  {
    id: "public-quiz",
    title: "Public Quiz Pages",
    description: "Confirm the generated quiz page uses the right quiz metadata and access rules.",
    items: [
      {
        id: "public-quiz-title",
        label: "Open a quiz page and confirm title, subject, and set number come from Firestore metadata.",
      },
      {
        id: "public-quiz-count",
        label: "Confirm total question count and preview question count are correct.",
      },
      {
        id: "public-quiz-preview",
        label: "Confirm unsubscribed users only see the percentage-based preview.",
      },
      {
        id: "public-quiz-paid-access",
        label: "Confirm paid ATI TEAS 7 users access ATI TEAS 7 only and paid HESI A2 users access HESI A2 only.",
      },
      {
        id: "public-quiz-related",
        label: "Confirm related practice sets use exact clickable names and display correctly on mobile/tablet.",
      },
      {
        id: "public-quiz-initial-breadcrumb",
        label: "Refresh the public quiz page on desktop and mobile and confirm the full breadcrumb path appears immediately before quiz content hydrates.",
      },
    ],
  },
  {
    id: "kb-articles",
    title: "Knowledge Base Articles",
    description: "Test knowledge-base article editing and public display.",
    items: [
      {
        id: "kb-editor-loads",
        label: "Open a Nursing Entrance Exam Knowledge Base Article editor.",
      },
      {
        id: "kb-editor-loading-breadcrumb",
        label: "Refresh the Knowledge Base Article editor and confirm the breadcrumb bar is visible while article content loads.",
      },
      {
        id: "kb-core-fields",
        label: "Save page name, slug, status, description, SEO fields, schema, and Tiptap body content.",
      },
      {
        id: "kb-main-list-refresh",
        label: "Create or delete a Knowledge Base Article from the main listing and confirm it returns to Knowledge Base Articles without a full page loading modal.",
      },
      {
        id: "kb-public-page",
        label: "Open the public Knowledge Base Article and confirm the saved content and metadata render correctly.",
      },
      {
        id: "kb-public-initial-breadcrumb",
        label: "Refresh the public Knowledge Base Article on desktop and mobile and confirm the breadcrumb appears immediately without client-side injection.",
      },
    ],
  },
  {
    id: "main-page-settings",
    title: "Main Page Settings",
    description: "Test the public Nursing Entrance Exam parent page editor.",
    items: [
      {
        id: "main-editor-open",
        label: "Open the main Nursing Entrance Exam edit page.",
        href: "/admin/nursing-entrance-exam/edit",
      },
      {
        id: "main-editor-loading-breadcrumb",
        label: "Refresh the main page settings editor and confirm the breadcrumb bar is visible while settings load.",
        href: "/admin/nursing-entrance-exam/edit",
      },
      {
        id: "main-editor-meta",
        label: "Save meta fields, schema, and hero content.",
      },
      {
        id: "main-editor-sections",
        label: "Add, remove, and save trust indicators, what-to-expect cards, common questions, study guide sections, privacy/pricing items, and FAQs.",
      },
      {
        id: "main-public-page",
        label: "Open /nursing-entrance-exam and confirm the page reflects the saved content.",
        href: "/nursing-entrance-exam",
      },
    ],
  },
  {
    id: "regression",
    title: "Final Regression",
    description: "Refresh all key pages and confirm saved data remains stable.",
    items: [
      {
        id: "regression-refresh-admin",
        label: "Refresh the main admin page, editors, quiz manager, and question pages.",
      },
      {
        id: "regression-loading-breadcrumbs",
        label: "Confirm every Nursing Entrance Exam admin loading screen keeps the shared sidebar and breadcrumb bar visible before content finishes loading.",
      },
      {
        id: "regression-action-context",
        label: "Confirm create, save, and delete actions keep the admin in the correct tab or editor context.",
      },
      {
        id: "regression-public-pages",
        label: "Open the public parent page, sub-page, nested page, KB page, and quiz page.",
      },
      {
        id: "regression-public-initial-breadcrumbs",
        label: "Confirm generated public Sub Page, Nested Sub Page, Knowledge Base Article, and Quiz pages receive server-built breadcrumbs on initial render.",
      },
      {
        id: "regression-console",
        label: "Confirm there are no console Firestore errors, stuck loaders, or broken route errors.",
      },
      {
        id: "regression-mobile",
        label: "Check admin listing and public quiz pages on mobile/tablet widths.",
      },
    ],
  },
];

function replaceChecklistText(value: string, config: ChecklistConfig) {
  return value
    .replaceAll("Nursing Entrance Exams", config.pluralName)
    .replaceAll("Nursing Entrance Exam", config.displayName)
    .replaceAll("ATI TEAS 7 and HESI A2", config.productCopy)
    .replaceAll("ATI TEAS 7 or HESI A2", config.productCopy)
    .replaceAll("ATI TEAS 7 / HESI A2", config.productCopy)
    .replaceAll("/admin/nursing-entrance-exam/edit", config.editPath)
    .replaceAll("/admin/nursing-entrance-exam", config.adminPath)
    .replaceAll("/nursing-entrance-exam", config.publicPath);
}

function replaceChecklistHref(value: string | undefined, config: ChecklistConfig) {
  if (!value) return value;
  return replaceChecklistText(value, config);
}

function buildChecklistSections(config: ChecklistConfig): ChecklistSection[] {
  return baseChecklistSections.map((section) => ({
    ...section,
    description: replaceChecklistText(section.description, config),
    items: section.items.map((item) => ({
      ...item,
      label: replaceChecklistText(item.label, config),
      helper: item.helper ? replaceChecklistText(item.helper, config) : item.helper,
      href: replaceChecklistHref(item.href, config),
    })),
  }));
}

function AdminChecklistContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [activeChecklistId, setActiveChecklistId] = useState(DEFAULT_CHECKLIST_ID);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [changesComplete, setChangesComplete] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(baseChecklistSections[0]?.id || "");
  const [persistenceNotice, setPersistenceNotice] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const activeChecklist = useMemo(
    () =>
      checklistConfigs.find((checklist) => checklist.id === activeChecklistId) ||
      checklistConfigs[0],
    [activeChecklistId]
  );
  const checklistSections = useMemo(
    () => buildChecklistSections(activeChecklist),
    [activeChecklist]
  );
  const allItems = useMemo(
    () => checklistSections.flatMap((section) => section.items),
    [checklistSections]
  );
  const checklistLocalStorageKey = `admin-checklist:${activeChecklist.documentId}`;
  const checklistRef = useMemo(
    () => doc(db, "adminChecklists", activeChecklist.documentId),
    [activeChecklist.documentId]
  );

  const completedCount = allItems.filter((item) => checked[item.id]).length;
  const changesCompleteCount = allItems.filter((item) => changesComplete[item.id]).length;
  const completionPercentage = Math.round((completedCount / allItems.length) * 100);
  const changesCompletePercentage = Math.round((changesCompleteCount / allItems.length) * 100);
  const sectionProgress = useMemo(
    () =>
      checklistSections.map((section) => {
        const completed = section.items.filter((item) => checked[item.id]).length;
        const completedChanges = section.items.filter((item) => changesComplete[item.id]).length;
        return {
          ...section,
          completed,
          completedChanges,
          total: section.items.length,
          percentage: Math.round((completed / section.items.length) * 100),
          changesPercentage: Math.round((completedChanges / section.items.length) * 100),
        };
      }),
    [changesComplete, checked, checklistSections]
  );
  const activeSection = useMemo(
    () =>
      checklistSections.find((section) => section.id === activeSectionId) ||
      checklistSections[0],
    [activeSectionId, checklistSections]
  );
  const visibleActiveItems = useMemo(
    () =>
      showIncompleteOnly
        ? activeSection.items.filter((item) => !checked[item.id])
        : activeSection.items,
    [activeSection, checked, showIncompleteOnly]
  );

  const formattedLastSaved = lastSavedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(lastSavedAt)
    : "Not saved yet";

  const checklistJsonExport = useMemo(
    () =>
      JSON.stringify(
        {
          checklistId: activeChecklist.documentId,
          checklistType: activeChecklist.id,
          title: activeChecklist.title,
          exportedAt: new Date().toISOString(),
          checked,
          changesComplete,
          notes,
        },
        null,
        2
      ),
    [activeChecklist, changesComplete, checked, notes]
  );

  useEffect(() => {
    setActiveSectionId(checklistSections[0]?.id || "");
  }, [activeChecklistId, checklistSections]);

  const saveChecklist = useCallback(
    async (
      nextChecked: Record<string, boolean>,
      nextNotes: Record<string, string>,
      nextChangesComplete: Record<string, boolean>
    ) => {
      setSaving(true);
      setError("");
      setSuccess("");
      setPersistenceNotice("");

      try {
        const savedAt = new Date();
        const localPayload: StoredChecklist = {
          checked: nextChecked,
          changesComplete: nextChangesComplete,
          notes: nextNotes,
          savedAt: savedAt.toISOString(),
        };
        window.localStorage.setItem(
          checklistLocalStorageKey,
          JSON.stringify(localPayload)
        );
        setLastSavedAt(savedAt);

        await setDoc(
          checklistRef,
          {
            checklistId: activeChecklist.documentId,
            checklistType: activeChecklist.id,
            title: activeChecklist.title,
            checked: nextChecked,
            changesComplete: nextChangesComplete,
            notes: nextNotes,
            totalItems: allItems.length,
            completedItems: allItems.filter((item) => nextChecked[item.id]).length,
            completedChangeItems: allItems.filter((item) => nextChangesComplete[item.id]).length,
            updatedAt: serverTimestamp(),
            updatedByUid: currentUser?.uid || null,
            updatedByEmail: currentUser?.email || null,
          },
          { merge: true }
        );
        setSuccess("Checklist saved.");
      } catch (saveError) {
        console.error("Failed to save checklist", saveError);
        setPersistenceNotice(
          "Checklist saved on this device. Firestore sync is blocked by admin checklist permissions."
        );
      } finally {
        setSaving(false);
      }
    },
    [activeChecklist, allItems, checklistLocalStorageKey, checklistRef, currentUser?.email, currentUser?.uid]
  );

  useEffect(() => {
    let mounted = true;

    const loadChecklist = async () => {
      try {
        setLoading(true);
        setError("");
        setPersistenceNotice("");

        setChecked({});
        setChangesComplete({});
        setNotes({});
        setLastSavedAt(null);

        const localValue = window.localStorage.getItem(checklistLocalStorageKey);
        if (localValue) {
          const localData = JSON.parse(localValue) as StoredChecklist;
          if (!mounted) return;
          setChecked(localData.checked || {});
          setChangesComplete(localData.changesComplete || {});
          setNotes(localData.notes || {});
          setLastSavedAt(localData.savedAt ? new Date(localData.savedAt) : null);
        }

        const snapshot = await getDoc(checklistRef);
        if (!mounted) return;

        if (snapshot.exists()) {
          const data = snapshot.data() as StoredChecklist;
          setChecked(data.checked || {});
          setChangesComplete(data.changesComplete || {});
          setNotes(data.notes || {});
          if (data.updatedAt?.toDate) {
            setLastSavedAt(data.updatedAt.toDate());
          } else if (typeof data.updatedAt?.seconds === "number") {
            setLastSavedAt(new Date(data.updatedAt.seconds * 1000));
          }
        }
      } catch (loadError) {
        console.error("Failed to load checklist", loadError);
        if (mounted) {
          setPersistenceNotice(
            "Using local checklist progress. Firestore sync is blocked by admin checklist permissions."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadChecklist();

    return () => {
      mounted = false;
    };
  }, [checklistLocalStorageKey, checklistRef]);

  const toggleItem = (itemId: string) => {
    const nextChecked = { ...checked, [itemId]: !checked[itemId] };
    setChecked(nextChecked);
    saveChecklist(nextChecked, notes, changesComplete);
  };

  const toggleChangesComplete = (itemId: string) => {
    const nextChangesComplete = {
      ...changesComplete,
      [itemId]: !changesComplete[itemId],
    };
    setChangesComplete(nextChangesComplete);
    saveChecklist(checked, notes, nextChangesComplete);
  };

  const updateNote = (itemId: string, value: string) => {
    const nextNotes = { ...notes, [itemId]: value };
    setNotes(nextNotes);
  };

  const persistNotes = () => {
    saveChecklist(checked, notes, changesComplete);
  };

  const resetChecklist = () => {
    const nextChecked: Record<string, boolean> = {};
    const nextNotes: Record<string, string> = {};
    const nextChangesComplete: Record<string, boolean> = {};
    setChecked(nextChecked);
    setChangesComplete(nextChangesComplete);
    setNotes(nextNotes);
    setShowResetDialog(false);
    saveChecklist(nextChecked, nextNotes, nextChangesComplete);
  };

  const copyChecklistJson = async () => {
    try {
      await navigator.clipboard.writeText(checklistJsonExport);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2500);
    } catch {
      setError("Could not copy checklist JSON. Select and copy it manually.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-white">
        <AdminSidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
          <div className="admin-page flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading Checklist"
              description={`Preparing the ${activeChecklist.displayName} testing checklist and saved progress.`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Checklist" },
          ]}
          actions={<span>{currentUser?.email || "Admin"}</span>}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <AdminPageHeader
              eyebrow="Admin QA"
              title="Checklist"
              description={`Track one by one testing for ${activeChecklist.displayName}, its Sub Pages, Nested Sub Pages, Quiz Metadata, questions, Knowledge Base Articles, public pages, and final regression checks.`}
              actions={
                <>
                  <label className="admin-field-group min-w-[240px]">
                    <span className="admin-field-label">Checklist Area</span>
                    <select
                      className="admin-field"
                      value={activeChecklistId}
                      onChange={(event) => setActiveChecklistId(event.target.value)}
                    >
                      {checklistConfigs.map((checklist) => (
                        <option key={checklist.id} value={checklist.id}>
                          {checklist.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-button-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showIncompleteOnly}
                      onChange={(event) => setShowIncompleteOnly(event.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    Show Incomplete Only
                  </label>
                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={persistNotes}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Notes"}
                  </button>
                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() => setShowJsonExport(true)}
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    className="admin-button-danger"
                    onClick={() => setShowResetDialog(true)}
                    disabled={saving}
                  >
                    Reset
                  </button>
                </>
              }
            />

            <AdminNotificationRegion
              error={error}
              success={success}
              info={persistenceNotice}
              errorTitle="Checklist Error"
              successTitle="Checklist Saved"
              infoTitle="Local Checklist Mode"
            />

            <section className="grid gap-4 md:grid-cols-3">
              <AdminStatCard
                label="Completed"
                value={`${completedCount}/${allItems.length}`}
                helper="Checked items saved locally and synced when permitted"
              />
              <AdminStatCard
                label="Progress"
                value={`${completionPercentage}%`}
                helper={`Overall ${activeChecklist.displayName} test coverage`}
              />
              <AdminStatCard
                label="Save Status"
                value={saving ? "Saving" : "Ready"}
                helper="Checks save immediately. Notes save on blur or Save Notes"
              />
              <AdminStatCard
                label="Changes Complete"
                value={`${changesCompleteCount}/${allItems.length}`}
                helper="Items confirmed as fully updated"
              />
            </section>

            <AdminCard className="mt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="admin-section-title">Testing Progress</h2>
                <p className="admin-helper mt-1">
                  Last saved: {formattedLastSaved}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge label={`${completionPercentage}% Checked`} tone="blue" />
                <AdminStatusBadge label={`${changesCompletePercentage}% Changes Complete`} tone="green" />
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--admin-accent)] transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="admin-helper mt-3">
              Checked items are saved automatically. Use notes for issues, confirmations, or follow up details.
            </p>
            </AdminCard>

            <div className="admin-checklist-layout mt-6">
            <AdminCard className="admin-checklist-sidebar h-fit xl:sticky xl:top-24">
              <div className="mb-4">
                <h2 className="admin-section-title">Checklist Domains</h2>
                <p className="admin-helper mt-1">
                  Select one area to test at a time.
                </p>
              </div>
              <nav className="space-y-2" aria-label="Checklist domains">
                {sectionProgress.map((section) => {
                  const isActive = section.id === activeSection.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className={`admin-checklist-domain-button w-full rounded-[14px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] ${
                        isActive
                          ? "border-[var(--admin-accent)] bg-[rgba(106,92,255,0.08)] shadow-[0_12px_28px_rgba(106,92,255,0.12)]"
                          : "border-[var(--admin-border)] bg-white hover:border-[var(--admin-accent-soft)] hover:bg-[var(--admin-surface-soft)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="admin-card-title block">{section.title}</span>
                          <span className="admin-helper mt-1 block">
                            {section.completed}/{section.total} Completed
                          </span>
                          <span className="admin-helper block">
                            {section.completedChanges}/{section.total} Changes Complete
                          </span>
                        </span>
                        <AdminStatusBadge label={`${section.percentage}%`} tone={isActive ? "purple" : "blue"} />
                      </span>
                    </button>
                  );
                })}
              </nav>
            </AdminCard>

            <AdminCard className="admin-checklist-panel min-w-0">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="admin-section-title">{activeSection.title}</h2>
                  <p className="admin-helper mt-1 max-w-[760px]">
                    {activeSection.description}
                  </p>
                </div>
                <AdminStatusBadge
                  label={`${
                    activeSection.items.filter((item) => checked[item.id]).length
                  }/${activeSection.items.length} Completed`}
                  tone="blue"
                />
                <AdminStatusBadge
                  label={`${
                    activeSection.items.filter((item) => changesComplete[item.id]).length
                  }/${activeSection.items.length} Changes Complete`}
                  tone="green"
                />
              </div>

              {visibleActiveItems.length === 0 ? (
                <div className="admin-info-tile p-6 text-center">
                  <p className="admin-card-title">This Domain Is Complete</p>
                  <p className="admin-helper mt-1">
                    Turn off Show Incomplete Only to review completed checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleActiveItems.map((item) => (
                    <div key={item.id} className="admin-checklist-row admin-info-tile p-4">
                      <div className="admin-checklist-row-main">
                        <label className="admin-checklist-label flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(checked[item.id])}
                            onChange={() => toggleItem(item.id)}
                            className="mt-1 h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                          />
                          <span className="min-w-0">
                            <span className="admin-card-title block">{item.label}</span>
                            {item.helper && (
                              <span className="admin-helper mt-1 block">{item.helper}</span>
                            )}
                          </span>
                        </label>

                        {item.href && (
                          <Link
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-button-secondary admin-checklist-link"
                          >
                            Open Page
                          </Link>
                        )}
                      </div>

                      <label className="mt-3 flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(changesComplete[item.id])}
                          onChange={() => toggleChangesComplete(item.id)}
                          className="h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-success)] focus:ring-[var(--admin-success)]"
                        />
                        <span className="admin-card-title">Changes Complete</span>
                      </label>

                      <label className="admin-field-label mt-3 block" htmlFor={`note-${item.id}`}>
                        Notes
                      </label>
                      <textarea
                        id={`note-${item.id}`}
                        value={notes[item.id] || ""}
                        onChange={(event) => updateNote(item.id, event.target.value)}
                        onBlur={persistNotes}
                        rows={2}
                        className="admin-field mt-1 min-h-[70px] resize-y"
                        placeholder="Add test notes, issue details, or confirmation..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
            </div>
          </div>
        </main>
      </div>
      {showResetDialog && (
        <AdminDestructiveDialog
          title="Reset Checklist"
          itemName="all checklist progress and notes"
          consequence="This clears every checked item and note from this checklist. Local progress will be overwritten, and Firestore sync will be attempted if permissions allow it."
          confirmLabel="Reset Checklist"
          confirmingLabel="Resetting..."
          confirming={saving}
          onCancel={() => setShowResetDialog(false)}
          onConfirm={resetChecklist}
        />
      )}
      {showJsonExport && (
        <AdminModal
          title="Checklist JSON Export"
          description="Copy this JSON when you want to share checklist notes, checked items, and completed changes."
          maxWidthClassName="max-w-[820px]"
        >
          <textarea
            readOnly
            value={checklistJsonExport}
            className="admin-field min-h-[420px] font-mono text-xs"
            aria-label="Checklist JSON export"
          />
          <AdminModalFooter>
            <button
              type="button"
              className="admin-button-cancel"
              onClick={() => setShowJsonExport(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="admin-button-primary"
              onClick={() => void copyChecklistJson()}
            >
              {jsonCopied ? "Copied" : "Copy JSON"}
            </button>
          </AdminModalFooter>
        </AdminModal>
      )}
    </div>
  );
}

export default function AdminChecklistPage() {
  return (
    <SidebarProvider>
      <AdminChecklistContent />
    </SidebarProvider>
  );
}
