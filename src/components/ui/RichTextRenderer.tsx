import React from "react";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content) {
    return null;
  }

  // Process content to add IDs to headings
  const processContent = (htmlContent: string) => {
    let processedContent = htmlContent;

    // Add IDs to headings (h1, h2, h3, h4, h5, h6)
    const headingRegex = /<(h[1-6])([^>]*)>(.*?)<\/\1>/gi;
    let headingIndex = 0;

    processedContent = processedContent.replace(
      headingRegex,
      (match, tag, attributes, text) => {
        headingIndex++;
        const id = `section-${headingIndex}`;
        const cleanText = text.replace(/<[^>]*>/g, "").trim();
        const slug = cleanText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        return `<${tag}${attributes} id="${slug || id}">${text}</${tag}>`;
      }
    );

    return processedContent;
  };

  const processedContent = processContent(content);
  const contentWithClass = `<div class="${className}">${processedContent}</div>`;

  return (
    <div
      className="rich-text-content"
      dangerouslySetInnerHTML={{
        __html: contentWithClass,
      }}
    />
  );
};

export default RichTextRenderer;
