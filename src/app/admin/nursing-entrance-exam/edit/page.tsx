"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPillarPageContent,
  uploadPillarPageContent,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { AdminLoadingState, AdminNotificationRegion, AdminTopBar } from "@/components/admin/AdminUi";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl, getImageUrl } from "@/lib/config";
import { buildPublicPageSchemaMarkup } from "@/lib/seo/structured-data";

interface ServiceContent {
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
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  trustIndicators: Array<{
    title: string;
    icon: string;
  }>;
  whatToExpect: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      icon: string;
      content: string[];
    }>;
    footer: string;
  };
  mostCommonQuestions: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      content: string[];
    }>;
  };
  studyGuide: {
    badge: string;
    title: string;
    subtitle: string;
    sections: Array<{
      title: string;
      icon: string;
      content: string;
    }>;
  };
  privacyPricing: Array<{
    title: string;
    icon: string;
    content: string;
  }>;
  faq: {
    title: string;
    subtitle: string;
    questions: Array<{
      question: string;
      paragraphs: string[];
      additionalParagraphs?: string[];
    }>;
  };
}

function buildNursingEntranceMainSchema(content: ServiceContent) {
  const pageName =
    content.hero.title ||
    content.meta.title?.replace(/\s*\|\s*NursingMocks\s*$/i, "") ||
    "Nursing Entrance Exam";
  const description =
    content.hero.description ||
    content.meta.description ||
    "Prepare for nursing entrance exams with NursingMocks practice resources.";

  return buildPublicPageSchemaMarkup({
    slug: "nursing-entrance-exam",
    pageName,
    categoryName: "Nursing Entrance Exams",
    description,
    pageType: "CollectionPage",
    breadcrumbs: [{ name: "Nursing Entrance Exams", slug: "nursing-entrance-exam" }],
    faqs: content.faq.questions.map((item) => ({
      question: item.question,
      answer: [
        ...(item.paragraphs || []),
        ...(item.additionalParagraphs || []),
      ]
        .filter(Boolean)
        .join(" "),
    })),
  });
}

