import {
  buildTeasBulkUploadPayload,
  type TeasBulkUploadPayload,
  type TeasBulkUploadQuestion,
} from "./teas-bulk-upload-schema";

type StructuredOcrQuestionColumn = {
  questionNumber?: unknown;
  headerLines?: unknown;
  passageTitle?: unknown;
  questionTitle?: unknown;
  promptLines?: unknown;
  promptHtmlLines?: unknown;
  passageLines?: unknown;
  passageHtmlLines?: unknown;
  exhibits?: unknown;
  choiceLines?: unknown;
  selectedAnswer?: unknown;
  selectedAnswerConfidenceRatio?: unknown;
  selectedAnswerScore?: unknown;
  layoutMode?: unknown;
  extractionModel?: unknown;
  questionTypeId?: unknown;
  warnings?: unknown;
};

type StructuredOcrExhibit = {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  placement?: unknown;
  inline?: unknown;
  requiresCrop?: unknown;
  alt?: unknown;
  imagePath?: unknown;
  headers?: unknown;
  rows?: unknown;
  textLines?: unknown;
  description?: unknown;
};

type StructuredOcrLine = {
  text?: unknown;
  left?: unknown;
  top?: unknown;
  right?: unknown;
  bottom?: unknown;
  region?: unknown;
  isUiText?: unknown;
};

type StructuredOcrRow = {
  text?: unknown;
  score?: unknown;
  left?: unknown;
  top?: unknown;
  right?: unknown;
  bottom?: unknown;
};

type StructuredOcrPage = {
  page?: unknown;
  fileName?: unknown;
  width?: unknown;
  height?: unknown;
  subject?: unknown;
  rows?: unknown;
  lines?: unknown;
  regionText?: {
    left_context?: unknown;
    question_column?: unknown;
  };
  questionColumn?: StructuredOcrQuestionColumn;
};

type StructuredOcrPayload = {
  pages?: unknown;
};

export type TeasStructuredOcrParseResult = {
  payload: TeasBulkUploadPayload;
  warnings: string[];
};

export function parseTeasStructuredOcrToBulkUploadPayload(
  structured: unknown
): TeasStructuredOcrParseResult {
  const warnings: string[] = [];
  const payload = structured as StructuredOcrPayload;
  const pages = Array.isArray(payload?.pages) ? (payload.pages as StructuredOcrPage[]) : [];

  if (pages.length === 0) {
    return {
      payload: buildTeasBulkUploadPayload([]),
      warnings: ["Structured OCR JSON must include a pages array."],
    };
  }

  const questions = pages
    .map((page, index) => pageToQuestion(page, index, warnings))
    .filter((question): question is TeasBulkUploadQuestion => Boolean(question));

  return {
    payload: buildTeasBulkUploadPayload(questions),
    warnings,
  };
}

