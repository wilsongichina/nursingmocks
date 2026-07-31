const DISALLOWED_ELEMENTS = new Set([
  "script",
  "style",
  "meta",
  "link",
  "iframe",
  "object",
  "embed",
]);

const DISALLOWED_STYLE_PROPERTIES = new Set([
  "background",
  "background-color",
  "color",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-variant",
  "font-weight",
  "letter-spacing",
  "line-height",
  "mso-bidi-font-family",
  "mso-fareast-font-family",
  "mso-font-charset",
  "mso-style-name",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "text-align",
  "text-decoration",
  "text-indent",
]);

const WORD_HTML_PATTERN =
  /class="?Mso|mso-|Microsoft Word|WordDocument|urn:schemas-microsoft-com:office|xmlns:o=|<o:/i;

const TABLE_ELEMENTS = new Set([
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
  "caption",
]);

const TABLE_ATTRIBUTES = new Set([
  "colspan",
  "rowspan",
  "scope",
  "headers",
  "width",
  "height",
  "align",
  "valign",
]);

const shouldRemoveClass = (className: string) =>
  /^Mso/i.test(className) ||
  /^Apple-/i.test(className) ||
  /^gmail_/i.test(className) ||
  /^docs-/i.test(className);

const sanitizeStyleAttribute = (styleValue: string) => {
  const keptRules = styleValue
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .filter((rule) => {
      const [property] = rule.split(":");
      const normalizedProperty = property?.trim().toLowerCase();
      if (!normalizedProperty) return false;
      if (normalizedProperty.startsWith("mso-")) return false;
      return !DISALLOWED_STYLE_PROPERTIES.has(normalizedProperty);
    });

  return keptRules.join("; ");
};

const stripWordDocumentShell = (html: string) =>
  html
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<\/?(?:o|w|v|m):[^>]*>/gi, "")
    .replace(/<xml[\s\S]*?<\/xml>/gi, "");

const removeComments = (root: DocumentFragment) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];

  while (walker.nextNode()) {
    comments.push(walker.currentNode as Comment);
  }

  comments.forEach((comment) => comment.remove());
};

export const sanitizeAdminEditorHtml = (html: string) => {
  if (!html || typeof window === "undefined") return html;

  const isWordHtml = WORD_HTML_PATTERN.test(html);
  const template = document.createElement("template");
  template.innerHTML = isWordHtml ? stripWordDocumentShell(html) : html;

  removeComments(template.content);

  template.content.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName.includes(":") || DISALLOWED_ELEMENTS.has(tagName)) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (name === "style") {
        // Word/Office pastes include layout/font styles that override the
        // public template. Keep semantic tables, but remove external styling.
        if (isWordHtml && !TABLE_ELEMENTS.has(tagName)) {
          element.removeAttribute(attribute.name);
          return;
        }

        const sanitizedStyle = sanitizeStyleAttribute(value);
        if (sanitizedStyle) {
          element.setAttribute("style", sanitizedStyle);
        } else {
          element.removeAttribute("style");
        }
        return;
      }

      if (name === "class") {
        const cleanedClasses = value
          .split(/\s+/)
          .filter(Boolean)
          .filter((className) => !shouldRemoveClass(className));

        if (cleanedClasses.length > 0) {
          element.setAttribute("class", cleanedClasses.join(" "));
        } else {
          element.removeAttribute("class");
        }
        return;
      }

      if (isWordHtml && name.startsWith("xmlns")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (isWordHtml && !TABLE_ELEMENTS.has(tagName) && name === "align") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        isWordHtml &&
        TABLE_ELEMENTS.has(tagName) &&
        !TABLE_ATTRIBUTES.has(name) &&
        name !== "style" &&
        name !== "class"
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        name === "face" ||
        name === "size" ||
        name === "color" ||
        name === "bgcolor" ||
        name === "lang"
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
};

export const sanitizePlainTextPaste = (text: string) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trimEnd();

export const escapeHtmlText = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
