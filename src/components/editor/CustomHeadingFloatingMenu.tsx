"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";

interface CustomHeadingFloatingMenuProps {
  editor: Editor;
}

export default function CustomHeadingFloatingMenu({
  editor,
}: CustomHeadingFloatingMenuProps) {
  const [show, setShow] = useState(false);
  const [headingId, setHeadingId] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingPosRef = useRef<number | null>(null);
  const headingDepthRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;

    // Don't automatically show menu - only show on explicit click
    // This prevents interference with typing
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        // Don't hide if clicking in the editor
        const editorElement = editor.view.dom;
        if (!editorElement.contains(event.target as Node)) {
          setShow(false);
        }
      }
    };

    // Handle clicks on custom headings to show menu
    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const heading = target.closest('.custom-heading');
      
      if (heading) {
        // Only show menu on double-click or when clicking near the right edge (ID badge area)
        const rect = heading.getBoundingClientRect();
        const clickX = event.clientX;
        const rightEdge = rect.right;
        
        // Show menu on double-click or click in the right 20% of the heading (where ID badge is)
        if (event.detail === 2 || (clickX > rightEdge - rect.width * 0.2)) {
          event.preventDefault();
          event.stopPropagation();
          
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;

          let headingNode = null;
          let headingPos = null;
          let headingDepth = null;

          if ($from.parent.type.name === "heading") {
            headingNode = $from.parent;
            headingPos = $from.before($from.depth);
            headingDepth = $from.depth;
          } else {
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth);
              if (node.type.name === "heading") {
                headingNode = node;
                headingPos = $from.before(depth);
                headingDepth = depth;
                break;
              }
            }
          }

          if (headingNode && headingPos !== null && headingDepth !== null) {
            const dom = editor.view.nodeDOM(headingPos) as HTMLElement;
            if (dom) {
              const headingRect = dom.getBoundingClientRect();
              setPosition({
                top: headingRect.top,
                left: headingRect.left,
              });
              setHeadingId(headingNode.attrs.id || "");
              // Store the heading position and depth for later use
              headingPosRef.current = headingPos;
              headingDepthRef.current = headingDepth;
              setShow(true);
              // Focus input after a brief delay
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            }
          }
        }
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const editorElement = editor.view.dom;
    editorElement.addEventListener("click", handleEditorClick);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      editorElement.removeEventListener("click", handleEditorClick);
    };
  }, [show, editor]);

  if (!show || !editor) {
    return null;
  }

  const handleUpdateId = () => {
    // Use the stored heading position and depth instead of trying to find it again
    const headingPos = headingPosRef.current;
    const headingDepth = headingDepthRef.current;
    
    if (headingPos !== null && headingDepth !== null) {
      const { state } = editor;
      const { tr } = state;
      
      // Get the node at the stored position
      const node = state.doc.nodeAt(headingPos);
      
      if (node && node.type.name === "heading") {
        // Use setNodeMarkup to update the node attributes directly
        tr.setNodeMarkup(headingPos, undefined, {
          ...node.attrs,
          id: headingId.trim() || null,
        });
        
        editor.view.dispatch(tr);
        editor.commands.focus();
      } else {
        // Fallback: try using the command chain
        editor
          .chain()
          .focus()
          .setTextSelection(headingPos)
          .updateAttributes("heading", {
            id: headingId.trim() || null,
          })
          .run();
      }
      
      // Clear the stored position and depth
      headingPosRef.current = null;
      headingDepthRef.current = null;
    }
    
    // Close the menu after updating
    setShow(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateId();
      setShow(false);
    } else if (e.key === "Escape") {
      headingPosRef.current = null;
      headingDepthRef.current = null;
      setShow(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className="admin-editor-menu"
      style={{
        top: `${position.top - 10}px`,
        left: `${position.left}px`,
        transform: "translateY(-100%)",
      }}
    >
      <div className="space-y-2">
        <label
          htmlFor="heading-id-floating-menu"
          className="admin-field-label mb-1 block"
        >
          ID (optional)
        </label>
        <input
          ref={inputRef}
          id="heading-id-floating-menu"
          type="text"
          value={headingId}
          onChange={(e) => setHeadingId(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleUpdateId}
          onFocus={(e) => {
            // Prevent editor from losing focus when clicking input
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Prevent editor from losing focus when clicking input
            e.stopPropagation();
          }}
          placeholder="e.g., section-1"
          className="admin-field w-full"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              headingPosRef.current = null;
              headingDepthRef.current = null;
              setShow(false);
            }}
            className="admin-button-cancel min-h-[34px] px-3 py-1.5 text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleUpdateId}
            className="admin-button-primary min-h-[34px] px-3 py-1.5 text-xs"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

