"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  uploadQuestionContent,
  getAllServices,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F"];

interface QuestionFormData {
  questionText: string;
  answerChoices: string[];
  correctAnswer: string;
  explanation: string;
  category: string; // This is the serviceId
  tags: string[];
  image: string;
  slug: string;
  meta: {
    title: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  schema?: string;
  publishStatus: string;
}

export default function CreateQuestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: "",
    answerChoices: ["", ""],
    correctAnswer: "A",
    explanation: "",
    category: "",
    tags: [],
    image: "",
    slug: "",
    meta: {
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
    schema: "",
    publishStatus: "draft",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      slug: prev.questionText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      meta: {
        ...prev.meta,
        title: prev.meta.title || prev.questionText,
      },
    }));
  }, [formData.questionText]);

  const loadCategories = async () => {
    try {
      const result = await getAllServices();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch {
      // ignore
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAnswerChange = (idx: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.answerChoices];
      updated[idx] = value;
      return { ...prev, answerChoices: updated };
    });
  };

  const handleAddAnswer = () => {
    if (formData.answerChoices.length < 6) {
      setFormData((prev) => ({
        ...prev,
        answerChoices: [...prev.answerChoices, ""],
      }));
    }
  };

  const handleRemoveAnswer = (idx: number) => {
    if (formData.answerChoices.length > 2) {
      setFormData((prev) => {
        const updated = prev.answerChoices.filter((_, i) => i !== idx);
        return { ...prev, answerChoices: updated };
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setPendingImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetaChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [field]: value },
    }));
  };
  const handleSchemaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, schema: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Validation
    if (!formData.category.trim()) {
      setError("Category (Service) is required");
      setLoading(false);
      return;
    }
    if (!formData.questionText.trim()) {
      setError("Question text is required");
      setLoading(false);
      return;
    }
    if (
      formData.answerChoices.length < 2 ||
      formData.answerChoices.some((a) => !a.trim())
    ) {
      setError(
        "At least 2 answer choices are required, and none can be empty."
      );
      setLoading(false);
      return;
    }
    if (!formData.correctAnswer) {
      setError("Correct answer is required");
      setLoading(false);
      return;
    }
    if (!formData.explanation.trim()) {
      setError("Explanation is required");
      setLoading(false);
      return;
    }
    // Upload image if present
    let finalImageUrl = formData.image;
    if (pendingImageFile) {
      const uploadResult = await (
        await import("@/lib/firestore-operations")
      ).uploadImage(pendingImageFile, "question-images");
      if (uploadResult.success && uploadResult.data) {
        finalImageUrl = uploadResult.data.url;
      } else {
        setError(uploadResult.message);
        setLoading(false);
        return;
      }
    }
    const dataToSave = {
      ...formData,
      image: finalImageUrl,
      createdAt: new Date().toISOString(),
    };
    const result = await uploadQuestionContent(
      formData.category,
      formData.slug,
      dataToSave
    );
    if (result.success) {
      router.push("/admin/question");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Question
            </h1>
            <p className="text-gray-600 mt-1">Add a new exam question</p>
          </div>
          <form className="p-8" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Service) *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select service</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <RichTextEditor
                  value={formData.questionText}
                  onChange={(val) => handleInputChange("questionText", val)}
                  placeholder="Enter the main exam question..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Choices (A–F) *
                </label>
                {formData.answerChoices.map((choice, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <span className="w-6 font-bold">{ANSWER_LABELS[idx]}</span>
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      placeholder={`Option ${ANSWER_LABELS[idx]}`}
                      required
                    />
                    {formData.answerChoices.length > 2 && (
                      <button
                        type="button"
                        className="ml-2 text-red-500"
                        onClick={() => handleRemoveAnswer(idx)}
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 text-xs text-blue-600"
                  onClick={handleAddAnswer}
                  disabled={formData.answerChoices.length >= 6}
                >
                  + Add Answer Choice
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    handleInputChange("correctAnswer", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                >
                  {formData.answerChoices.map((_, idx) => (
                    <option key={idx} value={ANSWER_LABELS[idx]}>
                      {ANSWER_LABELS[idx]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation *
                </label>
                <RichTextEditor
                  value={formData.explanation}
                  onChange={(val) => handleInputChange("explanation", val)}
                  placeholder="Enter a full explanation of the correct answer..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-xs text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-l"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-purple-600 text-white rounded-r"
                    onClick={handleAddTag}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug / URL Title
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  readOnly
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta.title}
                    onChange={(e) => handleMetaChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Custom SEO title tag"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={formData.meta.description}
                    onChange={(e) =>
                      handleMetaChange("description", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Meta description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta.keywords}
                    onChange={(e) =>
                      handleMetaChange("keywords", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Meta keywords (comma separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta.ogTitle}
                    onChange={(e) =>
                      handleMetaChange("ogTitle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Open Graph title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Description
                  </label>
                  <input
                    type="text"
                    value={formData.meta.ogDescription}
                    onChange={(e) =>
                      handleMetaChange("ogDescription", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Open Graph description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.meta.ogImage}
                    onChange={(e) =>
                      handleMetaChange("ogImage", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Open Graph image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={formData.meta.canonicalUrl}
                    onChange={(e) =>
                      handleMetaChange("canonicalUrl", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Canonical URL"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Markup (JSON-LD)
                </label>
                <textarea
                  value={formData.schema}
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black min-h-[120px] font-mono"
                  placeholder="Paste custom schema markup here (JSON-LD)"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Status
                </label>
                <select
                  value={formData.publishStatus}
                  onChange={(e) =>
                    handleInputChange("publishStatus", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/question")}
                className="text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Question</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