function pageToQuestion(
  page: StructuredOcrPage,
  index: number,
  warnings: string[]
): TeasBulkUploadQuestion | null {
  const reviewWarnings: string[] = [];
  const addWarning = (message: string) => {
    warnings.push(message);
    reviewWarnings.push(message);
  };
  const recovered = recoverQuestionColumn(page);
  const promptLines = rejectMetadataLines(recovered.promptLines);
  const promptHtmlLines = rejectMetadataLines(htmlLineArray(page.questionColumn?.promptHtmlLines));
  const choiceLines = recovered.choiceLines;
  const subject = normalizeTeasSubject(page.subject);
  const questionNumber = cleanText(page.questionColumn?.questionNumber);
  const headerLines = stringArray(page.questionColumn?.headerLines);
  const separatedHeader = separateQuestionHeaderFields(headerLines, subject, questionNumber);
  const tableHeaderPromotion = tableHeaderPromotionForExhibits(
    separatedHeader.contentHeaderLines,
    page.questionColumn?.exhibits
  );
  const passageTitle = cleanContentTitle(page.questionColumn?.passageTitle);
  const questionTitle = cleanContentTitle(page.questionColumn?.questionTitle);
  const questionPassage = rejectMetadataLines(stringArray(page.questionColumn?.passageLines)).join("\n");
  const passageHtmlLines = withInlineTitle(
    rejectMetadataLines(htmlLineArray(page.questionColumn?.passageHtmlLines)),
    passageTitle
  );
  const promptHtmlLinesWithTitle = withInlineTitle(promptHtmlLines, questionTitle);
  const exhibits = structuredExhibits(page.questionColumn?.exhibits, tableHeaderPromotion.title);
  const rawPassage = questionPassage || cleanText(page.regionText?.left_context);
  const hasExplicitPassage = Boolean(questionPassage);
  const selectedAnswer = cleanText(page.questionColumn?.selectedAnswer).toUpperCase();
  const selectedAnswerConfidenceRatio = numberValue(page.questionColumn?.selectedAnswerConfidenceRatio);
  const selectedAnswerScore = numberValue(page.questionColumn?.selectedAnswerScore);
  const pageLabel = cleanText(page.fileName) || `page-${index + 1}`;
  const prompt = promptLines.join(" ");
  const explicitQuestionTypeId = numberValue(page.questionColumn?.questionTypeId);
  const questionTypeId = [1, 2, 6, 7, 9].includes(explicitQuestionTypeId)
    ? explicitQuestionTypeId
    : classifyQuestionType(prompt, choiceLines);
  const passage = passageForQuestion(rawPassage, prompt, choiceLines, subject, hasExplicitPassage);
  stringArray(page.questionColumn?.warnings)
    .filter((warning) => !isIgnorableStructuredWarning(questionTypeId, warning))
    .forEach((warning) => addWarning(`${pageLabel} ${warning}`));

  if (promptLines.length === 0) {
    addWarning(`${pageLabel} has no detected prompt lines.`);
    return {
      id: `teas-structured-${index + 1}`,
      question: [
        headerLinesToHtml(separatedHeader.contentHeaderLines),
        `<p><strong>Manual review required:</strong> Gemini did not extract question text from this page.</p>`,
        `<p>Review source image ${escapeHtml(pageLabel)} and enter the question manually.</p>`,
      ]
        .filter(Boolean)
        .join(""),
      options: {},
      correctAnswer: selectedAnswer,
      solution: "",
      question_type_id: questionTypeId,
      ati_format: atiFormatForStructuredQuestionType(questionTypeId),
      scanLayout: scanLayoutFromPage(page),
      scanReview: {
        needsReview: true,
        warnings: reviewWarnings,
        layoutMode: cleanText(page.questionColumn?.layoutMode),
        extractionModel: cleanText(page.questionColumn?.extractionModel),
        choiceCount: choiceLines.length,
        promptLineCount: 0,
        selectedAnswer,
        selectedAnswerScore,
        selectedAnswerConfidenceRatio,
        sourceFileName: pageLabel,
        questionNumber,
        questionProgress: separatedHeader.questionProgress,
        examTitle: separatedHeader.examTitle,
        subject,
        hasPassage: Boolean(passage),
        exhibitCount: exhibits.length,
        imageExhibitCount: exhibits.filter((exhibit) => exhibit.type === "image" || exhibit.type === "chart").length,
        inlineExhibitCount: exhibits.filter((exhibit) => exhibit.inline).length,
        cropRequiredCount: exhibits.filter((exhibit) => exhibit.requiresCrop).length,
        sourceImageRequired: true,
      },
    };
  }
  if (
    questionTypeId !== 6 &&
    questionTypeId !== 7 &&
    !/[?]/.test(prompt) &&
    !recovered.boundaryRecovered &&
    choiceLines.length !== 4
  ) {
    addWarning(`${pageLabel} prompt does not include a question mark; review the prompt boundaries.`);
  }
  if (/^[a-z]/.test(promptLines[0] || "")) {
    addWarning(`${pageLabel} prompt starts mid-sentence; review for a continuation or cropped question.`);
  }
  if (questionTypeId === 6) {
    if (choiceLines.length < 4 || choiceLines.length > 6) {
      addWarning(`${pageLabel} ordered response expected 4-6 choices but found ${choiceLines.length}.`);
    }
  } else if (questionTypeId === 7) {
    if (choiceLines.length > 0) {
      addWarning(`${pageLabel} fill-in-the-blank should not include multiple-choice options.`);
    }
  } else if (questionTypeId === 2) {
    if (choiceLines.length < 4) {
      addWarning(`${pageLabel} multiple select expected at least 4 choices but found ${choiceLines.length}.`);
    }
  } else if (choiceLines.length !== 4) {
    addWarning(`${pageLabel} expected 4 choices but found ${choiceLines.length}.`);
  }
  const selectedAnswerLabels = selectedAnswer
    .split(/[\s,;]+/)
    .map((label) => label.trim().toUpperCase())
    .filter((label) => /^[A-F]$/.test(label));
  if (questionTypeId === 2 && selectedAnswerLabels.length < 2) {
    addWarning(`${pageLabel} has no reliable selected answer marker.`);
  } else if (questionTypeId !== 2 && questionTypeId !== 6 && questionTypeId !== 7 && !/^[A-F]$/.test(selectedAnswer)) {
    addWarning(`${pageLabel} has no reliable selected answer marker.`);
  } else if (
    questionTypeId !== 6 &&
    questionTypeId !== 7 &&
    selectedAnswerScore > 0 &&
    selectedAnswerConfidenceRatio > 0 &&
    selectedAnswerConfidenceRatio < 1.25
  ) {
    addWarning(
      `${pageLabel} selected answer marker is low confidence (${selectedAnswerConfidenceRatio.toFixed(2)}x over runner-up).`
    );
  }

  const options: Record<string, { choice: string }> = {};
  choiceLines.slice(0, 6).forEach((choice, choiceIndex) => {
    options[String.fromCharCode(65 + choiceIndex)] = { choice };
  });
  const orderedLabels = choiceLines.slice(0, 6).map((_, choiceIndex) => String.fromCharCode(65 + choiceIndex));
  const usedExhibitIds = new Set<string>();
  const passageHtml = passage
    ? `<p><strong>Passage:</strong></p>${
        passageHtmlLines.length > 0
          ? htmlLinesToParagraphs(passageHtmlLines, exhibits, usedExhibitIds)
          : paragraphsToHtml([passageTitle, passage].filter(Boolean).join("\n"))
      }`
    : "";
  const promptHtml =
    promptHtmlLinesWithTitle.length > 0
      ? htmlLinesToParagraphs(promptHtmlLinesWithTitle, exhibits, usedExhibitIds)
      : promptLinesToHtml(questionTitle ? [questionTitle, ...promptLines] : promptLines);

  return {
    id: `teas-structured-${index + 1}`,
    question: [
      headerLinesToHtml(tableHeaderPromotion.remainingHeaderLines),
      exhibitsToHtml(exhibitsForPlacement(exhibits, usedExhibitIds, "before_passage")),
      passageHtml,
      exhibitsToHtml(exhibitsForPlacement(exhibits, usedExhibitIds, "inside_passage")),
      exhibitsToHtml(exhibitsForPlacement(exhibits, usedExhibitIds, "between_passage_and_question", "unknown")),
      exhibitsToHtml(exhibitsForPlacement(exhibits, usedExhibitIds, "inside_question")),
      promptHtml,
      exhibitsToHtml(exhibitsForPlacement(exhibits, usedExhibitIds, "after_question", "after_choices")),
    ]
      .filter(Boolean)
      .join(""),
    options,
    correctAnswer: questionTypeId === 6 ? orderedLabels : selectedAnswer,
    solution: "",
    question_type_id: questionTypeId,
    ati_format: atiFormatForStructuredQuestionType(questionTypeId),
    scanLayout: scanLayoutFromPage(page),
    scanReview: {
      needsReview: reviewWarnings.length > 0,
      warnings: reviewWarnings,
      layoutMode: cleanText(page.questionColumn?.layoutMode),
      extractionModel: cleanText(page.questionColumn?.extractionModel),
      choiceCount: choiceLines.length,
      promptLineCount: promptLines.length,
      selectedAnswer,
      selectedAnswerScore,
      selectedAnswerConfidenceRatio,
      sourceFileName: pageLabel,
      questionNumber,
      questionProgress: separatedHeader.questionProgress,
      examTitle: separatedHeader.examTitle,
      subject,
      hasPassage: Boolean(passage),
      exhibitCount: exhibits.length,
      imageExhibitCount: exhibits.filter((exhibit) => exhibit.type === "image" || exhibit.type === "chart").length,
      inlineExhibitCount: exhibits.filter((exhibit) => exhibit.inline).length,
      cropRequiredCount: exhibits.filter((exhibit) => exhibit.requiresCrop).length,
        sourceImageRequired: exhibits.some(exhibitRequiresSourceImage),
      },
  };
}

