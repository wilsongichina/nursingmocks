/**
 * Lightweight public Tiptap HTML renderer.
 *
 * Admin editors still use the full Tiptap editor. Public generated pages only
 * need saved HTML, so this renderer avoids loading @tiptap/react and editor
 * extensions on the public route.
 */

interface TiptapContentRendererProps {
  content: string;
  className?: string;
}

const MARKETING_BLOCK_TYPES = new Set([
  "cta-block",
  "internal-link-card",
  "faq-content-block",
  "comparison-table-block",
]);

const MARKETING_BLOCK_MARKERS = [
  'data-type="cta-block"',
  "data-type='cta-block'",
  'data-type="internal-link-card"',
  "data-type='internal-link-card'",
  'data-type="faq-content-block"',
  "data-type='faq-content-block'",
  'data-type="comparison-table-block"',
  "data-type='comparison-table-block'",
];

function hasMarketingBlockMarker(html: string) {
  return MARKETING_BLOCK_MARKERS.some((marker) => html.includes(marker));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeAttribute(value: string | undefined) {
  if (!value) return "";

  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i")
  );
  return decodeAttribute(match?.[1] ?? match?.[2]);
}

function normalizeHref(value: string) {
  const href = value.trim();
  if (!href) return "#";

  if (/^(javascript|data|vbscript):/i.test(href)) {
    return "#";
  }

  return href;
}

function hasRenderedBlockContent(innerHtml: string) {
  return innerHtml.replace(/<br\s*\/?>/gi, "").trim().length > 0;
}

function renderCtaBlock(openingTag: string) {
  const eyebrow = getAttribute(openingTag, "data-eyebrow") || "Ready to practice?";
  const title = getAttribute(openingTag, "data-title") || "Start your practice session";
  const description =
    getAttribute(openingTag, "data-description") ||
    "Choose a subject, answer practice questions, and review explanations.";
  const buttonLabel = getAttribute(openingTag, "data-button-label") || "Start Practice";
  const buttonHref = normalizeHref(getAttribute(openingTag, "data-button-href"));

  return `<section data-type="cta-block" class="public-cta-block">
    <div class="public-cta-block-copy">
      <div class="public-cta-block-eyebrow">${escapeHtml(eyebrow)}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
    <a class="public-cta-block-button" href="${escapeHtml(buttonHref)}">${escapeHtml(buttonLabel)}</a>
  </section>`;
}

function renderInternalLinkCard(openingTag: string) {
  const title = getAttribute(openingTag, "data-title") || "Related practice page";
  const description =
    getAttribute(openingTag, "data-description") ||
    "Continue with a related NursingMocks practice page.";
  const linkLabel = getAttribute(openingTag, "data-link-label") || "View Practice Page";
  const linkHref = normalizeHref(getAttribute(openingTag, "data-link-href"));

  return `<aside data-type="internal-link-card" class="public-internal-link-card">
    <div class="public-internal-link-card-icon">Open</div>
    <div class="public-internal-link-card-copy">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      <a href="${escapeHtml(linkHref)}">${escapeHtml(linkLabel)}</a>
    </div>
  </aside>`;
}

function renderFaqContentBlock(openingTag: string) {
  const question = getAttribute(openingTag, "data-question") || "Common student question";
  const answer =
    getAttribute(openingTag, "data-answer") ||
    "Review the answer before choosing your next practice activity.";

  return `<aside data-type="faq-content-block" class="public-faq-content-block">
    <div class="public-faq-content-block-badge">Question</div>
    <h3>${escapeHtml(question)}</h3>
    <p>${escapeHtml(answer)}</p>
  </aside>`;
}

function renderComparisonTableBlock(openingTag: string) {
  const title = getAttribute(openingTag, "data-title") || "Comparison table";
  const columnOneHeading = getAttribute(openingTag, "data-column-one-heading") || "Option";
  const columnTwoHeading =
    getAttribute(openingTag, "data-column-two-heading") || "What it means";
  const rows = [
    [
      getAttribute(openingTag, "data-row-one-left"),
      getAttribute(openingTag, "data-row-one-right"),
    ],
    [
      getAttribute(openingTag, "data-row-two-left"),
      getAttribute(openingTag, "data-row-two-right"),
    ],
    [
      getAttribute(openingTag, "data-row-three-left"),
      getAttribute(openingTag, "data-row-three-right"),
    ],
    [
      getAttribute(openingTag, "data-row-four-left"),
      getAttribute(openingTag, "data-row-four-right"),
    ],
  ].filter(([left, right]) => left || right);

  const renderedRows = rows
    .map(
      ([left, right]) =>
        `<div class="public-comparison-table-row"><div>${escapeHtml(left)}</div><div>${escapeHtml(right)}</div></div>`
    )
    .join("");

  return `<section data-type="comparison-table-block" class="public-comparison-table-block">
    <h3>${escapeHtml(title)}</h3>
    <div class="public-comparison-table">
      <div class="public-comparison-table-row public-comparison-table-head">
        <div>${escapeHtml(columnOneHeading)}</div>
        <div>${escapeHtml(columnTwoHeading)}</div>
      </div>
      ${renderedRows}
    </div>
  </section>`;
}

function renderMarketingBlock(openingTag: string, type: string) {
  if (type === "cta-block") return renderCtaBlock(openingTag);
  if (type === "internal-link-card") return renderInternalLinkCard(openingTag);
  if (type === "faq-content-block") return renderFaqContentBlock(openingTag);
  if (type === "comparison-table-block") return renderComparisonTableBlock(openingTag);
  return openingTag;
}

function renderEmptyMarketingBlocks(html: string) {
  // Most public article HTML does not contain legacy empty marketing block atoms.
  // Avoid running the broad block-matching regex on every generated page.
  if (!hasMarketingBlockMarker(html)) {
    return html;
  }

  return html.replace(
    /<(section|aside)\b(?=[^>]*\bdata-type=(["'])(cta-block|internal-link-card|faq-content-block|comparison-table-block)\2)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (fullMatch, tagName, _quote, type, attrs, innerHtml) => {
      if (!MARKETING_BLOCK_TYPES.has(type) || hasRenderedBlockContent(innerHtml)) {
        return fullMatch;
      }

      return renderMarketingBlock(`<${tagName}${attrs}>`, type);
    }
  );
}

function sanitizePublicHtml(html: string) {
  return renderEmptyMarketingBlocks(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, "")
    .replace(/\scontenteditable=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*(javascript|data|vbscript):[^"']*\2/gi, ' $1="#"');
}

export default function TiptapContentRenderer({
  content,
  className = "",
}: TiptapContentRendererProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      <div
        className="tiptap-editor tiptap-readonly"
        dangerouslySetInnerHTML={{ __html: sanitizePublicHtml(content) }}
      />
    </div>
  );
}
