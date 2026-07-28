"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingExitExamKbArticle,
  uploadNursingExitExamKbArticle,
} from "@/lib/firestore-operations";
import TiptapEditor from "@/components/editor/TiptapEditor";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import {
  AdminAlert,
  AdminLoadingShell,
  AdminLoadingState,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl, getImageUrl } from "@/lib/config";

interface KbArticleContent {
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
  parentId?: string;
  pillarId?: string;
}

function EditKbArticleContent({
  params,
}: {
  params: Promise<{ kbArticleId: string }>;
}) {
  const [content, setContent] = useState<KbArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    "Draft"
  );
  const [resolvedParams, setResolvedParams] = useState<{
    kbArticleId: string;
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

      const result = await getNursingExitExamKbArticle(
        resolvedParams.kbArticleId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load slug and status from pageData or use defaults
        const loadedSlug = pageData.slug || resolvedParams.kbArticleId;
        const loadedStatus = pageData.status || "Draft";
        setSlug(loadedSlug);
        setStatus(loadedStatus);

        // Ensure all required fields exist with defaults
        const initializedContent: KbArticleContent = {
          pageName: pageData.pageName || resolvedParams.kbArticleId,
          slug: pageData.slug || resolvedParams.kbArticleId,
          status: pageData.status || "Draft",
          heading:
            pageData.heading ||
            pageData.hero?.title ||
            pageData.pageName ||
            resolvedParams.kbArticleId,
          description: pageData.description || pageData.hero?.description || "",
          seoLabel:
            pageData.seoLabel || pageData.pageName || resolvedParams.kbArticleId,
          seoSlug:
            pageData.seoSlug || pageData.slug || resolvedParams.kbArticleId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.kbArticleId} | NursingMocks`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${getSiteUrl()}/${resolvedParams.kbArticleId}`,
          },
          schema: pageData.schema || "",
          hero: {
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.kbArticleId,
            description: pageData.hero?.description || "",
          },
          bodyContent: pageData.bodyContent || "",
          parentId: pageData.parentId || "",
          pillarId: pageData.pillarId || "nursing-exit-exam",
        };

        setContent(initializedContent);
      } else {
        // Initialize with default content structure
        const defaultContent: KbArticleContent = {
          pageName: resolvedParams.kbArticleId,
          slug: resolvedParams.kbArticleId,
          status: "Draft",
          heading: "",
          description: "",
          meta: {
            title: `${resolvedParams.kbArticleId} | NursingMocks`,
            description: `Content for ${resolvedParams.kbArticleId}`,
            keywords: `${resolvedParams.kbArticleId}, nursing exit exam`,
            ogTitle: `${resolvedParams.kbArticleId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.kbArticleId}`,
            ogImage: getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: `${getSiteUrl()}/${resolvedParams.kbArticleId}`,
          },
          schema: "",
          hero: {
            title: resolvedParams.kbArticleId,
            description: "",
          },
          bodyContent: "",
          parentId: "",
          pillarId: "nursing-exit-exam",
        };
        setContent(defaultContent);
        setSlug(resolvedParams.kbArticleId);
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

  const handleSave = async () => {
    if (!content || !resolvedParams) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare content to be saved with all fields
      const contentToSave: any = {
        pageName: content.pageName,
        slug: slug.trim() || resolvedParams.kbArticleId,
        status,
        heading: content.heading || "",
        description: content.description || "",
        seoLabel: content.seoLabel || content.pageName || "",
        seoSlug: content.seoSlug || slug.trim() || resolvedParams.kbArticleId,
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
        parentId: content.parentId || "",
        pillarId: content.pillarId || "nursing-exit-exam",
        lastUpdated: new Date().toISOString(),
      };

      const result = await uploadNursingExitExamKbArticle(
        resolvedParams.kbArticleId,
        contentToSave
      );

      if (result.success) {
        // Always use the document ID in the URL (not the slug)
        const resultData = result.data as
          | { id: string; slug: string }
          | undefined;
        const documentId = resultData?.id || resolvedParams.kbArticleId;
        
        // If we're not already on the correct ID URL, redirect
        if (documentId !== resolvedParams.kbArticleId) {
          setSuccess("Content updated! Redirecting...");
          setTimeout(() => {
            router.push(
              `/admin/nursing-exit-exam/kb-articles/${documentId}`
            );
          }, 1000);
        } else {
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

  if (loading) {
    return (
      <AdminLoadingShell
        title="Loading KB article content"
        description="Preparing article details, SEO fields, schema markup, and the editor."
      />
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div
        className={`admin-workspace ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Content" },
            { label: "Nursing Exit Exam", href: "/admin/nursing-exit-exam" },
            { label: "KB Articles" },
            {
              label:
                content.pageName ||
                resolvedParams?.kbArticleId ||
                "Edit KB Article",
            },
          ]}
          actions={<span>{currentUser?.email || "Admin"}</span>}
        />

        {/* Main Body */}
        <div className="admin-content">
          <div className="w-full">
            {/* Page Header */}
            <header className="admin-header">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <h1 className="admin-page-title">
                    Edit KB Article - Nursing Exit Exam
                  </h1>
                  <p className="admin-body max-w-[720px]">
                    Edit a KB article for the Nursing Exit Exam pillar. Define the
                    article details, SEO, and full content.
                    <span className="admin-status-badge admin-status-badge-warning ml-2">
                      Draft KB article
                    </span>
                  </p>
                </div>
                <div className="admin-header-actions">
                  <Link href="/admin/nursing-exit-exam" className="admin-button-secondary">
                    Back to Admin
                  </Link>
                  {resolvedParams?.kbArticleId && (
                    <Link
                      href={`/${slug || resolvedParams.kbArticleId}`}
                      target="_blank"
                      className="admin-button-secondary"
                    >
                      View Page
                    </Link>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="admin-button-primary"
                  >
                    {saving ? "Saving..." : "Save KB Article"}
                  </button>
                </div>
              </div>
            </header>

            {/* Alerts */}
            {error && (
              <AdminAlert tone="error" title="Unable to save article">
                {error}
              </AdminAlert>
            )}

            {success && (
              <AdminAlert tone="success" title="KB article saved">
                {success}
              </AdminAlert>
            )}

            {/* Top Grid: KB Article Settings + SEO */}
            <section className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-4.5 mb-1 items-start">
              {/* Left: KB Article Settings */}
              <section className="admin-card mb-5 p-5">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div>
                    <div className="admin-card-title">
                      KB Article Settings
                    </div>
                    <div className="admin-helper mt-1">
                      See where this KB article sits in the structure and how it
                      appears on NursingMocks.
                    </div>
                  </div>
                  <span className="admin-status-badge admin-status-badge-info">
                    Core
                  </span>
                </div>

                <div className="admin-section-title mt-5 mb-2">
                  Parent Structure
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-1">
                  <div className="admin-info-tile">
                    <div className="admin-field-label mb-1">
                      Pillar page
                    </div>
                    <div className="admin-card-title mb-1">
                      Nursing Exit Exam
                    </div>
                    <div className="admin-helper">
                      Fixed root for all exit exam content.
                    </div>
                  </div>
                  <div className="admin-info-tile">
                    <div className="admin-field-label mb-1">
                      Parent sub page
                    </div>
                    <div className="admin-card-title mb-1">
                      {content.parentId || "N/A"}
                    </div>
                    <div className="admin-helper">
                      Parent sub-page ID for this KB article.
                    </div>
                  </div>
                </div>

                <div className="admin-section-title mt-5 mb-2">
                  KB Article Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="cat-name"
                        >
                          KB Article name
                        </label>
                        <span className="admin-helper">
                          Internal admin label
                        </span>
                      </div>
                      <input
                        type="text"
                        id="cat-name"
                        value={content.pageName || ""}
                        onChange={(e) =>
                          setContent({ ...content, pageName: e.target.value })
                        }
                        placeholder="KB Article Title"
                        className="admin-field"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="display-title"
                        >
                          Display title (H1)
                        </label>
                        <span className="admin-helper">
                          Shown on the live page
                        </span>
                      </div>
                      <input
                        type="text"
                        id="display-title"
                        value={content.heading || ""}
                        onChange={(e) =>
                          updateContent("heading", e.target.value)
                        }
                        placeholder="KB Article Heading"
                        className="admin-field"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="slug"
                        >
                          Slug
                        </label>
                        <span className="admin-helper">
                          Builds the URL
                        </span>
                      </div>
                      <input
                        type="text"
                        id="slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          if (content) {
                            setContent({ ...content, slug: e.target.value });
                          }
                        }}
                        placeholder="kb-article-slug"
                        className="admin-field"
                      />
                      <div className="admin-helper mt-1">
                        Example URL:{" "}
                        <strong className="text-[var(--admin-text-muted)]">
                          /
                          {slug ||
                            resolvedParams?.kbArticleId ||
                            "kb-article-slug"}
                        </strong>
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="status"
                        >
                          Status
                        </label>
                        <span className="admin-helper">
                          Control visibility
                        </span>
                      </div>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => {
                          const newStatus = e.target.value as
                            | "Draft"
                            | "Published"
                            | "Archived";
                          setStatus(newStatus);
                          if (content) {
                            setContent({ ...content, status: newStatus });
                          }
                        }}
                        className="admin-field appearance-none bg-[length:14px] bg-[right_10px_center] bg-no-repeat pr-8"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%237a819c' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        }}
                      >
                        <option>Draft</option>
                        <option>Published</option>
                        <option>Archived</option>
                      </select>
                      <div className="admin-helper mt-1">
                        Only{" "}
                        <strong className="text-[var(--admin-text-muted)]">Published</strong>{" "}
                        KB articles appear to students.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3.5 mt-4">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="admin-field-label"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <span className="admin-helper">
                      Rich text description
                    </span>
                  </div>
                  <RichTextEditor
                    value={content.description || ""}
                    onChange={(value) => updateContent("description", value)}
                    placeholder="Enter a description for this KB article..."
                  />
                </div>
              </section>

              {/* Right: SEO, Meta & Schema */}
              <section className="admin-card mb-5 p-5">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div>
                    <div className="admin-card-title">
                      SEO, Meta & Schema
                    </div>
                    <div className="admin-helper mt-1">
                      Control how this KB article appears in search and on
                      social platforms.
                    </div>
                  </div>
                  <span className="admin-status-badge admin-status-badge-info">
                    SEO
                  </span>
                </div>

                <div className="admin-section-title mt-5 mb-2">
                  SEO Fields
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="seo-label"
                        >
                          SEO Label
                        </label>
                        <span className="admin-helper">
                          Used on user-facing pages
                        </span>
                      </div>
                      <input
                        type="text"
                        id="seo-label"
                        value={content.seoLabel || ""}
                        onChange={(e) =>
                          setContent({ ...content, seoLabel: e.target.value })
                        }
                        placeholder="KB Article SEO Label"
                        className="admin-field"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="seo-slug"
                        >
                          SEO Slug
                        </label>
                        <span className="admin-helper">
                          SEO-friendly URL slug
                        </span>
                      </div>
                      <input
                        type="text"
                        id="seo-slug"
                        value={content.seoSlug || ""}
                        onChange={(e) =>
                          setContent({ ...content, seoSlug: e.target.value })
                        }
                        placeholder="kb-article-seo-slug"
                        className="admin-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-section-title mt-5 mb-2">
                  SEO Meta
                </div>
                <div className="mb-3.5">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="admin-field-label"
                      htmlFor="meta-title"
                    >
                      Meta title
                    </label>
                    <span className="admin-helper">
                      ~60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    id="meta-title"
                    value={content.meta.title}
                    onChange={(e) =>
                      updateContent("meta.title", e.target.value)
                    }
                    placeholder="KB Article Meta Title"
                    className="admin-field"
                  />
                </div>

                <div className="mb-3.5">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="admin-field-label"
                      htmlFor="meta-desc"
                    >
                      Meta description
                    </label>
                    <span className="admin-helper">
                      ~155 characters
                    </span>
                  </div>
                  <textarea
                    id="meta-desc"
                    value={content.meta.description}
                    onChange={(e) =>
                      updateContent("meta.description", e.target.value)
                    }
                    placeholder="Short summary that will appear in search results for this KB article."
                    rows={3}
                    className="admin-field resize-y min-h-[90px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="keywords"
                        >
                          Keywords (optional)
                        </label>
                        <span className="admin-helper">
                          Internal only
                        </span>
                      </div>
                      <input
                        type="text"
                        id="keywords"
                        value={content.meta.keywords}
                        onChange={(e) =>
                          updateContent("meta.keywords", e.target.value)
                        }
                        placeholder="kb article, nursing exit exam"
                        className="admin-field"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="canonical"
                        >
                          Canonical URL
                        </label>
                        <span className="admin-helper">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        id="canonical"
                        value={content.meta.canonicalUrl}
                        onChange={(e) =>
                          updateContent("meta.canonicalUrl", e.target.value)
                        }
                        placeholder="https://www.nursingmocks.com/.../kb-article"
                        className="admin-field"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="og-title"
                        >
                          OG title
                        </label>
                        <span className="admin-helper">
                          Social preview
                        </span>
                      </div>
                      <input
                        type="text"
                        id="og-title"
                        value={content.meta.ogTitle}
                        onChange={(e) =>
                          updateContent("meta.ogTitle", e.target.value)
                        }
                        placeholder="KB Article OG Title"
                        className="admin-field"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="admin-field-label"
                          htmlFor="og-image"
                        >
                          OG image
                        </label>
                        <span className="admin-helper">
                          Relative path or URL
                        </span>
                      </div>
                      <input
                        type="text"
                        id="og-image"
                        value={content.meta.ogImage}
                        onChange={(e) =>
                          updateContent("meta.ogImage", e.target.value)
                        }
                        placeholder="/images/og/kb-article.png"
                        className="admin-field"
                      />
                      <div className="admin-helper mt-1">
                        This image will be used for social sharing cards.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-section-title mt-5 mb-2">
                  Schema markup (JSON-LD)
                </div>
                <div className="mb-3.5">
                  <textarea
                    id="schema"
                    value={content.schema}
                    onChange={(e) => updateContent("schema", e.target.value)}
                    placeholder='{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "KB Article Title",
  "description": "Short summary describing this KB article..."
}'
                    rows={8}
                    className="admin-field resize-y min-h-[130px] font-mono text-xs"
                  />
                  <div className="admin-helper mt-1">
                    Paste valid JSON-LD. Your frontend will inject this into the
                    page head.
                  </div>
                </div>
              </section>
            </section>

            {/* Content Editor */}
            <section className="admin-card mb-5 p-5">
              <div className="flex justify-between items-center mb-3 gap-2">
                <div>
                  <div className="admin-card-title">
                    Content Editor
                  </div>
                  <div className="admin-helper mt-1">
                    Single Tiptap editor for the full body content, with
                    drag-and-drop custom modules.
                  </div>
                </div>
                <span className="admin-status-badge admin-status-badge-info">
                  Content
                </span>
              </div>

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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditKbArticle({
  params,
}: {
  params: Promise<{ kbArticleId: string }>;
}) {
  return (
    <SidebarProvider>
      <EditKbArticleContent params={params} />
    </SidebarProvider>
  );
}

