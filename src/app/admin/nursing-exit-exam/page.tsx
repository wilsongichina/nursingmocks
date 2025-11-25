"use client";

import { useState, useEffect } from "react";
import {
  getNursingExitExamSubPages,
  deleteNursingExitExamSubPage,
  uploadNursingExitExamSubPage,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface SubPage {
  id: string;
  subPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  hero?: {
    title: string;
  };
}

export default function NursingExitExamAdminPage() {
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubPageId, setNewSubPageId] = useState("");
  const [newSubPageName, setNewSubPageName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subPageToDelete, setSubPageToDelete] = useState<SubPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSubPages();
  }, []);

  const loadSubPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getNursingExitExamSubPages();

      if (result.success && result.data) {
        setSubPages(result.data);
      } else {
        setError("Failed to load sub-pages");
      }
    } catch (err) {
      setError("Failed to load sub-pages");
      console.error("Error loading sub-pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (subPage: SubPage) => {
    setSubPageToDelete(subPage);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subPageToDelete) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingExitExamSubPage(subPageToDelete.id);

      if (result.success) {
        setSuccess("Sub-page deleted successfully!");
        setShowDeleteModal(false);
        setSubPageToDelete(null);
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete sub-page");
      }
    } catch (err) {
      setError("Failed to delete sub-page");
      console.error("Error deleting sub-page:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSubPageToDelete(null);
  };

  const handleCreateSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newSubPageId.trim() || !newSubPageName.trim()) {
      setValidationError("Sub-page ID and Name are required.");
      return;
    }

    const normalizedSubPageId = newSubPageId.toLowerCase().replace(/\s+/g, "-");

    // Check for duplicates
    const existingSubPage = subPages.find(
      (page) => page.id === normalizedSubPageId
    );
    if (existingSubPage) {
      setValidationError(`A sub-page with ID "${normalizedSubPageId}" already exists.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const defaultSubPageContent = {
        pageName: newSubPageName,
        slug: normalizedSubPageId,
        meta: {
          title: `${newSubPageName} | Nursing Exit Exam`,
          description: `Content for ${newSubPageName} under Nursing Exit Exam.`,
          keywords: `${newSubPageName}, nursing exit exam`,
          ogTitle: `${newSubPageName} | Nursing Exit Exam`,
          ogDescription: `Content for ${newSubPageName} under Nursing Exit Exam.`,
          ogImage: "/teas-gurus-logo.png",
          canonicalUrl: `https://teasgurus.com/${normalizedSubPageId}`,
        },
        hero: {
          badge: "Nursing Exit Exam",
          title: newSubPageName,
          subtitle: `Detailed information about ${newSubPageName}.`,
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
        schema: "",
      };

      const result = await uploadNursingExitExamSubPage(
        normalizedSubPageId,
        defaultSubPageContent
      );

      if (result.success) {
        setSuccess(`Sub-page "${newSubPageName}" created successfully!`);
        setShowCreateModal(false);
        setNewSubPageId("");
        setNewSubPageName("");
        setValidationError("");
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create sub-page.");
      }
    } catch (err) {
      setValidationError("Failed to create sub-page.");
      console.error("Error creating sub-page:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sub-pages...</p>
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
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nursing Exit Exam CMS
                </h1>
                <p className="text-sm text-gray-600">
                  Manage the main page and sub-pages
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

        {/* Main Page Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nursing Exit Exam Main Page
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Edit the main Nursing Exit Exam page content
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/nursing-exit-exam/edit"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                Edit Main Page
              </Link>
              <Link
                href="/nursing-exit-exam"
                target="_blank"
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                View Page →
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-Pages Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sub-Pages</h2>
            <button
              onClick={() => setShowCreateModal(true)}
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
              <span>Create Sub-page</span>
            </button>
          </div>

          {subPages.length === 0 ? (
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sub-pages found
              </h3>
              <p className="text-gray-600">
                Create a sub-page to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subPages.map((subPage) => (
                <div
                  key={subPage.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {subPage.pageName ||
                          subPage.hero?.title ||
                          subPage.title ||
                          subPage.id}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        ID: {subPage.id}
                      </p>
                      {subPage.lastUpdated && (
                        <p className="text-sm text-gray-500">
                          Updated:{" "}
                          {new Date(subPage.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/nursing-exit-exam/${subPage.id}/manage`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center space-x-2"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Manage</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(subPage)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/${subPage.slug || subPage.id}`}
                      target="_blank"
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                    >
                      View Page →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && subPageToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Delete Sub-page
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete the sub-page{" "}
              <span className="font-semibold text-gray-900">
                "{subPageToDelete.pageName ||
                  subPageToDelete.hero?.title ||
                  subPageToDelete.title ||
                  subPageToDelete.id}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Sub-page
            </h2>
            <form onSubmit={handleCreateSubPage} className="space-y-4">
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-page Name *
                </label>
                <input
                  type="text"
                  value={newSubPageName}
                  onChange={(e) => setNewSubPageName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Math Review, Reading Strategies"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The display name for this sub-page.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug URL *
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    https://teasgurus.com/nursing-exit-exam/
                  </span>
                  <input
                    type="text"
                    value={newSubPageId}
                    onChange={(e) =>
                      setNewSubPageId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., math-review, reading-strategies"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  This will create a page at /{newSubPageId || "sub-page-id"}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Sub-page"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSubPageId("");
                    setNewSubPageName("");
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
    </div>
  );
}

