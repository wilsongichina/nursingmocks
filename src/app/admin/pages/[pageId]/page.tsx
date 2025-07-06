"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getServiceContent,
  uploadServiceContent,
} from "@/lib/firestore-operations";

export default function PageEditor() {
  const { pageId } = useParams();
  const router = useRouter();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!pageId) return;
    setLoading(true);
    getServiceContent(pageId as string).then((result) => {
      if (result.success && result.data) {
        setContent(result.data);
      } else {
        setMessage("Failed to load page content");
      }
      setLoading(false);
    });
  }, [pageId]);

  const handleChange = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const result = await uploadServiceContent(pageId as string, content);
    if (result.success) {
      setMessage("Page content saved!");
    } else {
      setMessage(result.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!content) {
    return (
      <div className="p-8 text-center text-red-600">
        {message || "No content found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Editing: /{pageId}</h1>
          <button
            onClick={() => router.push("/admin/pages")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        </div>
        {message && <div className="mb-4 text-blue-700">{message}</div>}

        {/* Hero Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Hero Section</h2>
          <input
            className="w-full mb-2 px-3 py-2 border rounded"
            value={content.hero.title}
            onChange={(e) => handleChange("hero", "title", e.target.value)}
            placeholder="Title"
          />
          <input
            className="w-full mb-2 px-3 py-2 border rounded"
            value={content.hero.badge}
            onChange={(e) => handleChange("hero", "badge", e.target.value)}
            placeholder="Badge"
          />
          <input
            className="w-full mb-2 px-3 py-2 border rounded"
            value={content.hero.subtitle}
            onChange={(e) => handleChange("hero", "subtitle", e.target.value)}
            placeholder="Subtitle"
          />
          <textarea
            className="w-full mb-2 px-3 py-2 border rounded"
            value={content.hero.description}
            onChange={(e) =>
              handleChange("hero", "description", e.target.value)
            }
            placeholder="Description"
          />
        </section>

        {/* Add more sections here as needed, e.g. trustIndicators, whatToExpect, etc. */}
        {/* For brevity, only Hero is shown. You can expand this pattern for all sections. */}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mt-4 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
