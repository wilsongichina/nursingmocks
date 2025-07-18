"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBlogs, getAllBlogCategories } from "@/lib/firestore-operations";
import Layout from "@/components/layout/Layout";
import FirebaseImage from "@/components/ui/FirebaseImage";

interface Blog {
  id: string;
  title: string;
  date: string;
  author: string;
  image: string;
  content: string;
  tableOfContents: string;
  category?: string;
  tags?: string[];
  lastUpdated?: string;
}

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getAllBlogCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    // Filter blogs based on search term and category
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || blog.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedCategory]);

  const loadBlogs = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAllBlogs();
      if (result.success && result.data) {
        setBlogs(result.data);
        setFilteredBlogs(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, "");
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Loading Blogs
                </h3>
                <p className="text-gray-600">
                  Gathering the latest insights...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-700/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                Latest Insights & Tips
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Our Blog
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Discover expert insights, proven strategies, and inspiring
                stories to help you excel in your TEAS exam journey
              </p>

              {/* Enhanced Search and Filter Bar */}
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-6 w-6 text-white/70 group-focus-within:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for insights, tips, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-white/70 text-lg transition-all duration-300"
                  />
                </div>

                {/* Enhanced Category Filter */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === ""
                        ? "bg-white text-purple-600 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category.name
                          ? "bg-white text-purple-600 shadow-lg"
                          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center shadow-lg">
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {filteredBlogs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 shadow-2xl text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm ? "No blogs found" : "No blogs yet"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms or browse all blogs."
                    : "Check back soon for our latest articles and insights."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Enhanced Results Count */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                    <svg
                      className="w-5 h-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700 font-semibold">
                      {filteredBlogs.length} blog
                      {filteredBlogs.length !== 1 ? "s" : ""} found
                      {searchTerm && ` for "${searchTerm}"`}
                    </span>
                  </div>
                </div>

                {/* Enhanced Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="group bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                    >
                      {blog.image && (
                        <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                          <FirebaseImage
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          {blog.category && (
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-purple-700 backdrop-blur-sm">
                                {blog.category}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {blog.author}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {formatDate(blog.date)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {truncateContent(blog.content)}
                        </p>

                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {blog.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {blog.tags.length > 3 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                  +{blog.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors">
                            <span className="text-sm font-semibold">
                              Read Article
                            </span>
                            <svg
                              className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
