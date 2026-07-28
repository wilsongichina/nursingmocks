"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNursingTestBankSubPage,
  uploadNursingTestBankSubPage,
} from "@/lib/firestore-operations";
import TiptapEditor from "@/components/editor/TiptapEditor";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FaqEditor, { type FaqItem } from "@/components/admin/FaqEditor";
import ContentQualityWarnings from "@/components/admin/ContentQualityWarnings";
import PublicContentPreview from "@/components/admin/PublicContentPreview";
import Link from "next/link";
import {
  AdminLoadingShell,
  AdminFormSection,
  AdminFieldGroup,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminSelectField,
  AdminSlugField,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import { getSiteUrl, getImageUrl } from "@/lib/config";

const adminInputClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const adminTextareaClass = `${adminInputClass} min-h-[96px] resize-y`;

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
}

function stripHtml(value: string | undefined) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function replaceLegacyBrandText(value: string | undefined) {
  return (value || "")
    .replace(/https:\/\/www\.teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/https:\/\/teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/http:\/\/www\.teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/http:\/\/teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/www\.teasgurus\.com/gi, "www.nursingmocks.com")
    .replace(/teasgurus\.com/gi, "nursingmocks.com")
    .replace(/support@teasgurus\.com/gi, "support@nursingmocks.com")
    .replace(/teasgurus@gmail\.com/gi, "support@nursingmocks.com")
    .replace(/\/teas-gurus-logo\.png/gi, "/nursing-mocks-logo.png")
    .replace(/TeasGurus/gi, "NursingMocks")
    .replace(/Teas Gurus/gi, "NursingMocks")
    .replace(/teas-gurus/gi, "nursingmocks")
    .replace(/teasgurus/gi, "nursingmocks");
}

function sanitizeSubPageContent(content: SubPageContent): SubPageContent {
  return {
    ...content,
    pageName: replaceLegacyBrandText(content.pageName),
    slug: replaceLegacyBrandText(content.slug),
    heading: replaceLegacyBrandText(content.heading),
    description: replaceLegacyBrandText(content.description),
    seoLabel: replaceLegacyBrandText(content.seoLabel),
    seoSlug: replaceLegacyBrandText(content.seoSlug),
    meta: {
      title: replaceLegacyBrandText(content.meta.title),
      description: replaceLegacyBrandText(content.meta.description),
      keywords: replaceLegacyBrandText(content.meta.keywords),
      ogTitle: replaceLegacyBrandText(content.meta.ogTitle),
      ogDescription: replaceLegacyBrandText(content.meta.ogDescription),
      ogImage: replaceLegacyBrandText(content.meta.ogImage),
      canonicalUrl: replaceLegacyBrandText(content.meta.canonicalUrl),
    },
    schema: replaceLegacyBrandText(content.schema),
    hero: {
      title: replaceLegacyBrandText(content.hero.title),
      description: replaceLegacyBrandText(content.hero.description),
    },
    bodyContent: replaceLegacyBrandText(content.bodyContent),
    faqs: Array.isArray(content.faqs)
      ? content.faqs.map((faq) => ({
          ...faq,
          question: replaceLegacyBrandText(faq.question),
          answer: replaceLegacyBrandText(faq.answer),
        }))
      : [],
  };
}

