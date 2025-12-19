"use client";

import { useEffect, useState } from "react";

interface SectionHeading {
  id: string;
  text: string;
  level: number;
}

interface SectionHeadingsListProps {
  content?: string;
  className?: string;
  onHeadingClick?: (id: string) => void;
  showLevels?: boolean;
  showIds?: boolean;
  title?: string;
  emptyMessage?: string;
}

export default function SectionHeadingsList({
  content = "",
  className = "",
  onHeadingClick,
  showLevels = false,
  showIds = true,
  title = "Table of Contents",
  emptyMessage = "No section headings found",
}: SectionHeadingsListProps) {
  const [headings, setHeadings] = useState<SectionHeading[]>([]);

  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    // Parse HTML content to extract headings with IDs
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    
    // Select all headings that have an ID attribute
    const headingElements = doc.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");

    const extractedHeadings: SectionHeading[] = [];

    headingElements.forEach((heading) => {
      const id = heading.getAttribute("id");
      const text = heading.textContent?.trim() || "";
      const tagName = heading.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1)); // Extract number from h1, h2, etc.

      // Only include headings that have both an ID and text
      if (id && text && id !== "dummy") {
        extractedHeadings.push({
          id,
          text,
          level,
        });
      }
    });

    setHeadings(extractedHeadings);
  }, [content]);

  const handleClick = (id: string) => {
    if (onHeadingClick) {
      onHeadingClick(id);
    } else {
      // Default behavior: scroll to the heading
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update URL hash without scrolling again
        window.history.pushState(null, "", `#${id}`);
      }
    }
  };

  if (headings.length === 0) {
    return (
      <div className={`section-headings-list ${className}`}>
        {title && (
          <h3 className="text-sm font-semibold text-[#202437] mb-3">{title}</h3>
        )}
        <p className="text-xs text-[#a0a5bf] text-center py-4">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`section-headings-list ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-[#202437] mb-3">{title}</h3>
      )}
      <div className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            type="button"
            onClick={() => handleClick(heading.id)}
            className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-[#f4f5ff] hover:text-[#6a5cff] text-[#202437] group"
            style={{
              paddingLeft: showLevels ? `${heading.level * 0.75 + 0.75}rem` : "0.75rem",
            }}
          >
            <div className="flex items-center gap-2">
              {showLevels && (
                <span className="text-xs text-[#a0a5bf] font-mono flex-shrink-0">
                  H{heading.level}
                </span>
              )}
              <span className="text-sm font-medium flex-1 truncate">{heading.text}</span>
              {showIds && (
                <span className="text-xs text-[#a0a5bf] font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  #{heading.id}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

