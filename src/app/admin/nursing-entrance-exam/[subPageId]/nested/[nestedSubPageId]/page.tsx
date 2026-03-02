"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNestedSubPage,
  uploadNestedSubPage,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
import TiptapEditor from "@/components/editor/TiptapEditor";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

interface NestedPageContent {
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

      const result = await getNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Use slug directly (no prefix)
        const fullSlug = pageData.slug || resolvedParams.nestedSubPageId;
        const loadedStatus = pageData.status || "Draft";
        setSlug(fullSlug);
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
          seoLabel:
            pageData.seoLabel ||
            pageData.pageName ||
            resolvedParams.nestedSubPageId,
          seoSlug:
            pageData.seoSlug || pageData.slug || resolvedParams.nestedSubPageId,
          meta: {
            title:
              pageData.meta?.title ||
              `${resolvedParams.nestedSubPageId} | TeasGurus`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/teas-gurus-logo.png",
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"
              }/${fullSlug}`,
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
        };

        setContent(initializedContent);
      } else {
        // Initialize with default content structure
        const defaultSlug = resolvedParams.nestedSubPageId;
        const defaultContent: NestedPageContent = {
          pageName: resolvedParams.nestedSubPageId,
          slug: resolvedParams.nestedSubPageId,
          status: "Draft",
          heading: "",
          description: "",
          seoLabel: resolvedParams.nestedSubPageId,
          seoSlug: resolvedParams.nestedSubPageId,
          meta: {
            title: `${resolvedParams.nestedSubPageId} | TeasGurus`,
            description: `Content for ${resolvedParams.nestedSubPageId}`,
            keywords: `${resolvedParams.nestedSubPageId}, ${resolvedParams.subPageId}, nursing entrance exam`,
            ogTitle: `${resolvedParams.nestedSubPageId} | TeasGurus`,
            ogDescription: `Content for ${resolvedParams.nestedSubPageId}`,
            ogImage: "/teas-gurus-logo.png",
            canonicalUrl: `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"
            }/${defaultSlug}`,
          },
          schema: "",
          hero: {
            title: resolvedParams.nestedSubPageId,
            description: "",
          },
          bodyContent: "",
        };
        setContent(defaultContent);
        setSlug(defaultSlug);
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
      const contentToSave: NestedPageContent = {
        pageName: content.pageName,
        slug: slug.trim() || resolvedParams.nestedSubPageId,
        status,
        heading: content.heading || "",
        description: content.description || "",
        seoLabel: content.seoLabel || content.pageName || "",
        seoSlug:
          content.seoSlug || slug.trim() || resolvedParams.nestedSubPageId,
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
      };

      const result = await uploadNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        contentToSave
      );

      if (result.success) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f2ff] via-[#f5f6fb] to-[#f5f6fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6a5cff] mx-auto mb-4"></div>
          <p className="text-[#7a819c]">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const userInitial = currentUser?.email?.[0]?.toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f2ff] via-[#f5f6fb] to-[#f5f6fb]">
      <AdminSidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Main Header */}
        <header className="sticky top-0 z-10 h-[60px] flex items-center justify-center bg-white/92 backdrop-blur-sm border-b border-[#e2e4f0]/95">
          <div className="w-full max-w-[1220px] flex items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-1.5 text-xs text-[#a0a5bf]">
              <span>Home</span>
              <span>/</span>
              <span>Content</span>
              <span>/</span>
              <span>Nursing Entrance Exam</span>
              <span>/</span>
              <span className="text-[#202437] font-medium">
                {content.pageName ||
                  resolvedParams?.nestedSubPageId ||
                  "Edit Nested Page"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#202437]">
              <span>{currentUser?.email || "Admin"}</span>
              <div className="w-8 h-8 rounded-full bg-[#6a5cff] text-white flex items-center justify-center font-semibold text-sm shadow-lg shadow-[#4c3dff]/40">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <div className="py-5 px-4 flex justify-center">
          <div className="w-full max-w-[1220px]">
            {/* Page Header */}
            <header className="flex justify-between items-start mb-4.5 gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1 text-[#202437]">
                  Edit Nested Page – Nursing Entrance Exam
                </h1>
                <p className="text-sm text-[#7a819c] max-w-[640px] leading-relaxed">
                  Edit a nested page under a sub-page. Define the nested page
                  details, SEO, and full content.
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 ml-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Draft nested page
                  </span>
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/admin/nursing-entrance-exam"
                  className="rounded-full border border-[#e2e4f0] bg-transparent text-[#7a819c] px-3.5 py-2 text-sm font-medium hover:bg-[#f4f5ff] transition-colors flex items-center gap-1.5"
                >
                  ← Back to Admin
                </Link>
                {resolvedParams?.nestedSubPageId && (
                  <Link
                    href={`/${slug || resolvedParams.nestedSubPageId}`}
                    target="_blank"
                    className="rounded-full border border-[#e2e4f0] bg-transparent text-[#7a819c] px-3.5 py-2 text-sm font-medium hover:bg-[#f4f5ff] transition-colors flex items-center gap-1.5"
                  >
                    View Page
                  </Link>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-[#6a5cff] to-[#8b5dff] text-white px-3.5 py-2 text-sm font-medium shadow-lg shadow-[#4c3dff]/40 hover:shadow-xl hover:shadow-[#4c3dff]/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? "Saving..." : "Save Nested Page"}
                </button>
              </div>
            </header>

            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Top Grid: Sub-Page Settings + SEO */}
            <section className="grid grid-cols-1 lg:grid-cols-[3fr_2.2fr] gap-4.5 mb-1 items-start">
              {/* Left: Nested Page Settings */}
              <section className="bg-white rounded-2xl shadow-sm p-4.5 border border-[#e2e4f0]/90 mb-4.5">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div>
                    <div className="text-[15px] font-semibold text-[#202437]">
                      Nested Page Settings
                    </div>
                    <div className="text-xs text-[#a0a5bf]">
                      See where this nested page sits in the structure and how
                      it appears on NursingMocks.
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f4ff] text-[#5b60a0]">
                    Core
                  </span>
                </div>

                <div className="text-[13px] font-semibold mt-2 mb-1.5 text-[#202437]">
                  Parent Structure
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-1">
                  <div className="rounded-xl border border-dashed border-[#e2e4f0] p-3 bg-gradient-to-br from-[#f9fafb] via-[#f5f5ff] to-[#eef2ff]">
                    <div className="text-[11px] uppercase tracking-wider text-[#a0a5bf] mb-1">
                      Pillar page
                    </div>
                    <div className="text-sm font-semibold mb-1 text-[#202437]">
                      Nursing Entrance Exam
                    </div>
                    <div className="text-xs text-[#7a819c]">
                      Fixed root for all TEAS & HESI entrance content.
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-[#e2e4f0] p-3 bg-gradient-to-br from-[#f9fafb] via-[#f5f5ff] to-[#eef2ff]">
                    <div className="text-[11px] uppercase tracking-wider text-[#a0a5bf] mb-1">
                      Parent sub page
                    </div>
                    <div className="text-sm font-semibold mb-1 text-[#202437]">
                      {resolvedParams?.subPageId || "Sub-Page"}
                    </div>
                    <div className="text-xs text-[#7a819c]">
                      Parent sub-page for this nested page.
                    </div>
                  </div>
                </div>

                <div className="text-[13px] font-semibold mt-2 mb-1.5 text-[#202437]">
                  Nested Page Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="cat-name"
                        >
                          Nested page name
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="TEAS Reading"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="display-title"
                        >
                          Display title (H1)
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="ATI TEAS Reading Practice Questions & Study Guide"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="slug"
                        >
                          Slug
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="ati-teas-reading-questions"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                      <div className="text-[11px] text-[#a0a5bf] mt-1">
                        Example URL:{" "}
                        <strong className="text-[#7a819c]">
                          /
                          {slug ||
                            resolvedParams?.nestedSubPageId ||
                            "ati-teas-reading-questions"}
                        </strong>
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="status"
                        >
                          Status
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white appearance-none bg-[length:14px] bg-[right_10px_center] bg-no-repeat pr-8"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%237a819c' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        }}
                      >
                        <option>Draft</option>
                        <option>Published</option>
                        <option>Archived</option>
                      </select>
                      <div className="text-[11px] text-[#a0a5bf] mt-1">
                        Only{" "}
                        <strong className="text-[#7a819c]">Published</strong>{" "}
                        nested pages appear to students.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3.5 mt-4">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="text-xs font-medium text-[#3b3f57]"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <span className="text-[11px] text-[#a0a5bf]">
                      Rich text description
                    </span>
                  </div>
                  <RichTextEditor
                    value={content.description || ""}
                    onChange={(value) => updateContent("description", value)}
                    placeholder="Enter a description for this nested page..."
                  />
                </div>
              </section>

              {/* Right: SEO, Meta & Schema */}
              <section className="bg-white rounded-2xl shadow-sm p-4.5 border border-[#e2e4f0]/90 mb-4.5">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div>
                    <div className="text-[15px] font-semibold text-[#202437]">
                      SEO, Meta & Schema
                    </div>
                    <div className="text-xs text-[#a0a5bf]">
                      Control how this nested page appears in search and on
                      social platforms.
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f4ff] text-[#5b60a0]">
                    SEO
                  </span>
                </div>

                <div className="text-[13px] font-semibold mt-2 mb-1.5 text-[#202437]">
                  SEO Fields
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="seo-label"
                        >
                          SEO Label
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="ATI TEAS Reading Practice"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="seo-slug"
                        >
                          SEO Slug
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="ati-teas-reading-practice"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[13px] font-semibold mt-2 mb-1.5 text-[#202437]">
                  SEO Meta
                </div>
                <div className="mb-3.5">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="text-xs font-medium text-[#3b3f57]"
                      htmlFor="meta-title"
                    >
                      Meta title
                    </label>
                    <span className="text-[11px] text-[#a0a5bf]">
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
                    placeholder="ATI TEAS Reading Practice Questions (Updated 2026)"
                    className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                  />
                </div>

                <div className="mb-3.5">
                  <div className="flex justify-between items-baseline gap-3 mb-1">
                    <label
                      className="text-xs font-medium text-[#3b3f57]"
                      htmlFor="meta-desc"
                    >
                      Meta description
                    </label>
                    <span className="text-[11px] text-[#a0a5bf]">
                      ~155 characters
                    </span>
                  </div>
                  <textarea
                    id="meta-desc"
                    value={content.meta.description}
                    onChange={(e) =>
                      updateContent("meta.description", e.target.value)
                    }
                    placeholder="Short summary that will appear in search results for this nested page."
                    rows={3}
                    className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white resize-y min-h-[90px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="keywords"
                        >
                          Keywords (optional)
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="teas reading practice, teas passages, nursing entrance exam"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="canonical"
                        >
                          Canonical URL
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="https://www.nursingmocks.com/.../ati-teas-reading-questions"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="og-title"
                        >
                          OG title
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="ATI TEAS Reading Practice Questions & Study Guide"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                    </div>

                    <div className="mb-3.5">
                      <div className="flex justify-between items-baseline gap-3 mb-1">
                        <label
                          className="text-xs font-medium text-[#3b3f57]"
                          htmlFor="og-image"
                        >
                          OG image
                        </label>
                        <span className="text-[11px] text-[#a0a5bf]">
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
                        placeholder="/images/og/ati-teas-reading.png"
                        className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-sm font-sans text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
                      />
                      <div className="text-[11px] text-[#a0a5bf] mt-1">
                        This image will be used for social sharing cards.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[13px] font-semibold mt-2 mb-1.5 text-[#202437]">
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
  "headline": "ATI TEAS Reading Practice Questions & Study Guide",
  "description": "Short summary describing this nested page..."
}'
                    rows={8}
                    className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-2.5 py-2.25 text-xs font-mono text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white resize-y min-h-[130px]"
                  />
                  <div className="text-[11px] text-[#a0a5bf] mt-1">
                    Paste valid JSON-LD. Your frontend will inject this into the
                    page head.
                  </div>
                </div>
              </section>
            </section>

            {/* Content Editor */}
            <section className="bg-white rounded-2xl shadow-sm p-4.5 border border-[#e2e4f0]/90 mb-4.5">
              <div className="flex justify-between items-center mb-3 gap-2">
                <div>
                  <div className="text-[15px] font-semibold text-[#202437]">
                    Content Editor
                  </div>
                  <div className="text-xs text-[#a0a5bf]">
                    Single Tiptap editor for the full body content, with
                    drag-and-drop custom modules.
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f4ff] text-[#5b60a0]">
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
