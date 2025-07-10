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

  // Apply className to the content by wrapping it in a div with the class
  const contentWithClass = `<div class="${className}">${content}</div>`;

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
