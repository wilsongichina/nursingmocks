"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingTestBankTopic,
  getNursingTestBankSubPage,
  getNursingTestBankNestedSubPage,
  uploadNursingTestBankTopic,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
import TiptapEditor from "@/components/editor/TiptapEditor";
import FaqEditor, { type FaqItem } from "@/components/admin/FaqEditor";
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
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";

const adminInputClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const adminTextareaClass = `${adminInputClass} min-h-[96px] resize-y`;

interface TopicPageContent {
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

function sanitizeTopicContent(content: TopicPageContent): TopicPageContent {
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

function buildTopicSchema({
  topicName,
  heading,
  description,
  slug,
  parentName,
  nestedName,
}: {
  topicName: string;
  heading: string;
  description: string;
  slug: string;
  parentName: string;
  nestedName: string;
}) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com";
  const cleanSlug = slug.replace(/^\/+/, "");
  const pageUrl = `${siteUrl}/${cleanSlug}`;
  const title = heading || topicName;
  const cleanDescription =
    stripHtml(description) ||
    `Practice nursing test bank questions for ${title}.`;

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
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
              name: parentName,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: nestedName,
            },
            {
              "@type": "ListItem",
              position: 5,
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

function EditTopicContent({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
  }>;
}) {
  const [content, setContent] = useState<TopicPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState("");
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    "Draft"
  );
  const { isCollapsed } = useSidebar();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
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

      const [parentResult, nestedResult] = await Promise.all([
        getNursingTestBankSubPage(resolvedParams.subPageId),
        getNursingTestBankNestedSubPage(
          resolvedParams.subPageId,
          resolvedParams.nestedSubPageId
        ),
      ]);

