"use client";

import { useState, useEffect } from "react";
import {
  getAllPillarPages,
  deletePillarPageContent,
  getPillarPageContent,
} from "@/lib/firestore-operations";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PillarPage {
  id: string;
  title?: string;
  pageName?: string;
  lastUpdated?: string;
  version?: string;
  hero?: {
    title: string;
  };
}

export default function AdminPillarPagesPage() {
  const router = useRouter();
  const [pillarPages, setPillarPages] = useState<PillarPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    loadPillarPages();
  }, []);

  const loadPillarPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllPillarPages();

      if (result.success && result.data) {
        setPillarPages(result.data);
      } else {
        setError("Failed to load pillar pages");
      }
    } catch (err) {
      setError("Failed to load pillar pages");
      console.error("Error loading pillar pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const validatePageInfo = async (
    pageName: string,
    slug: string
  ): Promise<string | null> => {
    if (!pageName.trim()) {
      return "Page name is required";
    }

    if (!slug.trim()) {
      return "Slug URL is required";
    }

    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");

    // Check for duplicate page name
    const duplicateName = pillarPages.find(
      (page) => page.pageName?.toLowerCase() === pageName.toLowerCase()
    );
    if (duplicateName) {
      return `A pillar page with the name "${pageName}" already exists`;
    }

    // Check for duplicate slug
    const duplicateSlug = pillarPages.find(
      (page) => page.id === normalizedSlug
    );
    if (duplicateSlug) {
      return `A pillar page with the slug "${normalizedSlug}" already exists`;
    }

    // Also check if the slug exists in Firebase
    try {
      const result = await getPillarPageContent(normalizedSlug);
      if (result.success && result.data) {
        return `A pillar page with the slug "${normalizedSlug}" already exists`;
      }
    } catch {
      // If there's an error checking, we'll assume it doesn't exist
    }

    return null;
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setNewPageName("");
    setNewSlug("");
    setValidationError("");
  };

  const handleCreatePageInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const normalizedSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const error = await validatePageInfo(newPageName, normalizedSlug);

    if (error) {
      setValidationError(error);
      return;
    }

    // Navigate to create page with query params
    router.push(
      `/admin/pillarpages/create?pageName=${encodeURIComponent(
        newPageName
      )}&slug=${encodeURIComponent(normalizedSlug)}`
    );
  };

  const handleDeletePillarPage = async (pillarPageId: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the pillar page "${pillarPageId}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const result = await deletePillarPageContent(pillarPageId);

      if (result.success) {
        setSuccess("Pillar page deleted successfully!");
        loadPillarPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete pillar page");
      }
    } catch (err) {
      setError("Failed to delete pillar page");
      console.error("Error deleting pillar page:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pillar pages...</p>
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
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pillar Pages CMS
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your pillar pages (e.g., HESI A2)
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
                onClick={handleOpenCreateModal}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
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
                <span>Create Pillar Page</span>
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

        {/* Create Pillar Page Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Pillar Page
              </h2>
              <form onSubmit={handleCreatePageInfo} className="space-y-4">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{validationError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Name *
                  </label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., HESI A2, TEAS 7, NCLEX"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The display name for this pillar page
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug URL *
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      https://teasgurus.com/
                    </span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) =>
                        setNewSlug(
                          e.target.value.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="e.g., hesi-a2, teas-7"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    This will create a page at /{newSlug || "pillar-page-id"}
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPageName("");
                      setNewSlug("");
                      setValidationError("");
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

        {/* Pillar Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillarPages.map((pillarPage) => (
            <div
              key={pillarPage.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {pillarPage.pageName ||
                      pillarPage.hero?.title ||
                      pillarPage.title ||
                      pillarPage.id}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    ID: {pillarPage.id}
                  </p>
                  {pillarPage.lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Updated:{" "}
                      {new Date(pillarPage.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/pillarpages/${pillarPage.id}`}
                    className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeletePillarPage(pillarPage.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  href={`/${pillarPage.id}`}
                  target="_blank"
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  View Page →
                </Link>
                {pillarPage.version && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    v{pillarPage.version}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {pillarPages.length === 0 && !loading && (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pillar pages found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first pillar page.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold inline-block"
            >
              Create Your First Pillar Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