function isIgnorableStructuredWarning(questionTypeId: number, warning: string) {
  if (questionTypeId === 6) {
    return (
      /\bselected answer is not visually clear\b/i.test(warning) ||
      /\bselected answer is not visually marked\b/i.test(warning) ||
      /\bselected answer is not visibly clear\b/i.test(warning) ||
      /\bselected answer is not visibly indicated\b/i.test(warning) ||
      /\bno answer is visually selected\b/i.test(warning) ||
      /\bno single answer is explicitly selected\b/i.test(warning)
    );
  }
  if (questionTypeId === 2) {
    return (
      /\bexpected\s+4\s+choices\s+but\s+found\s+[4-6]\b/i.test(warning) ||
      /\bhas no reliable selected answer marker\b/i.test(warning)
    );
  }
  if (questionTypeId === 7) {
    return (
      /\bfill-in-the-blank question, so selectedAnswer is left empty\b/i.test(warning) ||
      /\bselected answer is left empty\b/i.test(warning) ||
      /\bselected answer is not visibly indicated\b/i.test(warning) ||
      /\bhas no reliable selected answer marker\b/i.test(warning)
    );
  }
  return false;
}

function atiFormatForStructuredQuestionType(questionTypeId: number): TeasBulkUploadQuestion["ati_format"] {
  if (questionTypeId === 2) return "multiple_select";
  if (questionTypeId === 6) return "ordered_response";
  if (questionTypeId === 7) return "fill_in_blank";
  if (questionTypeId === 9) return "hot_spot";
  return "multiple_choice";
}

