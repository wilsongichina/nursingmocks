import { Node, mergeAttributes } from "@tiptap/core";

export interface DottedSeparatorOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dottedSeparator: {
      /**
       * Insert a dotted horizontal line separator
       */
      setDottedSeparator: () => ReturnType;
    };
  }
}

export const DottedSeparator = Node.create<DottedSeparatorOptions>({
  name: "dottedSeparator",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dotted-separator"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "dotted-separator",
        class: "dotted-separator",
      }),
    ];
  },

  addCommands() {
    return {
      setDottedSeparator:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {},
          });
        },
    };
  },
});

