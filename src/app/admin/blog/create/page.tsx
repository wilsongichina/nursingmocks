"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  uploadBlogContent,
  getAllBlogCategories,
  addBlogCategory,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number; // 1 for h2, 2 for h3, 3 for h4, etc.
}

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    image: "",
    imageAlt: "",
    content: "",
    tableOfContents: "",
    category: "",
    tags: [] as string[],
  });

  // Add state for image preview and pending upload
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Add state for pending content images
  const [pendingContentImages, setPendingContentImages] = useState<
    Array<{
      file: File;
      previewUrl: string;
      firebaseUrl?: string;
    }>
  >([]);

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Table of Contents state
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);
  const [newTocTitle, setNewTocTitle] = useState("");
  const [newTocLevel, setNewTocLevel] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  // Update tableOfContents when tocItems change
  useEffect(() => {
    const tocHtml = tocItems
      .map((item) => {
        const indent = "  ".repeat(item.level - 1);
        return `${indent}<li><a href="#${item.title
          .toLowerCase()
          .replace(/\s+/g, "-")}">${item.title}</a></li>`;
      })
      .join("\n");

    const fullToc = tocItems.length > 0 ? `<ul>\n${tocHtml}\n</ul>` : "";

    setFormData((prev) => ({
      ...prev,
      tableOfContents: fullToc,
    }));
  }, [tocItems]);

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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const result = await addBlogCategory(newCategory.trim());
      if (result.success) {
        setNewCategory("");
        setShowAddCategory(false);
        await loadCategories();
      }
    } catch (err) {
      console.error("Failed to add category:", err);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Table of Contents functions
  const addTocItem = () => {
    if (!newTocTitle.trim()) return;

    const newItem: TableOfContentsItem = {
      id: Date.now().toString(),
      title: newTocTitle.trim(),
      level: newTocLevel,
    };

    setTocItems((prev) => [...prev, newItem]);
    setNewTocTitle("");
    setNewTocLevel(1);
  };

  const removeTocItem = (id: string) => {
    setTocItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTocItem = (
    id: string,
    field: "title" | "level",
    value: string | number
  ) => {
    setTocItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const moveTocItem = (id: string, direction: "up" | "down") => {
    setTocItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;

      const newItems = [...prev];
      if (direction === "up" && index > 0) {
        [newItems[index], newItems[index - 1]] = [
          newItems[index - 1],
          newItems[index],
        ];
      } else if (direction === "down" && index < newItems.length - 1) {
        [newItems[index], newItems[index + 1]] = [
          newItems[index + 1],
          newItems[index],
        ];
      }
      return newItems;
    });
  };

  const useTemplate = () => {
    setFormData({
      title: "Sample Blog Post",
      date: new Date().toISOString().split("T")[0],
      author: "TeasGurus Team",
      image:
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      imageAlt: "Sample blog post image",
      category: "Study Tips",
      tags: ["TEAS Exam", "Study Guide", "Nursing School"],
      content: `
        <h2>The Ultimate Guide to TEAS Exam Preparation</h2>
        <p>Preparing for the TEAS (Test of Essential Academic Skills) exam can be a daunting task, but with the right approach and resources, you can achieve your target score. This comprehensive guide will walk you through everything you need to know about TEAS exam preparation.</p>
        
        <h3>Understanding the TEAS Exam Structure</h3>
        <p>The TEAS exam consists of four main sections, each designed to assess different academic skills essential for nursing school success:</p>
        <ul>
          <li><strong>Reading:</strong> 53 questions, 64 minutes</li>
          <li><strong>Mathematics:</strong> 36 questions, 54 minutes</li>
          <li><strong>Science:</strong> 53 questions, 63 minutes</li>
          <li><strong>English and Language Usage:</strong> 28 questions, 28 minutes</li>
        </ul>
        
        <h3>Creating Your Study Plan</h3>
        <p>A well-structured study plan is crucial for TEAS exam success. Here's how to create an effective study schedule:</p>
        
        <h4>Step 1: Assess Your Current Knowledge</h4>
        <p>Start by taking a diagnostic test to identify your strengths and weaknesses. This will help you allocate more time to areas that need improvement.</p>
        
        <h4>Step 2: Set Realistic Goals</h4>
        <p>Based on your target nursing program's requirements, set specific score goals for each section. Most nursing programs require a minimum composite score of 60-70%.</p>
        
        <h4>Step 3: Create a Study Schedule</h4>
        <p>Allocate 2-3 hours daily for TEAS preparation, focusing on different sections each day. Include regular practice tests to track your progress.</p>
        
        <h3>Essential Study Strategies</h3>
        <p>Implement these proven strategies to maximize your TEAS exam performance:</p>
        
        <h4>Reading Section Strategies</h4>
        <ul>
          <li>Practice active reading techniques</li>
          <li>Focus on main ideas and supporting details</li>
          <li>Learn to identify author's purpose and tone</li>
          <li>Practice with various text types (informational, literary, persuasive)</li>
        </ul>
        
        <h4>Mathematics Section Strategies</h4>
        <ul>
          <li>Review basic algebra and geometry concepts</li>
          <li>Practice word problems and data interpretation</li>
          <li>Learn to use the calculator efficiently</li>
          <li>Focus on time management during calculations</li>
        </ul>
        
        <h4>Science Section Strategies</h4>
        <ul>
          <li>Review human anatomy and physiology</li>
          <li>Understand basic chemistry concepts</li>
          <li>Practice interpreting scientific data</li>
          <li>Focus on scientific reasoning and methodology</li>
        </ul>
        
        <h4>English and Language Usage Strategies</h4>
        <ul>
          <li>Review grammar rules and conventions</li>
          <li>Practice identifying sentence structure errors</li>
          <li>Learn to improve sentence clarity and flow</li>
          <li>Focus on vocabulary in context</li>
        </ul>
        
        <h3>Recommended Study Resources</h3>
        <p>Invest in quality study materials to enhance your preparation:</p>
        
        <h4>Official TEAS Study Materials</h4>
        <ul>
          <li>ATI TEAS Study Manual (7th Edition)</li>
          <li>ATI TEAS Online Practice Tests</li>
          <li>ATI TEAS SmartPrep</li>
        </ul>
        
        <h4>Additional Resources</h4>
        <ul>
          <li>Khan Academy for math and science concepts</li>
          <li>YouTube channels specializing in TEAS prep</li>
          <li>Mobile apps for on-the-go practice</li>
          <li>Study groups and tutoring services</li>
        </ul>
        
        <h3>Practice Test Strategies</h3>
        <p>Regular practice tests are essential for TEAS exam success. Here's how to make the most of them:</p>
        
        <h4>Simulate Real Test Conditions</h4>
        <p>Take full-length practice tests under timed conditions to build stamina and improve time management skills.</p>
        
        <h4>Analyze Your Performance</h4>
        <p>After each practice test, thoroughly review your answers and identify patterns in your mistakes. Focus your study efforts on weak areas.</p>
        
        <h4>Track Your Progress</h4>
        <p>Keep a detailed log of your practice test scores to monitor improvement over time. Aim for consistent score increases.</p>
        
        <h3>Test Day Preparation</h3>
        <p>Proper preparation for test day can significantly impact your performance:</p>
        
        <h4>The Night Before</h4>
        <ul>
          <li>Get 7-8 hours of quality sleep</li>
          <li>Prepare your test day materials</li>
          <li>Avoid last-minute cramming</li>
          <li>Set multiple alarms</li>
        </ul>
        
        <h4>Test Day Morning</h4>
        <ul>
          <li>Eat a nutritious breakfast</li>
          <li>Arrive at the test center early</li>
          <li>Bring required identification</li>
          <li>Stay calm and confident</li>
        </ul>
        
        <h3>Conclusion</h3>
        <p>Success on the TEAS exam requires dedication, proper preparation, and the right resources. By following this comprehensive guide and implementing the strategies outlined, you'll be well-equipped to achieve your target score and take the next step toward your nursing career.</p>
        
        <p>Remember, consistent practice and a positive mindset are key to TEAS exam success. Good luck on your journey to becoming a nurse!</p>
      `,
      tableOfContents: "",
    });

    // Set up default table of contents items
    setTocItems([
      { id: "1", title: "Understanding the TEAS Exam Structure", level: 1 },
      { id: "2", title: "Creating Your Study Plan", level: 1 },
      { id: "3", title: "Step 1: Assess Your Current Knowledge", level: 2 },
      { id: "4", title: "Step 2: Set Realistic Goals", level: 2 },
      { id: "5", title: "Step 3: Create a Study Schedule", level: 2 },
      { id: "6", title: "Essential Study Strategies", level: 1 },
      { id: "7", title: "Reading Section Strategies", level: 2 },
      { id: "8", title: "Mathematics Section Strategies", level: 2 },
      { id: "9", title: "Science Section Strategies", level: 2 },
      { id: "10", title: "English and Language Usage Strategies", level: 2 },
      { id: "11", title: "Recommended Study Resources", level: 1 },
      { id: "12", title: "Official TEAS Study Materials", level: 2 },
      { id: "13", title: "Additional Resources", level: 2 },
      { id: "14", title: "Practice Test Strategies", level: 1 },
      { id: "15", title: "Simulate Real Test Conditions", level: 2 },
      { id: "16", title: "Analyze Your Performance", level: 2 },
      { id: "17", title: "Track Your Progress", level: 2 },
      { id: "18", title: "Test Day Preparation", level: 1 },
      { id: "19", title: "The Night Before", level: 2 },
      { id: "20", title: "Test Day Morning", level: 2 },
      { id: "21", title: "Conclusion", level: 1 },
    ]);
  };

  const handlePendingImageUpload = (file: File, previewUrl: string) => {
    setPendingContentImages((prev) => [...prev, { file, previewUrl }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create a URL-friendly ID from the title
      const blogId = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      let finalImageUrl = formData.image;

      // If there's a pending image file, upload it first
      if (pendingImageFile) {
        const uploadResult = await (
          await import("@/lib/firestore-operations")
        ).uploadImage(pendingImageFile);

        if (uploadResult.success && uploadResult.data) {
          finalImageUrl = uploadResult.data.url;
        } else {
          setError(uploadResult.message);
          setLoading(false);
          return;
        }
      }

      // Upload all pending content images and replace preview URLs with Firebase URLs
      let finalContent = formData.content;
      if (pendingContentImages.length > 0) {
        const uploadPromises = pendingContentImages.map(async (imageData) => {
          const uploadResult = await (
            await import("@/lib/firestore-operations")
          ).uploadImage(imageData.file);

          if (uploadResult.success && uploadResult.data) {
            return {
              previewUrl: imageData.previewUrl,
              firebaseUrl: uploadResult.data.url,
            };
          } else {
            throw new Error(`Failed to upload image: ${uploadResult.message}`);
          }
        });

        try {
          const uploadResults = await Promise.all(uploadPromises);

          // Replace preview URLs with Firebase URLs in content
          uploadResults.forEach(({ previewUrl, firebaseUrl }) => {
            finalContent = finalContent.replace(previewUrl, firebaseUrl);
          });
        } catch {
          setError("Failed to upload one or more content images");
          setLoading(false);
          return;
        }
      }

      const blogData = {
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        author: formData.author,
        image: finalImageUrl,
        imageAlt: formData.imageAlt,
        content: finalContent,
        tableOfContents: formData.tableOfContents,
        category: formData.category,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
      };

      const result = await uploadBlogContent(blogId, blogData);

      if (result.success) {
        router.push("/admin/blog");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Blog Post
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new blog post to your website
                </p>
              </div>
              <Link
                href="/admin/blog"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Back to Blogs
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Blog Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Publication Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="Enter author name"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Blog Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Create local preview
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result as string;
                      setImagePreview(result);
                      setPendingImageFile(file);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                />
                {/* Alt Text Field */}
                <input
                  type="text"
                  id="imageAlt"
                  value={formData.imageAlt}
                  onChange={(e) =>
                    handleInputChange("imageAlt", e.target.value)
                  }
                  placeholder="Image alt text (for accessibility and SEO)"
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
                {(imagePreview || formData.image) && (
                  <div className="mt-2 flex items-center gap-4">
                    <Image
                      src={imagePreview || formData.image}
                      alt={formData.imageAlt || "Preview"}
                      width={128}
                      height={80}
                      className="w-32 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image: "" }));
                          setImagePreview("");
                          setPendingImageFile(null);
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        Remove Image
                      </button>
                      {pendingImageFile && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Image will be uploaded when you save
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="px-4 py-3 text-purple-600 hover:text-purple-700 border border-purple-300 hover:border-purple-400 rounded-lg transition-colors"
                    title="Add new category"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>
                {showAddCategory && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddCategory()
                        }
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter a tag and press Enter"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Tag
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                            title={`Remove tag: ${tag}`}
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table of Contents
              </label>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newTocTitle}
                      onChange={(e) => setNewTocTitle(e.target.value)}
                      placeholder="Enter section title"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTocItem())
                      }
                    />
                    <select
                      value={newTocLevel}
                      onChange={(e) => setNewTocLevel(Number(e.target.value))}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    >
                      <option value={1}>Main Section (H2)</option>
                      <option value={2}>Sub Section (H3)</option>
                      <option value={3}>Sub Sub Section (H4)</option>
                    </select>
                    <button
                      type="button"
                      onClick={addTocItem}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Add Section
                    </button>
                  </div>
                </div>

                {tocItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Table of Contents Items:
                    </h4>
                    {tocItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
                        style={{
                          paddingLeft: `${(item.level - 1) * 20 + 12}px`,
                        }}
                      >
                        <div className="flex-1 flex items-center space-x-3">
                          <span className="text-gray-500 text-sm w-8">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateTocItem(item.id, "title", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black text-sm"
                          />
                          <select
                            value={item.level}
                            onChange={(e) =>
                              updateTocItem(
                                item.id,
                                "level",
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black text-sm"
                          >
                            <option value={1}>H2</option>
                            <option value={2}>H3</option>
                            <option value={3}>H4</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveTocItem(item.id, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
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
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTocItem(item.id, "down")}
                            disabled={index === tocItems.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTocItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Remove item"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tocItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
                    <p className="text-sm">
                      No table of contents items yet. Add sections above to
                      create your table of contents.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange("content", value)}
                placeholder="Write your blog content here..."
                onPendingImageUpload={handlePendingImageUpload}
              />
              {pendingContentImages.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {pendingContentImages.length} image(s) will be uploaded when
                    you save
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/blog"
                  className="text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={useTemplate}
                  className="text-blue-600 hover:text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Use Template</span>
                </button>
              </div>
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
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Create Blog</span>
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