function separateQuestionHeaderFields(headerLines: string[], subject: string, questionNumber: string) {
  let questionProgress = "";
  let examTitle = "";
  const contentHeaderLines: string[] = [];
  headerLines.forEach((line) => {
    const normalized = cleanText(line);
    if (!normalized) return;
    if (!questionProgress && /^question\s*:?\s*\d+\s+of\s+\d+$/i.test(normalized)) {
      questionProgress = normalized.replace(/^question\s*:?\s*/i, "");
      return;
    }
    if (!questionProgress && /^question\s+\d+\s+of\s+\d+$/i.test(normalized)) {
      questionProgress = normalized.replace(/^question\s+/i, "");
      return;
    }
    if (!examTitle && /^ati\s+teas/i.test(normalized)) {
      examTitle = normalized;
      return;
    }
    if (subject && normalized.toLowerCase() === `subject: ${subject}`.toLowerCase()) return;
    if (subject && normalized.toLowerCase() === subject.toLowerCase()) return;
    if (questionNumber && normalized.toLowerCase() === `question ${questionNumber}`.toLowerCase()) return;
    contentHeaderLines.push(normalized);
  });
  return { questionProgress, examTitle, contentHeaderLines };
}

function tableHeaderPromotionForExhibits(contentHeaderLines: string[], value: unknown) {
  const exhibits = Array.isArray(value) ? (value as StructuredOcrExhibit[]) : [];
  const firstTable = exhibits.find((exhibit) => cleanText(exhibit?.type).toLowerCase() === "table");
  const canPromote =
    contentHeaderLines.length > 0 &&
    firstTable &&
    !cleanText(firstTable.title) &&
    ["", "before_passage", "between_passage_and_question", "inside_question", "unknown"].includes(
      normalizeExhibitPlacement(firstTable.placement)
    );
  if (!canPromote) {
    return { title: "", remainingHeaderLines: contentHeaderLines };
  }
  return {
    title: contentHeaderLines[0],
    remainingHeaderLines: contentHeaderLines.slice(1),
  };
}

function recoverQuestionColumn(page: StructuredOcrPage) {
  const promptLines = stringArray(page.questionColumn?.promptLines);
  const choiceLines = stringArray(page.questionColumn?.choiceLines);
  if (choiceLines.length >= 4 && promptLines.join(" ").includes("?")) {
    return { promptLines, choiceLines, boundaryRecovered: false };
  }

  const lines = compactLines(page.lines)
    .filter((line) => line.text && !line.isUiText && ["left_context", "question_column"].includes(line.region))
    .sort((a, b) => a.top - b.top || a.left - b.left);
  const leftLines = mergeSameRowSplitLines(lines.filter((line) => line.region === "left_context"));
  const recoveredFromLeft = recoverFromLines(leftLines, promptLines, choiceLines);
  if (hasNumericChoices(recoveredFromLeft.choiceLines) && recoveredFromLeft.choiceLines.length >= 4) {
    return recoveredFromLeft;
  }

  const mergedLines = mergeSameRowSplitLines(lines);
  const recoveredFromMerged = recoverFromLines(mergedLines, promptLines, choiceLines);
  if (recoveredFromMerged.choiceLines.length > choiceLines.length) {
    return recoveredFromMerged;
  }

  if (recoveredFromLeft.choiceLines.length > choiceLines.length) {
    return recoveredFromLeft;
  }

  return { promptLines, choiceLines, boundaryRecovered: false };
}

