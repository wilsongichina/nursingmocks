"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FirebaseImage from "@/components/ui/FirebaseImage";

interface Blog {
  id: string;
  title: string;
  date: string;
  author: string;
  image: string;
  content: string;
  tableOfContents: string;
  lastUpdated?: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ClientPage({ blog }: { blog: Blog }) {
  const [activeSection, setActiveSection] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const sections = contentRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      let currentSection = "";
      let minDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);

        if (distance < minDistance && rect.top <= 150) {
          minDistance = distance;
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);

      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const extractTocItems = useCallback(() => {
    if (!blog?.content) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = blog.content;
    const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const items: TocItem[] = [];
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || "";
      const cleanText = text.replace(/<[^>]*>/g, "").trim();
      const slug = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const id = slug || `section-${items.length + 1}`;

      items.push({ id, text: cleanText, level });
    });

    setTocItems(items);
  }, [blog?.content]);

  useEffect(() => {
    if (blog?.content) {
      extractTocItems();
    }
  }, [blog, extractTocItems]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: blog.title },
  ];

  const readingTime = calculateReadingTime(blog.content);

  return (
    <Layout>
      <div className="reading-progress">
        <div
          className="reading-progress-bar"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-white opacity-5 rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-white opacity-5 rounded-full"></div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="mb-8">
              <Breadcrumb items={breadcrumbItems} className="text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white/90 backdrop-blur-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Blog Post
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {blog.title}
                </h1>

                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  A comprehensive guide to help you succeed in your academic
                  journey
                </p>

                <div className="flex flex-wrap items-center gap-6 text-white/80">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Author</p>
                      <p className="font-medium">{blog.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Published</p>
                      <p className="font-medium">{formatDate(blog.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Reading time</p>
                      <p className="font-medium">{readingTime} min read</p>
                    </div>
                  </div>
                </div>
              </div>

              {blog.image && (
                <div className="lg:col-span-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
                    <FirebaseImage
                      src={blog.image}
                      alt={blog.title}
                      width={400}
                      height={320}
                      className="relative w-full h-80 object-cover rounded-3xl shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {tocItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`toc-item w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                          activeSection === item.id
                            ? "active"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        style={{
                          paddingLeft: `${(item.level - 1) * 12 + 12}px`,
                        }}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            <div
              className={`${
                tocItems.length > 0 ? "lg:col-span-3" : "lg:col-span-4"
              }`}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reading time</p>
                        <p className="font-medium text-gray-900">
                          {readingTime} min read
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 blog-content" ref={contentRef}>
                  <div className="blog-prose prose prose-lg prose-purple max-w-none">
                    <RichTextRenderer content={blog.content} />
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        Last updated:{" "}
                        {blog.lastUpdated
                          ? formatDate(blog.lastUpdated)
                          : formatDate(blog.date)}
                      </span>
                      <span>•</span>
                      <span>Share this article</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/blog"
                        className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
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
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Back to Blogs
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
