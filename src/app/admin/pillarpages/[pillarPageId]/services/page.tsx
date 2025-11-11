"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getAllPillarServicePages,
  uploadPillarServicePageContent,
  deletePillarServicePageContent,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface ServicePage {
  id: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  hero?: {
    title: string;
  };
}

export default function PillarServicePagesPage() {
  const params = useParams();
  const pillarPageId = params.pillarPageId as string;
  const [servicePages, setServicePages] = useState<ServicePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newServicePageId, setNewServicePageId] = useState("");
  const [newServicePageTitle, setNewServicePageTitle] = useState("");

  useEffect(() => {
    if (pillarPageId) {
      loadServicePages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillarPageId]);

  const loadServicePages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllPillarServicePages(pillarPageId);

      if (result.success && result.data) {
        setServicePages(result.data);
      } else {
        setError("Failed to load service pages");
      }
    } catch (err) {
      setError("Failed to load service pages");
      console.error("Error loading service pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServicePage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServicePageId.trim() || !newServicePageTitle.trim()) {
      setError("Please provide both service page ID and title");
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Create a basic service page template
      const newServicePage = {
        meta: {
          title: `${newServicePageTitle} - ${pillarPageId.toUpperCase()} | TeasGurus`,
          description: `Get expert help with ${newServicePageTitle} for ${pillarPageId.toUpperCase()}. Practice tests, study guides, and comprehensive preparation.`,
          keywords: `${pillarPageId} ${newServicePageTitle}, ${pillarPageId} ${newServicePageTitle} questions, ${pillarPageId} ${newServicePageTitle} practice test`,
          ogTitle: `${newServicePageTitle} - ${pillarPageId.toUpperCase()}`,
          ogDescription: `Get expert help with ${newServicePageTitle} for ${pillarPageId.toUpperCase()}.`,
          ogImage: `/teas-gurus-logo.png`,
          canonicalUrl: `https://teasgurus.com/${pillarPageId}/${newServicePageId}`,
        },
        hero: {
          badge: `${newServicePageTitle} Practice`,
          title: `${pillarPageId.toUpperCase()} ${newServicePageTitle} Questions`,
          subtitle: `Practice the Most Common ${pillarPageId.toUpperCase()} ${newServicePageTitle} Questions for Exam Success`,
          description: `Struggling with the ${newServicePageTitle.toLowerCase()} portion of the ${pillarPageId.toUpperCase()} exam? Our ${pillarPageId.toUpperCase()} ${newServicePageTitle.toLowerCase()} practice tests are designed to give you focused, exam-like practice that boosts confidence and performance.`,
        },
      };

      const result = await uploadPillarServicePageContent(
        pillarPageId,
        newServicePageId,
        newServicePage
      );

      if (result.success) {
        setSuccess("Service page created successfully!");
        setNewServicePageId("");
        setNewServicePageTitle("");
        setIsCreating(false);
        loadServicePages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to create service page");
      }
    } catch (err) {
      setError("Failed to create service page");
      console.error("Error creating service page:", err);
    }
  };

  const handleDeleteServicePage = async (servicePageId: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the service page "${servicePageId}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const result = await deletePillarServicePageContent(
        pillarPageId,
        servicePageId
      );

      if (result.success) {
        setSuccess("Service page deleted successfully!");
        loadServicePages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete service page");
      }
    } catch (err) {
      setError("Failed to delete service page");
      console.error("Error deleting service page:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service pages...</p>
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Support Pages - {pillarPageId}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage support pages under {pillarPageId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/pillarpages"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Pillar Pages
              </Link>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Create Service Page Modal */}
        {isCreating && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Support Page
              </h2>
              <form onSubmit={handleCreateServicePage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Page ID (URL slug)
                  </label>
                  <input
                    type="text"
                    value={newServicePageId}
                    onChange={(e) =>
                      setNewServicePageId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., math, reading, science"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL: /{pillarPageId}/{newServicePageId || "support-page-id"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Page Title
                  </label>
                  <input
                    type="text"
                    value={newServicePageTitle}
                    onChange={(e) => setNewServicePageTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Math, Reading, Science"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Create Support Page
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewServicePageId("");
                      setNewServicePageTitle("");
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

        {/* Service Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicePages.map((servicePage) => (
            <div
              key={servicePage.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {servicePage.hero?.title || servicePage.title || servicePage.id}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">ID: {servicePage.id}</p>
                  {servicePage.lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Updated:{" "}
                      {new Date(servicePage.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/pillarpages/${pillarPageId}/services/${servicePage.id}`}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteServicePage(servicePage.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  href={`/${pillarPageId}/${servicePage.id}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Page →
                </Link>
                {servicePage.version && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    v{servicePage.version}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {servicePages.length === 0 && !loading && (
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Your First Support Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

