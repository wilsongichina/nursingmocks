"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type WarningLevel = "warning" | "notice";

interface ContentQualityWarning {
  id: string;
  level: WarningLevel;
  title: string;
  detail: string;
}

interface ContentQualityWarningsProps {
  bodyContent: string;
  cardDescription?: string;
}

function textFromHtml(html: string) {
  if (typeof window === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() || "";
}

function cleanText(value: string | null | undefined) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function wordCount(value: string | null | undefined) {
  return cleanText(value).split(/\s+/).filter(Boolean).length;
}

function isMissingUrl(value: string | null | undefined) {
  const url = cleanText(value);
  return !url || url === "#";
}

function isGenericLabel(value: string | null | undefined) {
  return ["click here", "read more", "learn more", "view", "open", "view practice page"].includes(
    cleanText(value).toLowerCase()
  );
}

function getContentWarnings(
  bodyContent: string,
  cardDescription?: string
): ContentQualityWarning[] {
  if (typeof window === "undefined") return [];

  const doc = new DOMParser().parseFromString(bodyContent || "", "text/html");
  const warnings: ContentQualityWarning[] = [];
  const headings = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const h1Count = doc.body.querySelectorAll("h1").length;
  const emptyHeadings = headings.filter(
    (heading) => !heading.textContent?.replace(/\s+/g, " ").trim()
  );
  const headingsWithoutIds = headings.filter((heading) => !heading.getAttribute("id"));
  const longParagraphs = Array.from(doc.body.querySelectorAll("p")).filter((paragraph) => {
    const words = paragraph.textContent?.trim().split(/\s+/).filter(Boolean).length || 0;
    return words > 95;
  });
  const genericLinks = Array.from(doc.body.querySelectorAll("a")).filter((link) => {
    const label = link.textContent?.replace(/\s+/g, " ").trim().toLowerCase() || "";
    return ["click here", "read more", "learn more", "view", "open"].includes(label);
  });
  const fixedWidthTables = Array.from(doc.body.querySelectorAll("table")).filter((table) => {
    const style = table.getAttribute("style") || "";
    return /\bwidth\s*:\s*\d+px/i.test(style) || table.hasAttribute("width");
  });
  const ctaBlocks = Array.from(doc.body.querySelectorAll('[data-type="cta-block"]'));
  const internalLinkCards = Array.from(
    doc.body.querySelectorAll('[data-type="internal-link-card"]')
  );
  const faqBlocks = Array.from(doc.body.querySelectorAll('[data-type="faq-content-block"]'));
  const comparisonBlocks = Array.from(
    doc.body.querySelectorAll('[data-type="comparison-table-block"]')
  );
  const plainText = textFromHtml(bodyContent);

  if (h1Count > 0) {
    warnings.push({
      id: "body-h1",
      level: "warning",
      title: "Article body contains H1 headings",
      detail:
        "The public page template already owns the H1. Change body H1 headings to H2 so the live page keeps one clear main heading.",
    });
  }

  if (emptyHeadings.length > 0) {
    warnings.push({
      id: "empty-headings",
      level: "warning",
      title: "Empty headings found",
      detail:
        "Empty headings create confusing page sections for students and search engines. Remove them or add useful heading text.",
    });
  }

  if (longParagraphs.length > 0) {
    warnings.push({
      id: "long-paragraphs",
      level: "notice",
      title: "Long paragraphs may be hard to scan",
      detail:
        "Break long paragraphs into shorter blocks so mobile readers can move through the content more easily.",
    });
  }

  if (genericLinks.length > 0) {
    warnings.push({
      id: "generic-links",
      level: "warning",
      title: "Generic link text found",
      detail:
        "Use exact page names for internal links, such as ATI TEAS Math Practice Test, instead of labels like click here or learn more.",
    });
  }

  if (fixedWidthTables.length > 0) {
    warnings.push({
      id: "fixed-width-tables",
      level: "notice",
      title: "Fixed-width tables found",
      detail:
        "Fixed pixel widths can overflow on mobile. Use the Comparison Table block for simple two-column comparisons whenever possible.",
    });
  }

  const ctaBlocksWithBadUrls = ctaBlocks.filter((block) =>
    isMissingUrl(block.getAttribute("data-button-href"))
  );
  if (ctaBlocksWithBadUrls.length > 0) {
    warnings.push({
      id: "cta-missing-url",
      level: "warning",
      title: "CTA block needs a real URL",
      detail:
        "CTA blocks should not point to an empty URL or #. Add the exact destination route so the action works for students.",
    });
  }

  const ctaBlocksWithGenericLabels = ctaBlocks.filter((block) =>
    isGenericLabel(block.getAttribute("data-button-label"))
  );
  if (ctaBlocksWithGenericLabels.length > 0) {
    warnings.push({
      id: "cta-generic-label",
      level: "notice",
      title: "CTA label could be more specific",
      detail:
        "Use an action label that names the destination or task, such as Start ATI TEAS Math Practice, instead of a generic label.",
    });
  }

  const linkCardsWithBadUrls = internalLinkCards.filter((card) =>
    isMissingUrl(card.getAttribute("data-link-href"))
  );
  if (linkCardsWithBadUrls.length > 0) {
    warnings.push({
      id: "internal-link-missing-url",
      level: "warning",
      title: "Internal link card needs a real URL",
      detail:
        "Internal link cards should point to a real public route, not an empty URL or #.",
    });
  }

  const linkCardsWithGenericLabels = internalLinkCards.filter((card) =>
    isGenericLabel(card.getAttribute("data-link-label"))
  );
  if (linkCardsWithGenericLabels.length > 0) {
    warnings.push({
      id: "internal-link-generic-label",
      level: "warning",
      title: "Internal link card uses generic link text",
      detail:
        "Use the exact destination page name as the link label so students and search engines understand the relationship.",
    });
  }

  const linkCardsWithMismatch = internalLinkCards.filter((card) => {
    const title = cleanText(card.getAttribute("data-title")).toLowerCase();
    const label = cleanText(card.getAttribute("data-link-label")).toLowerCase();
    return title && label && title !== label;
  });
  if (linkCardsWithMismatch.length > 0) {
    warnings.push({
      id: "internal-link-label-mismatch",
      level: "notice",
      title: "Internal link label differs from the page name",
      detail:
        "For SEO-focused internal cards, keep the link label the same as the exact destination page name unless there is a clear reason.",
    });
  }

  const faqBlocksWithEmptyQuestions = faqBlocks.filter(
    (block) => !cleanText(block.getAttribute("data-question"))
  );
  if (faqBlocksWithEmptyQuestions.length > 0) {
    warnings.push({
      id: "faq-empty-question",
      level: "warning",
      title: "FAQ content block has an empty question",
      detail:
        "Inline FAQ blocks need a clear question so the answer has useful context inside the article.",
    });
  }

  const faqBlocksWithShortAnswers = faqBlocks.filter(
    (block) => wordCount(block.getAttribute("data-answer")) > 0 && wordCount(block.getAttribute("data-answer")) < 12
  );
  if (faqBlocksWithShortAnswers.length > 0) {
    warnings.push({
      id: "faq-short-answer",
      level: "notice",
      title: "FAQ content answer may be too short",
      detail:
        "Give inline FAQ answers enough detail to be useful. A one-line answer often reads like a placeholder.",
    });
  }

  const faqQuestions = faqBlocks
    .map((block) => cleanText(block.getAttribute("data-question")).toLowerCase())
    .filter(Boolean);
  const duplicateFaqQuestions = faqQuestions.filter(
    (question, index) => faqQuestions.indexOf(question) !== index
  );
  if (duplicateFaqQuestions.length > 0) {
    warnings.push({
      id: "faq-duplicate-question",
      level: "notice",
      title: "Duplicate FAQ content questions found",
      detail:
        "Avoid repeating the same inline FAQ question. Merge duplicates or make each question answer a distinct student concern.",
    });
  }

  const comparisonBlocksWithoutRows = comparisonBlocks.filter((block) => {
    const rows = [
      ["data-row-one-left", "data-row-one-right"],
      ["data-row-two-left", "data-row-two-right"],
      ["data-row-three-left", "data-row-three-right"],
      ["data-row-four-left", "data-row-four-right"],
    ];
    return !rows.some(([left, right]) => cleanText(block.getAttribute(left)) || cleanText(block.getAttribute(right)));
  });
  if (comparisonBlocksWithoutRows.length > 0) {
    warnings.push({
      id: "comparison-no-rows",
      level: "warning",
      title: "Comparison table has no real rows",
      detail:
        "Add at least one paired row so the comparison table gives students useful information.",
    });
  }

  const comparisonBlocksWithMissingHeadings = comparisonBlocks.filter(
    (block) =>
      !cleanText(block.getAttribute("data-title")) ||
      !cleanText(block.getAttribute("data-column-one-heading")) ||
      !cleanText(block.getAttribute("data-column-two-heading"))
  );
  if (comparisonBlocksWithMissingHeadings.length > 0) {
    warnings.push({
      id: "comparison-missing-headings",
      level: "warning",
      title: "Comparison table is missing a title or column heading",
      detail:
        "Comparison tables need a title and both column headings so the row content is easy to understand.",
    });
  }

  const comparisonBlocksWithLongRows = comparisonBlocks.filter((block) =>
    [
      "data-row-one-left",
      "data-row-one-right",
      "data-row-two-left",
      "data-row-two-right",
      "data-row-three-left",
      "data-row-three-right",
      "data-row-four-left",
      "data-row-four-right",
    ].some((attribute) => wordCount(block.getAttribute(attribute)) > 35)
  );
  if (comparisonBlocksWithLongRows.length > 0) {
    warnings.push({
      id: "comparison-long-rows",
      level: "notice",
      title: "Comparison table row text is long",
      detail:
        "Keep comparison rows short. Long explanations usually work better as normal paragraphs or FAQ content blocks.",
    });
  }

  if (headingsWithoutIds.length > 0) {
    warnings.push({
      id: "missing-heading-ids",
      level: "notice",
      title: "Some headings are missing IDs",
      detail:
        "Heading IDs help section links and semantic navigation. Add stable heading IDs for important article sections.",
    });
  }

  if (!cardDescription?.trim()) {
    warnings.push({
      id: "missing-card-description",
      level: "notice",
      title: "Card description is empty",
      detail:
        "Add a short card description so parent pages can show useful supporting copy without repeating the page title.",
    });
  }

  if (plainText && plainText.length < 250) {
    warnings.push({
      id: "thin-content",
      level: "notice",
      title: "Article body is very short",
      detail:
        "If this is a public money page, add enough useful content for students to understand the page and choose the next step.",
    });
  }

  return warnings;
}

export default function ContentQualityWarnings({
  bodyContent,
  cardDescription,
}: ContentQualityWarningsProps) {
  const warnings = useMemo(
    () => getContentWarnings(bodyContent, cardDescription),
    [bodyContent, cardDescription]
  );

  if (!warnings.length) {
    return (
      <div className="admin-info-tile mb-3 border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-900">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
          <div>
            <div className="admin-card-title text-emerald-950">No Content Quality Warnings</div>
            <p className="admin-helper mt-1 text-emerald-800">
              The article structure looks ready for public rendering.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-info-tile mb-3 border-amber-100 bg-amber-50/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="admin-card-title flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Content Quality Warnings
        </div>
        <span className="admin-status-badge admin-status-badge-amber">
          {warnings.length} {warnings.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {warnings.map((warning) => {
          const isWarning = warning.level === "warning";
          return (
            <div
              key={warning.id}
              className="admin-info-tile bg-white/90 p-3"
            >
              <div className="admin-field-label mb-1 flex items-center gap-1.5">
                {isWarning ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Info className="h-3.5 w-3.5 text-[var(--admin-accent)]" />
                )}
                {warning.title}
              </div>
              <p className="admin-helper">{warning.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
