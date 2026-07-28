"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNursingEntranceExamSubPage,
  uploadNursingEntranceExamSubPage,
} from "@/lib/firestore-operations";
import TiptapEditor from "@/components/editor/TiptapEditor";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FaqEditor, { type FaqItem } from "@/components/admin/FaqEditor";
import ContentQualityWarnings from "@/components/admin/ContentQualityWarnings";
import PublicContentPreview from "@/components/admin/PublicContentPreview";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import {
  AdminCard,
  AdminFieldGroup,
  AdminFormSection,
  AdminInfoTile,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminSelectField,
  AdminSlugField,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl, getImageUrl } from "@/lib/config";
import {
  normalizeAdminContentName,
  normalizeAdminContentNameInput,
  normalizeAdminContentSlug,
} from "@/lib/admin/content-naming";

interface SubPageContent {
  pageName?: string;
  slug?: string;
  status?: "Draft" | "Published" | "Archived";
  heading?: string;
  description?: string;
  seoLabel?: string;
  seoSlug?: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  schema: string;
  hero: {
    title: string;
    description: string;
  };
  bodyContent: string; // Tiptap editor content
  faqs?: FaqItem[];
  displayCopy?: {
    primaryCtaLabel?: string;
    secondaryCtaLabel?: string;
    practiceEyebrow?: string;
    practiceTitle?: string;
    practiceDescription?: string;
    guideTitle?: string;
    guideDescription?: string;
    faqTitle?: string;
    faqDescription?: string;
  };
}

const getAdminExamBadgeLabel = (content: SubPageContent | null) => {
  const source = `${content?.pageName || ""} ${content?.seoLabel || ""} ${content?.heading || ""}`.toLowerCase();

  if (source.includes("teas")) return "ATI TEAS 7";
  if (source.includes("hesi")) return "HESI A2";
  return content?.pageName || "Nursing Exam";
};

const getGeneratedPublicCopyDefaults = (content: SubPageContent | null) => {
  const examBadge = getAdminExamBadgeLabel(content);

  return {
    primaryCtaLabel: `Start ${examBadge} Practice`,
    secondaryCtaLabel: `View ${examBadge} Subjects`,
    practiceEyebrow: "Start By Subject",
    practiceTitle: `${examBadge} Practice Subjects`,
    practiceDescription:
      "Pick the subject that matches your study plan. Each link opens the exact practice page for that subject.",
    guideTitle: `${content?.pageName || examBadge} Guide`,
    guideDescription:
      "Use the guide navigation to move through the full saved content without scrolling through one long article.",
    faqTitle: `${content?.pageName || examBadge} Questions`,
    faqDescription: `Answers to common questions students ask before starting ${examBadge} practice on NursingMocks.`,
  };
};

