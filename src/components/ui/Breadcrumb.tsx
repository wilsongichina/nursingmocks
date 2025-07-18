import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  className = "",
}) => {
  // Check if we're in a dark background context (gradient-bg or text-white)
  const isDarkBackground =
    className.includes("text-white") ||
    className.includes("gradient-bg") ||
    className.includes("bg-gradient");

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg
              className={`w-4 h-4 ${
                isDarkBackground ? "text-white/60" : "text-gray-400"
              }`}
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
          {item.href ? (
            <Link
              href={item.href}
              className={`transition-colors ${
                isDarkBackground
                  ? "text-white/80 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`font-medium ${
                isDarkBackground ? "text-white" : "text-gray-900"
              }`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