function recoverFromLines(
  lines: Array<ReturnType<typeof compactLines>[number]>,
  promptLines: string[],
  choiceLines: string[]
) {
  const startIndex = lines.findIndex((line) => questionStartPattern(line.text));
  const content = lines.slice(startIndex >= 0 ? startIndex : 0).filter((line) => !calculatorArtifactLine(line.text));
  const questionMarkIndex = content.findIndex((line) => line.text.includes("?"));
  if (questionMarkIndex < 0) {
    const firstChoiceIndex = content.findIndex((line) => likelyAnswerChoiceLine(line.text));
    if (firstChoiceIndex > 0) {
      const recoveredChoiceLines = content
        .slice(firstChoiceIndex)
        .filter((line) => likelyAnswerChoiceLine(line.text))
        .map((line) => line.text)
        .slice(0, 6);
      if (recoveredChoiceLines.length > choiceLines.length) {
        return {
          promptLines: content.slice(0, firstChoiceIndex).map((line) => line.text),
          choiceLines: recoveredChoiceLines,
          boundaryRecovered: true,
        };
      }
    }
    return { promptLines, choiceLines, boundaryRecovered: false };
  }
  const recoveredPromptLines = content.slice(0, questionMarkIndex + 1).map((line) => line.text);
  const recoveredChoiceLines = content.slice(questionMarkIndex + 1).map((line) => line.text).slice(0, 6);
  if (recoveredChoiceLines.length > choiceLines.length) {
    return {
      promptLines: recoveredPromptLines,
      choiceLines: recoveredChoiceLines,
      boundaryRecovered: false,
    };
  }
  return { promptLines, choiceLines, boundaryRecovered: false };
}

function mergeSameRowSplitLines(lines: Array<ReturnType<typeof compactLines>[number]>) {
  const merged: Array<ReturnType<typeof compactLines>[number]> = [];
  for (const line of lines) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...line });
      continue;
    }
    const previousHeight = Math.max(1, previous.bottom - previous.top);
    const lineHeight = Math.max(1, line.bottom - line.top);
    const sameRow = Math.abs(line.top - previous.top) <= Math.max(10, Math.min(previousHeight, lineHeight) * 0.75);
    const closeEnough = line.left - previous.right <= 36;
    if (sameRow && closeEnough) {
      previous.text = cleanText(`${previous.text} ${line.text}`);
      previous.right = Math.max(previous.right, line.right);
      previous.bottom = Math.max(previous.bottom, line.bottom);
    } else {
      merged.push({ ...line });
    }
  }
  return merged;
}

function questionStartPattern(text: string) {
  return /\b(which|what|how|why|where|when|who|select|solve|calculate|identify|place|order|if|based)\b/i.test(
    text
  );
}

function likelyAnswerChoiceLine(text: string) {
  const normalized = cleanText(text);
  return (
    /^-?\d+(\.\d+)?\s*%$/.test(normalized) ||
    /^-?\d+\s*\/\s*\d+$/.test(normalized) ||
    /^-?\d+\.\d+$/.test(normalized) ||
    /^\$\s*\d{1,3}(,\d{3})*(\.\d+)?$/.test(normalized) ||
    /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(normalized)
  );
}

function hasNumericChoices(choiceLines: string[]) {
  return choiceLines.filter((choice) => likelyAnswerChoiceLine(choice)).length >= 4;
}

function calculatorArtifactLine(text: string) {
  const normalized = cleanText(text);
  return (
    /^[0-9+\-x÷*/=.\s]+$/i.test(normalized) &&
    !likelyAnswerChoiceLine(normalized) &&
    normalized.length <= 8
  );
}

function classifyQuestionType(prompt: string, choiceLines: string[]) {
  const normalized = prompt.toLowerCase();
  if (
    /\border\b/.test(normalized) ||
    /\bascending\b/.test(normalized) ||
    /\bleast to greatest\b/.test(normalized) ||
    /\bgreatest to least\b/.test(normalized) ||
    /move the options/.test(normalized) ||
    /selected order/.test(normalized)
  ) {
    return 6;
  }
  return choiceLines.length > 4 ? 6 : 1;
}

function passageForQuestion(
  passage: string,
  prompt: string,
  choiceLines: string[],
  subject: string,
  hasExplicitPassage: boolean
) {
  if (!passage) return "";

  // TEAS Math screens often use the full page width, so the left region can be
  // only a sliced copy of the question/options instead of a real passage.
  if (!hasExplicitPassage && subject.toLowerCase() === "mathematics") return "";

  const normalizedPassage = comparableText(passage);
  const normalizedPrompt = comparableText(prompt);
  const overlapsPrompt =
    normalizedPrompt.length > 40 &&
    (normalizedPassage.includes(normalizedPrompt.slice(0, 40)) ||
      normalizedPrompt.includes(normalizedPassage.slice(0, 40)));
  const choiceOverlapCount = choiceLines.filter((choice) =>
    normalizedPassage.includes(comparableText(choice).slice(0, 24))
  ).length;

  if (overlapsPrompt || choiceOverlapCount >= 2) {
    return "";
  }

  return passage;
}

function comparableText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scanLayoutFromPage(page: StructuredOcrPage) {
  return {
    page: numberValue(page.page) || null,
    fileName: cleanText(page.fileName),
    width: numberValue(page.width) || null,
    height: numberValue(page.height) || null,
    subject: cleanText(page.subject),
    regionText: page.regionText || {},
    questionColumn: page.questionColumn || {},
    lines: compactLines(page.lines),
    rows: compactRows(page.rows),
  };
}

