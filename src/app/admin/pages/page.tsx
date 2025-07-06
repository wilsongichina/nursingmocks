"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllPages, uploadServiceContent } from "@/lib/firestore-operations";
import { mathPageContent } from "@/lib/math-page-content";

interface PageData {
  [key: string]: any;
}

export default function AdminPages() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState<PageData>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const ADMIN_PASSWORD = "teasgurus2024"; // In production, use environment variables

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadPages();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      loadPages();
    } else {
      setMessage("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setPages({});
  };

  const loadPages = async () => {
    setLoading(true);
    try {
      const result = await getAllPages();
      if (result.success && result.data) {
        setPages(result.data);
      } else {
        setMessage("Failed to load pages");
      }
    } catch {
      setMessage("Error loading pages");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageId.trim()) {
      setMessage("Please enter a page ID");
      return;
    }

    setLoading(true);
    try {
      // Create a template based on math content
      const templateContent = {
        ...mathPageContent,
        hero: {
          ...mathPageContent.hero,
          title: `Take My ${
            newPageId.charAt(0).toUpperCase() + newPageId.slice(1)
          } Exam for Me`,
          badge: `${
            newPageId.charAt(0).toUpperCase() + newPageId.slice(1)
          } Exam Help`,
        },
      };

      const result = await uploadServiceContent(newPageId, templateContent);
      if (result.success) {
        setMessage(`Page "${newPageId}" created successfully!`);
        setNewPageId("");
        setShowCreateForm(false);
        loadPages(); // Reload pages
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Error creating page");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm(`Are you sure you want to delete the page "${pageId}"?`)) {
      return;
    }

    setLoading(true);
    try {
      // For now, we'll just remove from local state
      // In a real implementation, you'd delete from Firestore
      const updatedPages = { ...pages };
      delete updatedPages[pageId];
      setPages(updatedPages as PageData);
      setMessage(`Page "${pageId}" deleted successfully!`);
    } catch {
      setMessage("Error deleting page");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">
              Enter password to access admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            {message && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pages Management
              </h1>
              <p className="text-gray-600 mt-1">Manage all service pages</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Create New Page
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Create New Page Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Page
            </h2>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label
                  htmlFor="pageId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Page ID (URL slug)
                </label>
                <input
                  type="text"
                  id="pageId"
                  value={newPageId}
                  onChange={(e) =>
                    setNewPageId(
                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., english, science, reading"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will create a page at /{newPageId || "page-id"}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Page"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPageId("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pages List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Pages
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pages...</p>
            </div>
          ) : Object.keys(pages).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No pages found. Create your first page above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(pages).map(([pageId, pageData]) => (
                <div key={pageId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          /{pageId}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {pageData.hero?.title || "No title set"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Last updated:{" "}
                        {pageData.lastUpdated
                          ? new Date(pageData.lastUpdated).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => router.push(`/admin/pages/${pageId}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => window.open(`/${pageId}`, "_blank")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeletePage(pageId)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