function EditSubPageContent({
  params,
}: {
  params: Promise<{ subPageId: string }>;
}) {
  const [content, setContent] = useState<SubPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [publicCopyModalOpen, setPublicCopyModalOpen] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    "Draft"
  );
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
  } | null>(null);
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      const result = await getNursingEntranceExamSubPage(
        resolvedParams.subPageId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load slug and status from pageData or use defaults
        const loadedSlug = pageData.slug || resolvedParams.subPageId;
        const loadedStatus = pageData.status || "Draft";
        setSlug(loadedSlug);
        setSlugManuallyEdited(
          loadedSlug !== normalizeAdminContentSlug(pageData.pageName || resolvedParams.subPageId)
        );
        setStatus(loadedStatus);

        // Ensure all required fields exist with defaults
        const initializedContent: SubPageContent = {
          pageName: pageData.pageName || resolvedParams.subPageId,
          slug: pageData.slug || resolvedParams.subPageId,
          status: pageData.status || "Draft",
          heading:
            pageData.heading ||
            pageData.hero?.title ||
            pageData.pageName ||
            resolvedParams.subPageId,
          description: pageData.description || pageData.hero?.description || "",
          seoLabel:
            pageData.seoLabel || pageData.pageName || resolvedParams.subPageId,
          seoSlug:
            pageData.seoSlug || pageData.slug || resolvedParams.subPageId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.subPageId} | NursingMocks`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${getSiteUrl()}/${resolvedParams.subPageId}`,
          },
          schema: pageData.schema || "",
          hero: {
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.subPageId,
            description: pageData.hero?.description || "",
          },
          bodyContent: pageData.bodyContent || "",
          faqs: Array.isArray(pageData.faqs) ? pageData.faqs : [],
          displayCopy:
            pageData.displayCopy && typeof pageData.displayCopy === "object"
              ? {
                  primaryCtaLabel: pageData.displayCopy.primaryCtaLabel || "",
                  secondaryCtaLabel: pageData.displayCopy.secondaryCtaLabel || "",
                  practiceEyebrow: pageData.displayCopy.practiceEyebrow || "",
                  practiceTitle: pageData.displayCopy.practiceTitle || "",
                  practiceDescription: pageData.displayCopy.practiceDescription || "",
                  guideTitle: pageData.displayCopy.guideTitle || "",
                  guideDescription: pageData.displayCopy.guideDescription || "",
                  faqTitle: pageData.displayCopy.faqTitle || "",
                  faqDescription: pageData.displayCopy.faqDescription || "",
                }
              : {},
        };

        setContent(initializedContent);
        setSavedSnapshot(
          JSON.stringify({
            content: initializedContent,
            slug: loadedSlug,
            status: loadedStatus,
          })
        );
      } else {
        // Initialize with default content structure
        const defaultContent: SubPageContent = {
          pageName: resolvedParams.subPageId,
          slug: resolvedParams.subPageId,
          status: "Draft",
          heading: "",
          description: "",
          meta: {
            title: `${resolvedParams.subPageId} | NursingMocks`,
            description: `Content for ${resolvedParams.subPageId}`,
            keywords: `${resolvedParams.subPageId}, nursing entrance exam`,
            ogTitle: `${resolvedParams.subPageId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.subPageId}`,
            ogImage: getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: `${getSiteUrl()}/${resolvedParams.subPageId}`,
          },
          schema: "",
          hero: {
            title: resolvedParams.subPageId,
            description: "",
          },
          bodyContent: "",
          faqs: [],
          displayCopy: {},
        };
        setContent(defaultContent);
        setSlug(resolvedParams.subPageId);
        setSlugManuallyEdited(false);
        setSavedSnapshot("__new__");
      }
    } catch (err) {
      setError("Failed to load content");
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const currentSnapshot = useMemo(() => {
    if (!content) return "";
    return JSON.stringify({ content, slug, status });
  }, [content, slug, status]);

  const hasUnsavedChanges = Boolean(
    savedSnapshot && currentSnapshot && savedSnapshot !== currentSnapshot
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!content || !resolvedParams) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Normalize naming before save so public/admin labels follow the project convention.
      const normalizedPageName = normalizeAdminContentName(content.pageName || resolvedParams.subPageId);
      const savedSlug = normalizeAdminContentSlug(slug || normalizedPageName || resolvedParams.subPageId);
      const contentToSave: SubPageContent = {
        pageName: normalizedPageName,
        slug: savedSlug,
        status,
        heading: content.heading || "",
        description: content.description || "",
        seoLabel: normalizeAdminContentName(content.seoLabel || normalizedPageName || ""),
        seoSlug: normalizeAdminContentSlug(content.seoSlug || savedSlug),
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
        faqs: Array.isArray(content.faqs) ? content.faqs : [],
        displayCopy: content.displayCopy || {},
      };

      const result = await uploadNursingEntranceExamSubPage(
        resolvedParams.subPageId,
        contentToSave
      );

      if (result.success) {
        // If slug changed, redirect to new URL
        const resultData = result.data as
          | { id: string; slug: string }
          | undefined;
        if (resultData?.slug && resultData.slug !== resolvedParams.subPageId) {
          setSuccess("Content updated! Redirecting...");
          setTimeout(() => {
            router.push(`/admin/nursing-entrance-exam/${resultData.slug}`);
          }, 1000);
        } else {
          setContent(contentToSave);
          setSlug(savedSlug);
          setSavedSnapshot(
            JSON.stringify({
              content: contentToSave,
              slug: savedSlug,
              status,
            })
          );
          setSuccess("Content updated successfully!");
          setTimeout(() => setSuccess(""), 3000);
        }
      } else {
        setError(result.message || "Failed to save content");
      }
    } catch (err) {
      setError("Failed to save content");
      console.error("Error saving content:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path: string, value: string) => {
    if (!content) return;

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev));
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          return prev;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      return newContent;
    });
  };

  const updateDisplayCopy = (
    key: keyof NonNullable<SubPageContent["displayCopy"]>,
    value: string
  ) => {
    setContent((current) =>
      current
        ? {
            ...current,
            displayCopy: {
              ...(current.displayCopy || {}),
              [key]: value,
            },
          }
        : current
    );
  };

  const clearDisplayCopy = () => {
    setContent((current) =>
      current
        ? {
            ...current,
            displayCopy: {},
          }
        : current
    );
  };

  const handlePageNameBlur = () => {
    if (!content) return;
    const normalizedName = normalizeAdminContentName(content.pageName || "");
    if (!normalizedName) return;

    setContent((current) =>
      current
        ? {
            ...current,
            pageName: normalizedName,
            seoLabel: normalizeAdminContentName(current.seoLabel || normalizedName),
          }
        : current
    );

    if (!slugManuallyEdited) {
      setSlug(normalizeAdminContentSlug(normalizedName));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-white">
        <AdminSidebar />
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <AdminTopBar
            breadcrumbs={[
              { label: "Admin", href: "/admin" },
              { label: "Content", href: "/admin" },
              { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
              { label: resolvedParams?.subPageId || "Loading Sub Page" },
            ]}
            actions={<span>{currentUser?.email || "Admin"}</span>}
          />
          <div className="admin-page flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading Sub Page Content"
              description="Preparing page details, SEO fields, schema markup, and the editor."
            />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const publicCopyDefaults = getGeneratedPublicCopyDefaults(content);
  const displayCopy = content.displayCopy || {};

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Content", href: "/admin" },
            { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
            {
              label:
                content.pageName ||
                resolvedParams?.subPageId ||
                "Edit Sub Page",
            },
          ]}
          actions={<span>{currentUser?.email || "Admin"}</span>}
        />

        {/* Main Body */}
        <main className="admin-workspace">
        <div className="admin-content">
          <div className="w-full">
            <AdminPageHeader
              eyebrow="Nursing Entrance Exam"
              title="Edit Sub Page"
              description={
                <>
                  Manage the Sub Page label, URL slug, page content, SEO fields,
                  schema markup, and FAQs.
                </>
              }
              actions={
                <>
                  <Link href="/admin/nursing-entrance-exam" className="admin-button-secondary">
                    Back To Nursing Entrance Exam
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPublicCopyModalOpen(true)}
                    className="admin-button-secondary"
                  >
                    Edit Public Copy
                  </button>
                  {resolvedParams?.subPageId && (
                    <Link
                      href={`/${slug || resolvedParams.subPageId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-button-secondary"
                    >
                      View Public Page
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="admin-button-primary"
                  >
                    {saving ? "Saving..." : "Save Sub Page"}
                  </button>
                </>
              }
            />

            <AdminNotificationRegion
              error={error}
              success={success}
              errorTitle="Unable To Save Content"
              successTitle="Content Saved"
            />

            {publicCopyModalOpen && (
              <AdminModal
                title="Edit Public Copy"
                description="Override generated public-page labels only when this page needs custom copy. Empty fields use the generated default."
                maxWidthClassName="max-w-[1040px]"
                onClose={() => setPublicCopyModalOpen(false)}
              >
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-4">
                      <h3 className="admin-card-title">Hero Buttons</h3>
                      <p className="admin-helper">
                        Optional labels for the two buttons shown in the public hero.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <AdminFieldGroup
                        label="Primary Button"
                        helper={`Default: ${publicCopyDefaults.primaryCtaLabel}`}
                      >
                        <input
                          type="text"
                          value={displayCopy.primaryCtaLabel || ""}
                          onChange={(event) =>
                            updateDisplayCopy("primaryCtaLabel", event.target.value)
                          }
                          placeholder={publicCopyDefaults.primaryCtaLabel}
                          className="admin-field"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Secondary Button"
                        helper={`Default: ${publicCopyDefaults.secondaryCtaLabel}`}
                      >
                        <input
                          type="text"
                          value={displayCopy.secondaryCtaLabel || ""}
                          onChange={(event) =>
                            updateDisplayCopy("secondaryCtaLabel", event.target.value)
                          }
                          placeholder={publicCopyDefaults.secondaryCtaLabel}
                          className="admin-field"
                        />
                      </AdminFieldGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-4">
                        <h3 className="admin-card-title">Practice Section</h3>
                        <p className="admin-helper">
                          Copy shown above the subject, exam, or topic cards.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <AdminFieldGroup
                          label="Eyebrow"
                          helper={`Default: ${publicCopyDefaults.practiceEyebrow}`}
                        >
                          <input
                            type="text"
                            value={displayCopy.practiceEyebrow || ""}
                            onChange={(event) =>
                              updateDisplayCopy("practiceEyebrow", event.target.value)
                            }
                            placeholder={publicCopyDefaults.practiceEyebrow}
                            className="admin-field"
                          />
                        </AdminFieldGroup>

                        <AdminFieldGroup
                          label="Title"
                          helper={`Default: ${publicCopyDefaults.practiceTitle}`}
                        >
                          <input
                            type="text"
                            value={displayCopy.practiceTitle || ""}
                            onChange={(event) =>
                              updateDisplayCopy("practiceTitle", event.target.value)
                            }
                            placeholder={publicCopyDefaults.practiceTitle}
                            className="admin-field"
                          />
                        </AdminFieldGroup>
                      </div>

                    <AdminFieldGroup
                      label="Description"
                      helper={`Default: ${publicCopyDefaults.practiceDescription}`}
                    >
                      <textarea
                        value={displayCopy.practiceDescription || ""}
                        onChange={(event) =>
                          updateDisplayCopy("practiceDescription", event.target.value)
                        }
                        placeholder={publicCopyDefaults.practiceDescription}
                        rows={3}
                        className="admin-field mt-4 min-h-[96px] resize-y"
                      />
                    </AdminFieldGroup>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-4">
                        <h3 className="admin-card-title">Guide Section</h3>
                        <p className="admin-helper">
                          Copy shown above the saved long-form guide content.
                        </p>
                      </div>
                      <AdminFieldGroup
                        label="Title"
                        helper={`Default: ${publicCopyDefaults.guideTitle}`}
                      >
                        <input
                          type="text"
                          value={displayCopy.guideTitle || ""}
                          onChange={(event) =>
                            updateDisplayCopy("guideTitle", event.target.value)
                          }
                          placeholder={publicCopyDefaults.guideTitle}
                          className="admin-field"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Description"
                        helper={`Default: ${publicCopyDefaults.guideDescription}`}
                      >
                        <textarea
                          value={displayCopy.guideDescription || ""}
                          onChange={(event) =>
                            updateDisplayCopy("guideDescription", event.target.value)
                          }
                          placeholder={publicCopyDefaults.guideDescription}
                          rows={3}
                          className="admin-field mt-4 min-h-[96px] resize-y"
                        />
                      </AdminFieldGroup>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="admin-helper font-semibold text-gray-700">
                      Current effective copy
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                      <span>{displayCopy.primaryCtaLabel || publicCopyDefaults.primaryCtaLabel}</span>
                      <span>{displayCopy.secondaryCtaLabel || publicCopyDefaults.secondaryCtaLabel}</span>
                      <span>{displayCopy.practiceEyebrow || publicCopyDefaults.practiceEyebrow}</span>
                      <span>{displayCopy.practiceTitle || publicCopyDefaults.practiceTitle}</span>
                      <span>{displayCopy.guideTitle || publicCopyDefaults.guideTitle}</span>
                    </div>
                  </div>
                </div>

                <AdminModalFooter>
                  <button
                    type="button"
                    onClick={() => setPublicCopyModalOpen(false)}
                    disabled={saving}
                    className="admin-button-cancel"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={clearDisplayCopy}
                    disabled={saving}
                    className="admin-button-secondary"
                  >
                    Reset To Defaults
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSave();
                      setPublicCopyModalOpen(false);
                    }}
                    disabled={saving}
                    className="admin-button-primary"
                  >
                    {saving ? "Saving..." : "Save Public Copy"}
                  </button>
                </AdminModalFooter>
              </AdminModal>
            )}

            {/* Top Grid: Sub Page Settings And SEO */}
            <section className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-4.5 mb-1 items-start">
              <AdminCard
                className="mb-5"
                title="Sub Page Settings"
                description="Manage where this Sub Page sits in the Nursing Entrance Exam structure and how it appears publicly."
              >
                <div className="mb-4 flex justify-end">
                  <AdminStatusBadge label={status} />
                </div>

                <AdminFormSection title="Parent Structure">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-1">
                    <AdminInfoTile label="Pillar Page">
                      <div className="admin-card-title mb-1">
                        Nursing Entrance Exam
                      </div>
                      <p className="admin-helper">
                        Root area for ATI TEAS 7 and HESI A2 entrance content.
                      </p>
                    </AdminInfoTile>
                    <AdminInfoTile label="Current Sub Page">
                      <div className="admin-card-title mb-1">
                        {content.pageName ||
                          resolvedParams?.subPageId ||
                          "New Sub Page"}
                      </div>
                      <p className="admin-helper">
                        This is the admin label and public grouping for the
                        current Sub Page.
                      </p>
                    </AdminInfoTile>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Sub Page Details"
                  description="Names are normalized as you type. Slugs auto-update until you edit the slug manually."
                  className="mt-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                    <div className="space-y-4">
                      <AdminFieldGroup
                        label="Sub Page Name"
                        helper="Used as the internal admin label."
                      >
                        <input
                          type="text"
                          value={content.pageName || ""}
                          onChange={(e) => {
                            const normalizedInput = normalizeAdminContentNameInput(e.target.value);
                            setContent({ ...content, pageName: normalizedInput });
                            if (!slugManuallyEdited) {
                              setSlug(normalizeAdminContentSlug(normalizedInput));
                            }
                          }}
                          onBlur={handlePageNameBlur}
                          placeholder="TEAS Reading"
                          className="admin-field"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Display Title"
                        helper="Shown as the public page H1."
                      >
                        <input
                          type="text"
                          value={content.heading || ""}
                          onChange={(e) =>
                            updateContent("heading", e.target.value)
                          }
                          placeholder="ATI TEAS Reading Practice Questions And Study Guide"
                          className="admin-field"
                        />
                      </AdminFieldGroup>
                    </div>

                    <div className="space-y-4">
                      <AdminFieldGroup
                        label="Slug"
                        helper="Editable URL slug. Manual edits will not be overwritten by the name field."
                      >
                        <AdminSlugField
                          origin={getSiteUrl()}
                          value={slug}
                          onChange={(value) => {
                            const normalizedSlug = normalizeAdminContentSlug(value);
                            setSlugManuallyEdited(true);
                            setSlug(normalizedSlug);
                            if (content) {
                              setContent({ ...content, slug: normalizedSlug });
                            }
                          }}
                          placeholder="ati-teas-reading-questions"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Status"
                        helper="Only Published Sub Pages appear to students."
                      >
                        <AdminSelectField
                          value={status}
                          onChange={(value) => {
                            const newStatus = value as
                              | "Draft"
                              | "Published"
                              | "Archived";
                            setStatus(newStatus);
                            if (content) {
                              setContent({ ...content, status: newStatus });
                            }
                          }}
                        >
                          <option>Draft</option>
                          <option>Published</option>
                          <option>Archived</option>
                        </AdminSelectField>
                      </AdminFieldGroup>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Description"
                  description="Short public description for this Sub Page."
                  className="mt-5"
                >
                  <RichTextEditor
                    value={content.description || ""}
                    onChange={(value) => updateContent("description", value)}
                    placeholder="Enter a description for this Sub Page."
                  />
                </AdminFormSection>
              </AdminCard>

              <AdminCard
                className="mb-5"
                title="SEO, Meta, and Schema"
                description="Control how this Sub Page appears in search and on social platforms."
              >
                <AdminFormSection title="SEO Fields">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminFieldGroup
                      label="SEO Label"
                      helper="Used on user-facing pages."
                    >
                      <input
                        type="text"
                        value={content.seoLabel || ""}
                        onChange={(e) =>
                          setContent({ ...content, seoLabel: e.target.value })
                        }
                        placeholder="ATI TEAS Reading Practice"
                        className="admin-field"
                      />
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="SEO Slug"
                      helper="SEO-friendly URL slug."
                    >
                      <input
                        type="text"
                        value={content.seoSlug || ""}
                        onChange={(e) =>
                          setContent({ ...content, seoSlug: e.target.value })
                        }
                        placeholder="ati-teas-reading-practice"
                        className="admin-field"
                      />
                    </AdminFieldGroup>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="SEO Meta" className="mt-5">
                  <AdminFieldGroup
                    label="Meta Title"
                    helper="Recommended length is about 60 characters."
                  >
                    <input
                      type="text"
                      value={content.meta.title}
                      onChange={(e) =>
                        updateContent("meta.title", e.target.value)
                      }
                      placeholder="ATI TEAS Reading Practice Questions (Updated 2026)"
                      className="admin-field"
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Meta Description"
                    helper="Recommended length is about 155 characters."
                  >
                    <textarea
                      value={content.meta.description}
                      onChange={(e) =>
                        updateContent("meta.description", e.target.value)
                      }
                      placeholder="Short summary that will appear in search results for this Sub Page."
                      rows={3}
                      className="admin-field resize-y min-h-[90px]"
                    />
                  </AdminFieldGroup>

                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                    <div className="space-y-4">
                      <AdminFieldGroup
                        label="Keywords"
                        helper="Optional internal keyword references."
                      >
                        <input
                          type="text"
                          value={content.meta.keywords}
                          onChange={(e) =>
                            updateContent("meta.keywords", e.target.value)
                          }
                          placeholder="teas reading practice, teas passages, nursing entrance exam"
                          className="admin-field"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Canonical URL"
                        helper="Optional canonical URL override."
                      >
                        <input
                          type="text"
                          value={content.meta.canonicalUrl}
                          onChange={(e) =>
                            updateContent("meta.canonicalUrl", e.target.value)
                          }
                          placeholder="https://www.nursingmocks.com/.../ati-teas-reading-questions"
                          className="admin-field"
                        />
                      </AdminFieldGroup>
                    </div>

                    <div className="space-y-4">
                      <AdminFieldGroup
                        label="Open Graph Title"
                        helper="Used for social sharing previews."
                      >
                        <input
                          type="text"
                          value={content.meta.ogTitle}
                          onChange={(e) =>
                            updateContent("meta.ogTitle", e.target.value)
                          }
                          placeholder="ATI TEAS Reading Practice Questions And Study Guide"
                          className="admin-field"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Open Graph Description"
                        helper="Used for social sharing previews."
                      >
                        <textarea
                          value={content.meta.ogDescription}
                          onChange={(e) =>
                            updateContent("meta.ogDescription", e.target.value)
                          }
                          placeholder="Engaging description that will appear when this page is shared on social media."
                          rows={3}
                          className="admin-field resize-y min-h-[90px]"
                        />
                      </AdminFieldGroup>

                      <AdminFieldGroup
                        label="Open Graph Image"
                        helper="Relative path or full image URL."
                      >
                        <input
                          type="text"
                          value={content.meta.ogImage}
                          onChange={(e) =>
                            updateContent("meta.ogImage", e.target.value)
                          }
                          placeholder="/images/og/ati-teas-reading.png"
                          className="admin-field"
                        />
                      </AdminFieldGroup>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Schema Markup"
                  description="Paste valid JSON-LD for this Sub Page."
                  className="mt-5"
                >
                  <textarea
                    value={content.schema}
                    onChange={(e) => updateContent("schema", e.target.value)}
                    placeholder='{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ATI TEAS Reading Practice Questions And Study Guide",
  "description": "Short summary describing this Sub Page."
}'
                    rows={8}
                    className="admin-field resize-y min-h-[130px] font-mono text-xs"
                  />
                </AdminFormSection>
              </AdminCard>
            </section>

            <AdminCard
              className="mb-5"
              title="Content Editor"
              description="Use the Tiptap editor for the full body content and custom content blocks."
            >

              <ContentQualityWarnings bodyContent={content.bodyContent || ""} />
              <PublicContentPreview
                content={content.bodyContent || ""}
                publicPath={content.slug || content.seoSlug}
              />

              <div className="mt-2">
                <TiptapEditor
                  content={content.bodyContent || ""}
                  onChange={(value) =>
                    setContent({ ...content, bodyContent: value })
                  }
                  placeholder="Start typing your content..."
                  editable={true}
                />
              </div>
            </AdminCard>

            <AdminCard
              className="mb-5"
              title="FAQ Section"
              description="Manage the public FAQ heading copy and the question-and-answer list shown below the page content."
            >
              <AdminFormSection
                title="FAQ Section Copy"
                description="These fields are prefilled from generated defaults and can be edited for this page."
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AdminFieldGroup
                    label="FAQ Title"
                    helper="Shown as the heading above the public FAQ list."
                  >
                    <input
                      type="text"
                      value={displayCopy.faqTitle || publicCopyDefaults.faqTitle}
                      onChange={(event) =>
                        updateDisplayCopy("faqTitle", event.target.value)
                      }
                      placeholder={publicCopyDefaults.faqTitle}
                      className="admin-field"
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="FAQ Description"
                    helper="Shown below the FAQ heading on the public page."
                  >
                    <textarea
                      value={displayCopy.faqDescription || publicCopyDefaults.faqDescription}
                      onChange={(event) =>
                        updateDisplayCopy("faqDescription", event.target.value)
                      }
                      placeholder={publicCopyDefaults.faqDescription}
                      rows={3}
                      className="admin-field min-h-[96px] resize-y"
                    />
                  </AdminFieldGroup>
                </div>
              </AdminFormSection>

              <FaqEditor
                label="FAQs (shown on the live page)"
                value={content.faqs}
                onChange={(faqs) => setContent({ ...content, faqs })}
              />
            </AdminCard>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default function EditSubPage({
  params,
}: {
  params: Promise<{ subPageId: string }>;
}) {
  return (
    <SidebarProvider>
      <EditSubPageContent params={params} />
    </SidebarProvider>
  );
}
