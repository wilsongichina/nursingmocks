"use client";

import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Image as ImageIcon,
  Table,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
interface ToolbarProps {
  editor: Editor;
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const linkMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        linkMenuRef.current &&
        !linkMenuRef.current.contains(event.target as Node)
      ) {
        setShowLinkMenu(false);
      }
      if (
        tableMenuRef.current &&
        !tableMenuRef.current.contains(event.target as Node)
      ) {
        setShowTableMenu(false);
      }
    };

    if (showLinkMenu || showTableMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLinkMenu, showTableMenu]);

  if (!editor) {
    return null;
  }

  const buttonClass =
    "p-2 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeButtonClass = "bg-white";

  return (
    <div className="border-b border-[#e2e4f0] p-2 bg-gradient-to-r from-[#f9fafb] via-[#f4f5ff] to-[#f9fafb] flex flex-wrap gap-1 items-center rounded-t-2xl">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${buttonClass} ${
          editor.isActive("bold") ? activeButtonClass : ""
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${
          editor.isActive("italic") ? activeButtonClass : ""
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${
          editor.isActive("strike") ? activeButtonClass : ""
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${buttonClass} ${
          editor.isActive("code") ? activeButtonClass : ""
        }`}
        title="Inline Code"
      >
        <Code className="w-4 h-4 text-[#202437]" />
      </button>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 1 }) ? activeButtonClass : ""
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 2 }) ? activeButtonClass : ""
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 3 }) ? activeButtonClass : ""
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4 text-[#202437]" />
      </button>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${
          editor.isActive("bulletList") ? activeButtonClass : ""
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${
          editor.isActive("orderedList") ? activeButtonClass : ""
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonClass} ${
          editor.isActive("blockquote") ? activeButtonClass : ""
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${buttonClass} ${
          editor.isActive("codeBlock") ? activeButtonClass : ""
        }`}
        title="Code Block"
      >
        <Code className="w-4 h-4 text-[#202437]" />
      </button>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Links */}
      <div className="relative" ref={linkMenuRef}>
        <button
          type="button"
          onClick={() => {
            const currentUrl = editor.getAttributes("link").href || "";
            setLinkUrl(currentUrl);
            setShowLinkMenu(!showLinkMenu);
          }}
          className={`${buttonClass} ${
            editor.isActive("link") ? activeButtonClass : ""
          }`}
          title="Insert/Edit Link (Ctrl+K)"
        >
          <LinkIcon className="w-4 h-4 text-[#202437]" />
        </button>
        {showLinkMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#e2e4f0] rounded-lg shadow-lg p-3 z-50 min-w-[280px]">
            <div className="space-y-2">
              <div>
                <label
                  htmlFor="link-url-input"
                  className="block text-xs font-medium text-[#3b3f57] mb-1"
                >
                  URL
                </label>
                <input
                  id="link-url-input"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (linkUrl.trim()) {
                        const { from, to } = editor.state.selection;
                        const selectedText = editor.state.doc.textBetween(
                          from,
                          to,
                          " "
                        );

                        if (selectedText) {
                          editor
                            .chain()
                            .focus()
                            .extendMarkRange("link")
                            .setLink({ href: linkUrl.trim(), target: "_blank" })
                            .run();
                        } else {
                          editor
                            .chain()
                            .focus()
                            .insertContent({
                              type: "text",
                              text: linkUrl.trim(),
                              marks: [
                                {
                                  type: "link",
                                  attrs: {
                                    href: linkUrl.trim(),
                                    target: "_blank",
                                  },
                                },
                              ],
                            })
                            .run();
                        }
                        setShowLinkMenu(false);
                        setLinkUrl("");
                      }
                    } else if (e.key === "Escape") {
                      setShowLinkMenu(false);
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full px-2 py-1.5 text-sm border border-[#e2e4f0] rounded focus:outline-none focus:ring-1 focus:ring-[#6a5cff] focus:border-[#6a5cff] text-[#202437]"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkMenu(false);
                    setLinkUrl("");
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#7a819c] bg-white border border-[#e2e4f0] rounded hover:bg-[#f4f5ff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (linkUrl.trim()) {
                      const { from, to } = editor.state.selection;
                      const selectedText = editor.state.doc.textBetween(
                        from,
                        to,
                        " "
                      );

                      if (selectedText) {
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({
                            href: linkUrl.trim(),
                            target: "_blank",
                          })
                          .run();
                      } else {
                        editor
                          .chain()
                          .focus()
                          .insertContent({
                            type: "text",
                            text: linkUrl.trim(),
                            marks: [
                              {
                                type: "link",
                                attrs: {
                                  href: linkUrl.trim(),
                                  target: "_blank",
                                },
                              },
                            ],
                          })
                          .run();
                      }
                      setShowLinkMenu(false);
                      setLinkUrl("");
                    }
                  }}
                  disabled={!linkUrl.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#6a5cff] to-[#8b5dff] rounded hover:from-[#5a4cef] hover:to-[#7b4def] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4c3dff]/40"
                >
                  Insert
                </button>
              </div>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                    setShowLinkMenu(false);
                    setLinkUrl("");
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Unlink className="w-3 h-3 text-[#202437]" />
                  Remove Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Media */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Enter image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url, alt: "" }).run();
          }
        }}
        className={buttonClass}
        title="Insert Image"
      >
        <ImageIcon className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const src = event.target?.result as string;
                editor.chain().focus().setImage({ src, alt: "" }).run();
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}
        className={buttonClass}
        title="Upload Image"
      >
        <ImageIcon className="w-4 h-4 text-[#202437]" />
      </button>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Tables */}
      <div className="relative" ref={tableMenuRef}>
        <button
          type="button"
          onClick={() => {
            setShowTableMenu(!showTableMenu);
          }}
          className={`${buttonClass} ${
            editor.isActive("table") ? activeButtonClass : ""
          }`}
          title="Insert Table"
        >
          <Table className="w-4 h-4 text-[#202437]" />
        </button>
        {showTableMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[240px]">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="table-rows"
                  className="block text-xs font-medium text-[#3b3f57] mb-1"
                >
                  Rows
                </label>
                <input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) =>
                    setTableRows(
                      Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm border border-[#e2e4f0] rounded focus:outline-none focus:ring-1 focus:ring-[#6a5cff] focus:border-[#6a5cff] text-[#202437]"
                />
              </div>
              <div>
                <label
                  htmlFor="table-cols"
                  className="block text-xs font-medium text-[#3b3f57] mb-1"
                >
                  Columns
                </label>
                <input
                  id="table-cols"
                  type="number"
                  min="1"
                  max="20"
                  value={tableCols}
                  onChange={(e) =>
                    setTableCols(
                      Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm border border-[#e2e4f0] rounded focus:outline-none focus:ring-1 focus:ring-[#6a5cff] focus:border-[#6a5cff] text-[#202437]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="table-header"
                  type="checkbox"
                  checked={withHeaderRow}
                  onChange={(e) => setWithHeaderRow(e.target.checked)}
                  className="w-4 h-4 text-[#6a5cff] border-[#e2e4f0] rounded focus:ring-[#6a5cff]"
                />
                <label
                  htmlFor="table-header"
                  className="text-xs font-medium text-[#3b3f57] cursor-pointer"
                >
                  Header Row
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowTableMenu(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#7a819c] bg-white border border-[#e2e4f0] rounded hover:bg-[#f4f5ff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertTable({
                        rows: tableRows,
                        cols: tableCols,
                        withHeaderRow: withHeaderRow,
                      })
                      .run();
                    setShowTableMenu(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#6a5cff] to-[#8b5dff] rounded hover:from-[#5a4cef] hover:to-[#7b4def] transition-colors shadow-lg shadow-[#4c3dff]/40"
                >
                  Insert Table
                </button>
              </div>
              {editor.isActive("table") && (
                <div className="pt-2 border-t border-[#e2e4f0]">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setShowTableMenu(false);
                    }}
                    disabled={!editor.can().deleteTable()}
                    className="w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Table className="w-3 h-3" />
                    Delete Table
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "left" }) ? activeButtonClass : ""
        }`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "center" }) ? activeButtonClass : ""
        }`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "right" }) ? activeButtonClass : ""
        }`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4 text-[#202437]" />
      </button>

      <div className="w-px h-6 bg-[#e2e4f0] mx-1" />

      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={buttonClass}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4 text-[#202437]" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={buttonClass}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4 text-[#202437]" />
      </button>
    </div>
  );
}
