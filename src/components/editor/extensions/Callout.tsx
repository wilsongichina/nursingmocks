import { Node, mergeAttributes } from "@tiptap/core";

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

const CALLOUT_TYPES = new Set(["info", "warning", "success", "error"]);

const normalizeCalloutType = (value: unknown) => {
  const type = String(value || "").toLowerCase();
  return CALLOUT_TYPES.has(type) ? type : "info";
};

const parseCalloutType = (element: HTMLElement) => {
  const explicitType = element.getAttribute("data-callout-type");
  if (explicitType) {
    return normalizeCalloutType(explicitType);
  }

  const dataType = element.getAttribute("data-type");
  if (dataType && dataType !== "callout") {
    return normalizeCalloutType(dataType);
  }

  const classType = Array.from(element.classList)
    .find((className) => className.startsWith("callout-"))
    ?.replace("callout-", "");

  return normalizeCalloutType(classType);
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Insert a callout box
       */
      setCallout: (options: {
        type?: "info" | "warning" | "success" | "error";
      }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",

  group: "block",

  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => parseCalloutType(element),
        renderHTML: (attributes) => {
          const type = normalizeCalloutType(attributes.type);

          return {
            "data-type": "callout",
            "data-callout-type": type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
      {
        tag: 'div[data-type="info"]',
      },
      {
        tag: 'div[data-type="warning"]',
      },
      {
        tag: 'div[data-type="success"]',
      },
      {
        tag: 'div[data-type="error"]',
      },
      {
        tag: "div.callout",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = normalizeCalloutType(HTMLAttributes.type);

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "callout",
        "data-callout-type": type,
        class: `callout callout-${type}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              type: options.type || "info",
            },
            content: [
              {
                type: "paragraph",
                content: [],
              },
            ],
          });
        },
    };
  },
});
