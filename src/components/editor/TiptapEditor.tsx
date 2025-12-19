"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { CustomImage } from "./extensions/CustomImage";
import Link from "@tiptap/extension-link";
import Toolbar from "./Toolbar";
import CustomModulesPanel from "./CustomModulesPanel";
import CustomHeadingFloatingMenu from "./CustomHeadingFloatingMenu";
import { useEffect, useState } from "react";

// Import table extensions as named exports (Tiptap v3 uses named exports)
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

// Import text align extension
import TextAlign from "@tiptap/extension-text-align";

// Import custom extensions
import { Callout } from "./extensions/Callout";
import { CustomHeading } from "./extensions/CustomHeading";
import { DottedSeparator } from "./extensions/DottedSeparator";
import { QuizCard } from "./extensions/QuizCard";

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
        heading: false, // Disable default heading to use custom one
      }),
      CustomHeading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: "custom-heading",
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
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Callout,
      DottedSeparator,
      QuizCard,
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

        const customHeading = dataTransfer.getData("application/x-custom-heading");
        if (customHeading === "true") {
          // Prevent default drop behavior
          event.preventDefault();

          // Get the drop position
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            // Insert a default H2 custom heading with dummy text at the drop position
            editor
              .chain()
              .focus()
              .setTextSelection(coordinates.pos)
              .insertContent({
                type: "heading",
                attrs: {
                  level: 2,
                  id: "dummy",
                },
                content: [
                  {
                    type: "text",
                    text: "Section Heading",
                  },
                ],
              })
              .run();
          }

          return true; // Handled the drop
        }

        const dottedSeparator = dataTransfer.getData("application/x-dotted-separator");
        if (dottedSeparator === "true") {
          // Prevent default drop behavior
          event.preventDefault();

          // Get the drop position
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            // Insert the dotted separator at the drop position
            editor
              .chain()
              .focus()
              .setTextSelection(coordinates.pos)
              .setDottedSeparator()
              .run();
          }

          return true; // Handled the drop
        }

        const quizCard = dataTransfer.getData("application/x-quiz-card");
        if (quizCard === "true") {
          // Prevent default drop behavior
          event.preventDefault();

          // Get the drop position
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            // Insert the quiz card at the drop position
            editor
              .chain()
              .focus()
              .setTextSelection(coordinates.pos)
              .setQuizCard({})
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
        editable ? "border border-[#e2e4f0] rounded-2xl bg-white shadow-sm flex flex-col max-h-[600px]" : ""
      }`}
    >
      {editable && <div className="flex-shrink-0"><Toolbar editor={editor} /></div>}
      <div
        className={
          editable ? "grid grid-cols-[minmax(220px,280px)_1fr] gap-4 p-4 overflow-hidden flex-1 min-h-0" : ""
        }
      >
        {editable && (
          <div className="overflow-y-auto overflow-x-hidden">
            <CustomModulesPanel editor={editor} />
          </div>
        )}
        <div className={editable ? "min-w-0 relative overflow-y-auto overflow-x-hidden" : ""}>
          {editable && <CustomHeadingFloatingMenu editor={editor} />}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
