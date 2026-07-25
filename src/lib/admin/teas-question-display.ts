import { atiFormatForQuestionTypeId } from "@/lib/admin/teas-bulk-upload-schema";

export function formatTeasOptionValue(option: unknown): string {
  if (option === null || option === undefined) return "";
  if (typeof option !== "object") return normalizeTeasDisplayHtml(String(option));
  if (Array.isArray(option)) return option.map(formatTeasOptionValue).filter(Boolean).join(" ");
  const record = option as Record<string, unknown>;
  return formatTeasOptionValue(
    record.choice ??
      record.text ??
      record.label ??
      record.answer ??
      record.value ??
      record.option ??
      record.content ??
      record.html ??
      ""
  );
}

export function normalizeTeasDisplayHtml(value: string) {
  return renderTeasExhibitImages(repairTeasTableHeaders(value))
    .replace(/&amp;#39;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;apos;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;quot;/gi, '"')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;nbsp;/gi, " ")
    .replace(/&nbsp;/gi, " ");
}

function renderTeasExhibitImages(value: string) {
  return value.replace(
    /<div\b([^>]*class=(["'])[^"']*\bteas-scan-exhibit\b[^"']*\2[^>]*)>([\s\S]*?)<\/div>/gi,
    (match, attributes: string, _quote: string, body: string) => {
      const imagePathMatch = body.match(/<p>\s*<strong>\s*Image path:\s*<\/strong>\s*([^<\s]+)\s*<\/p>/i);
      const dataImagePathMatch = attributes.match(/\sdata-image-path=(["'])(.*?)\1/i);
      const imagePath = imagePathMatch?.[1] || dataImagePathMatch?.[2] || "";
      if (!imagePath || body.includes("<img")) return match;
      const altMatch = body.match(/<p>\s*<strong>\s*Alt:\s*<\/strong>\s*([\s\S]*?)<\/p>/i);
      const titleMatch = body.match(/<p>\s*<strong>([^<]+):<\/strong>\s*<\/p>/i);
      const alt = stripHtml(altMatch?.[1] || titleMatch?.[1] || "Question exhibit image");
      const cleanedBody = body.replace(/<p\s+class=(["'])teas-scan-image-notice\1[\s\S]*?<\/p>/i, "");
      return `<div ${attributes}>${cleanedBody}<figure class="teas-scan-image-figure"><img src="${escapeHtmlAttribute(imagePath)}" alt="${escapeHtmlAttribute(alt)}" /></figure></div>`;
    }
  );
}

function stripHtml(value: string) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtmlAttribute(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function repairTeasTableHeaders(value: string) {
  return value.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
    const headerRowMatch = tableHtml.match(/<thead\b[^>]*>[\s\S]*?<tr\b[^>]*>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/i);
    const bodyRowMatch = tableHtml.match(/<tbody\b[^>]*>[\s\S]*?<tr\b[^>]*>([\s\S]*?)<\/tr>/i);
    if (!headerRowMatch || !bodyRowMatch) return tableHtml;

    const headerCells = headerRowMatch[1].match(/<th\b[^>]*>[\s\S]*?<\/th>/gi) || [];
    const bodyCells = bodyRowMatch[1].match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    let nextTableHtml = tableHtml;

    if (headerCells.length > 0 && bodyCells.length === headerCells.length + 1) {
      nextTableHtml = nextTableHtml.replace(
        /(<thead\b[^>]*>[\s\S]*?<tr\b[^>]*>)/i,
        '$1<th scope="col" class="teas-scan-empty-header" aria-label="Row labels">&#160;</th>'
      );
    }

    return nextTableHtml.replace(
      /<th\b([^>]*)>\s*<\/th>/gi,
      (_match, attributes: string) =>
        `<th${mergeClassAttribute(attributes, "teas-scan-empty-header")} aria-label="Row labels">&#160;</th>`
    );
  });
}

function mergeClassAttribute(attributes: string, className: string) {
  const normalizedAttributes = attributes || "";
  if (/\sclass\s*=/i.test(normalizedAttributes)) {
    return normalizedAttributes.replace(/\sclass=(["'])(.*?)\1/i, (_match, quote: string, classes: string) => {
      const nextClasses = classes.split(/\s+/).includes(className) ? classes : `${classes} ${className}`;
      return ` class=${quote}${nextClasses.trim()}${quote}`;
    });
  }
  return `${normalizedAttributes} class="${className}"`;
}

export function teasOptionTexts(options: unknown) {
  if (!options) return [];
  if (typeof options === "string") {
    try {
      return teasOptionTexts(JSON.parse(options));
    } catch {
      return [];
    }
  }
  if (Array.isArray(options)) return options.map(formatTeasOptionValue);
  if (typeof options === "object") {
    return Object.keys(options as Record<string, unknown>)
      .sort()
      .map((key) => formatTeasOptionValue((options as Record<string, unknown>)[key]));
  }
  return [];
}

export function teasQuestionTypeLabel(questionTypeId: number) {
  const format = atiFormatForQuestionTypeId(questionTypeId);
  if (format === "multiple_choice") return "Multiple Choice";
  if (format === "multiple_select") return "Multiple Select";
  if (format === "fill_in_blank") return "Fill-in-the-Blank";
  if (format === "hot_spot") return "Hot Spot";
  if (format === "ordered_response") return "Ordered Response";
  return `Type ${questionTypeId}`;
}
