"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllQuestions,
  deleteQuestionContent,
} from "@/lib/firestore-operations";

export default function QuestionManagementPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllQuestions();
      if (result.success && result.data) {
        setQuestions(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/admin/question/create"
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
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td
                      className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-black"
                      title={q.questionText
                        ?.replace(/<[^>]+>/g, "")
                        .slice(0, 100)}
                    >
                      {q.questionText?.replace(/<[^>]+>/g, "").slice(0, 100) ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {q.category ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {q.category}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {q.service ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {q.service}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          q.publishStatus === "published"
                            ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                            : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"
                        }
                      >
                        {q.publishStatus === "published"
                          ? "Published"
                          : "Draft"}
                      </span>
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
                ))}
                {questions.length === 0 && (
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
