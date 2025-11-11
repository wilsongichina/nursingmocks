"use client";

import { useState, useEffect } from "react";
import {
  getAllSupportPages,
  uploadSupportPageContent,
  deleteSupportPageContent,
  getAllPages,
  testFirebaseConnection,
  getAllPillarPages,
  getAllPillarServicePages,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface SupportPage {
  id: string;
  serviceId: string;
  pageId: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  pillarPageId?: string;
  pillarPageName?: string;
  meta?: {
    title: string;
  };
}

export default function SupportPagesPage() {
  const [supportPages, setSupportPages] = useState<SupportPage[]>([]);
  const [availableServices, setAvailableServices] = useState<Array<{ id: string; title?: string; pillarPageId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPillarPage, setSelectedPillarPage] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [pillarPages, setPillarPages] = useState<Array<{ id: string; pageName?: string }>>([]);
  const [filterPillarPage, setFilterPillarPage] = useState("all");

  useEffect(() => {
    // Test Firebase connection first
    testFirebaseConnection().then((result) => {
      console.log("Firebase connection test result:", result);
      if (!result.success) {
        setError(`Firebase connection failed: ${result.message}`);
      }
    });

    loadSupportPages();
    loadPillarPages();
  }, []);

  const loadSupportPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllSupportPages();

      console.log("Support pages result:", result);

      if (result.success && result.data) {
        console.log("Support pages data structure:", result.data);
        const pagesList: SupportPage[] = [];

        // Load pillar pages to get names
        const pillarPagesResult = await getAllPillarPages();
        const pillarPagesMap = new Map<string, string>();
        if (pillarPagesResult.success && pillarPagesResult.data) {
          pillarPagesResult.data.forEach((page) => {
            pillarPagesMap.set(page.id, page.pageName || page.id);
          });
        }

        // Handle the nested structure: { serviceId: { pageId: pageData } }
        Object.keys(result.data).forEach((serviceId) => {
          const servicePages = result.data[serviceId];
          console.log(`Service ${serviceId} pages:`, servicePages);
          if (servicePages && typeof servicePages === "object") {
            Object.keys(servicePages).forEach((pageId) => {
              const pageData = servicePages[pageId];
              console.log(`Page ${pageId} data:`, pageData);
              
              // Check if serviceId contains a slash (pillar service)
              const isPillarService = serviceId.includes("/");
              const pillarPageId = isPillarService ? serviceId.split("/")[0] : undefined;
              const pillarPageName = pillarPageId ? pillarPagesMap.get(pillarPageId) : undefined;
              
              pagesList.push({
                id: `${serviceId}_${pageId}`,
                serviceId,
                pageId,
                pillarPageId,
                pillarPageName,
                ...pageData,
              });
            });
          }
        });

        console.log("Final pages list:", pagesList);
        setSupportPages(pagesList);

        // If no pages found, show a helpful message
        if (pagesList.length === 0) {
          console.log("No support pages found in the database");
        }
      } else {
        setError(result.message || "Failed to load support pages");
        console.error("Failed to load support pages:", result.message);
      }
    } catch (err) {
      setError("Failed to load support pages");
      console.error("Error loading support pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPillarPages = async () => {
    try {
      const result = await getAllPillarPages();
      if (result.success && result.data) {
        setPillarPages(result.data);
      }
    } catch (err) {
      console.error("Error loading pillar pages:", err);
    }
  };

  const loadAvailableServices = async (pillarPageId: string) => {
    try {
      const services: Array<{ id: string; title?: string; pillarPageId?: string }> = [];

      if (pillarPageId === "teas" || pillarPageId === "") {
        // Load regular services (TEAS)
        const result = await getAllPages();
        if (result.success && result.data) {
          Object.keys(result.data).forEach((id) => {
            services.push({
              id,
              title: result.data[id]?.hero?.title || id,
            });
          });
        }
      } else {
        // Load services from the selected pillar page
        const pillarServicesResult = await getAllPillarServicePages(pillarPageId);
        if (pillarServicesResult.success && pillarServicesResult.data) {
          pillarServicesResult.data.forEach((service: any) => {
            services.push({
              id: `${pillarPageId}/${service.servicePageId}`,
              title: service.hero?.title || service.servicePageId,
              pillarPageId,
            });
          });
        }
      }

      setAvailableServices(services);
    } catch (err) {
      console.error("Error loading available services:", err);
      setAvailableServices([]);
    }
  };

  const handleCreateSupportPage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPillarPage || !newServiceId.trim() || !newPageId.trim() || !newPageTitle.trim()) {
      setError("Please provide pillar page, service ID, page ID, and title");
      return;
    }

    // Validate page ID length (max 70 characters)
    if (newPageId.length > 70) {
      setError("Page ID must be 70 characters or less");
      return;
    }

    // Validate page ID format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(newPageId)) {
      setError("Page ID can only contain letters, numbers, and hyphens");
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Create a basic support page template matching pillar page structure
      const newSupportPage = {
        meta: {
          title: `${newPageTitle} - Complete Guide | TEAS Gurus`,
          description: `Learn everything about ${newPageTitle.toLowerCase()}. Get expert guidance, tips, and comprehensive information for your TEAS exam preparation.`,
          keywords: `${newPageTitle.toLowerCase()}, TEAS exam, nursing school, study guide, practice test`,
          ogTitle: `${newPageTitle} - Complete Guide`,
          ogDescription: `Learn everything about ${newPageTitle.toLowerCase()}. Get expert guidance and comprehensive information.`,
          ogImage: `/teas-gurus-logo.png`,
          canonicalUrl: `https://teasgurus.com/${newServiceId}/${newPageId}`,
        },
        schema: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${newPageTitle} - Complete Guide",
  "description": "Learn everything about ${newPageTitle.toLowerCase()}. Get expert guidance, tips, and comprehensive information for your TEAS exam preparation.",
  "image": "https://teasgurus.com/teas-gurus-logo.png",
  "author": {
    "@type": "Organization",
    "name": "TEAS Gurus"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TEAS Gurus",
    "logo": {
      "@type": "ImageObject",
      "url": "https://teasgurus.com/teas-gurus-logo.png"
    }
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://teasgurus.com/${newServiceId}/${newPageId}"
  }
}`,
        hero: {
          badge: `${newPageTitle} Guide`,
          title: newPageTitle,
          subtitle: `Complete Guide to ${newPageTitle}`,
          description: `Learn everything you need to know about ${newPageTitle.toLowerCase()}. This comprehensive guide provides expert insights, practical tips, and detailed information to help you succeed in your TEAS exam preparation.`,
        },
        content: `<h2>Introduction to ${newPageTitle}</h2>
<p>Welcome to our comprehensive guide on ${newPageTitle.toLowerCase()}. This page provides detailed information, expert tips, and practical advice to help you understand and master this important topic.</p>

<h2>Key Points About ${newPageTitle}</h2>
<ul>
<li>Important aspect 1</li>
<li>Important aspect 2</li>
<li>Important aspect 3</li>
</ul>

<h2>How to Prepare for ${newPageTitle}</h2>
<p>Effective preparation for ${newPageTitle.toLowerCase()} involves understanding the core concepts, practicing regularly, and using the right study materials. Here are some key strategies:</p>

<h3>Study Strategies</h3>
<p>Develop a systematic approach to studying ${newPageTitle.toLowerCase()}. Focus on understanding the fundamentals before moving to more complex topics.</p>

<h2>Conclusion</h2>
<p>Mastering ${newPageTitle.toLowerCase()} is essential for TEAS exam success. With proper preparation and the right resources, you can achieve your goals and excel in your nursing school journey.</p>`,
      };

      const result = await uploadSupportPageContent(
        newServiceId,
        newPageId,
        newSupportPage
      );

      if (result.success) {
        setSuccess("Support page created successfully!");
        setSelectedPillarPage("");
        setNewServiceId("");
        setNewPageId("");
        setNewPageTitle("");
        setAvailableServices([]);
        setIsCreating(false);
        loadSupportPages(); // Reload the pages list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to create support page");
      }
    } catch (err) {
      setError("Failed to create support page");
      console.error("Error creating support page:", err);
    }
  };

  const handleDeleteSupportPage = async (serviceId: string, pageId: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the support page "${serviceId}/${pageId}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const result = await deleteSupportPageContent(serviceId, pageId);

      if (result.success) {
        setSuccess("Support page deleted successfully!");
        loadSupportPages(); // Reload the pages list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete support page");
      }
    } catch (err) {
      setError("Failed to delete support page");
      console.error("Error deleting support page:", err);
    }
  };

  // Filter support pages based on selected pillar page
  const filteredSupportPages = 
    filterPillarPage === "all"
      ? supportPages
      : filterPillarPage === "teas"
      ? supportPages.filter((page) => !page.pillarPageId)
      : supportPages.filter((page) => page.pillarPageId === filterPillarPage);

  // Load services when pillar page selection changes
  useEffect(() => {
    if (selectedPillarPage) {
      loadAvailableServices(selectedPillarPage);
    } else {
      setAvailableServices([]);
      setNewServiceId("");
    }
  }, [selectedPillarPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Support Pages CMS
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your support pages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
                <span>Create Support Page</span>
              </button>
            </div>
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

        {/* Create Support Page Modal */}
        {isCreating && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Support Page
              </h2>
              <form onSubmit={handleCreateSupportPage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pillar Page
                  </label>
                  <select
                    value={selectedPillarPage}
                    onChange={(e) => {
                      setSelectedPillarPage(e.target.value);
                      setNewServiceId("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select a pillar page...</option>
                    <option value="teas">TEAS</option>
                    {pillarPages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.pageName || page.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the pillar page this support page belongs to
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service ID
                  </label>
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!selectedPillarPage}
                  >
                    <option value="">Select a service...</option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.id.includes("/") ? service.id.split("/")[1] : service.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPillarPage 
                      ? `Select the service from ${selectedPillarPage === "teas" ? "TEAS" : pillarPages.find(p => p.id === selectedPillarPage)?.pageName || selectedPillarPage}`
                      : "Please select a pillar page first"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page ID (URL slug)
                  </label>
                  <input
                    type="text"
                    value={newPageId}
                    onChange={(e) => setNewPageId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., study-guide, practice-tips"
                    maxLength={70}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max 70 characters, letters, numbers, and hyphens only. URL:
                    /{newServiceId}/{newPageId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Complete Study Guide"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in the page title and content
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Create Support Page
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedPillarPage("");
                      setNewServiceId("");
                      setNewPageId("");
                      setNewPageTitle("");
                      setAvailableServices([]);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">
              Filter by Pillar Page:
            </label>
            <select
              value={filterPillarPage}
              onChange={(e) => setFilterPillarPage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[200px]"
            >
              <option value="all">All Support Pages</option>
              <option value="teas">TEAS</option>
              {pillarPages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.pageName || page.id}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredSupportPages.length} page(s)
          </div>
        </div>

        {/* Support Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupportPages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {page.meta?.title ||
                      page.title ||
                      `${page.serviceId}/${page.pageId}`}
                  </h3>
                  {page.pillarPageId && (
                    <p className="text-sm text-orange-600 font-medium mb-1">
                      Pillar: {page.pillarPageName || page.pillarPageId}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    Service: {page.serviceId}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Page: {page.pageId}
                  </p>
                  {page.lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(page.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/supportpages/${page.serviceId.split("/").join("/")}/${page.pageId}`}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() =>
                      handleDeleteSupportPage(page.serviceId, page.pageId)
                    }
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  href={`/${page.serviceId}/${page.pageId}`}
                  target="_blank"
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  View Page →
                </Link>
                {page.version && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    v{page.version}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSupportPages.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No support pages found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first support page.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Create Your First Support Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
