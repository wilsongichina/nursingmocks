"use client";

import { useState, useEffect } from "react";
import { uploadPillarPageContent, getAllPillarPages, getPillarPageContent } from "@/lib/firestore-operations";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  features: string[];
  callToAction: string;
}

interface PillarPageContent {
  pageName?: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  servicesHeading: string;
  servicesSubHeading: string;
  services: ServiceCard[];
  schema?: string;
}

export default function CreatePillarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pillarPageId, setPillarPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [content, setContent] = useState<PillarPageContent>({
    pageName: "",
    meta: {
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "/nursing-mocks-logo.png",
      canonicalUrl: "",
    },
    hero: {
      badge: "We are Teas Gurus",
      title: "",
      subtitle: "",
    },
    servicesHeading: "",
    servicesSubHeading: "",
    services: [],
    schema: "",
  });

  // Load page name and slug from URL params
  useEffect(() => {
    const pageNameParam = searchParams.get("pageName");
    const slugParam = searchParams.get("slug");
    
    if (pageNameParam) {
      setPageName(decodeURIComponent(pageNameParam));
    }
    if (slugParam) {
      setPillarPageId(decodeURIComponent(slugParam));
    }
  }, [searchParams]);

  const handleHeroChange = (field: keyof PillarPageContent["hero"], value: string) => {
    setContent({
      ...content,
      hero: {
        ...content.hero,
        [field]: value,
      },
    });
  };

  const handleMetaChange = (field: keyof PillarPageContent["meta"], value: string) => {
    setContent({
      ...content,
      meta: {
        ...content.meta,
        [field]: value,
      },
    });
  };

  const handleSchemaChange = (value: string) => {
    setContent({
      ...content,
      schema: value,
    });
  };

  const handleServicesHeadingChange = (value: string) => {
    setContent({
      ...content,
      servicesHeading: value,
    });
  };

  const handleSubHeadingChange = (value: string) => {
    setContent({
      ...content,
      servicesSubHeading: value,
    });
  };

  const handleAddCard = () => {
    const newCard: ServiceCard = {
      icon: "📋",
      title: "New Service",
      description: "Service description",
      features: ["Feature 1"],
      callToAction: "Get started today!",
    };
    setContent({
      ...content,
      services: [...content.services, newCard],
    });
  };

  const handleRemoveCard = (index: number) => {
    const newServices = content.services.filter((_, i) => i !== index);
    setContent({
      ...content,
      services: newServices,
    });
  };

  const handleCardChange = (
    index: number,
    field: keyof ServiceCard,
    value: string | string[]
  ) => {
    const newServices = [...content.services];
    newServices[index] = {
      ...newServices[index],
      [field]: value,
    };
    setContent({
      ...content,
      services: newServices,
    });
  };

  const handleAddFeature = (cardIndex: number) => {
    const newServices = [...content.services];
    newServices[cardIndex] = {
      ...newServices[cardIndex],
      features: [...newServices[cardIndex].features, "New feature"],
    };
    setContent({
      ...content,
      services: newServices,
    });
  };

  const handleRemoveFeature = (cardIndex: number, featureIndex: number) => {
    const newServices = [...content.services];
    newServices[cardIndex] = {
      ...newServices[cardIndex],
      features: newServices[cardIndex].features.filter(
        (_, i) => i !== featureIndex
      ),
    };
    setContent({
      ...content,
      services: newServices,
    });
  };

  const handleFeatureChange = (
    cardIndex: number,
    featureIndex: number,
    value: string
  ) => {
    const newServices = [...content.services];
    const newFeatures = [...newServices[cardIndex].features];
    newFeatures[featureIndex] = value;
    newServices[cardIndex] = {
      ...newServices[cardIndex],
      features: newFeatures,
    };
    setContent({
      ...content,
      services: newServices,
    });
  };

  const validateBeforeSave = async (): Promise<string | null> => {
    if (!pillarPageId.trim()) {
      return "Please provide a pillar page ID (URL slug)";
    }

    if (!pageName.trim()) {
      return "Please provide a page name";
    }

    // Check for duplicate page name
    const allPagesResult = await getAllPillarPages();
    if (allPagesResult.success && allPagesResult.data) {
      const duplicateName = allPagesResult.data.find(
        (page: any) => page.pageName?.toLowerCase() === pageName.toLowerCase() && page.id !== pillarPageId
      );
      if (duplicateName) {
        return `A pillar page with the name "${pageName}" already exists`;
      }

      // Check for duplicate slug
      const duplicateSlug = allPagesResult.data.find((page: any) => page.id === pillarPageId);
      if (duplicateSlug) {
        return `A pillar page with the slug "${pillarPageId}" already exists`;
      }
    }

    // Also check if the slug exists in Firebase
    try {
      const result = await getPillarPageContent(pillarPageId);
      if (result.success && result.data) {
        return `A pillar page with the slug "${pillarPageId}" already exists`;
      }
    } catch {
      // If there's an error checking, we'll assume it doesn't exist
    }

    if (!content.hero.title.trim()) {
      return "Please provide a hero title";
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const validationError = await validateBeforeSave();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Update canonical URL if not set and include pageName
      const finalContent = {
        ...content,
        pageName: pageName || content.pageName || "",
        meta: {
          ...content.meta,
          canonicalUrl:
            content.meta.canonicalUrl ||
            `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${pillarPageId}`,
        },
      };

      const result = await uploadPillarPageContent(pillarPageId, finalContent);

      if (result.success) {
        setSuccess("Pillar page created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin/pillarpages");
        }, 1500);
      } else {
        setError(result.message || "Failed to create pillar page");
      }
    } catch (err) {
      setError("Failed to create pillar page");
      console.error("Error creating pillar page:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/admin/pillarpages"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Pillar Page
                </h1>
                <p className="text-sm text-gray-600">
                  Fill in all the content for your new pillar page
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Pillar Page"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Page Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Name *
                </label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  disabled={!!searchParams.get("pageName")}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 ${
                    searchParams.get("pageName") ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="e.g., HESI A2, TEAS 7, NCLEX"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The display name for this pillar page (e.g., "HESI A2", "NCLEX")
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug URL *
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">https://teasgurus.com/</span>
                  <input
                    type="text"
                    value={pillarPageId}
                    onChange={(e) =>
                      setPillarPageId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    disabled={!!searchParams.get("slug")}
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 ${
                      searchParams.get("slug") ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="e.g., hesi-a2, teas-7"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This will create a page at /{pillarPageId || "pillar-page-id"}. The slug cannot be changed after creation.
                </p>
              </div>
            </div>
          </div>

          {/* Meta Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <details className="cursor-pointer" open>
              <summary className="text-2xl font-bold text-gray-900 mb-6 list-none">
                <div className="flex items-center justify-between">
                  <span>SEO & Meta Information</span>
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </summary>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={content.meta.title}
                    onChange={(e) => handleMetaChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="e.g., HESI A2 Services - TeasGurus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={content.meta.description}
                    onChange={(e) => handleMetaChange("description", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Meta description for search engines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={content.meta.keywords}
                    onChange={(e) => handleMetaChange("keywords", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Comma-separated keywords"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={content.meta.ogTitle}
                    onChange={(e) => handleMetaChange("ogTitle", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Open Graph title for social sharing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={content.meta.ogDescription}
                    onChange={(e) => handleMetaChange("ogDescription", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Open Graph description for social sharing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    OG Image
                  </label>
                  <input
                    type="text"
                    value={content.meta.ogImage}
                    onChange={(e) => handleMetaChange("ogImage", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="/nursing-mocks-logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={content.meta.canonicalUrl}
                    onChange={(e) => handleMetaChange("canonicalUrl", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder={`${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${pillarPageId || "pillar-page-id"}`}
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Schema Markup Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Schema Markup</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JSON-LD Schema
              </label>
              <textarea
                value={content.schema || ""}
                onChange={(e) => handleSchemaChange(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 font-mono text-sm"
                placeholder="Paste your JSON-LD schema here (e.g., {&quot;@context&quot;: &quot;https://schema.org&quot;, ...})"
              />
              <p className="text-sm text-gray-500 mt-2">
                Paste your complete schema markup script here. This will be added to the page as JSON-LD structured data for search engines.
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) => handleHeroChange("badge", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="e.g., We are Teas Gurus"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => handleHeroChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="e.g., HESI A2 Services"
                  required
                />
              </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <RichTextEditor
                value={content.hero.subtitle}
                onChange={(value) => handleHeroChange("subtitle", value)}
                placeholder="e.g., Comprehensive HESI A2 exam services designed to help you succeed."
              />
            </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Services Section
              </h2>
              <button
                type="button"
                onClick={handleAddCard}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add Card</span>
              </button>
            </div>

            {/* Services Heading and Sub-heading */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services Heading
                </label>
                <input
                  type="text"
                  value={content.servicesHeading}
                  onChange={(e) => handleServicesHeadingChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="e.g., Our Comprehensive NCLEX Services"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services Sub-heading / Description
                </label>
                <RichTextEditor
                  value={content.servicesSubHeading}
                  onChange={handleSubHeadingChange}
                  placeholder="e.g., Choose the service that best fits your learning style and timeline. All services include our proven strategies and expert support."
                />
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-6">
              {content.services.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(cardIndex)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Card
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Icon */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon (Emoji or Unicode)
                      </label>
                      <input
                        type="text"
                        value={card.icon}
                        onChange={(e) =>
                          handleCardChange(cardIndex, "icon", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder="e.g., ➗, 🔬, 📘"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          handleCardChange(cardIndex, "title", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder="e.g., HESI A2 Math Questions"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <RichTextEditor
                        value={card.description}
                        onChange={(value) =>
                          handleCardChange(cardIndex, "description", value)
                        }
                        placeholder="Service description"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Features
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(cardIndex)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Add Feature
                        </button>
                      </div>
                      <div className="space-y-4">
                        {card.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-medium text-gray-600">
                                Feature {featureIndex + 1}
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFeature(cardIndex, featureIndex)
                                }
                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                              >
                                Remove Feature
                              </button>
                            </div>
                            <RichTextEditor
                              value={feature}
                              onChange={(value) =>
                                handleFeatureChange(
                                  cardIndex,
                                  featureIndex,
                                  value
                                )
                              }
                              placeholder="Feature description"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Call to Action
                      </label>
                      <RichTextEditor
                        value={card.callToAction}
                        onChange={(value) =>
                          handleCardChange(cardIndex, "callToAction", value)
                        }
                        placeholder="e.g., 👉 We give you HESI A2 Math Questions or take the test for you."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {content.services.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="mb-4">No cards yet.</p>
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Add Your First Card
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pb-8">
            <Link
              href="/admin/pillarpages"
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Pillar Page"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

