/**
 * Static HTML Renderer for Tiptap Content
 *
 * This component renders Tiptap HTML content as static HTML during build time.
 * Use this for pages that need to be statically generated.
 *
 * For client-side rendering with Tiptap features, use TiptapEditor with editable={false}
 */

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
    <div
      className={`tiptap-readonly ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
