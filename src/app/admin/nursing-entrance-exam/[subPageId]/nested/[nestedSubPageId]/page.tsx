"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNursingEntranceExamSubPage,
  getNestedSubPage,
  uploadNestedSubPage,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
import TiptapEditor from "@/components/editor/TiptapEditor";
import FaqEditor, { type FaqItem } from "@/components/admin/FaqEditor";
import ContentQualityWarnings from "@/components/admin/ContentQualityWarnings";
import PublicContentPreview from "@/components/admin/PublicContentPreview";
import Link from "next/link";
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

interface NestedPageContent {
  pageName?: string;
  slug?: string;
  status?: "Draft" | "Published" | "Archived";
  heading?: string;
  description?: string;
  cardDescription?: string;
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
}

function EditNestedSubPageContent({
  params,
}: {
  params: Promise<{ subPageId: string; nestedSubPageId: string }>;
}) {
  const [content, setContent] = useState<NestedPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    "Draft"
  );
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
  } | null>(null);

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

      const [result, parentResult] = await Promise.all([
        getNestedSubPage(
          resolvedParams.subPageId,
          resolvedParams.nestedSubPageId
        ),
        getNursingEntranceExamSubPage(resolvedParams.subPageId),
      ]);

      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSubPageName(
          parentData.pageName ||
            parentData.hero?.title ||
            parentData.title ||
            resolvedParams.subPageId
        );
      } else {
        setParentSubPageName("");
      }

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Use slug directly (no prefix)
        const fullSlug = pageData.slug || resolvedParams.nestedSubPageId;
        const loadedStatus = pageData.status || "Draft";
        setSlug(fullSlug);
        setSlugManuallyEdited(
          fullSlug !== normalizeAdminContentSlug(pageData.pageName || resolvedParams.nestedSubPageId)
        );
        setStatus(loadedStatus);

        // Ensure all required fields exist with defaults
        const initializedContent: NestedPageContent = {
          pageName: pageData.pageName || resolvedParams.nestedSubPageId,
          slug: pageData.slug || resolvedParams.nestedSubPageId,
          status: pageData.status || "Draft",
          heading:
            pageData.heading ||
            pageData.hero?.title ||
            pageData.pageName ||
            resolvedParams.nestedSubPageId,
          description: pageData.description || pageData.hero?.description || "",
          cardDescription: pageData.cardDescription || pageData.shortDescription || "",
          seoLabel:
            pageData.seoLabel ||
            pageData.pageName ||
            resolvedParams.nestedSubPageId,
          seoSlug:
            pageData.seoSlug || pageData.slug || resolvedParams.nestedSubPageId,
          meta: {
            title:
              pageData.meta?.title ||
              `${resolvedParams.nestedSubPageId} | NursingMocks`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${getSiteUrl()}/${fullSlug}`,
          },
          schema: pageData.schema || "",
          hero: {
            title:
              pageData.hero?.title ||
              pageData.heading ||
              pageData.pageName ||
              resolvedParams.nestedSubPageId,
            description:
              pageData.hero?.description || pageData.description || "",
          },
          bodyContent: pageData.bodyContent || "",
          faqs: Array.isArray(pageData.faqs) ? pageData.faqs : [],
        };

        setContent(initializedContent);
        setSavedSnapshot(
          JSON.stringify({
            content: initializedContent,
            slug: fullSlug,
            status: loadedStatus,
          })
        );
      } else {
        // Initialize with default content structure
        const defaultSlug = resolvedParams.nestedSubPageId;
        const defaultContent: NestedPageContent = {
          pageName: resolvedParams.nestedSubPageId,
          slug: resolvedParams.nestedSubPageId,
          status: "Draft",
          heading: "",
          description: "",
          cardDescription: "",
          seoLabel: resolvedParams.nestedSubPageId,
          seoSlug: resolvedParams.nestedSubPageId,
          meta: {
            title: `${resolvedParams.nestedSubPageId} | NursingMocks`,
            description: `Content for ${resolvedParams.nestedSubPageId}`,
            keywords: `${resolvedParams.nestedSubPageId}, ${resolvedParams.subPageId}, nursing entrance exam`,
            ogTitle: `${resolvedParams.nestedSubPageId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.nestedSubPageId}`,
            ogImage: getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: `${getSiteUrl()}/${defaultSlug}`,
          },
          schema: "",
          hero: {
            title: resolvedParams.nestedSubPageId,
            description: "",
          },
          bodyContent: "",
          faqs: [],
        };
        setContent(defaultContent);
        setSlug(defaultSlug);
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

      // Prepare content to be saved with all fields
      const normalizedPageName = normalizeAdminContentName(
        content.pageName || resolvedParams.nestedSubPageId
      );
      const savedSlug = normalizeAdminContentSlug(
        slug || normalizedPageName || resolvedParams.nestedSubPageId
      );
      const contentToSave: NestedPageContent = {
        pageName: normalizedPageName,
        slug: savedSlug,
        status,
        heading: content.heading || "",
        description: content.description || "",
        cardDescription: content.cardDescription || "",
        seoLabel: normalizeAdminContentName(content.seoLabel || normalizedPageName || ""),
        seoSlug:
          normalizeAdminContentSlug(content.seoSlug || savedSlug),
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
        faqs: Array.isArray(content.faqs) ? content.faqs : [],
      };

      const result = await uploadNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        contentToSave
      );

      if (result.success) {
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
              {
                label: "Parent Sub Page",
                href: resolvedParams
                  ? `/admin/nursing-entrance-exam/${resolvedParams.subPageId}`
                  : "/admin/nursing-entrance-exam",
              },
              { label: resolvedParams?.nestedSubPageId || "Loading Nested Sub Page" },
            ]}
            actions={<span>{currentUser?.email || "Admin"}</span>}
          />
          <div className="admin-page flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading Nested Sub Page Content"
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
              label: parentSubPageName || "Parent Sub Page",
              href: resolvedParams
                ? `/admin/nursing-entrance-exam/${resolvedParams.subPageId}`
                : "/admin/nursing-entrance-exam",
            },
            {
              label:
                content.pageName ||
                resolvedParams?.nestedSubPageId ||
                "Edit Nested Sub Page",
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
              title="Edit Nested Sub Page"
              description={
                <>
                  Manage the Nested Sub Page label, URL slug, page content, SEO
                  fields, schema markup, and FAQs.
                </>
              }
              actions={
                <>
                  <Link href="/admin/nursing-entrance-exam" className="admin-button-secondary">
                    Back To Nursing Entrance Exam
                  </Link>
                  {resolvedParams?.nestedSubPageId && (
                    <Link
                      href={`/${slug || resolvedParams.nestedSubPageId}`}
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
                    {saving ? "Saving..." : "Save Nested Sub Page"}
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

            {/* Top Grid: Sub-Page Settings + SEO */}
            <section className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-4.5 mb-1 items-start">
              <AdminCard
                className="mb-5"
                title="Nested Sub Page Settings"
                description="Manage where this Nested Sub Page sits in the Nursing Entrance Exam structure and how it appears publicly."
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
                    <AdminInfoTile label="Parent Sub Page">
                      <div className="admin-card-title mb-1">
                        {resolvedParams?.subPageId || "Sub Page"}
                      </div>
                      <p className="admin-helper">
                        This Nested Sub Page appears under the selected parent
                        Sub Page.
                      </p>
                    </AdminInfoTile>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Nested Sub Page Details"
                  description="Names are normalized as you type. Slugs auto-update until you edit the slug manually."
                  className="mt-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                    <div className="space-y-4">
                      <AdminFieldGroup
                        label="Nested Sub Page Name"
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
                        helper="Only Published Nested Sub Pages appear to students."
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
                  description="Short public description for this Nested Sub Page."
                  className="mt-5"
                >
                  <RichTextEditor
                    value={content.description || ""}
                    onChange={(value) => updateContent("description", value)}
                    placeholder="Enter a description for this Nested Sub Page."
                  />
                </AdminFormSection>

                <AdminFormSection
                  title="Card Description"
                  description="Short supporting copy shown on parent-page cards."
                  className="mt-5"
                >
                  <textarea
                    value={content.cardDescription || ""}
                    onChange={(e) =>
                      updateContent("cardDescription", e.target.value)
                    }
                    placeholder="Practice reading comprehension, question formats, and explanations for ATI TEAS preparation."
                    rows={3}
                    maxLength={180}
                    className="admin-field resize-y min-h-[90px]"
                  />
                </AdminFormSection>
              </AdminCard>

              <AdminCard
                className="mb-5"
                title="SEO, Meta, and Schema"
                description="Control how this Nested Sub Page appears in search and on social platforms."
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
                      placeholder="Short summary that will appear in search results for this Nested Sub Page."
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
                  description="Paste valid JSON-LD for this Nested Sub Page."
                  className="mt-5"
                >
                  <textarea
                    value={content.schema}
                    onChange={(e) => updateContent("schema", e.target.value)}
                    placeholder='{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ATI TEAS Reading Practice Questions And Study Guide",
  "description": "Short summary describing this Nested Sub Page."
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
              description="Use the Tiptap editor for full body content, custom content blocks, and FAQs."
            >

              <ContentQualityWarnings
                bodyContent={content.bodyContent || ""}
                cardDescription={content.cardDescription || ""}
              />
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

export default function EditNestedSubPage({
  params,
}: {
  params: Promise<{ subPageId: string; nestedSubPageId: string }>;
}) {
  return (
    <SidebarProvider>
      <EditNestedSubPageContent params={params} />
    </SidebarProvider>
  );
}