function structuredExhibits(value: unknown, promotedTableTitle = "") {
  if (!Array.isArray(value)) return [];
  let promotedTitleUsed = false;
  return (value as StructuredOcrExhibit[])
    .map((exhibit) => {
      const record = exhibit && typeof exhibit === "object" ? exhibit : {};
      const type = cleanText(record.type).toLowerCase();
      const normalizedType = ["table", "chart", "image", "text"].includes(type) ? type : "text";
      const rawTextLines = stringArray(record.textLines);
      const tableFromTextLines = normalizedType === "table" ? tablePartsFromTextLines(rawTextLines) : null;
      const rawHeaders = stringArray(record.headers).length > 0 ? stringArray(record.headers) : tableFromTextLines?.headers || [];
      const rawRows = Array.isArray(record.rows) && record.rows.length > 0
        ? record.rows.map((row) => stringArray(row)).filter((row) => row.length > 0)
        : tableFromTextLines?.rows || [];
      const title = cleanText(record.title) || (!promotedTitleUsed && normalizedType === "table" ? promotedTableTitle : "");
      if (promotedTableTitle && title === promotedTableTitle && normalizedType === "table") promotedTitleUsed = true;
      const normalizedTable =
        normalizedType === "table" ? normalizeTableShape(rawHeaders, rawRows, title) : { headers: rawHeaders, rows: rawRows };
      return {
        id: cleanText(record.id),
        type: normalizedType,
        title,
        placement: normalizeExhibitPlacement(record.placement),
        inline: Boolean(record.inline) || ["chart", "image"].includes(normalizedType),
        requiresCrop: Boolean(record.requiresCrop) || ["chart", "image"].includes(normalizedType),
        alt: cleanText(record.alt || record.description || record.title),
        imagePath: cleanText(record.imagePath),
        headers: normalizedTable.headers,
        rows: normalizedTable.rows,
        textLines: tableFromTextLines ? [] : rawTextLines,
        description: cleanText(record.description),
      };
    })
    .filter((exhibit) => {
      return (
        exhibit.title ||
        exhibit.id ||
        exhibit.description ||
        exhibit.alt ||
        exhibit.headers.length > 0 ||
        exhibit.rows.length > 0 ||
        exhibit.textLines.length > 0
      );
    });
}

function normalizeTableShape(headers: string[], rows: string[][], title = "") {
  const widestRow = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const normalizedHeaders = removeDuplicateTableTitleHeader(headers, title);

  // When body rows have one extra leading label cell, add a blank header above that label column.
  if (normalizedHeaders.length > 0 && widestRow === normalizedHeaders.length + 1) {
    normalizedHeaders.unshift("");
  }
  const columnCount = Math.max(normalizedHeaders.length, widestRow);
  while (normalizedHeaders.length > 0 && normalizedHeaders.length < columnCount) {
    normalizedHeaders.push("");
  }

  const normalizedRows = rows.map((row) => {
    const nextRow = [...row];
    while (nextRow.length < columnCount) nextRow.push("");
    return nextRow;
  });

  return {
    headers: normalizedHeaders,
    rows: normalizedRows,
  };
}

function removeDuplicateTableTitleHeader(headers: string[], title: string) {
  const normalizedTitle = normalizeComparableTableText(title);
  const normalizedHeaders = [...headers];
  if (!normalizedTitle || normalizedHeaders.length === 0) return normalizedHeaders;

  if (normalizedHeaders.length === 1 && normalizeComparableTableText(normalizedHeaders[0]) === normalizedTitle) {
    return [];
  }
  if (
    normalizedHeaders.length === 2 &&
    !cleanText(normalizedHeaders[0]) &&
    normalizeComparableTableText(normalizedHeaders[1]) === normalizedTitle
  ) {
    return [];
  }
  return normalizedHeaders;
}

function normalizeComparableTableText(value: string) {
  return cleanText(value).replace(/[^\w%]+/g, " ").toLowerCase().trim();
}

function tablePartsFromTextLines(lines: string[]) {
  if (lines.length < 2) return null;
  const separator = lines.some((line) => line.includes("|")) ? "|" : lines.some((line) => line.includes(",")) ? "," : "";
  if (!separator) return null;
  const rows = lines
    .map((line) => line.split(separator).map((cell) => cleanText(cell)))
    .filter((row) => row.length > 1);
  if (rows.length < 2) return null;
  const columnCount = rows[0].length;
  if (rows.some((row) => Math.abs(row.length - columnCount) > 1)) return null;
  return {
    headers: rows[0],
    rows: rows.slice(1),
  };
}

