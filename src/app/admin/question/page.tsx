"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllQuestions,
  getAllPillarPages,
  getAllPillarServicePages,
  getAllPages,
  deleteQuestionContent,
} from "@/lib/firestore-operations";

interface QuestionGroup {
  service: string;
  category: string;
  set: string;
  count: number;
  questions: any[];
}

function QuestionManagementContent() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [pillarPages, setPillarPages] = useState<any[]>([]);
  const [pillarCategories, setPillarCategories] = useState<Record<string, any[]>>({});
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [dropdownFilterPillarPage, setDropdownFilterPillarPage] = useState<string>("all");
  const [dropdownFilterCategory, setDropdownFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterService = searchParams.get("service");
  const filterCategory = searchParams.get("category");
  const filterSet = searchParams.get("set");
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const isFiltered = !!(filterService || filterCategory || filterSet);
  const QUESTIONS_PER_PAGE = 30;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [questionsResult, pillarPagesResult, allPagesResult] = await Promise.all([
        getAllQuestions(),
        getAllPillarPages(),
        getAllPages(),
      ]);

      if (questionsResult.success && questionsResult.data) {
        setQuestions(questionsResult.data);
      } else {
        setError(questionsResult.message);
      }

      if (pillarPagesResult.success && pillarPagesResult.data) {
        setPillarPages(pillarPagesResult.data);
        
        // Load categories for each pillar page
        const categoriesByPillar: Record<string, any[]> = {};
        const pillarPageCategoryIds = new Set<string>();
        
        for (const pillarPage of pillarPagesResult.data) {
          const result = await getAllPillarServicePages(pillarPage.id);
          if (result.success && result.data) {
            const categories = result.data.map((service: any) => ({
              id: service.servicePageId || service.id,
              servicePageId: service.servicePageId || service.id,
              ...service,
            }));
            categoriesByPillar[pillarPage.id] = categories;
            
            // Track which categories belong to pillar pages
            categories.forEach((cat: any) => {
              const categoryId = cat.servicePageId || cat.id;
              if (categoryId) {
                pillarPageCategoryIds.add(categoryId);
              }
            });
          }
        }
        
        setPillarCategories(categoriesByPillar);
        
        // Get all categories (pages) and filter out those that belong to pillar pages
        if (allPagesResult.success && allPagesResult.data) {
          const allPageIds = Object.keys(allPagesResult.data);
          setAllCategories(allPageIds);
        }
      }
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // Group questions by service, category, and set
  const groupedQuestions = useMemo(() => {
    const groupsMap = new Map<string, QuestionGroup>();

    questions.forEach((question) => {
      const service = question.service || "Unknown";
      const category = question.category || "Unknown";
      const set = question.set || "No Set";

      const key = `${service}|${category}|${set}`;

      if (groupsMap.has(key)) {
        const group = groupsMap.get(key)!;
        group.count += 1;
        group.questions.push(question);
      } else {
        groupsMap.set(key, {
          service,
          category,
          set,
          count: 1,
          questions: [question],
        });
      }
    });

    // Convert map to array and sort
    let groupsArray = Array.from(groupsMap.values());
    
    // Apply filters
    if (dropdownFilterPillarPage !== "all") {
      groupsArray = groupsArray.filter((group) => group.service === dropdownFilterPillarPage);
    }
    
    if (dropdownFilterCategory !== "all") {
      groupsArray = groupsArray.filter((group) => group.category === dropdownFilterCategory);
    }
    
    groupsArray.sort((a, b) => {
      // Sort by service, then category, then set
      if (a.service !== b.service) {
        return a.service.localeCompare(b.service);
      }
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.set.localeCompare(b.set);
    });

    return groupsArray;
  }, [questions, dropdownFilterPillarPage, dropdownFilterCategory]);
  
  // Get available categories based on selected pillar page
  const availableCategories = useMemo(() => {
    if (dropdownFilterPillarPage === "all") {
      // Return all unique categories from grouped questions
      const uniqueCategories = new Set<string>();
      questions.forEach((q) => {
        if (q.category) {
          uniqueCategories.add(q.category);
        }
      });
      return Array.from(uniqueCategories).sort();
    } else if (dropdownFilterPillarPage === "teas") {
      // For TEAS, return categories that don't belong to any pillar page
      const pillarPageCategoryIds = new Set<string>();
      Object.values(pillarCategories).forEach((categories) => {
        categories.forEach((cat: any) => {
          const categoryId = cat.servicePageId || cat.id;
          if (categoryId) {
            pillarPageCategoryIds.add(categoryId);
          }
        });
      });
      return allCategories.filter((cat) => !pillarPageCategoryIds.has(cat)).sort();
    } else {
      // Return categories for the selected pillar page
      const categories = pillarCategories[dropdownFilterPillarPage] || [];
      return categories.map((cat: any) => cat.servicePageId || cat.id).sort();
    }
  }, [dropdownFilterPillarPage, pillarCategories, allCategories, questions]);
  
  // Reset category filter when pillar page changes
  useEffect(() => {
    if (dropdownFilterPillarPage !== "all" && !availableCategories.includes(dropdownFilterCategory)) {
      setDropdownFilterCategory("all");
    }
  }, [dropdownFilterPillarPage, availableCategories, dropdownFilterCategory]);

  // Get filtered questions when viewing a specific group
  const filteredQuestions = useMemo(() => {
    if (!isFiltered) return [];
    
    let filtered = questions.filter((q) => {
      const matchesService = !filterService || q.service === filterService;
      const matchesCategory = !filterCategory || q.category === filterCategory;
      const matchesSet = !filterSet || q.set === filterSet;
      return matchesService && matchesCategory && matchesSet;
    });

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((q) => {
        const questionText = q.questionText?.replace(/<[^>]+>/g, "").toLowerCase() || "";
        return questionText.includes(query);
      });
    }

    return filtered;
  }, [questions, filterService, filterCategory, filterSet, isFiltered, searchQuery]);

  // Function to update page in URL
  const updatePage = (page: number) => {
    const params = new URLSearchParams();
    if (filterService) params.set("service", filterService);
    if (filterCategory) params.set("category", filterCategory);
    if (filterSet) params.set("set", filterSet);
    if (page > 1) params.set("page", page.toString());
    router.push(`/admin/question?${params.toString()}`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const validPage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;
  const startIndex = (validPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 if current page is beyond available pages or search changes
  useEffect(() => {
    if (isFiltered && currentPage > totalPages && totalPages > 0) {
      updatePage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredQuestions.length, currentPage, totalPages]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery && currentPage > 1) {
      updatePage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleDelete = async (serviceId: string, slug: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setDeleteLoading(`${serviceId}_${slug}`);
    try {
      const result = await deleteQuestionContent(serviceId, slug);
      if (result.success) {
        setQuestions(
          questions.filter((q) => !(q.service === serviceId && q.slug === slug))
        );
      } else {
        alert("Failed to delete question: " + result.message);
      }
    } catch {
      alert("Failed to delete question");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get pillar page name from service ID
  const getPillarPageName = (serviceId: string) => {
    const pillarPage = pillarPages.find((p) => p.id === serviceId);
    if (pillarPage?.pageName) {
      return pillarPage.pageName;
    }
    // Capitalize first letter and replace dashes with spaces
    return serviceId
      .charAt(0)
      .toUpperCase() + serviceId.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isFiltered ? "Question Details" : "Questions Management"}
            </h1>
            {isFiltered && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filtered by:</span>
                {filterService && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {getPillarPageName(filterService)}
                  </span>
                )}
                {filterCategory && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1).replace(/-/g, " ")}
                  </span>
                )}
                {filterSet && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    Set: {filterSet}
                  </span>
                )}
                <button
                  onClick={() => router.push("/admin/question")}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href={
                isFiltered
                  ? `/admin/question/create?service=${encodeURIComponent(filterService || "")}&category=${encodeURIComponent(filterCategory || "")}&set=${encodeURIComponent(filterSet || "")}`
                  : "/admin/question/create"
              }
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + Create New Question
            </Link>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {!isFiltered && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-wrap">
              <label className="text-sm font-semibold text-gray-700">
                Filter by Pillar Page:
              </label>
              <select
                value={dropdownFilterPillarPage}
                onChange={(e) => {
                  setDropdownFilterPillarPage(e.target.value);
                  setDropdownFilterCategory("all");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[200px]"
              >
                <option value="all">All Pillar Pages</option>
                <option value="teas">TEAS</option>
                {pillarPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.pageName || page.id}
                  </option>
                ))}
              </select>
              
              <label className="text-sm font-semibold text-gray-700">
                Filter by Category:
              </label>
              <select
                value={dropdownFilterCategory}
                onChange={(e) => setDropdownFilterCategory(e.target.value)}
                disabled={availableCategories.length === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {groupedQuestions.length} group{groupedQuestions.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
        {isFiltered && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by text..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} matching "{searchQuery}"
              </p>
            )}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading...
          </div>
        ) : isFiltered ? (
          // Show individual questions when filtered
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedQuestions.map((q, index) => {
                  const questionNumber = startIndex + index + 1;
                  const lastUpdated = q.lastUpdated || q.createdAt || "";
                  const formatDate = (dateString: string) => {
                    if (!dateString) return "-";
                    try {
                      const date = new Date(dateString);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      return dateString;
                    }
                  };

                  return (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {questionNumber}
                      </td>
                      <td
                        className="px-6 py-4 max-w-md text-black"
                        title={q.questionText?.replace(/<[^>]+>/g, "").slice(0, 200)}
                      >
                        <div className="line-clamp-2">
                          {q.questionText?.replace(/<[^>]+>/g, "").slice(0, 150) || "-"}
                          {q.questionText?.replace(/<[^>]+>/g, "").length > 150 && "..."}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={
                            q.publishStatus === "published"
                              ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                              : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"
                          }
                        >
                          {q.publishStatus === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lastUpdated)}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/question/${q.id}`}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/${q.category}/question/${q.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center"
                        >
                          View
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(q.service, q.slug)}
                          disabled={deleteLoading === q.id}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {deleteLoading === q.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {paginatedQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No questions found in this group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {filteredQuestions.length > QUESTIONS_PER_PAGE && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => updatePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => updatePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredQuestions.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredQuestions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => updatePage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => updatePage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-purple-50 border-purple-500 text-purple-600"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => updatePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show grouped questions
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pillar Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Set
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Questions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedQuestions.map((group, index) => (
                  <tr key={`${group.service}-${group.category}-${group.set}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {getPillarPageName(group.service)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {group.category.charAt(0).toUpperCase() + group.category.slice(1).replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">
                        {group.set}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {group.count} {group.count === 1 ? "Question" : "Questions"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/question/create?service=${encodeURIComponent(group.service)}&category=${encodeURIComponent(group.category)}&set=${encodeURIComponent(group.set)}`}
                          className="text-green-600 hover:text-green-800 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Question
                        </Link>
                        <Link
                          href={`/admin/question?service=${encodeURIComponent(group.service)}&category=${encodeURIComponent(group.category)}&set=${encodeURIComponent(group.set)}`}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          View Questions
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {groupedQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <QuestionManagementContent />
    </Suspense>
  );
}
