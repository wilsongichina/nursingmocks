"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  uploadQuestionContent,
  getAllServicesList,
  getAllPages,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F"];

interface QuestionFormData {
  questionText: string;
  answerChoices: string[];
  correctAnswer: string;
  correctAnswers: string[]; // New field for multiple correct answers
  isMultipleAnswer: boolean; // Toggle for single/multiple answer mode
  explanation: string;
  category: string; // Question category
  service: string; // Service (HESI, TEAS, etc.)
  set: string; // Question set
  passage: string; // Reading passage for reading category
  tags: string[];
  image: string;
  slug: string;
  date: string; // Date field
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
    answerChoices: ["", "", "", ""],
    correctAnswer: "A",
    correctAnswers: ["A"], // Initialize with first answer
    isMultipleAnswer: false,
    explanation: "",
    category: "",
    service: "",
    set: "",
    passage: "",
    tags: [],
    image: "",
    slug: "",
    date: new Date().toISOString().split("T")[0], // Initialize with current date
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
    publishStatus: "published",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateTimeSuffix, setDateTimeSuffix] = useState<string>("");

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  // Helper function to strip HTML tags and decode HTML entities
  const stripHtmlTags = (html: string): string => {
    if (typeof window === "undefined") {
      // Server-side: just remove HTML tags and decode basic entities
      let text = html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      text = text.replace(/\u00A0/g, " "); // Non-breaking space
      text = text.replace(/\s+/g, " ");
      return text.trim();
    }

    // Client-side: Create a temporary DOM element to decode HTML entities
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || "";

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, "");

    // Replace non-breaking spaces and other whitespace characters with regular spaces
    text = text.replace(/\u00A0/g, " "); // &nbsp; or \u00A0
    text = text.replace(/\s+/g, " "); // Multiple spaces to single space

    return text.trim();
  };

  // Generate day.second suffix once when question text is first entered (removed year, month, and minutes)
  useEffect(() => {
    if (formData.questionText.trim() && !dateTimeSuffix) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0"); // DD (day of month)
      const seconds = String(now.getSeconds()).padStart(2, "0"); // SS (seconds)
      setDateTimeSuffix(`-${day}-${seconds}`);
    }
  }, [formData.questionText, dateTimeSuffix]);

  // Update slug and meta when question text changes
  useEffect(() => {
    setFormData((prev) => {
      const cleanQuestionText = stripHtmlTags(prev.questionText);
      // Remove nbsp and other HTML entities, then create slug
      let baseSlug = cleanQuestionText
        .toLowerCase()
        .replace(/nbsp/g, "") // Remove any remaining "nbsp" text
        .replace(/&nbsp;/g, "") // Remove &nbsp; entity
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Trim base slug if total would exceed 220 characters (when date/time suffix is added)
      if (dateTimeSuffix) {
        const dateTimeSuffixLength = dateTimeSuffix.length; // 6 characters
        const maxBaseSlugLength = 220 - dateTimeSuffixLength; // 214 characters
        if (baseSlug.length > maxBaseSlugLength) {
          baseSlug = baseSlug.substring(0, maxBaseSlugLength);
          // Remove trailing hyphen if present after trimming
          baseSlug = baseSlug.replace(/-+$/, "");
        }
      }

      // Combine base slug with date/time suffix (if available)
      const fullSlug = dateTimeSuffix ? baseSlug + dateTimeSuffix : baseSlug;

      return {
        ...prev,
        slug: fullSlug,
        meta: {
          ...prev.meta,
          title:
            cleanQuestionText.length > 60
              ? cleanQuestionText.substring(0, 60) + "..."
              : cleanQuestionText,
          description: cleanQuestionText,
          ogTitle: cleanQuestionText,
          ogDescription: cleanQuestionText,
          ogImage: prev.image,
          canonicalUrl:
            typeof window !== "undefined" ? window.location.href : "",
          keywords: prev.tags.join(", "),
        },
      };
    });
  }, [formData.questionText, formData.image, formData.tags, dateTimeSuffix]);

  // Update schema when relevant fields change
  useEffect(() => {
    setFormData((prev) => {
      // Generate dynamic schema based on question data
      const generateSchema = () => {
        const cleanQuestionText = stripHtmlTags(prev.questionText);
        if (!cleanQuestionText.trim()) return "";

        const questionSlug =
          prev.slug ||
          cleanQuestionText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const questionUrl = `https://www.teasgurus.com/questions/${questionSlug}`;
        const serviceName = prev.service === "hesi" ? "HESI" : "TEAS";

        const schema = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.teasgurus.com/#organization",
              name: "Teas Gurus",
              url: "https://www.teasgurus.com",
              logo: {
                "@type": "ImageObject",
                url: "https://teasgurus.com/teas-gurus-logo.png",
              },
            },
            {
              "@type": "WebSite",
              "@id": "https://www.teasgurus.com/#website",
              url: "https://www.teasgurus.com",
              name: "Teas Gurus",
              publisher: {
                "@id": "https://www.teasgurus.com/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://www.teasgurus.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "WebPage",
              "@id": `${questionUrl}#webpage`,
              url: questionUrl,
              name: cleanQuestionText,
              isPartOf: {
                "@id": "https://www.teasgurus.com/#website",
              },
              about: {
                "@id": "https://www.teasgurus.com/#organization",
              },
              breadcrumb: {
                "@id": `${questionUrl}#breadcrumb`,
              },
              primaryImageOfPage: {
                "@type": "ImageObject",
                url:
                  prev.image ||
                  "https://www.teasgurus.com/images/question-banner.jpg",
              },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${questionUrl}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.teasgurus.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: `${serviceName} Questions`,
                  item: `https://www.teasgurus.com/questions`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: cleanQuestionText,
                  item: questionUrl,
                },
              ],
            },
            {
              "@type": "QAPage",
              "@id": `${questionUrl}#qa`,
              mainEntity: {
                "@type": "Question",
                name: cleanQuestionText,
                text: cleanQuestionText,
                answerCount: prev.answerChoices.length,
                acceptedAnswer: prev.isMultipleAnswer
                  ? prev.correctAnswers.map((answer) => ({
                      "@type": "Answer",
                      text: `${answer}. ${
                        prev.answerChoices[ANSWER_LABELS.indexOf(answer)] || ""
                      }`,
                      url: `${questionUrl}#correct`,
                      upvoteCount: 100,
                      downvoteCount: 0,
                    }))
                  : {
                      "@type": "Answer",
                      text: `${prev.correctAnswer}. ${
                        prev.answerChoices[
                          ANSWER_LABELS.indexOf(prev.correctAnswer)
                        ] || ""
                      }`,
                      url: `${questionUrl}#correct`,
                      upvoteCount: 100,
                      downvoteCount: 0,
                    },
                suggestedAnswer: prev.answerChoices
                  .map((choice, idx) => {
                    const answerLabel = ANSWER_LABELS[idx];
                    if (prev.isMultipleAnswer) {
                      if (prev.correctAnswers.includes(answerLabel))
                        return null;
                    } else {
                      if (answerLabel === prev.correctAnswer) return null;
                    }
                    return {
                      "@type": "Answer",
                      text: `${answerLabel}. ${choice}`,
                    };
                  })
                  .filter(Boolean),
              },
            },
          ],
        };

        return JSON.stringify(schema, null, 2);
      };

      return {
        ...prev,
        schema: generateSchema(),
      };
    });
  }, [
    formData.questionText,
    formData.slug,
    formData.image,
    formData.service,
    formData.answerChoices,
    formData.correctAnswer,
    formData.correctAnswers,
    formData.isMultipleAnswer,
  ]);

  const loadCategories = async () => {
    try {
      const result = await getAllPages();
      if (result.success && result.data) {
        // Extract page IDs from the pages object
        const pageIds = Object.keys(result.data);
        setCategories(pageIds);
      }
    } catch {
      // ignore
    }
  };

  const loadServices = async () => {
    try {
      const result = await getAllServicesList();
      if (result.success && result.data) {
        setServices(result.data);
      }
    } catch {
      // ignore
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    // Split by commas and trim each tag
    const tagsToAdd = newTag
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag && !formData.tags.includes(tag));

    if (tagsToAdd.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, ...tagsToAdd],
      }));
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Auto-add category and service as tags when they change
  useEffect(() => {
    setFormData((prev) => {
      const newTags = [...prev.tags];

      // Add category as tag if not already present
      if (prev.category && !newTags.includes(prev.category)) {
        newTags.push(prev.category);
      }

      // Add service as tag if not already present
      if (prev.service && !newTags.includes(prev.service)) {
        newTags.push(prev.service);
      }

      return {
        ...prev,
        tags: newTags,
      };
    });
  }, [formData.category, formData.service]);

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
    if (formData.answerChoices.length > 1) {
      setFormData((prev) => {
        const updated = prev.answerChoices.filter((_, i) => i !== idx);
        const answerLabel = ANSWER_LABELS[idx];

        // Remove the answer from correctAnswers if it was selected
        const updatedCorrectAnswers = prev.correctAnswers.filter(
          (answer) => answer !== answerLabel
        );

        // Update correctAnswer if it was the removed answer
        let updatedCorrectAnswer = prev.correctAnswer;
        if (prev.correctAnswer === answerLabel) {
          updatedCorrectAnswer = ANSWER_LABELS[0];
        }

        return {
          ...prev,
          answerChoices: updated,
          correctAnswer: updatedCorrectAnswer,
          correctAnswers: updatedCorrectAnswers,
        };
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

  const handleToggleMultipleAnswer = () => {
    setFormData((prev) => {
      const newIsMultipleAnswer = !prev.isMultipleAnswer;
      if (newIsMultipleAnswer) {
        // Switch to multiple answer mode - initialize with current single answer
        return {
          ...prev,
          isMultipleAnswer: newIsMultipleAnswer,
          correctAnswers: [prev.correctAnswer],
        };
      } else {
        // Switch to single answer mode - use first correct answer or default to A
        return {
          ...prev,
          isMultipleAnswer: newIsMultipleAnswer,
          correctAnswer:
            prev.correctAnswers.length > 0 ? prev.correctAnswers[0] : "A",
          correctAnswers: [],
        };
      }
    });
  };

  const handleMultipleAnswerChange = (
    answerLabel: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      if (checked) {
        // Add answer to multiple correct answers
        const updatedCorrectAnswers = [...prev.correctAnswers, answerLabel];
        return { ...prev, correctAnswers: updatedCorrectAnswers };
      } else {
        // Remove answer from multiple correct answers
        const updatedCorrectAnswers = prev.correctAnswers.filter(
          (answer) => answer !== answerLabel
        );
        return { ...prev, correctAnswers: updatedCorrectAnswers };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Validation
    if (!formData.category.trim()) {
      setError("Category is required");
      setLoading(false);
      return;
    }
    if (!formData.service.trim()) {
      setError("Service is required");
      setLoading(false);
      return;
    }
    if (!formData.questionText.trim()) {
      setError("Question text is required");
      setLoading(false);
      return;
    }
    // Validate slug length (including date.minute.second) - max 220 characters
    if (formData.slug.length > 220) {
      setError(
        `Slug is too long (${formData.slug.length} characters). Maximum allowed is 220 characters including the date and time suffix. Please shorten the question text.`
      );
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
    if (formData.isMultipleAnswer) {
      if (formData.correctAnswers.length === 0) {
        setError(
          "At least one correct answer is required for multiple answer questions"
        );
        setLoading(false);
        return;
      }
    } else {
      if (!formData.correctAnswer) {
        setError("Correct answer is required");
        setLoading(false);
        return;
      }
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
      formData.service,
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
                  Service *
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => handleInputChange("service", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set
                </label>
                <input
                  type="text"
                  value={formData.set}
                  onChange={(e) => handleInputChange("set", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="Enter question set (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                />
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
                  Reading Passage (optional)
                </label>
                <RichTextEditor
                  value={formData.passage}
                  onChange={(val) => handleInputChange("passage", val)}
                  placeholder="Enter the reading passage that the question is based on..."
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
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => handleRemoveAnswer(idx)}
                      title="Remove"
                    >
                      &times;
                    </button>
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
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Type
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleMultipleAnswer}
                    aria-label={`Switch to ${
                      formData.isMultipleAnswer ? "single" : "multiple"
                    } answer mode`}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      formData.isMultipleAnswer
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isMultipleAnswer
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {formData.isMultipleAnswer
                    ? "Multiple Answers"
                    : "Single Answer"}
                </div>

                {formData.isMultipleAnswer ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answers *
                    </label>
                    <div className="space-y-2">
                      {formData.answerChoices.map((_, idx) => {
                        const answerLabel = ANSWER_LABELS[idx];
                        const isSelected =
                          formData.correctAnswers.includes(answerLabel);
                        return (
                          <label
                            key={idx}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleMultipleAnswerChange(
                                  answerLabel,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 font-medium text-gray-700">
                              {answerLabel}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
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
                )}
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
                      className="bg-purple-100 text-black px-2 py-1 rounded-full flex items-center"
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
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-l text-black"
                    placeholder="Add tag (e.g., tag1, tag2)"
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
