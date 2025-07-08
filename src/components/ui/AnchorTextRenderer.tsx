import Link from "next/link";

interface AnchorTextRendererProps {
  text: string;
  className?: string;
}

export default function AnchorTextRenderer({
  text,
  className = "",
}: AnchorTextRendererProps) {
  // Parse markdown links and convert them to JSX
  const renderTextWithLinks = (text: string) => {
    // Debug: log the text to see what we're working with
    console.log("AnchorTextRenderer received text:", text);

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      console.log("Found link:", match[1], "->", match[2]);

      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <Link
          key={match.index}
          href={match[2]}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          {match[1]}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    console.log("Rendered parts:", parts);
    return parts.length > 0 ? parts : text;
  };

  return <span className={className}>{renderTextWithLinks(text)}</span>;
}
