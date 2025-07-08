"use client";

import { useState, useRef } from "react";

interface AnchorLink {
  text: string;
  url: string;
}

interface AnchorTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

export default function AnchorTextEditor({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  className = "",
  label,
}: AnchorTextEditorProps) {
  const [showAnchorModal, setShowAnchorModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [anchorUrl, setAnchorUrl] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse existing anchor links from text
  const parseAnchorLinks = (
    text: string
  ): { text: string; links: AnchorLink[] } => {
    console.log("parseAnchorLinks - Input text:", text);

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: AnchorLink[] = [];
    let match;
    let cleanText = text;

    while ((match = linkRegex.exec(text)) !== null) {
      console.log("parseAnchorLinks - Found link:", match[1], "->", match[2]);
      links.push({
        text: match[1],
        url: match[2],
      });
    }

    // Remove markdown links from clean text
    cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
    console.log("parseAnchorLinks - Clean text:", cleanText);
    console.log("parseAnchorLinks - Found links:", links);

    return { text: cleanText, links };
  };

  // Convert text with anchor links to markdown format
  const convertToMarkdown = (text: string, links: AnchorLink[]): string => {
    console.log("convertToMarkdown - Input text:", text);
    console.log("convertToMarkdown - Input links:", links);

    let result = text;

    // Sort links by length (longest first) to avoid partial matches
    const sortedLinks = [...links].sort(
      (a, b) => b.text.length - a.text.length
    );

    sortedLinks.forEach((link) => {
      // Escape special regex characters in the link text
      const escapedText = link.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedText}\\b`, "g");
      result = result.replace(regex, `[${link.text}](${link.url})`);
      console.log(
        "convertToMarkdown - Replaced",
        link.text,
        "with",
        `[${link.text}](${link.url})`
      );
    });

    console.log("convertToMarkdown - Final result:", result);
    return result;
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    console.log("handleTextSelection - start:", start, "end:", end);

    if (start !== end) {
      // Get the selected text from the display text (clean text without markdown)
      const { text: cleanText } = parseAnchorLinks(value);
      const selected = cleanText.substring(start, end);
      console.log("handleTextSelection - selected text:", selected);
      console.log("handleTextSelection - cleanText:", cleanText);

      setSelectedText(selected);
      setAnchorText(selected); // Auto-populate the anchor text field
      setCursorPosition({ start, end });
      setShowAnchorModal(true);
    }
  };

  const handleAddAnchor = () => {
    if (!anchorText || !anchorUrl) return;

    console.log("handleAddAnchor - anchorText:", anchorText);
    console.log("handleAddAnchor - anchorUrl:", anchorUrl);
    console.log("handleAddAnchor - selectedText:", selectedText);
    console.log("handleAddAnchor - cursorPosition:", cursorPosition);

    const { text: cleanText, links } = parseAnchorLinks(value);
    console.log("handleAddAnchor - cleanText:", cleanText);
    console.log("handleAddAnchor - existing links:", links);

    // Create the markdown link
    const markdownLink = `[${anchorText}](${anchorUrl})`;

    // If there's selected text, replace it with the markdown link
    if (selectedText && cursorPosition.start !== cursorPosition.end) {
      const beforeSelection = cleanText.substring(0, cursorPosition.start);
      const afterSelection = cleanText.substring(cursorPosition.end);
      const newValue = beforeSelection + markdownLink + afterSelection;
      console.log(
        "AnchorTextEditor - Adding link with selected text:",
        newValue
      );
      onChange(newValue);
    } else {
      // If no text is selected, just add the link to existing links
      const newLinks = [...links, { text: anchorText, url: anchorUrl }];
      const newValue = convertToMarkdown(cleanText, newLinks);
      console.log(
        "AnchorTextEditor - Adding link without selection:",
        newValue
      );
      onChange(newValue);
    }

    // Reset form but keep modal open for multiple links
    setAnchorText("");
    setAnchorUrl("");
    setSelectedText("");
    // Don't close modal - allow adding multiple links
  };

  const handleRemoveAnchor = (linkText: string) => {
    const { text: cleanText, links } = parseAnchorLinks(value);

    // Remove the link
    const newLinks = links.filter((link) => link.text !== linkText);

    // Convert back to markdown
    const newValue = convertToMarkdown(cleanText, newLinks);

    onChange(newValue);
  };

  const { text: displayText, links } = parseAnchorLinks(value);

  // Debug logging
  console.log("AnchorTextEditor - Received value:", value);
  console.log("AnchorTextEditor - Parsed displayText:", displayText);
  console.log("AnchorTextEditor - Parsed links:", links);

  return (
    <div className="space-y-4">
      {/* Text Editor */}
      <div>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          value={displayText}
          onChange={(e) => {
            console.log(
              "AnchorTextEditor - Textarea onChange:",
              e.target.value
            );
            const { links } = parseAnchorLinks(value);
            const newValue = convertToMarkdown(e.target.value, links);
            console.log(
              "AnchorTextEditor - New value after conversion:",
              newValue
            );
            onChange(newValue);
          }}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          rows={rows}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400 ${className}`}
          placeholder={placeholder}
        />
      </div>

      {/* Anchor Links Display */}
      {links.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Anchor Links:
          </h4>
          <div className="space-y-2">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-3 border"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-600">
                    {link.text}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">→</span>
                  <span className="text-sm text-gray-600 ml-2">{link.url}</span>
                </div>
                <button
                  onClick={() => handleRemoveAnchor(link.text)}
                  className="text-red-600 hover:text-red-800 transition-colors ml-2"
                  title="Remove anchor link"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>How to add anchor links:</strong> Select any text in the field
          above, then click "Add Anchor Link" to make it clickable and route to
          another page. You can add multiple links - the modal will stay open
          until you click "Done".
        </p>
      </div>

      {/* Add Anchor Link Button */}
      <button
        onClick={() => setShowAnchorModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <span>Add Anchor Link</span>
      </button>

      {/* Anchor Link Modal */}
      {showAnchorModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Anchor Link
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Enter the text to link"
                />
                {selectedText && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected text:{" "}
                    <span className="font-medium">{selectedText}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={anchorUrl}
                  onChange={(e) => setAnchorUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Enter the URL (e.g., /hesi-a2, /prices)"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddAnchor}
                disabled={!anchorText || !anchorUrl}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Link
              </button>
              <button
                onClick={() => {
                  setShowAnchorModal(false);
                  setAnchorText("");
                  setAnchorUrl("");
                  setSelectedText("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
