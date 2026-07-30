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
  "text-decoration",
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

export const sanitizeAdminEditorHtml = (html: string) => {
  if (!html || typeof window === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("*").forEach((element) => {
    if (DISALLOWED_ELEMENTS.has(element.tagName.toLowerCase())) {
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
