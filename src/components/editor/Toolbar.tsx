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
  Eraser,
  Undo,
  Redo,
  Image as ImageIcon,
  Palette,
  Superscript,
  Table,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { AdminDestructiveDialog } from "@/components/admin/AdminUi";

interface ToolbarProps {
  editor: Editor;
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [confirmingTableDelete, setConfirmingTableDelete] = useState(false);
  const [documentStats, setDocumentStats] = useState({ words: 0, characters: 0 });
  const linkMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const textColors = [
    { label: "Default", value: "", swatch: "#202437" },
    { label: "Purple", value: "#5548e0", swatch: "#5548e0" },
    { label: "Green", value: "#15803d", swatch: "#15803d" },
    { label: "Amber", value: "#b45309", swatch: "#b45309" },
    { label: "Red", value: "#b91c1c", swatch: "#b91c1c" },
  ];

  const getDocumentStats = () => {
    const text = editor.getText().trim();
    return {
      words: text ? text.split(/\s+/).filter(Boolean).length : 0,
      characters: text.replace(/\s/g, "").length,
    };
  };

  const cleanPastedContent = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(editor.getHTML(), "text/html");

    doc.body.querySelectorAll("*").forEach((element) => {
      element.removeAttribute("style");

      const dataType = element.getAttribute("data-type");
      const isCustomModule = Boolean(dataType);
      const isHeading = /^H[1-6]$/.test(element.tagName);
      const isTableCell = element.tagName === "TH" || element.tagName === "TD";

      if (!isCustomModule && !isHeading && !isTableCell) {
        element.removeAttribute("class");
      }

      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name;
        const keep =
          name.startsWith("data-") ||
          ["href", "src", "alt", "title", "id", "class", "colspan", "rowspan"].includes(name);

        if (!keep) {
          element.removeAttribute(name);
        }
      });
    });

    doc.body.querySelectorAll("span").forEach((span) => {
      if (span.attributes.length === 0) {
        span.replaceWith(...Array.from(span.childNodes));
      }
    });

    editor.chain().focus().setContent(doc.body.innerHTML).run();
  };

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
      if (
        colorMenuRef.current &&
        !colorMenuRef.current.contains(event.target as Node)
      ) {
        setShowColorMenu(false);
      }
    };

    if (showLinkMenu || showTableMenu || showColorMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLinkMenu, showTableMenu, showColorMenu]);

  useEffect(() => {
    const updateStats = () => setDocumentStats(getDocumentStats());
    updateStats();
    editor.on("update", updateStats);

    return () => {
      editor.off("update", updateStats);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const buttonClass = "admin-editor-toolbar-button";
  const activeButtonClass = "admin-editor-toolbar-button-active";
  const handleConfirmTableDelete = () => {
    editor.chain().focus().deleteTable().run();
    setConfirmingTableDelete(false);
    setShowTableMenu(false);
  };

  return (
    <>
    <div className="admin-editor-toolbar">
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
        <Bold className="admin-editor-toolbar-icon" />
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
        <Italic className="admin-editor-toolbar-icon" />
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
        <Strikethrough className="admin-editor-toolbar-icon" />
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
        <Code className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`${buttonClass} ${
          editor.isActive("superscript") ? activeButtonClass : ""
        }`}
        title="Superscript"
      >
        <Superscript className="admin-editor-toolbar-icon" />
      </button>

      <div className="relative" ref={colorMenuRef}>
        <button
          type="button"
          onClick={() => setShowColorMenu((value) => !value)}
          className={`${buttonClass} ${
            editor.isActive("textColor") ? activeButtonClass : ""
          }`}
          title="Text Color"
        >
          <Palette className="admin-editor-toolbar-icon" />
        </button>
        {showColorMenu && (
          <div className="absolute top-full left-0 z-50 mt-2 min-w-[190px] rounded-2xl border border-[#e3e5f0] bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="grid gap-1">
              {textColors.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().setTextColor(color.value).run();
                    } else {
                      editor.chain().focus().unsetTextColor().run();
                    }
                    setShowColorMenu(false);
                  }}
                  className="flex min-h-[34px] items-center gap-2 rounded-lg px-2 text-left text-xs font-semibold text-[#202437] hover:bg-[#f4f5ff]"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-[#e3e5f0]"
                    style={{ backgroundColor: color.swatch }}
                    aria-hidden="true"
                  />
                  {color.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={cleanPastedContent}
        className={buttonClass}
        title="Clean Pasted Content"
      >
        <Eraser className="admin-editor-toolbar-icon" />
      </button>

      <div className="admin-editor-divider" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 1 }) ? activeButtonClass : ""
        }`}
        title="Heading 1"
      >
        <Heading1 className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 2 }) ? activeButtonClass : ""
        }`}
        title="Heading 2"
      >
        <Heading2 className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${
          editor.isActive("heading", { level: 3 }) ? activeButtonClass : ""
        }`}
        title="Heading 3"
      >
        <Heading3 className="admin-editor-toolbar-icon" />
      </button>

      <div className="admin-editor-divider" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${
          editor.isActive("bulletList") ? activeButtonClass : ""
        }`}
        title="Bullet List"
      >
        <List className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${
          editor.isActive("orderedList") ? activeButtonClass : ""
        }`}
        title="Numbered List"
      >
        <ListOrdered className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonClass} ${
          editor.isActive("blockquote") ? activeButtonClass : ""
        }`}
        title="Blockquote"
      >
        <Quote className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${buttonClass} ${
          editor.isActive("codeBlock") ? activeButtonClass : ""
        }`}
        title="Code Block"
      >
        <Code className="admin-editor-toolbar-icon" />
      </button>

      <div className="admin-editor-divider" />

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
          <LinkIcon className="admin-editor-toolbar-icon" />
        </button>
        {showLinkMenu && (
          <div className="absolute top-full left-0 z-50 mt-2 min-w-[280px] rounded-2xl border border-[#e3e5f0] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="space-y-2">
              <div>
                <label
                  htmlFor="link-url-input"
                  className="admin-field-label mb-1 block"
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
                  className="admin-field min-h-[36px] w-full px-2 py-1.5 text-sm"
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
                  className="admin-button-cancel min-h-[34px] px-3 py-1.5 text-xs"
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
                  className="admin-button-primary min-h-[34px] px-3 py-1.5 text-xs"
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
                  className="admin-button-danger min-h-[34px] w-full px-3 py-1.5 text-xs"
                >
                  <Unlink className="h-3 w-3" />
                  Remove Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="admin-editor-divider" />

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
        <ImageIcon className="admin-editor-toolbar-icon" />
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
        <ImageIcon className="admin-editor-toolbar-icon" />
      </button>

      <div className="admin-editor-divider" />

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
          <Table className="admin-editor-toolbar-icon" />
        </button>
        {showTableMenu && (
          <div className="absolute top-full left-0 z-50 mt-2 min-w-[240px] rounded-2xl border border-[#e3e5f0] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="table-rows"
                  className="admin-field-label mb-1 block"
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
                  className="admin-field min-h-[36px] w-full px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="table-cols"
                  className="admin-field-label mb-1 block"
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
                  className="admin-field min-h-[36px] w-full px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="table-header"
                  type="checkbox"
                  checked={withHeaderRow}
                  onChange={(e) => setWithHeaderRow(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e3e5f0] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                />
                <label
                  htmlFor="table-header"
                  className="admin-field-label cursor-pointer"
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
                  className="admin-button-cancel min-h-[34px] px-3 py-1.5 text-xs"
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
                  className="admin-button-primary min-h-[34px] px-3 py-1.5 text-xs"
                >
                  Insert Table
                </button>
              </div>
              {editor.isActive("table") && (
                <div className="border-t border-[#e3e5f0] pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableMenu(false);
                      setConfirmingTableDelete(true);
                    }}
                    disabled={!editor.can().deleteTable()}
                    className="admin-button-danger min-h-[34px] w-full px-3 py-1.5 text-xs"
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

      <div className="admin-editor-divider" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "left" }) ? activeButtonClass : ""
        }`}
        title="Align Left"
      >
        <AlignLeft className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "center" }) ? activeButtonClass : ""
        }`}
        title="Align Center"
      >
        <AlignCenter className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`${buttonClass} ${
          editor.isActive({ textAlign: "right" }) ? activeButtonClass : ""
        }`}
        title="Align Right"
      >
        <AlignRight className="admin-editor-toolbar-icon" />
      </button>

      <div className="admin-editor-divider" />

      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={buttonClass}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="admin-editor-toolbar-icon" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={buttonClass}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="admin-editor-toolbar-icon" />
      </button>
      <div
        className="ml-auto rounded-full border border-[#e3e5f0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#64748b]"
        title={`${documentStats.words} words, ${documentStats.characters} characters`}
      >
        {documentStats.words} words
      </div>
    </div>
    {confirmingTableDelete && (
      <AdminDestructiveDialog
        title="Delete Table"
        itemName="this table"
        consequence="This removes the table from the editor content."
        confirmLabel="Delete Table"
        onCancel={() => setConfirmingTableDelete(false)}
        onConfirm={handleConfirmTableDelete}
      />
    )}
    </>
  );
}