function exhibitRequiresSourceImage(exhibit: ReturnType<typeof structuredExhibits>[number]) {
  if (exhibit.type === "image" || exhibit.type === "chart") return true;
  if (exhibit.type === "table") return exhibit.rows.length === 0 || exhibit.headers.length === 0;
  return false;
}

function compactLines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return (value as StructuredOcrLine[]).map((line) => ({
    text: cleanText(line.text),
    left: numberValue(line.left),
    top: numberValue(line.top),
    right: numberValue(line.right),
    bottom: numberValue(line.bottom),
    region: cleanText(line.region),
    isUiText: Boolean(line.isUiText),
  }));
}

function cleanContentTitle(value: unknown) {
  const title = cleanText(value);
  return isMetadataOnlyLine(title) ? "" : title;
}

function withInlineTitle(lines: string[], title: string) {
  if (!title) return lines;
  const firstText = cleanText((lines[0] || "").replace(/<[^>]+>/g, " "));
  if (firstText.toLowerCase() === title.toLowerCase()) return lines;
  return [`<strong>${escapeHtml(title)}</strong>`, ...lines];
}

function normalizeExhibitPlacement(value: unknown) {
  const placement = cleanText(value);
  return [
    "before_passage",
    "inside_passage",
    "between_passage_and_question",
    "inside_question",
    "after_question",
    "inside_choice",
    "after_choices",
    "unknown",
  ].includes(placement)
    ? placement
    : "unknown";
}

function compactRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return (value as StructuredOcrRow[]).map((row) => ({
    text: cleanText(row.text),
    score: numberValue(row.score),
    left: numberValue(row.left),
    top: numberValue(row.top),
    right: numberValue(row.right),
    bottom: numberValue(row.bottom),
  }));
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item)).filter(Boolean)
    : [];
}

function htmlLineArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => sanitizeInlineHtml(item)).filter(Boolean)
    : [];
}

function rejectMetadataLines(lines: string[]) {
  return lines.filter((line) => !isMetadataOnlyLine(line));
}

function isMetadataOnlyLine(value: string) {
  const text = cleanText(value.replace(/<[^>]+>/g, " "));
  return (
    /^ati\s+teas\b/i.test(text) ||
    /^subject:\s*(Reading|Mathematics|Science|English and Language Usage)?$/i.test(text) ||
    /^question\s*:?\s*\d+\s+of\s+\d+$/i.test(text)
  );
}

function cleanText(value: unknown) {
  return decodeCommonHtmlEntities(String(value || ""))
    .replace(/\s+/g, " ")
    .replace(/([a-z0-9])([.?!])([A-Z])/g, "$1$2 $3")
    .replace(/([A-Za-z]),([A-Za-z])/g, "$1, $2")
    .trim();
}