function EditNursingEntranceExamPageContent() {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPillarPageContent("nursing-entrance-exam");

      if (result.success && result.data) {
        const pageData = result.data as any;
        
        // Ensure all required fields exist with defaults
        const initializedContent: ServiceContent = {
          meta: {
            title: pageData.meta?.title || "Nursing Entrance Exam | NursingMocks",
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: pageData.meta?.canonicalUrl || `${getSiteUrl()}/nursing-entrance-exam`,
          },
          schema: pageData.schema || "",
          hero: {
            badge: pageData.hero?.badge || "",
            title: pageData.hero?.title || "",
            subtitle: pageData.hero?.subtitle || "",
            description: pageData.hero?.description || "",
          },
          trustIndicators: pageData.trustIndicators || [],
          whatToExpect: {
            badge: pageData.whatToExpect?.badge || "",
            title: pageData.whatToExpect?.title || "",
            subtitle: pageData.whatToExpect?.subtitle || "",
            cards: pageData.whatToExpect?.cards || [],
            footer: pageData.whatToExpect?.footer || "",
          },
          mostCommonQuestions: {
            badge: pageData.mostCommonQuestions?.badge || "",
            title: pageData.mostCommonQuestions?.title || "",
            subtitle: pageData.mostCommonQuestions?.subtitle || "",
            cards: pageData.mostCommonQuestions?.cards || [],
          },
          studyGuide: {
            badge: pageData.studyGuide?.badge || "",
            title: pageData.studyGuide?.title || "",
            subtitle: pageData.studyGuide?.subtitle || "",
            sections: pageData.studyGuide?.sections || [],
          },
          privacyPricing: pageData.privacyPricing || [],
          faq: {
            title: pageData.faq?.title || "",
            subtitle: pageData.faq?.subtitle || "",
            questions: pageData.faq?.questions || [],
          },
        };
        
        setContent({
          ...initializedContent,
          schema: pageData.schema || buildNursingEntranceMainSchema(initializedContent),
        });
      } else {
        // Initialize with default content structure
        const defaultContent: ServiceContent = {
          meta: {
            title: "Nursing Entrance Exam | NursingMocks",
            description: "Comprehensive guide to nursing entrance exams",
            keywords: "nursing entrance exam, nursing school, exam preparation",
            ogTitle: "Nursing Entrance Exam | NursingMocks",
            ogDescription: "Comprehensive guide to nursing entrance exams",
            ogImage: getImageUrl("/nursing-mocks-logo.png"),
            canonicalUrl: `${getSiteUrl()}/nursing-entrance-exam`,
          },
          schema: "",
          hero: {
            badge: "",
            title: "Nursing Entrance Exam",
            subtitle: "",
            description: "",
          },
          trustIndicators: [],
          whatToExpect: {
            badge: "",
            title: "",
            subtitle: "",
            cards: [],
            footer: "",
          },
          mostCommonQuestions: {
            badge: "",
            title: "",
            subtitle: "",
            cards: [],
          },
          studyGuide: {
            badge: "",
            title: "",
            subtitle: "",
            sections: [],
          },
          privacyPricing: [],
          faq: {
            title: "",
            subtitle: "",
            questions: [],
          },
        };
        setContent({
          ...defaultContent,
          schema: buildNursingEntranceMainSchema(defaultContent),
        });
      }
    } catch (err) {
      setError("Failed to load content");
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const generatedSchema = useMemo(
    () => (content ? buildNursingEntranceMainSchema(content) : ""),
    [content]
  );

  useEffect(() => {
    if (!content || !generatedSchema || content.schema === generatedSchema) {
      return;
    }

    setContent((current) =>
      current && current.schema !== generatedSchema
        ? { ...current, schema: generatedSchema }
        : current
    );
  }, [content, generatedSchema]);

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const contentToSave = {
        ...content,
        schema: generatedSchema || buildNursingEntranceMainSchema(content),
      };

      const result = await uploadPillarPageContent(
        "nursing-entrance-exam",
        contentToSave
      );

      if (result.success) {
        setContent(contentToSave);
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

  const updateArrayContent = (path: string, index: number, value: any) => {
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
      if (!current || !Array.isArray(current[lastKey])) {
        return prev;
      }

      current[lastKey][index] = value;
      return newContent;
    });
  };

  const addArrayItem = (path: string, newItem: any) => {
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
      if (!current || !Array.isArray(current[lastKey])) {
        return prev;
      }

      current[lastKey].push(newItem);
      return newContent;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
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
      if (!current || !Array.isArray(current[lastKey])) {
        return prev;
      }

      current[lastKey].splice(index, 1);
      return newContent;
    });
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
              { label: "Main Page Settings" },
            ]}
            actions={<span>{currentUser?.email || "Admin"}</span>}
          />
          <main className="admin-workspace">
            <div className="admin-content flex min-h-[calc(100vh-8rem)] items-center justify-center">
              <AdminLoadingState
                title="Loading Nursing Entrance Exam Settings"
                description="Preparing page settings, metadata, schema, hero content, sections, and FAQs."
              />
            </div>
          </main>
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
            { label: "Main Page Settings" },
          ]}
          actions={<span>{currentUser?.email || "Admin"}</span>}
        />

        <main className="admin-workspace">
        <div className="admin-content">
          <header className="admin-header">
            <div className="admin-header-row">
              <div className="admin-header-copy">
                <h1 className="admin-page-title">Edit Nursing Entrance Exam</h1>
                <p className="admin-body max-w-[720px]">
                  Update the public Nursing Entrance Exam page content, SEO metadata,
                  schema markup, page sections, and FAQ content.
                </p>
              </div>
              <div className="admin-header-actions">
                <Link href="/admin/nursing-entrance-exam" className="admin-button-secondary">
                  Back to Admin
                </Link>
                <Link
                  href="/nursing-entrance-exam"
                  target="_blank"
                  className="admin-button-secondary"
                >
                  View Page
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="admin-button-primary"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </header>

        <AdminNotificationRegion
          error={error}
          success={success}
          errorTitle="Unable To Save Page Content"
          successTitle="Page Content Saved"
        />

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Page Settings */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">Page Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="admin-field-label mb-2 block">
                  Page ID
                </label>
                <input
                  type="text"
                  value="nursing-entrance-exam"
                  disabled
                  className="admin-field cursor-not-allowed opacity-70"
                />
                <p className="admin-helper mt-1">
                  Page identifier (read-only)
                </p>
              </div>
            </div>
          </div>

          {/* Meta Data */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">Meta Data</h2>
            <div className="space-y-4">
              <div>
                <label className="admin-field-label mb-2 block">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={content.meta.title}
                  onChange={(e) => updateContent("meta.title", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Meta Description
                </label>
                <textarea
                  value={content.meta.description}
                  onChange={(e) => updateContent("meta.description", e.target.value)}
                  rows={3}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Keywords
                </label>
                <input
                  type="text"
                  value={content.meta.keywords}
                  onChange={(e) => updateContent("meta.keywords", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  OG Title
                </label>
                <input
                  type="text"
                  value={content.meta.ogTitle}
                  onChange={(e) => updateContent("meta.ogTitle", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  OG Description
                </label>
                <textarea
                  value={content.meta.ogDescription}
                  onChange={(e) => updateContent("meta.ogDescription", e.target.value)}
                  rows={3}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  OG Image
                </label>
                <input
                  type="text"
                  value={content.meta.ogImage}
                  onChange={(e) => updateContent("meta.ogImage", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={content.meta.canonicalUrl}
                  onChange={(e) => updateContent("meta.canonicalUrl", e.target.value)}
                  className="admin-field"
                />
              </div>
            </div>
          </div>

          {/* Schema Markup */}
          <div className="admin-card p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="admin-section-title">Schema Markup</h2>
                <p className="admin-helper mt-1 max-w-3xl">
                  This JSON-LD is generated from the current Main Page Settings and references the public Nursing Entrance Exam page.
                </p>
              </div>
              <span className="admin-status-badge admin-status-badge-purple">
                Auto Generated
              </span>
            </div>
            <div>
              <label className="admin-field-label mb-2 block">
                Generated JSON-LD Schema
              </label>
              <textarea
                value={generatedSchema}
                readOnly
                rows={12}
                className="admin-field font-mono text-sm"
              />
              <p className="admin-helper mt-2">
                Updates automatically from the page title, description, canonical Nursing Entrance Exam route, breadcrumbs, and FAQs.
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="admin-field-label mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => updateContent("hero.title", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Description
                </label>
                <RichTextEditor
                  value={content.hero.description}
                  onChange={(value) => updateContent("hero.description", value)}
                />
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="admin-card p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="admin-section-title">Trust Indicators</h2>
              <button
                onClick={() =>
                  addArrayItem("trustIndicators", { title: "", icon: "" })
                }
                className="admin-button-secondary"
              >
                <span>Add Indicator</span>
              </button>
            </div>
            <div className="space-y-4">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="admin-info-tile p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="admin-card-title">
                      Indicator {index + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("trustIndicators", index)}
                      className="admin-button-danger"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Title
                      </label>
                      <input
                        type="text"
                        value={indicator.title}
                        onChange={(e) =>
                          updateArrayContent("trustIndicators", index, {
                            ...indicator,
                            title: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={indicator.icon}
                        onChange={(e) =>
                          updateArrayContent("trustIndicators", index, {
                            ...indicator,
                            icon: e.target.value,
                          })
                        }
                        className="admin-field"
                        placeholder="e.g., check, shield, star"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to Expect Section */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">What to Expect</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="admin-field-label mb-2 block">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.whatToExpect.badge}
                  onChange={(e) =>
                    updateContent("whatToExpect.badge", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={content.whatToExpect.title}
                  onChange={(e) =>
                    updateContent("whatToExpect.title", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.whatToExpect.subtitle}
                  onChange={(value) =>
                    updateContent("whatToExpect.subtitle", value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="admin-card-title">Cards</h3>
              <button
                onClick={() =>
                  addArrayItem("whatToExpect.cards", {
                    title: "",
                    icon: "",
                    content: [""],
                  })
                }
                className="admin-button-secondary"
              >
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.whatToExpect.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="admin-info-tile p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="admin-card-title">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("whatToExpect.cards", cardIndex)
                      }
                      className="admin-button-danger"
                    >
                      Remove Card
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            title: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={card.icon}
                        onChange={(e) =>
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            icon: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Content
                      </label>
                      {card.content.map((contentItem, contentIndex) => (
                        <div key={contentIndex} className="mb-4">
                          <RichTextEditor
                            value={contentItem}
                            onChange={(value) => {
                              const newContent = [...card.content];
                              newContent[contentIndex] = value;
                              updateArrayContent("whatToExpect.cards", cardIndex, {
                                ...card,
                                content: newContent,
                              });
                            }}
                          />
                          <button
                            onClick={() => {
                              const newContent = card.content.filter(
                                (_, i) => i !== contentIndex
                              );
                              updateArrayContent("whatToExpect.cards", cardIndex, {
                                ...card,
                                content: newContent,
                              });
                            }}
                            className="admin-button-danger mt-2"
                          >
                            Remove Content
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newContent = [...card.content, ""];
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            content: newContent,
                          });
                        }}
                        className="admin-button-secondary"
                      >
                        Add Content Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label className="admin-field-label mb-2 block">
                Footer
              </label>
              <RichTextEditor
                value={content.whatToExpect.footer}
                onChange={(value) =>
                  updateContent("whatToExpect.footer", value)
                }
              />
            </div>
          </div>

          {/* Most Common Questions */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">
              Most Common Questions
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="admin-field-label mb-2 block">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.mostCommonQuestions.badge}
                  onChange={(e) =>
                    updateContent("mostCommonQuestions.badge", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={content.mostCommonQuestions.title}
                  onChange={(e) =>
                    updateContent("mostCommonQuestions.title", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.mostCommonQuestions.subtitle}
                  onChange={(value) =>
                    updateContent("mostCommonQuestions.subtitle", value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="admin-card-title">Cards</h3>
              <button
                onClick={() =>
                  addArrayItem("mostCommonQuestions.cards", {
                    title: "",
                    content: [""],
                  })
                }
                className="admin-button-secondary"
              >
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.mostCommonQuestions.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="admin-info-tile p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="admin-card-title">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("mostCommonQuestions.cards", cardIndex)
                      }
                      className="admin-button-danger"
                    >
                      Remove Card
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          updateArrayContent(
                            "mostCommonQuestions.cards",
                            cardIndex,
                            {
                              ...card,
                              title: e.target.value,
                            }
                          )
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Content
                      </label>
                      {card.content.map((contentItem, contentIndex) => (
                        <div key={contentIndex} className="mb-4">
                          <RichTextEditor
                            value={contentItem}
                            onChange={(value) => {
                              const newContent = [...card.content];
                              newContent[contentIndex] = value;
                              updateArrayContent(
                                "mostCommonQuestions.cards",
                                cardIndex,
                                {
                                  ...card,
                                  content: newContent,
                                }
                              );
                            }}
                          />
                          <button
                            onClick={() => {
                              const newContent = card.content.filter(
                                (_, i) => i !== contentIndex
                              );
                              updateArrayContent(
                                "mostCommonQuestions.cards",
                                cardIndex,
                                {
                                  ...card,
                                  content: newContent,
                                }
                              );
                            }}
                            className="admin-button-danger mt-2"
                          >
                            Remove Content
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newContent = [...card.content, ""];
                          updateArrayContent(
                            "mostCommonQuestions.cards",
                            cardIndex,
                            {
                              ...card,
                              content: newContent,
                            }
                          );
                        }}
                        className="admin-button-secondary"
                      >
                        Add Content Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Guide */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">Study Guide</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="admin-field-label mb-2 block">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.studyGuide.badge}
                  onChange={(e) =>
                    updateContent("studyGuide.badge", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={content.studyGuide.title}
                  onChange={(e) =>
                    updateContent("studyGuide.title", e.target.value)
                  }
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.studyGuide.subtitle}
                  onChange={(value) =>
                    updateContent("studyGuide.subtitle", value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="admin-card-title">Sections</h3>
              <button
                onClick={() =>
                  addArrayItem("studyGuide.sections", {
                    title: "",
                    icon: "",
                    content: "",
                  })
                }
                className="admin-button-secondary"
              >
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.privacyPricing.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="admin-info-tile p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="admin-card-title">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("privacyPricing", cardIndex)
                      }
                      className="admin-button-danger"
                    >
                      Remove Card
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
                            title: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={card.icon}
                        onChange={(e) =>
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
                            icon: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Content
                      </label>
                      <RichTextEditor
                        value={card.content}
                        onChange={(value) =>
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
                            content: value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="admin-card p-5">
            <h2 className="admin-section-title mb-5">FAQ Section</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="admin-field-label mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={content.faq.title}
                  onChange={(e) => updateContent("faq.title", e.target.value)}
                  className="admin-field"
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.faq.subtitle}
                  onChange={(value) => updateContent("faq.subtitle", value)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="admin-card-title">Questions</h3>
              <button
                onClick={() =>
                  addArrayItem("faq.questions", {
                    question: "",
                    paragraphs: [""],
                    additionalParagraphs: [],
                  })
                }
                className="admin-button-secondary"
              >
                <span>Add Question</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.faq.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="admin-info-tile p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="admin-card-title">
                      Question {questionIndex + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("faq.questions", questionIndex)}
                      className="admin-button-danger"
                    >
                      Remove Question
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) =>
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            question: e.target.value,
                          })
                        }
                        className="admin-field"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label mb-2 block">
                        Paragraphs
                      </label>
                      {question.paragraphs.map((paragraph, paraIndex) => (
                        <div key={paraIndex} className="mb-4">
                          <RichTextEditor
                            value={paragraph}
                            onChange={(value) => {
                              const newParagraphs = [...question.paragraphs];
                              newParagraphs[paraIndex] = value;
                              updateArrayContent("faq.questions", questionIndex, {
                                ...question,
                                paragraphs: newParagraphs,
                              });
                            }}
                          />
                          <button
                            onClick={() => {
                              const newParagraphs = question.paragraphs.filter(
                                (_, i) => i !== paraIndex
                              );
                              updateArrayContent("faq.questions", questionIndex, {
                                ...question,
                                paragraphs: newParagraphs,
                              });
                            }}
                            className="admin-button-danger mt-2"
                          >
                            Remove Paragraph
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newParagraphs = [...question.paragraphs, ""];
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            paragraphs: newParagraphs,
                          });
                        }}
                        className="admin-button-secondary"
                      >
                        Add Paragraph
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default function EditNursingEntranceExamPage() {
  return (
    <SidebarProvider>
      <EditNursingEntranceExamPageContent />
    </SidebarProvider>
  );
}
