import { Node, mergeAttributes } from "@tiptap/core";

export interface CustomImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Set an image
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

export const CustomImage = Node.create<CustomImageOptions>({
  name: "customImage",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,

  group: "inline",

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          const align =
            element.getAttribute("data-align") ||
            element.style.textAlign ||
            element.parentElement?.style.textAlign;
          return align || "left";
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === "left") {
            return {};
          }
          return {
            "data-align": attributes.align,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const parent = element.parentElement;
          let align = "left";

          // Check for alignment in parent div's style
          if (parent && parent.tagName === "DIV") {
            const textAlign = parent.style.textAlign;
            if (textAlign === "center" || textAlign === "right") {
              align = textAlign;
            }
          }

          // Check for data-align attribute
          const dataAlign = element.getAttribute("data-align");
          if (dataAlign) {
            align = dataAlign;
          }

          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: element.getAttribute("width")
              ? parseInt(element.getAttribute("width") || "0", 10)
              : null,
            height: element.getAttribute("height")
              ? parseInt(element.getAttribute("height") || "0", 10)
              : null,
            align: align,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes.align || "left";
    const imgAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      {
        style: HTMLAttributes.width
          ? `width: ${HTMLAttributes.width}px; height: auto; max-width: 100%;`
          : "max-width: 100%; height: auto;",
      }
    );

    // Remove align from img attributes as it's handled by the wrapper
    delete imgAttrs.align;

    // If alignment is not left, wrap in a div with text-align
    if (align === "center" || align === "right") {
      return [
        "div",
        {
          style: `text-align: ${align}; width: 100%;`,
        },
        ["img", imgAttrs],
      ];
    }

    // For left alignment, just return the img
    return ["img", imgAttrs];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Helper function to update node attributes
      const updateAttributes = (attrs: Record<string, any>) => {
        if (typeof getPos === "function") {
          const pos = getPos();
          if (pos !== undefined) {
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                ...attrs,
              })
            );
          }
        }
      };
      // Create wrapper for alignment
      const alignmentWrapper = document.createElement("div");
      alignmentWrapper.style.width = "100%";

      const container = document.createElement("div");
      container.className =
        "custom-image-wrapper relative inline-block max-w-full";
      container.style.position = "relative";
      container.style.display = "inline-block";

      // Apply alignment to the wrapper, not the container
      const alignment = node.attrs.align || "left";
      if (alignment === "center") {
        alignmentWrapper.style.textAlign = "center";
        container.style.display = "inline-block";
      } else if (alignment === "right") {
        alignmentWrapper.style.textAlign = "right";
        container.style.display = "inline-block";
      } else {
        alignmentWrapper.style.textAlign = "left";
        container.style.display = "inline-block";
      }

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.title = node.attrs.title || "";
      img.className = "custom-image cursor-pointer";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
      }

      const controls = document.createElement("div");
      controls.className =
        "image-controls absolute top-0 right-0 flex gap-1 p-1 bg-white border border-gray-300 rounded shadow-lg z-10 hidden";
      controls.style.display = "none";

      // Alt text button
      const altButton = document.createElement("button");
      altButton.type = "button";
      altButton.className = "p-1.5 hover:bg-gray-100 rounded transition-colors";
      altButton.innerHTML = `<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>`;
      altButton.title = "Edit Alt Text";

      // Alignment buttons
      const alignLeftButton = document.createElement("button");
      alignLeftButton.type = "button";
      alignLeftButton.className =
        "p-1.5 hover:bg-gray-100 rounded transition-colors";
      alignLeftButton.innerHTML = `<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M3 6h6M3 18h6"></path></svg>`;
      alignLeftButton.title = "Align Left";
      if (alignment === "left") {
        alignLeftButton.classList.add("bg-gray-100");
      }

      const alignCenterButton = document.createElement("button");
      alignCenterButton.type = "button";
      alignCenterButton.className =
        "p-1.5 hover:bg-gray-100 rounded transition-colors";
      alignCenterButton.innerHTML = `<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M6 6h12M6 18h12"></path></svg>`;
      alignCenterButton.title = "Align Center";
      if (alignment === "center") {
        alignCenterButton.classList.add("bg-gray-100");
      }

      const alignRightButton = document.createElement("button");
      alignRightButton.type = "button";
      alignRightButton.className =
        "p-1.5 hover:bg-gray-100 rounded transition-colors";
      alignRightButton.innerHTML = `<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M15 6h6M15 18h6"></path></svg>`;
      alignRightButton.title = "Align Right";
      if (alignment === "right") {
        alignRightButton.classList.add("bg-gray-100");
      }

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className =
        "p-1.5 hover:bg-red-50 rounded transition-colors";
      deleteButton.innerHTML = `<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
      deleteButton.title = "Delete Image";

      // Resize handle
      const resizeHandle = document.createElement("div");
      resizeHandle.className =
        "resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize hidden flex items-center justify-center";
      resizeHandle.style.display = "none";
      resizeHandle.innerHTML = `<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"/></svg>`;

      // Alt text input container
      const altInputContainer = document.createElement("div");
      altInputContainer.className =
        "alt-input-container absolute bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50 hidden";
      altInputContainer.style.display = "none";
      altInputContainer.style.minWidth = "250px";

      const altInputLabel = document.createElement("label");
      altInputLabel.className =
        "block text-xs font-semibold text-gray-700 mb-1.5";
      altInputLabel.textContent = "Alt Text";

      const altInput = document.createElement("input");
      altInput.type = "text";
      altInput.value = node.attrs.alt || "";
      altInput.placeholder = "Enter image description";
      altInput.className =
        "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] text-gray-900";

      const altInputActions = document.createElement("div");
      altInputActions.className = "flex gap-2 justify-end mt-2";

      const altInputSave = document.createElement("button");
      altInputSave.type = "button";
      altInputSave.className =
        "px-3 py-1.5 text-xs font-medium text-white bg-[#4f46e5] rounded hover:bg-[#4338ca] transition-colors";
      altInputSave.textContent = "Save";

      const altInputCancel = document.createElement("button");
      altInputCancel.type = "button";
      altInputCancel.className =
        "px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors";
      altInputCancel.textContent = "Cancel";

      altInputActions.appendChild(altInputCancel);
      altInputActions.appendChild(altInputSave);
      altInputContainer.appendChild(altInputLabel);
      altInputContainer.appendChild(altInput);
      altInputContainer.appendChild(altInputActions);

      let isAltInputOpen = false;

      // Show controls on hover/click
      const showControls = () => {
        if (!isAltInputOpen) {
          controls.style.display = "flex";
          resizeHandle.style.display = "block";
        }
      };

      const hideControls = () => {
        if (!isAltInputOpen && document.activeElement !== altInput) {
          controls.style.display = "none";
          resizeHandle.style.display = "none";
        }
      };

      container.addEventListener("mouseenter", showControls);
      container.addEventListener("mouseleave", hideControls);
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        showControls();
      });

      // Alt text button click
      altButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        isAltInputOpen = !isAltInputOpen;
        if (isAltInputOpen) {
          altInputContainer.style.display = "block";
          // Disable editor temporarily to prevent event capture
          editor.setEditable(false);
          setTimeout(() => {
            altInput.focus();
            altInput.select();
            // Re-enable editor after a short delay
            setTimeout(() => {
              editor.setEditable(true);
            }, 100);
          }, 10);
        } else {
          altInputContainer.style.display = "none";
          editor.setEditable(true);
        }
      });

      // Prevent editor from capturing events in alt input container
      altInputContainer.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      });

      altInputContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      });

      altInput.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        editor.setEditable(false);
        setTimeout(() => {
          altInput.focus();
        }, 0);
      });

      altInput.addEventListener("click", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      });

      altInput.addEventListener("focus", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Disable editor when input is focused
        editor.setEditable(false);
      });

      altInput.addEventListener("blur", (_e) => {
        // Re-enable editor when input loses focus
        setTimeout(() => {
          if (
            document.activeElement !== altInputSave &&
            document.activeElement !== altInputCancel
          ) {
            editor.setEditable(true);
          }
        }, 100);
      });

      // Handle keydown - only prevent for special keys
      altInput.addEventListener("keydown", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (e.key === "Enter") {
          e.preventDefault();
          updateAttributes({ alt: altInput.value });
          isAltInputOpen = false;
          altInputContainer.style.display = "none";
          editor.setEditable(true);
          setTimeout(() => {
            editor.view.focus();
          }, 10);
        } else if (e.key === "Escape") {
          e.preventDefault();
          altInput.value = node.attrs.alt || "";
          isAltInputOpen = false;
          altInputContainer.style.display = "none";
          editor.setEditable(true);
          setTimeout(() => {
            editor.view.focus();
          }, 10);
        }
        // For all other keys, don't prevent default - let them work normally
      });

      // Don't prevent input events - let them work normally
      altInput.addEventListener("keyup", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      });

      // Allow input event to work normally - NO preventDefault or stopPropagation
      altInput.addEventListener("input", (_e) => {
        // Do nothing - let the input work normally
        // The value will update automatically in the DOM
      });

      // Allow beforeinput to work normally
      altInput.addEventListener("beforeinput", (_e) => {
        // Do nothing - let the input work normally
      });

      // Save button
      altInputSave.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        updateAttributes({ alt: altInput.value });
        isAltInputOpen = false;
        altInputContainer.style.display = "none";
        editor.setEditable(true);
        setTimeout(() => {
          editor.view.focus();
        }, 10);
      });

      // Cancel button
      altInputCancel.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        altInput.value = node.attrs.alt || "";
        isAltInputOpen = false;
        altInputContainer.style.display = "none";
        editor.setEditable(true);
        setTimeout(() => {
          editor.view.focus();
        }, 10);
      });

      // Close on blur (with delay to allow button clicks)
      altInput.addEventListener("blur", (_e) => {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            activeElement !== altInputSave &&
            activeElement !== altInputCancel &&
            activeElement !== altInput &&
            activeElement &&
            !altInputContainer.contains(activeElement)
          ) {
            isAltInputOpen = false;
            altInputContainer.style.display = "none";
            editor.setEditable(true);
          }
        }, 200);
      });

      // Delete button click
      deleteButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (typeof getPos === "function") {
          const pos = getPos();
          if (pos !== undefined) {
            editor.view.dispatch(
              editor.view.state.tr.delete(pos, pos + node.nodeSize)
            );
          }
        }
      });

      // Resize functionality
      let _isResizing = false;
      resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        _isResizing = true;
        const startX = e.clientX;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const diffX = moveEvent.clientX - startX;
          const newWidth = Math.max(100, Math.min(800, startWidth + diffX));
          const newHeight = newWidth / aspectRatio;

          img.style.width = `${newWidth}px`;
          updateAttributes({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
          _isResizing = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      });

      // Alignment button handlers
      alignLeftButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        updateAttributes({ align: "left" });
        alignmentWrapper.style.textAlign = "left";
        container.style.display = "inline-block";
        alignLeftButton.classList.add("bg-gray-100");
        alignCenterButton.classList.remove("bg-gray-100");
        alignRightButton.classList.remove("bg-gray-100");
      });

      alignCenterButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        updateAttributes({ align: "center" });
        alignmentWrapper.style.textAlign = "center";
        container.style.display = "inline-block";
        alignLeftButton.classList.remove("bg-gray-100");
        alignCenterButton.classList.add("bg-gray-100");
        alignRightButton.classList.remove("bg-gray-100");
      });

      alignRightButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        updateAttributes({ align: "right" });
        alignmentWrapper.style.textAlign = "right";
        container.style.display = "inline-block";
        alignLeftButton.classList.remove("bg-gray-100");
        alignCenterButton.classList.remove("bg-gray-100");
        alignRightButton.classList.add("bg-gray-100");
      });

      controls.appendChild(altButton);
      controls.appendChild(alignLeftButton);
      controls.appendChild(alignCenterButton);
      controls.appendChild(alignRightButton);
      controls.appendChild(deleteButton);
      container.appendChild(img);
      container.appendChild(controls);
      container.appendChild(altInputContainer);
      container.appendChild(resizeHandle);

      // Add container to alignment wrapper
      alignmentWrapper.appendChild(container);

      return {
        dom: alignmentWrapper,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          // Update image attributes
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src;
          }
          if (updatedNode.attrs.alt !== node.attrs.alt) {
            img.alt = updatedNode.attrs.alt || "";
            altInput.value = updatedNode.attrs.alt || "";
          }
          if (updatedNode.attrs.title !== node.attrs.title) {
            img.title = updatedNode.attrs.title || "";
          }
          if (updatedNode.attrs.width !== node.attrs.width) {
            if (updatedNode.attrs.width) {
              img.style.width = `${updatedNode.attrs.width}px`;
            } else {
              img.style.width = "auto";
            }
          }

          // Update alignment
          const newAlignment = updatedNode.attrs.align || "left";
          if (updatedNode.attrs.align !== node.attrs.align) {
            alignmentWrapper.style.textAlign = newAlignment;
            container.style.display = "inline-block";

            // Update button states
            alignLeftButton.classList.toggle(
              "bg-gray-100",
              newAlignment === "left"
            );
            alignCenterButton.classList.toggle(
              "bg-gray-100",
              newAlignment === "center"
            );
            alignRightButton.classList.toggle(
              "bg-gray-100",
              newAlignment === "right"
            );
          }

          node = updatedNode;
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
