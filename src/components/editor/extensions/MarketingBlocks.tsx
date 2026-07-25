import { Node, mergeAttributes } from "@tiptap/core";
import { showAdminConfirmDialog } from "../adminConfirmDialog";

export interface MarketingBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ctaBlock: {
      setCtaBlock: (options: {
        eyebrow?: string;
        title?: string;
        description?: string;
        buttonLabel?: string;
        buttonHref?: string;
      }) => ReturnType;
    };
    internalLinkCard: {
      setInternalLinkCard: (options: {
        title?: string;
        description?: string;
        linkLabel?: string;
        linkHref?: string;
      }) => ReturnType;
    };
    faqContentBlock: {
      setFaqContentBlock: (options: {
        question?: string;
        answer?: string;
      }) => ReturnType;
    };
    comparisonTableBlock: {
      setComparisonTableBlock: (options: {
        title?: string;
        columnOneHeading?: string;
        columnTwoHeading?: string;
        rowOneLeft?: string;
        rowOneRight?: string;
        rowTwoLeft?: string;
        rowTwoRight?: string;
        rowThreeLeft?: string;
        rowThreeRight?: string;
        rowFourLeft?: string;
        rowFourRight?: string;
      }) => ReturnType;
    };
  }
}

type FieldConfig = {
  key: string;
  label: string;
  multiline?: boolean;
};

