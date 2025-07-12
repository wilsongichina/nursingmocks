import React from "react";
import Link from "next/link";

interface ContentRendererProps {
  content: string;
  className?: string;
  textColor?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
  textColor = "",
}) => {
  if (!content) {
    return null;
  }

  // Function to process markdown links within HTML content
  const processContentWithLinks = (htmlContent: string) => {
    // First, we need to extract text nodes and process them for markdown links
    // This is a simplified approach that looks for markdown links in the content

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    // Find all markdown links in the content
    interface LinkMatch {
      index: number;
      text: string;
      url: string;
      fullMatch: string;
    }

    const matches: LinkMatch[] = [];
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      matches.push({
        index: match.index,
        text: match[1],
        url: match[2],
        fullMatch: match[0],
      });
    }

    // Debug logging
    if (matches.length > 0) {
      console.log(
        `ContentRenderer: Found ${matches.length} markdown links in content`
      );
      matches.forEach((match, index) => {
        console.log(`Link ${index + 1}: "${match.text}" -> "${match.url}"`);
      });
    }

    // If no markdown links found, return the content as-is
    if (matches.length === 0) {
      return (
        <div
          className={`rich-text-content ${className}`}
          style={textColor ? { color: textColor } : {}}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }

    // Process the content by replacing markdown links with JSX Link components
    let processedContent = htmlContent;

    // Replace markdown links with placeholder tokens that we can identify
    matches.forEach((match, index) => {
      const placeholder = `__LINK_PLACEHOLDER_${index}__`;
      processedContent = processedContent.replace(match.fullMatch, placeholder);
    });

    // Split the content by placeholders
    const contentParts = processedContent.split(/(__LINK_PLACEHOLDER_\d+__)/);

    return (
      <div
        className={`rich-text-content ${className}`}
        style={textColor ? { color: textColor } : {}}
      >
        {contentParts.map((part, index) => {
          const placeholderMatch = part.match(/__LINK_PLACEHOLDER_(\d+)__/);
          if (placeholderMatch) {
            const linkIndex = parseInt(placeholderMatch[1]);
            const linkData = matches[linkIndex];
            return (
              <Link
                key={`link-${index}`}
                href={linkData.url}
                className="anchor-link text-blue-700 hover:text-blue-900 underline decoration-2 decoration-blue-500 hover:decoration-blue-700 transition-all duration-200 font-medium"
              >
                {linkData.text}
              </Link>
            );
          }
          return (
            <span
              key={`text-${index}`}
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        })}
      </div>
    );
  };

  return processContentWithLinks(content);
};

export default ContentRenderer;