function normalizeTeasSubject(value: unknown) {
  const subject = cleanText(value);
  const normalized = subject.toLowerCase();
  if (normalized.includes("math")) return "Mathematics";
  if (normalized.includes("science")) return "Science";
  if (normalized.includes("english") || normalized.includes("language")) return "English and Language Usage";
  if (normalized.includes("read")) return "Reading";
  return subject;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function paragraphsToHtml(text: string) {
  return text
    .split(/\n{1,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function promptLinesToHtml(lines: string[]) {
  return lines
    .map((line) => cleanText(line))
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function headerLinesToHtml(lines: string[]) {
  return lines
    .map((line) => cleanText(line))
    .filter(Boolean)
    .map((line) => `<p><strong>${escapeHtml(line)}</strong></p>`)
    .join("");
}

function htmlLinesToParagraphs(
  lines: string[],
  exhibits: ReturnType<typeof structuredExhibits> = [],
  usedExhibitIds: Set<string> = new Set()
) {
  return lines
    .map((line) => sanitizeInlineHtml(line))
    .filter(Boolean)
    .map((line) => {
      if (/^<figure\s+data-exhibit-id="[^"]+"><\/figure>$/i.test(line)) {
        return replaceExhibitPlaceholders(line, exhibits, usedExhibitIds);
      }
      return replaceExhibitPlaceholders(`<p>${line}</p>`, exhibits, usedExhibitIds);
    })
    .join("");
}

function replaceExhibitPlaceholders(
  html: string,
  exhibits: ReturnType<typeof structuredExhibits>,
  usedExhibitIds: Set<string>
) {
  return html.replace(
    /<figure\s+data-exhibit-id="([^"]+)"><\/figure>/gi,
    (_match, exhibitId: string) => {
      const exhibit = exhibits.find((item) => item.id === exhibitId);
      if (!exhibit) return "";
      usedExhibitIds.add(exhibit.id);
      return exhibitToHtml(exhibit);
    }
  );
}

function exhibitsToHtml(exhibits: ReturnType<typeof structuredExhibits>) {
  if (exhibits.length === 0) return "";
  return exhibits.map(exhibitToHtml).join("");
}

function exhibitsForPlacement(
  exhibits: ReturnType<typeof structuredExhibits>,
  usedExhibitIds: Set<string>,
  ...placements: string[]
) {
  return exhibits.filter((exhibit) => {
    if (exhibit.id && usedExhibitIds.has(exhibit.id)) return false;
    return placements.includes(exhibit.placement);
  });
}

function exhibitToHtml(exhibit: ReturnType<typeof structuredExhibits>[number]) {
  const title = exhibit.title || titleForExhibitType(exhibit.type);
  const description = exhibit.description ? `<p>${escapeHtml(exhibit.description)}</p>` : "";
  const table =
    exhibit.type === "table" && (exhibit.headers.length > 0 || exhibit.rows.length > 0)
      ? tableToHtml(exhibit.headers, exhibit.rows)
      : "";
  const textLines =
    exhibit.textLines.length > 0 && !table
      ? promptLinesToHtml(exhibit.textLines)
      : "";
  const imageNotice =
    exhibit.type === "image" || exhibit.type === "chart"
      ? `<p class="teas-scan-image-notice"><strong>${escapeHtml(titleForExhibitType(exhibit.type))} required:</strong> ${escapeHtml(
          exhibit.description || "Review the source screenshot for this visual exhibit."
        )}</p>`
      : "";
  return [
    `<div class="teas-scan-exhibit" data-exhibit-type="${escapeHtml(exhibit.type)}" data-exhibit-id="${escapeHtml(exhibit.id)}" data-exhibit-placement="${escapeHtml(exhibit.placement)}">`,
    `<p><strong>${escapeHtml(title)}:</strong></p>`,
    description,
    imageNotice,
    table,
    textLines,
    "</div>",
  ].join("");
}

function tableToHtml(headers: string[], rows: string[][]) {
  const { headers: normalizedHeaders, rows: normalizedRows } = normalizeTableShape(headers, rows);
  const headerHtml =
    normalizedHeaders.length > 0
      ? `<thead><tr>${normalizedHeaders.map((header) => tableHeaderCellToHtml(header)).join("")}</tr></thead>`
      : "";
  const bodyHtml =
    normalizedRows.length > 0
      ? `<tbody>${normalizedRows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody>`
      : "";
  return `<div class="teas-scan-table-wrap"><table class="teas-scan-table">${headerHtml}${bodyHtml}</table></div>`;
}

function tableHeaderCellToHtml(header: string) {
  if (!cleanText(header)) {
    return `<th scope="col" class="teas-scan-empty-header" aria-label="Row labels">&#160;</th>`;
  }
  return `<th scope="col">${escapeHtml(header)}</th>`;
}

function titleForExhibitType(type: string) {
  if (type === "table") return "Table";
  if (type === "chart") return "Chart";
  if (type === "image") return "Image";
  return "Exhibit";
}

function sanitizeInlineHtml(value: unknown) {
  const placeholders: string[] = [];
  const withFigurePlaceholders = cleanFormattedText(value).replace(
    /<figure\s+data-exhibit-id=["']([a-z0-9_-]+)["']\s*><\/figure>/gi,
    (_match, exhibitId: string) => {
      const htmlTag = `<figure data-exhibit-id="${escapeHtml(exhibitId)}"></figure>`;
      placeholders.push(htmlTag);
      return `__TEAS_INLINE_HTML_${placeholders.length - 1}__`;
    }
  );
  const escaped = escapeHtml(withFigurePlaceholders);
  return escaped.replace(
    /&lt;(\/?(?:strong|em|sup|sub|br)\s*\/?)&gt;/gi,
    (_match, tag: string) => {
      const normalizedTag = tag.replace(/\s+/g, "").toLowerCase();
      const htmlTag = `<${normalizedTag}>`;
      placeholders.push(htmlTag);
      return `__TEAS_INLINE_HTML_${placeholders.length - 1}__`;
    }
  ).replace(/__TEAS_INLINE_HTML_(\d+)__/g, (_match, index: string) => placeholders[Number(index)] || "");
}

function cleanFormattedText(value: unknown) {
  return decodeCommonHtmlEntities(String(value || ""))
    .replace(/\s+/g, " ")
    .replace(/\s*(<br\s*\/?>)\s*/gi, "$1")
    .trim();
}

function decodeCommonHtmlEntities(value: string) {
  return value
    .replace(/&amp;#39;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;apos;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;quot;/gi, '"')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;nbsp;/gi, " ")
    .replace(/&nbsp;/gi, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
