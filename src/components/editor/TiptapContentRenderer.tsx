/**
 * Tiptap Content Renderer
 *
 * This component renders Tiptap HTML content using the TiptapEditor in read-only mode.
 * This ensures all custom modules (QuizCard, Callout, etc.) are properly rendered
 * with their React components and styling.
 */

import TiptapEditor from "./TiptapEditor";

interface TiptapContentRendererProps {
  content: string;
  className?: string;
}

export default function TiptapContentRenderer({
  content,
  className = "",
}: TiptapContentRendererProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      <TiptapEditor
        content={content}
        editable={false}
        placeholder=""
      />
    </div>
  );
}
