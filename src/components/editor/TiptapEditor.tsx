"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { CustomImage } from "./extensions/CustomImage";
import Link from "@tiptap/extension-link";
import Toolbar from "./Toolbar";
import CustomModulesPanel from "./CustomModulesPanel";
import { useEffect, useState } from "react";

// Import table extensions as named exports (Tiptap v3 uses named exports)
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

// Import custom extension
import { Callout } from "./extensions/Callout";

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Start typing your content...",
  editable = true,
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "custom-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor focus:outline-none ${
          editable ? "min-h-[300px] px-4 py-3" : "px-0 py-0"
        } ${!editable ? "tiptap-readonly" : ""}`,
      },
    },
  });

  // Update editor content when content prop changes (useful for loading saved content)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Add drop handler after editor is created
  useEffect(() => {
    if (!editor) return;

    const handleDrop = (
      view: any,
      event: DragEvent,
      _slice: any,
      _moved: boolean
    ) => {
      // Check if this is a drop from our custom modules panel
      const dataTransfer = event.dataTransfer;
      if (dataTransfer) {
        const calloutType = dataTransfer.getData("application/x-callout");
        if (calloutType) {
          // Prevent default drop behavior
          event.preventDefault();

          // Get the drop position
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            // Insert the callout at the drop position using the editor from closure
            editor
              .chain()
              .focus()
              .setTextSelection(coordinates.pos)
              .setCallout({
                type: calloutType as "info" | "success" | "warning" | "error",
              })
              .run();
          }

          return true; // Handled the drop
        }
      }
      return false; // Let Tiptap handle other drops
    };

    // Override the editor's handleDrop
    const originalEditorProps = editor.options.editorProps;
    editor.setOptions({
      editorProps: {
        ...originalEditorProps,
        handleDrop,
      },
    });
  }, [editor]);

  // Don't render until mounted on client
  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div
      className={`${
        editable ? "border border-[#e2e4f0] rounded-2xl bg-white shadow-sm" : ""
      }`}
    >
      {editable && <Toolbar editor={editor} />}
      <div
        className={
          editable ? "grid grid-cols-[minmax(220px,280px)_1fr] gap-4 p-4" : ""
        }
      >
        {editable && <CustomModulesPanel editor={editor} />}
        <div className={editable ? "min-w-0" : ""}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