      let loadedParentName = resolvedParams.subPageId;
      let loadedNestedName = resolvedParams.nestedSubPageId;

      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        loadedParentName = parentData.pageName || resolvedParams.subPageId;
      }
      setParentSubPageName(loadedParentName);

      if (nestedResult.success && nestedResult.data) {
        const nestedData = nestedResult.data as any;
        loadedNestedName =
          nestedData.pageName || resolvedParams.nestedSubPageId;
      }
      setNestedSubPageName(loadedNestedName);

      const result = await getNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Use slug directly (no prefix)
        const fullSlug = pageData.slug || resolvedParams.topicId;
        const loadedStatus = pageData.status || "Draft";
        const loadedPageName = pageData.pageName || resolvedParams.topicId;
        const loadedHeading =
          pageData.heading ||
          pageData.hero?.title ||
          pageData.pageName ||
          resolvedParams.topicId;
        const loadedDescription =
          pageData.description || pageData.hero?.description || "";
        const generatedSchema = buildTopicSchema({
          topicName: loadedPageName,
          heading: loadedHeading,
          description: loadedDescription,
          slug: fullSlug,
          parentName: loadedParentName,
          nestedName: loadedNestedName,
        });
        setSlug(fullSlug);
        setStatus(loadedStatus);

        // Ensure all required fields exist with defaults
        const initializedContent: TopicPageContent = {
          pageName: loadedPageName,
          slug: pageData.slug || resolvedParams.topicId,
          status: pageData.status || "Draft",
          heading: loadedHeading,
          description: loadedDescription,
          seoLabel:
            pageData.seoLabel || pageData.pageName || resolvedParams.topicId,
          seoSlug: pageData.seoSlug || pageData.slug || resolvedParams.topicId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.topicId} | NursingMocks`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/nursing-mocks-logo.png",
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com"
              }/${fullSlug}`,
          },
          schema:
            typeof pageData.schema === "string" && pageData.schema.trim()
              ? pageData.schema
              : generatedSchema,
          hero: {
            title:
              pageData.hero?.title ||
              pageData.heading ||
              pageData.pageName ||
              resolvedParams.topicId,
            description:
              pageData.hero?.description || pageData.description || "",
          },
          bodyContent: pageData.bodyContent || "",
          faqs: Array.isArray(pageData.faqs) ? pageData.faqs : [],
        };

        setContent(sanitizeTopicContent(initializedContent));
      } else {
        // Initialize with default content structure
        const defaultSlug = resolvedParams.topicId;
        const generatedSchema = buildTopicSchema({
          topicName: resolvedParams.topicId,
          heading: resolvedParams.topicId,
          description: `Content for ${resolvedParams.topicId}`,
          slug: defaultSlug,
          parentName: loadedParentName,
          nestedName: loadedNestedName,
        });
        const defaultContent: TopicPageContent = {
          pageName: resolvedParams.topicId,
          slug: resolvedParams.topicId,
          status: "Draft",
          heading: "",
          description: "",
          seoLabel: resolvedParams.topicId,
          seoSlug: resolvedParams.topicId,
          meta: {
            title: `${resolvedParams.topicId} | NursingMocks`,
            description: `Content for ${resolvedParams.topicId}`,
            keywords: `${resolvedParams.topicId}, ${resolvedParams.nestedSubPageId}, ${resolvedParams.subPageId}, nursing test bank`,
            ogTitle: `${resolvedParams.topicId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.topicId}`,
            ogImage: "/nursing-mocks-logo.png",
            canonicalUrl: `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com"
            }/${defaultSlug}`,
          },
          schema: generatedSchema,
          hero: {
            title: "",
            description: "",
          },
          bodyContent: "",
          faqs: [],
        };
        setContent(sanitizeTopicContent(defaultContent));
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

      const contentToSave: TopicPageContent = sanitizeTopicContent({
        pageName: content.pageName,
        slug: slug.trim() || resolvedParams.topicId,
        status,
        heading: content.heading || "",
        description: content.description || "",
        seoLabel: content.seoLabel || content.pageName || "",
        seoSlug: content.seoSlug || slug.trim() || resolvedParams.topicId,
        meta: content.meta,
        schema: content.schema,
        hero: content.hero,
        bodyContent: content.bodyContent || "",
        faqs: Array.isArray(content.faqs) ? content.faqs : [],
      });

      const result = await uploadNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
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

  const handleRegenerateSchema = () => {
    if (!content || !resolvedParams) return;

    updateContent(
      "schema",
      buildTopicSchema({
        topicName: content.pageName || resolvedParams.topicId,
        heading: content.heading || content.pageName || resolvedParams.topicId,
        description: content.description || content.meta.description,
        slug: slug || content.slug || resolvedParams.topicId,
        parentName: parentSubPageName || resolvedParams.subPageId,
        nestedName: nestedSubPageName || resolvedParams.nestedSubPageId,
      })
    );
  };

  const handleCleanLegacyBranding = () => {
    if (!content) return;

    const cleaned = sanitizeTopicContent(content);
    setSlug(replaceLegacyBrandText(slug));
    setContent(cleaned);
    setSuccess("Legacy branding cleaned from the current topic fields.");
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
              label: parentSubPageName || resolvedParams?.subPageId || "Sub Page",
              href: resolvedParams
                ? `/admin/nursing-test-bank/${resolvedParams.subPageId}/manage`
                : undefined,
            },
            {
              label:
                nestedSubPageName ||
                resolvedParams?.nestedSubPageId ||
                "Nested Sub Page",
              href: "/admin/nursing-test-bank?tab=topics",
            },
            {
              label:
                content.pageName ||
                resolvedParams?.topicId ||
                "Edit Topic",
            },
          ]}
        />
        <main className="admin-content min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-none space-y-6">
            <AdminNotificationRegion
              error={error}
              success={success}
              errorTitle="Unable To Save Topic"
              successTitle="Topic Saved"
            />
            <AdminPageHeader
              eyebrow="Nursing Test Bank"
              title="Edit Topic"
              description="Update the topic details, SEO, schema, FAQ content, and public body content."
              actions={
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <AdminStatusBadge
                    label={saving ? "Saving" : "Ready"}
                    tone={saving ? "amber" : "green"}
                  />
                  <Link
                    href="/admin/nursing-test-bank?tab=topics"
                    className="admin-button-secondary whitespace-nowrap"
                  >
                    Back to Admin
                  </Link>
                  {resolvedParams?.topicId && (
                    <Link
                      href={`/${slug || resolvedParams.topicId}`}
                      target="_blank"
                      className="admin-button-secondary whitespace-nowrap"
                    >
                      View Page
                    </Link>
                  )}
                  <Link
                    href={`/admin/nursing-test-bank/${resolvedParams?.subPageId}/nested/${resolvedParams?.nestedSubPageId}/topics/${resolvedParams?.topicId}/manage`}
                    className="admin-button-secondary whitespace-nowrap"
                  >
                    Manage Quiz Metadata
                  </Link>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="admin-button-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Topic"}
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
                title="Topic Settings"
                description="Set the topic label, public URL, visibility, and live-page summary."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="min-w-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Pillar Page
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-950" title="Nursing Test Bank">
                      Nursing Test Bank
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Sub Page
                    </p>
                    <p
                      className="truncate text-sm font-semibold text-gray-950"
                      title={parentSubPageName || resolvedParams?.subPageId || ""}
                    >
                      {parentSubPageName || resolvedParams?.subPageId || "Sub Page"}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Nested Sub Page
                    </p>
                    <p
                      className="truncate text-sm font-semibold text-gray-950"
                      title={nestedSubPageName || resolvedParams?.nestedSubPageId || ""}
                    >
                      {nestedSubPageName ||
                        resolvedParams?.nestedSubPageId ||
                        "Nested Sub Page"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AdminFieldGroup
                    label="Topic Name"
                    helper="Internal admin label and fallback page name."
                    required
                  >
                    <input
                      type="text"
                      value={content.pageName || ""}
                      onChange={(event) =>
                        setContent({ ...content, pageName: event.target.value })
                      }
                      placeholder="ATI LPN Nursing Test Bank"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Display Title"
                    helper="Primary H1 shown on the live topic page."
                  >
                    <input
                      type="text"
                      value={content.heading || ""}
                      onChange={(event) =>
                        updateContent("heading", event.target.value)
                      }
                      placeholder="ATI LPN Nursing Test Bank"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Slug"
                    helper={`Live URL: /${slug || resolvedParams?.topicId || "topic-slug"}`}
                    required
                  >
                    <AdminSlugField
                      origin="https://www.nursingmocks.com"
                      value={slug}
                      onChange={(value) => {
                        setSlug(value);
                        setContent({ ...content, slug: value });
                      }}
                      placeholder="ati-lpn-nursing-test-bank"
                      required
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Status"
                    helper="Only published topics should be presented to students."
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
                  helper="Rich text summary for the public topic page."
                >
                  <div className="min-w-0">
                    <RichTextEditor
                      value={content.description || ""}
                      onChange={(value) => updateContent("description", value)}
                      placeholder="Enter a description for this topic..."
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
                      placeholder="ATI LPN Nursing Test Bank"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="SEO Slug"
                    helper="SEO-friendly slug value stored with this topic."
                  >
                    <input
                      type="text"
                      value={content.seoSlug || ""}
                      onChange={(event) =>
                        setContent({ ...content, seoSlug: event.target.value })
                      }
                      placeholder="ati-lpn-nursing-test-bank"
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
                    placeholder="ATI LPN Nursing Test Bank | NursingMocks"
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
                    placeholder="Short search result description for this topic."
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
                      placeholder="nursing test bank, ati lpn"
                      className={adminInputClass}
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Canonical URL"
                    helper="Use the full canonical URL for this topic."
                  >
                    <input
                      type="text"
                      value={content.meta.canonicalUrl}
                      onChange={(event) =>
                        updateContent("meta.canonicalUrl", event.target.value)
                      }
                      placeholder="https://www.nursingmocks.com/ati-lpn-nursing-test-bank"
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
                      placeholder="ATI LPN Nursing Test Bank"
                      className={adminInputClass}
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
                    placeholder='{"@context":"https://schema.org","@type":"WebPage"}'
                    rows={9}
                    className={`${adminTextareaClass} min-h-[160px] font-mono text-xs`}
                  />
                </AdminFieldGroup>
              </AdminFormSection>
            </section>

            <AdminFormSection
              title="Content And FAQs"
              description="Edit the full public body content and the FAQ block shown on the topic page."
            >
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

export default function EditTopic({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
  }>;
}) {
  return (
    <SidebarProvider>
      <EditTopicContent params={params} />
    </SidebarProvider>
  );
}
