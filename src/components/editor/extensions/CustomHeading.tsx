import { Heading } from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";

export interface CustomHeadingOptions {
  levels: number[];
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customHeading: {
      /**
       * Set a heading node with custom attributes
       */
      setCustomHeading: (options: {
        level: number;
        id?: string;
        fontSize?: string;
        fontWeight?: string;
      }) => ReturnType;
    };
  }
}

export const CustomHeading = Heading.extend<CustomHeadingOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            id: attributes.id,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute("style");
          if (style) {
            const match = style.match(/font-size:\s*([^;]+)/);
            return match ? match[1].trim() : null;
          }
          return null;
        },
        renderHTML: () => {
          return {};
        },
      },
      fontWeight: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute("style");
          if (style) {
            const match = style.match(/font-weight:\s*([^;]+)/);
            return match ? match[1].trim() : null;
          }
          return null;
        },
        renderHTML: () => {
          return {};
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    // Build style string from fontSize and fontWeight
    const styles: string[] = [];
    if (node.attrs.fontSize) {
      styles.push(`font-size: ${node.attrs.fontSize}`);
    }
    if (node.attrs.fontWeight) {
      styles.push(`font-weight: ${node.attrs.fontWeight}`);
    }

    const attrs: Record<string, any> = {
      ...HTMLAttributes,
    };

    if (node.attrs.id) {
      attrs.id = node.attrs.id;
    }

    if (styles.length > 0) {
      attrs.style = styles.join("; ");
    }

    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, attrs), 0];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setCustomHeading:
        (options) =>
        ({ commands: _commands, chain, state }) => {
          const attrs: any = {
            level: options.level,
          };

          if (options.id) {
            attrs.id = options.id;
          }
          if (options.fontSize) {
            attrs.fontSize = options.fontSize;
          }
          if (options.fontWeight) {
            attrs.fontWeight = options.fontWeight;
          }

          // Check if we're in a heading already
          const { selection } = state;
          const { $from } = selection;
          const node = $from.node();

          // If we're already in a heading, update it
          if (node.type.name === this.name) {
            return chain()
              .updateAttributes(this.name, attrs)
              .run();
          }

          // Otherwise, insert a new heading with content
          const { from, to } = selection;
          const selectedText = state.doc.textBetween(from, to, " ");

          return chain()
            .insertContent({
              type: this.name,
              attrs,
              content: selectedText
                ? [
                    {
                      type: "text",
                      text: selectedText,
                    },
                  ]
                : [
                    {
                      type: "text",
                      text: "",
                    },
                  ],
            })
            .run();
        },
    };
  },
});

