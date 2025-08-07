"use client";

import { useState } from "react";
import { initializeDefaultServices } from "@/lib/firestore-operations";

export default function InitializeServicesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInitializeServices = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await initializeDefaultServices();
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to initialize services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Initialize Default Services
            </h1>
            <p className="text-gray-600 mt-1">
              Initialize HESI and TEAS services in Firebase
            </p>
          </div>
          <div className="p-8">
            {message && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Default Services to Initialize:
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                  <span className="text-gray-700">HESI</span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-700">TEAS</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleInitializeServices}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Initializing..." : "Initialize Services"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
