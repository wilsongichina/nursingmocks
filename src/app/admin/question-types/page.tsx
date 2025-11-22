"use client";

import { useState, useEffect } from "react";
import {
  getAllQuestionTypes,
  seedQuestionTypes,
  deleteQuestionType,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface QuestionType {
  id: string;
  questionTypeId: string;
  questionId: number;
  contentDescription: string;
  questionTypeName: string;
  lastUpdated?: string;
}

export default function QuestionTypesPage() {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadQuestionTypes();
  }, []);

  const loadQuestionTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAllQuestionTypes();
      if (result.success && result.data) {
        setQuestionTypes(result.data);
      } else {
        setError(result.message || "Failed to load question types");
      }
    } catch (err) {
      setError("Failed to load question types");
      console.error("Error loading question types:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedQuestionTypes = async () => {
    if (
      !confirm(
        "This will create/update all question types. Do you want to continue?"
      )
    ) {
      return;
    }

    try {
      setSeeding(true);
      setError("");
      setSuccess("");
      const result = await seedQuestionTypes();
      if (result.success) {
        setSuccess("Question types seeded successfully!");
        loadQuestionTypes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to seed question types");
      }
    } catch (err) {
      setError("Failed to seed question types");
      console.error("Error seeding question types:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteQuestionType = async (questionTypeId: string) => {
    if (
      !confirm(
        `Are you sure you want to delete question type "${questionTypeId}"?`
      )
    ) {
      return;
    }

    try {
      const result = await deleteQuestionType(questionTypeId);
      if (result.success) {
        setSuccess("Question type deleted successfully!");
        loadQuestionTypes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete question type");
      }
    } catch (err) {
      setError("Failed to delete question type");
      console.error("Error deleting question type:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Question Types
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage question types for quizzes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </Link>
              <button
                onClick={handleSeedQuestionTypes}
                disabled={seeding}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {seeding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Seeding...</span>
                  </>
                ) : (
                  <>
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Seed Question Types</span>
                  </>
                )}
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

        {/* Question Types Table */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Question Types
          </h2>

          {questionTypes.length === 0 ? (
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
                No question types found
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Seed Question Types" to add all question types.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question Type ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question Type Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questionTypes.map((questionType) => (
                    <tr key={questionType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {questionType.questionTypeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {questionType.questionId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {questionType.questionTypeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {questionType.contentDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() =>
                            handleDeleteQuestionType(questionType.questionTypeId)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