function buildSubPageSchema({
  pageName,
  heading,
  description,
  slug,
}: {
  pageName: string;
  heading: string;
  description: string;
  slug: string;
}) {
  const siteUrl = getSiteUrl();
  const cleanSlug = slug.replace(/^\/+/, "");
  const pageUrl = `${siteUrl}/${cleanSlug}`;
  const title = heading || pageName;
  const cleanDescription =
    stripHtml(description) ||
    `Browse nursing test bank categories and practice questions for ${title}.`;

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: title,
          description: cleanDescription,
          isPartOf: {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: "NursingMocks",
            url: siteUrl,
          },
          about: {
            "@type": "Thing",
            name: "Nursing Test Bank",
          },
          breadcrumb: {
            "@id": `${pageUrl}#breadcrumb`,
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Nursing Test Bank",
              item: `${siteUrl}/nursing-test-bank`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: pageUrl,
            },
          ],
        },
      ],
    },
    null,
    2
  );
}

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
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    "Draft"
  );
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
  } | null>(null);
  const router = useRouter();
  const { isCollapsed } = useSidebar();

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

      const result = await getNursingTestBankSubPage(resolvedParams.subPageId);

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load slug and status from pageData or use defaults
        const loadedSlug = pageData.slug || resolvedParams.subPageId;
        const loadedStatus = pageData.status || "Draft";
        const loadedPageName = pageData.pageName || resolvedParams.subPageId;
        const loadedHeading =
          pageData.heading ||
          pageData.hero?.title ||
          pageData.pageName ||
          resolvedParams.subPageId;
        const loadedDescription =
          pageData.description || pageData.hero?.description || "";
        const generatedSchema = buildSubPageSchema({
          pageName: loadedPageName,
          heading: loadedHeading,
          description: loadedDescription,
          slug: loadedSlug,
        });
        setSlug(loadedSlug);
        setStatus(loadedStatus);

        // Ensure all required fields exist with defaults
        const initializedContent: SubPageContent = {
          pageName: loadedPageName,
          slug: pageData.slug || resolvedParams.subPageId,
          status: pageData.status || "Draft",
          heading: loadedHeading,
          description: loadedDescription,
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
              `https://www.nursingmocks.com/${resolvedParams.subPageId}`,
          },
          schema:
            typeof pageData.schema === "string" && pageData.schema.trim()
              ? pageData.schema
              : generatedSchema,
          hero: {
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.subPageId,
            description: pageData.hero?.description || "",
          },
          bodyContent: pageData.bodyContent || "",
          faqs: Array.isArray(pageData.faqs) ? pageData.faqs : [],
        };

        const sanitizedContent = sanitizeSubPageContent(initializedContent);
        setContent(sanitizedContent);
        setSavedSnapshot(
          JSON.stringify({
            content: sanitizedContent,
            slug: loadedSlug,
            status: loadedStatus,
          })
        );
      } else {
        // Initialize with default content structure
        const generatedSchema = buildSubPageSchema({
          pageName: resolvedParams.subPageId,
          heading: resolvedParams.subPageId,
          description: `Content for ${resolvedParams.subPageId}`,
          slug: resolvedParams.subPageId,
        });
        const defaultContent: SubPageContent = {
          pageName: resolvedParams.subPageId,
          slug: resolvedParams.subPageId,
          status: "Draft",
          heading: "",
          description: "",
          meta: {
            title: `${resolvedParams.subPageId} | NursingMocks`,
            description: `Content for ${resolvedParams.subPageId}`,
            keywords: `${resolvedParams.subPageId}, nursing test bank`,
            ogTitle: `${resolvedParams.subPageId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.subPageId}`,
            ogImage: getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: `${getSiteUrl()}/${resolvedParams.subPageId}`,
          },
          schema: generatedSchema,
          hero: {
            title: resolvedParams.subPageId,
            description: "",
          },
          bodyContent: "",
          faqs: [],
        };
        const sanitizedContent = sanitizeSubPageContent(defaultContent);
        setContent(sanitizedContent);
        setSlug(resolvedParams.subPageId);
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
      const savedSlug = slug.trim() || resolvedParams.subPageId;
      const contentToSave: SubPageContent = sanitizeSubPageContent({
        pageName: content.pageName,
        slug: savedSlug,
        status,
        heading: content.heading || "",
        description: content.description || "",
        seoLabel: content.seoLabel || content.pageName || "",
        seoSlug: content.seoSlug || savedSlug,
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
        faqs: Array.isArray(content.faqs) ? content.faqs : [],
      });

      const result = await uploadNursingTestBankSubPage(
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
            router.push(`/admin/nursing-test-bank/${resultData.slug}`);
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

  const handleRegenerateSchema = () => {
    if (!content || !resolvedParams) return;

    updateContent(
      "schema",
      buildSubPageSchema({
        pageName: content.pageName || resolvedParams.subPageId,
        heading: content.heading || content.pageName || resolvedParams.subPageId,
        description: content.description || content.meta.description,
        slug: slug || content.slug || resolvedParams.subPageId,
      })
    );
  };

  const handleCleanLegacyBranding = () => {
    if (!content) return;

    const cleaned = sanitizeSubPageContent(content);
    setSlug(replaceLegacyBrandText(slug));
    setContent(cleaned);
    setSuccess("Legacy branding cleaned from the current sub page fields.");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <AdminLoadingShell
        title="Loading Content"
        description="Preparing admin content, metadata, and editor fields."
      />
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
            { label: "Nursing Test Bank", href: "/admin/nursing-test-bank" },
            {
              label:
                content.pageName ||
                resolvedParams?.subPageId ||
                "Edit Sub Page",
            },
          ]}
        />
        <main className="admin-content min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-none space-y-6">
            <AdminNotificationRegion
              error={error}
              success={success}
              errorTitle="Unable To Save Sub Page"
              successTitle="Sub Page Saved"
            />
            <AdminPageHeader
              eyebrow="Nursing Test Bank"
              title="Edit Sub Page"
              description="Update the Sub Page details, SEO, schema, FAQ content, and public body content."
              actions={
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <AdminStatusBadge
                    label={
                      saving
                        ? "Saving"
                        : hasUnsavedChanges
                        ? "Unsaved Changes"
                        : "Saved"
                    }
                    tone={saving || hasUnsavedChanges ? "amber" : "green"}
                  />
                  <Link
                    href="/admin/nursing-test-bank"
                    className="admin-button-secondary whitespace-nowrap"
                  >
                    Back to Admin
                  </Link>
                  {resolvedParams?.subPageId && (
                    <Link
                      href={`/${slug || resolvedParams.subPageId}`}
                      target="_blank"
                      className="admin-button-secondary whitespace-nowrap"
                    >
                      View Page
                    </Link>
                  )}
                  <Link
                    href={`/admin/nursing-test-bank/${resolvedParams?.subPageId}/manage`}
                    className="admin-button-secondary whitespace-nowrap"
                  >
                    Manage Nested Sub Pages
                  </Link>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                    className="admin-button-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : hasUnsavedChanges
                      ? "Save Changes"
                      : "Saved"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCleanLegacyBranding}
                    disabled={saving}
                    className="admin-button-secondary whitespace-nowrap"
                  >
                    Clean Legacy Branding
                  </button>
                </div>
              }
            />
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
              <AdminFormSection
                title="Sub Page Settings"
                description="Set the sub-page label, public URL, visibility, and live-page summary."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="min-w-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Pillar Page
                    </p>
                    <p
                      className="truncate text-sm font-semibold text-gray-950"
                      title="Nursing Test Bank"
                    >
                      Nursing Test Bank
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Current Sub Page
                    </p>
                    <p
                      className="truncate text-sm font-semibold text-gray-950"
                      title={content.pageName || resolvedParams?.subPageId || ""}
                    >
                      {content.pageName || resolvedParams?.subPageId || "Sub Page"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AdminFieldGroup
                    label="Sub Page Name"
                    helper="Internal admin label and fallback page name."
                    required
                  >
                    <input
                      type="text"
                      value={content.pageName || ""}
                      onChange={(event) =>
                        setContent({ ...content, pageName: event.target.value })
                      }
                      placeholder="LPN Exams"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Display Title"
                    helper="Primary H1 shown on the live sub-page."
                  >
                    <input
                      type="text"
                      value={content.heading || ""}
                      onChange={(event) =>
                        updateContent("heading", event.target.value)
                      }
                      placeholder="LPN Nursing Test Bank"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Slug"
                    helper={`Live URL: /${slug || resolvedParams?.subPageId || "sub-page-slug"}`}
                    required
                  >
                    <AdminSlugField
                      origin="https://www.nursingmocks.com"
                      value={slug}
                      onChange={(value) => {
                        setSlug(value);
                        setContent({ ...content, slug: value });
                      }}
                      placeholder="lpn-exams"
                      required
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Status"
                    helper="Only published sub-pages should be presented to students."
                  >
                    <AdminSelectField
                      value={status}
                      onChange={(value) => {
                        const nextStatus = value as
                          | "Draft"
                          | "Published"
                          | "Archived";
                        setStatus(nextStatus);
                        setContent({ ...content, status: nextStatus });
                      }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </AdminSelectField>
                  </AdminFieldGroup>
                </div>

                <AdminFieldGroup
                  label="Description"
                  helper="Rich text summary for the public sub-page."
                >
                  <div className="min-w-0">
                    <RichTextEditor
                      value={content.description || ""}
                      onChange={(value) => updateContent("description", value)}
                      placeholder="Enter a description for this sub-page..."
                    />
                  </div>
                </AdminFieldGroup>
              </AdminFormSection>

              <AdminFormSection
                title="SEO, Meta And Schema"
                description="Control search snippets, social preview details, canonical URL, and JSON-LD."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <AdminFieldGroup
                    label="SEO Label"
                    helper="Readable label used by public components."
                  >
                    <input
                      type="text"
                      value={content.seoLabel || ""}
                      onChange={(event) =>
                        setContent({ ...content, seoLabel: event.target.value })
                      }
                      placeholder="LPN Exams"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="SEO Slug"
                    helper="SEO-friendly slug value stored with this page."
                  >
                    <input
                      type="text"
                      value={content.seoSlug || ""}
                      onChange={(event) =>
                        setContent({ ...content, seoSlug: event.target.value })
                      }
                      placeholder="lpn-exams"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>
                </div>

                <AdminFieldGroup
                  label="Meta Title"
                  helper="Recommended length is around 50 to 65 characters."
                >
                  <input
                    type="text"
                    value={content.meta.title}
                    onChange={(event) =>
                      updateContent("meta.title", event.target.value)
                    }
                    placeholder="LPN Nursing Test Bank | NursingMocks"
                    className={adminInputClass}
                  />
                </AdminFieldGroup>

                <AdminFieldGroup
                  label="Meta Description"
                  helper="Recommended length is around 140 to 160 characters."
                >
                  <textarea
                    value={content.meta.description}
                    onChange={(event) =>
                      updateContent("meta.description", event.target.value)
                    }
                    placeholder="Short search result description for this sub-page."
                    rows={4}
                    className={adminTextareaClass}
                  />
                </AdminFieldGroup>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AdminFieldGroup
                    label="Keywords"
                    helper="Optional internal field."
                  >
                    <input
                      type="text"
                      value={content.meta.keywords}
                      onChange={(event) =>
                        updateContent("meta.keywords", event.target.value)
                      }
                      placeholder="nursing test bank, lpn exams"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Canonical URL"
                    helper="Use the full canonical URL for this sub-page."
                  >
                    <input
                      type="text"
                      value={content.meta.canonicalUrl}
                      onChange={(event) =>
                        updateContent("meta.canonicalUrl", event.target.value)
                      }
                      placeholder="https://www.nursingmocks.com/lpn-exams"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="OG Title"
                    helper="Social sharing preview title."
                  >
                    <input
                      type="text"
                      value={content.meta.ogTitle}
                      onChange={(event) =>
                        updateContent("meta.ogTitle", event.target.value)
                      }
                      placeholder="LPN Nursing Test Bank"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="OG Description"
                    helper="Social sharing preview description."
                  >
                    <textarea
                      value={content.meta.ogDescription}
                      onChange={(event) =>
                        updateContent("meta.ogDescription", event.target.value)
                      }
                      placeholder="Short description for social sharing previews."
                      rows={3}
                      className={adminTextareaClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="OG Image"
                    helper="Relative path or absolute image URL."
                  >
                    <input
                      type="text"
                      value={content.meta.ogImage}
                      onChange={(event) =>
                        updateContent("meta.ogImage", event.target.value)
                      }
                      placeholder="/nursing-mocks-logo.png"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>
                </div>

                <AdminFieldGroup
                  label="Schema Markup"
                  helper="Paste valid JSON-LD. The frontend injects this into the page head."
                >
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleRegenerateSchema}
                      className="admin-button-secondary px-3 py-1.5 text-xs"
                    >
                      Regenerate Schema
                    </button>
                  </div>
                  <textarea
                    value={content.schema}
                    onChange={(event) =>
                      updateContent("schema", event.target.value)
                    }
                    placeholder='{"@context":"https://schema.org","@type":"CollectionPage"}'
                    rows={9}
                    className={`${adminTextareaClass} min-h-[160px] font-mono text-xs`}
                  />
                </AdminFieldGroup>
              </AdminFormSection>
            </section>

            <AdminFormSection
              title="Content And FAQs"
              description="Edit the full public body content and the FAQ block shown on the sub-page."
            >
              <ContentQualityWarnings bodyContent={content.bodyContent || ""} />
              <PublicContentPreview
                content={content.bodyContent || ""}
                publicPath={content.slug || content.seoSlug}
              />

              <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <TiptapEditor
                  content={content.bodyContent || ""}
                  onChange={(value) =>
                    setContent({ ...content, bodyContent: value })
                  }
                  placeholder="Start typing your content..."
                  editable={true}
                />
              </div>

              <div className="min-w-0">
                <FaqEditor
                  label="FAQs"
                  value={content.faqs}
                  onChange={(faqs) => setContent({ ...content, faqs })}
                />
              </div>
            </AdminFormSection>
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