function createMarketingBlockEditor({
  node,
  editor,
  getPos,
  title,
  fields,
}: {
  node: any;
  editor: any;
  getPos: (() => number | undefined) | boolean;
  title: string;
  fields: FieldConfig[];
}) {
  const dom = document.createElement("div");
  dom.className = "marketing-block-editor";
  dom.setAttribute("data-editor-block", title);
  dom.contentEditable = "false";
  let currentAttrs = { ...node.attrs };
  const inputs = new Map<string, HTMLInputElement | HTMLTextAreaElement>();
  const editorControlEvents = [
    "mousedown",
    "mouseup",
    "click",
    "keydown",
    "keyup",
    "keypress",
    "copy",
    "cut",
    "paste",
    "selectstart",
  ];

  const header = document.createElement("div");
  header.className = "marketing-block-editor-header";

  const label = document.createElement("div");
  label.className = "marketing-block-editor-title";
  label.textContent = title;

  const actions = document.createElement("div");
  actions.className = "marketing-block-editor-actions";

  const hint = document.createElement("span");
  hint.className = "marketing-block-editor-hint";
  hint.textContent = "Editable block";

  const duplicateButton = document.createElement("button");
  duplicateButton.type = "button";
  duplicateButton.className = "marketing-block-editor-action";
  duplicateButton.textContent = "Duplicate";
  duplicateButton.setAttribute("aria-label", `Duplicate ${title}`);

  const moveUpButton = document.createElement("button");
  moveUpButton.type = "button";
  moveUpButton.className = "marketing-block-editor-action";
  moveUpButton.textContent = "Move Up";
  moveUpButton.setAttribute("aria-label", `Move ${title} up`);

  const moveDownButton = document.createElement("button");
  moveDownButton.type = "button";
  moveDownButton.className = "marketing-block-editor-action";
  moveDownButton.textContent = "Move Down";
  moveDownButton.setAttribute("aria-label", `Move ${title} down`);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className =
    "marketing-block-editor-action marketing-block-editor-action-danger";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${title}`);

  actions.append(hint, moveUpButton, moveDownButton, duplicateButton, deleteButton);

  header.append(label, actions);
  dom.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "marketing-block-editor-grid";

  const updateAttribute = (key: string, value: string) => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    if (pos === undefined || pos === null) return;

    editor.commands.command(({ tr }: { tr: any }) => {
      currentAttrs = {
        ...currentAttrs,
        [key]: value,
      };
      tr.setNodeMarkup(pos, undefined, {
        ...currentAttrs,
      });
      return true;
    });
  };

  const duplicateBlock = () => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    if (pos === undefined || pos === null) return;

    editor.commands.insertContentAt(pos + node.nodeSize, {
      type: node.type.name,
      attrs: { ...currentAttrs },
    });
  };

  const moveBlock = (direction: "up" | "down") => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    if (pos === undefined || pos === null) return;

    editor.commands.command(({ tr, state }: { tr: any; state: any }) => {
      const currentNode = state.doc.nodeAt(pos);
      if (!currentNode) return false;

      if (direction === "up") {
        let previousPos: number | null = null;
        let previousNode: any = null;

        state.doc.forEach((child: any, offset: number) => {
          if (offset < pos) {
            previousPos = offset;
            previousNode = child;
          }
        });

        if (previousPos === null || !previousNode) return false;

        tr.delete(pos, pos + currentNode.nodeSize);
        tr.insert(previousPos, currentNode);
        return true;
      }

      const nextPos = pos + currentNode.nodeSize;
      const nextNode = state.doc.nodeAt(nextPos);
      if (!nextNode) return false;

      tr.delete(nextPos, nextPos + nextNode.nodeSize);
      tr.insert(pos, nextNode);
      return true;
    });
  };

  const deleteBlock = async () => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    if (pos === undefined || pos === null) return;
    const confirmed = await showAdminConfirmDialog({
      title: `Delete ${title}`,
      itemName: title,
      consequence: "This removes the block from the editor content.",
      confirmLabel: "Delete Block",
    });
    if (!confirmed) return;

    editor.commands.deleteRange({
      from: pos,
      to: pos + node.nodeSize,
    });
  };

  duplicateButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    duplicateBlock();
  });

  moveUpButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    moveBlock("up");
  });

  moveDownButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    moveBlock("down");
  });

  deleteButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    deleteBlock();
  });

  [moveUpButton, moveDownButton, duplicateButton, deleteButton].forEach((button) => {
    editorControlEvents.forEach((eventName) => {
      button.addEventListener(eventName, (event) => event.stopPropagation());
    });
  });

  fields.forEach((field) => {
    const fieldWrap = document.createElement("label");
    fieldWrap.className = field.multiline
      ? "marketing-block-editor-field marketing-block-editor-field-full"
      : "marketing-block-editor-field";

    const fieldLabel = document.createElement("span");
    fieldLabel.textContent = field.label;

    const input = field.multiline
      ? document.createElement("textarea")
      : document.createElement("input");
    input.value = String(node.attrs[field.key] || "");
    inputs.set(field.key, input);
    input.setAttribute("aria-label", field.label);
    if (!field.multiline) {
      input.setAttribute("type", "text");
    }

    input.addEventListener("input", () => updateAttribute(field.key, input.value));
    editorControlEvents.forEach((eventName) => {
      input.addEventListener(eventName, (event) => event.stopPropagation());
    });

    fieldWrap.append(fieldLabel, input);
    grid.appendChild(fieldWrap);
  });

  dom.appendChild(grid);

  return {
    dom,
    update(updatedNode: any) {
      currentAttrs = { ...updatedNode.attrs };
      inputs.forEach((input, key) => {
        if (document.activeElement === input) return;
        input.value = String(currentAttrs[key] || "");
      });
      return updatedNode.type.name === node.type.name;
    },
    stopEvent(event: Event) {
      const target = event.target;
      return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLLabelElement
      );
    },
  };
}

function createCtaPreview(attrs: Record<string, string>) {
  const dom = document.createElement("section");
  dom.className = "public-cta-block";
  dom.setAttribute("data-type", "cta-block");

  const copy = document.createElement("div");
  copy.className = "public-cta-block-copy";

  const eyebrow = document.createElement("div");
  eyebrow.className = "public-cta-block-eyebrow";
  eyebrow.textContent = attrs.eyebrow || "Ready to practice?";

  const title = document.createElement("h3");
  title.textContent = attrs.title || "Start your practice session";

  const description = document.createElement("p");
  description.textContent =
    attrs.description ||
    "Choose a subject, answer exam-style questions, and review explanations.";

  const link = document.createElement("a");
  link.className = "public-cta-block-button";
  link.href = attrs.buttonHref || "#";
  link.textContent = attrs.buttonLabel || "Start Practice";

  copy.append(eyebrow, title, description);
  dom.append(copy, link);
  return dom;
}

function createInternalLinkPreview(attrs: Record<string, string>) {
  const dom = document.createElement("aside");
  dom.className = "public-internal-link-card";
  dom.setAttribute("data-type", "internal-link-card");

  const icon = document.createElement("div");
  icon.className = "public-internal-link-card-icon";
  icon.textContent = "Open";

  const copy = document.createElement("div");
  copy.className = "public-internal-link-card-copy";

  const title = document.createElement("h3");
  title.textContent = attrs.title || "Related practice page";

  const description = document.createElement("p");
  description.textContent =
    attrs.description || "Continue with a related NursingMocks practice page.";

  const link = document.createElement("a");
  link.href = attrs.linkHref || "#";
  link.textContent = attrs.linkLabel || "View Practice Page";

  copy.append(title, description, link);
  dom.append(icon, copy);
  return dom;
}

function createFaqContentPreview(attrs: Record<string, string>) {
  const dom = document.createElement("aside");
  dom.className = "public-faq-content-block";
  dom.setAttribute("data-type", "faq-content-block");

  const badge = document.createElement("div");
  badge.className = "public-faq-content-block-badge";
  badge.textContent = "Question";

  const question = document.createElement("h3");
  question.textContent = attrs.question || "Common student question";

  const answer = document.createElement("p");
  answer.textContent =
    attrs.answer ||
    "Add a clear answer that helps students understand the topic without needing another page.";

  dom.append(badge, question, answer);
  return dom;
}

function createComparisonTablePreview(attrs: Record<string, string>) {
  const dom = document.createElement("section");
  dom.className = "public-comparison-table-block";
  dom.setAttribute("data-type", "comparison-table-block");

  const title = document.createElement("h3");
  title.textContent = attrs.title || "Comparison table";

  const table = document.createElement("div");
  table.className = "public-comparison-table";

  const header = document.createElement("div");
  header.className = "public-comparison-table-row public-comparison-table-head";

  const headerOne = document.createElement("div");
  headerOne.textContent = attrs.columnOneHeading || "Option";

  const headerTwo = document.createElement("div");
  headerTwo.textContent = attrs.columnTwoHeading || "What it means";

  header.append(headerOne, headerTwo);
  table.appendChild(header);

  [
    [attrs.rowOneLeft, attrs.rowOneRight],
    [attrs.rowTwoLeft, attrs.rowTwoRight],
    [attrs.rowThreeLeft, attrs.rowThreeRight],
    [attrs.rowFourLeft, attrs.rowFourRight],
  ].forEach(([left, right]) => {
    if (!left && !right) return;
    const row = document.createElement("div");
    row.className = "public-comparison-table-row";

    const leftCell = document.createElement("div");
    leftCell.textContent = left || "";

    const rightCell = document.createElement("div");
    rightCell.textContent = right || "";

    row.append(leftCell, rightCell);
    table.appendChild(row);
  });

  dom.append(title, table);
  return dom;
}

export const CtaBlock = Node.create<MarketingBlockOptions>({
  name: "ctaBlock",
  group: "block",
  defining: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      eyebrow: {
        default: "Ready to practice?",
        parseHTML: (element) => element.getAttribute("data-eyebrow"),
        renderHTML: (attributes) => ({ "data-eyebrow": attributes.eyebrow }),
      },
      title: {
        default: "Start your practice session",
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => ({ "data-title": attributes.title }),
      },
      description: {
        default: "Choose a subject, answer exam-style questions, and review explanations.",
        parseHTML: (element) => element.getAttribute("data-description"),
        renderHTML: (attributes) => ({ "data-description": attributes.description }),
      },
      buttonLabel: {
        default: "Start Practice",
        parseHTML: (element) => element.getAttribute("data-button-label"),
        renderHTML: (attributes) => ({ "data-button-label": attributes.buttonLabel }),
      },
      buttonHref: {
        default: "#",
        parseHTML: (element) => element.getAttribute("data-button-href"),
        renderHTML: (attributes) => ({ "data-button-href": attributes.buttonHref }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-type="cta-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const eyebrow = HTMLAttributes.eyebrow || "Ready to practice?";
    const title = HTMLAttributes.title || "Start your practice session";
    const description =
      HTMLAttributes.description ||
      "Choose a subject, answer exam-style questions, and review explanations.";
    const buttonLabel = HTMLAttributes.buttonLabel || "Start Practice";
    const buttonHref = HTMLAttributes.buttonHref || "#";

    return [
      "section",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "cta-block",
        class: "public-cta-block",
      }),
      ["div", { class: "public-cta-block-copy" },
        ["div", { class: "public-cta-block-eyebrow" }, eyebrow],
        ["h3", {}, title],
        ["p", {}, description],
      ],
      ["a", { class: "public-cta-block-button", href: buttonHref }, buttonLabel],
    ];
  },

  addCommands() {
    return {
      setCtaBlock:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      if (!editor.isEditable) {
        return { dom: createCtaPreview(node.attrs) };
      }

      return createMarketingBlockEditor({
        node,
        editor,
        getPos,
        title: "CTA Block",
        fields: [
          { key: "eyebrow", label: "Eyebrow" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", multiline: true },
          { key: "buttonLabel", label: "Button Label" },
          { key: "buttonHref", label: "Button URL" },
        ],
      });
    };
  },
});

export const InternalLinkCard = Node.create<MarketingBlockOptions>({
  name: "internalLinkCard",
  group: "block",
  defining: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      title: {
        default: "Related practice page",
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => ({ "data-title": attributes.title }),
      },
      description: {
        default: "Continue with a related NursingMocks practice page.",
        parseHTML: (element) => element.getAttribute("data-description"),
        renderHTML: (attributes) => ({ "data-description": attributes.description }),
      },
      linkLabel: {
        default: "View Practice Page",
        parseHTML: (element) => element.getAttribute("data-link-label"),
        renderHTML: (attributes) => ({ "data-link-label": attributes.linkLabel }),
      },
      linkHref: {
        default: "#",
        parseHTML: (element) => element.getAttribute("data-link-href"),
        renderHTML: (attributes) => ({ "data-link-href": attributes.linkHref }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="internal-link-card"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || "Related practice page";
    const description =
      HTMLAttributes.description || "Continue with a related NursingMocks practice page.";
    const linkLabel = HTMLAttributes.linkLabel || "View Practice Page";
    const linkHref = HTMLAttributes.linkHref || "#";

    return [
      "aside",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "internal-link-card",
        class: "public-internal-link-card",
      }),
      ["div", { class: "public-internal-link-card-icon" }, "Open"],
      ["div", { class: "public-internal-link-card-copy" },
        ["h3", {}, title],
        ["p", {}, description],
        ["a", { href: linkHref }, linkLabel],
      ],
    ];
  },

  addCommands() {
    return {
      setInternalLinkCard:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      if (!editor.isEditable) {
        return { dom: createInternalLinkPreview(node.attrs) };
      }

      return createMarketingBlockEditor({
        node,
        editor,
        getPos,
        title: "Internal Link Card",
        fields: [
          { key: "title", label: "Exact Page Name" },
          { key: "description", label: "Description", multiline: true },
          { key: "linkLabel", label: "Link Label" },
          { key: "linkHref", label: "Page URL" },
        ],
      });
    };
  },
});

export const FaqContentBlock = Node.create<MarketingBlockOptions>({
  name: "faqContentBlock",
  group: "block",
  defining: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      question: {
        default: "Common student question",
        parseHTML: (element) => element.getAttribute("data-question"),
        renderHTML: (attributes) => ({ "data-question": attributes.question }),
      },
      answer: {
        default:
          "Add a clear answer that helps students understand the topic without needing another page.",
        parseHTML: (element) => element.getAttribute("data-answer"),
        renderHTML: (attributes) => ({ "data-answer": attributes.answer }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="faq-content-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const question = HTMLAttributes.question || "Common student question";
    const answer =
      HTMLAttributes.answer ||
      "Add a clear answer that helps students understand the topic without needing another page.";

    return [
      "aside",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "faq-content-block",
        class: "public-faq-content-block",
      }),
      ["div", { class: "public-faq-content-block-badge" }, "Question"],
      ["h3", {}, question],
      ["p", {}, answer],
    ];
  },

  addCommands() {
    return {
      setFaqContentBlock:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      if (!editor.isEditable) {
        return { dom: createFaqContentPreview(node.attrs) };
      }

      return createMarketingBlockEditor({
        node,
        editor,
        getPos,
        title: "FAQ Content Block",
        fields: [
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", multiline: true },
        ],
      });
    };
  },
});

export const ComparisonTableBlock = Node.create<MarketingBlockOptions>({
  name: "comparisonTableBlock",
  group: "block",
  defining: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    const textAttribute = (key: string, dataName: string, defaultValue: string) => ({
      default: defaultValue,
      parseHTML: (element: HTMLElement) => element.getAttribute(`data-${dataName}`),
      renderHTML: (attributes: Record<string, string>) => ({
        [`data-${dataName}`]: attributes[key],
      }),
    });

    return {
      title: textAttribute("title", "title", "Comparison table"),
      columnOneHeading: textAttribute("columnOneHeading", "column-one-heading", "Option"),
      columnTwoHeading: textAttribute("columnTwoHeading", "column-two-heading", "What it means"),
      rowOneLeft: textAttribute("rowOneLeft", "row-one-left", "First item"),
      rowOneRight: textAttribute("rowOneRight", "row-one-right", "Short explanation for the first item."),
      rowTwoLeft: textAttribute("rowTwoLeft", "row-two-left", "Second item"),
      rowTwoRight: textAttribute("rowTwoRight", "row-two-right", "Short explanation for the second item."),
      rowThreeLeft: textAttribute("rowThreeLeft", "row-three-left", ""),
      rowThreeRight: textAttribute("rowThreeRight", "row-three-right", ""),
      rowFourLeft: textAttribute("rowFourLeft", "row-four-left", ""),
      rowFourRight: textAttribute("rowFourRight", "row-four-right", ""),
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-type="comparison-table-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const rows = [
      [HTMLAttributes.rowOneLeft, HTMLAttributes.rowOneRight],
      [HTMLAttributes.rowTwoLeft, HTMLAttributes.rowTwoRight],
      [HTMLAttributes.rowThreeLeft, HTMLAttributes.rowThreeRight],
      [HTMLAttributes.rowFourLeft, HTMLAttributes.rowFourRight],
    ].filter(([left, right]) => left || right);

    return [
      "section",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "comparison-table-block",
        class: "public-comparison-table-block",
      }),
      ["h3", {}, HTMLAttributes.title || "Comparison table"],
      [
        "div",
        { class: "public-comparison-table" },
        [
          "div",
          { class: "public-comparison-table-row public-comparison-table-head" },
          ["div", {}, HTMLAttributes.columnOneHeading || "Option"],
          ["div", {}, HTMLAttributes.columnTwoHeading || "What it means"],
        ],
        ...rows.map(([left, right]) => [
          "div",
          { class: "public-comparison-table-row" },
          ["div", {}, left || ""],
          ["div", {}, right || ""],
        ]),
      ],
    ];
  },

  addCommands() {
    return {
      setComparisonTableBlock:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      if (!editor.isEditable) {
        return { dom: createComparisonTablePreview(node.attrs) };
      }

      return createMarketingBlockEditor({
        node,
        editor,
        getPos,
        title: "Comparison Table Block",
        fields: [
          { key: "title", label: "Table Title" },
          { key: "columnOneHeading", label: "Column 1 Heading" },
          { key: "columnTwoHeading", label: "Column 2 Heading" },
          { key: "rowOneLeft", label: "Row 1 Left" },
          { key: "rowOneRight", label: "Row 1 Right", multiline: true },
          { key: "rowTwoLeft", label: "Row 2 Left" },
          { key: "rowTwoRight", label: "Row 2 Right", multiline: true },
          { key: "rowThreeLeft", label: "Row 3 Left" },
          { key: "rowThreeRight", label: "Row 3 Right", multiline: true },
          { key: "rowFourLeft", label: "Row 4 Left" },
          { key: "rowFourRight", label: "Row 4 Right", multiline: true },
        ],
      });
    };
  },
});
