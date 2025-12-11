"use client";

import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface MobileBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const MobileBreadcrumb: React.FC<MobileBreadcrumbProps> = ({
  items,
  className = "",
}) => {
  if (items.length === 0) return null;

  return (
    <div
      className={`md:hidden overflow-x-auto scrollbar-hide ${className}`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <nav className="flex items-center space-x-2 text-sm py-2.5 px-4 bg-white border-b border-gray-200 min-w-max">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.url && index < items.length - 1 ? (
              <Link
                href={item.url}
                className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0 text-sm"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium whitespace-nowrap flex-shrink-0 text-sm">
                {item.name}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default MobileBreadcrumb;

