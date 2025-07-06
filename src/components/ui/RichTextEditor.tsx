"use client";

import { useState, useRef, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing your content...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertList = (type: "ordered" | "unordered") => {
    execCommand(
      type === "ordered" ? "insertOrderedList" : "insertUnorderedList"
    );
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 bg-gray-50 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Bold"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.6 18c-.4 0-.9-.1-1.3-.3l-3.8-2.1c-.4-.2-.7-.6-.7-1V5.4c0-.4.3-.8.7-1l3.8-2.1c.4-.2.9-.3 1.3-.3.4 0 .9.1 1.3.3l3.8 2.1c.4.2.7.6.7 1v11.2c0 .4-.3.8-.7 1l-3.8 2.1c-.4.2-.9.3-1.3.3z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Italic"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Underline"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16 9A6 6 0 1 1 4 9V1a1 1 0 1 1 2 0v8a4 4 0 1 0 8 0V1a1 1 0 1 1 2 0v8zM4 20a1 1 0 1 1 2 0v-1a1 1 0 1 1-2 0v1zm12 0a1 1 0 1 1 2 0v-1a1 1 0 1 1-2 0v1z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<h1>")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900 text-sm font-bold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<h2>")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900 text-sm font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<h3>")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900 text-sm font-bold"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<p>")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900 text-sm"
          title="Paragraph"
        >
          P
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => insertList("unordered")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertList("ordered")}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-gray-900"
          title="Insert Link"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
          </svg>
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset text-gray-900 ${
          isFocused ? "bg-white" : "bg-gray-50"
        }`}
        style={{ minHeight: "200px" }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
