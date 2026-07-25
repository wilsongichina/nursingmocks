export type AtiTeasQuestionFormat =
  | "multiple_choice"
  | "multiple_select"
  | "fill_in_blank"
  | "hot_spot"
  | "ordered_response";

export const ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID: Record<AtiTeasQuestionFormat, number> = {
  multiple_choice: 1,
  multiple_select: 2,
  fill_in_blank: 7,
  hot_spot: 9,
  ordered_response: 6,
};

export type TeasBulkUploadOption = {
  choice: string;
  reason?: string | null;
};

export type TeasBulkUploadQuestion = {
  id?: string | number;
  question: string;
  options?: Record<string, TeasBulkUploadOption | string>;
  correctAnswer: unknown;
  solution?: string;
  question_type_id: number;
  ati_format?: AtiTeasQuestionFormat;
  tabs?: unknown;
  match_option?: unknown;
  image_path?: string | null;
  units?: string | null;
  subquestions?: unknown[];
  scanLayout?: unknown;
  scanReview?: unknown;
};

export type TeasBulkUploadPayload = {
  questions: TeasBulkUploadQuestion[];
};

export type TeasBulkUploadValidationIssue = {
  path: string;
  message: string;
};

export type TeasBulkUploadValidationResult = {
  valid: boolean;
  errors: TeasBulkUploadValidationIssue[];
  warnings: TeasBulkUploadValidationIssue[];
};

export type TeasInlineImageReference = {
  path: string;
  src: string;
};

const VALID_QUESTION_TYPE_IDS = new Set(
  Object.values(ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID)
);

export function questionTypeIdForAtiFormat(format: AtiTeasQuestionFormat) {
  return ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID[format];
}

export function atiFormatForQuestionTypeId(questionTypeId: number): AtiTeasQuestionFormat | null {
  const entry = Object.entries(ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID).find(
    ([, value]) => value === questionTypeId
  );
  return (entry?.[0] as AtiTeasQuestionFormat | undefined) || null;
}

export function buildTeasBulkUploadPayload(
  questions: TeasBulkUploadQuestion[]
): TeasBulkUploadPayload {
  return { questions };
}

export function buildTeasBulkUploadQuestion(
  input: Omit<TeasBulkUploadQuestion, "question_type_id"> & {
    ati_format: AtiTeasQuestionFormat;
    question_type_id?: number;
  }
): TeasBulkUploadQuestion {
  return {
    ...input,
    question_type_id: input.question_type_id || questionTypeIdForAtiFormat(input.ati_format),
  };
}

export function validateTeasBulkUploadPayload(
  payload: unknown
): TeasBulkUploadValidationResult {
  const errors: TeasBulkUploadValidationIssue[] = [];
  const warnings: TeasBulkUploadValidationIssue[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ path: "$", message: "Expected an object with a questions array." }],
      warnings,
    };
  }

  const questions = (payload as { questions?: unknown }).questions;
  if (!Array.isArray(questions)) {
    return {
      valid: false,
      errors: [{ path: "$.questions", message: "Expected questions to be an array." }],
      warnings,
    };
  }

  questions.forEach((question, index) => {
    validateTeasBulkUploadQuestion(question, `$.questions[${index}]`, errors, warnings);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateTeasBulkUploadQuestion(
  question: unknown,
  path = "$",
  errors: TeasBulkUploadValidationIssue[] = [],
  warnings: TeasBulkUploadValidationIssue[] = []
) {
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    errors.push({ path, message: "Expected question to be an object." });
    return { errors, warnings };
  }

  const record = question as Partial<TeasBulkUploadQuestion> & {
    questionTypeId?: unknown;
    correct_answer?: unknown;
  };
  const questionTypeId = Number(record.question_type_id || record.questionTypeId || 1);
  const questionText = String(record.question || "").trim();
  const correctAnswer = record.correctAnswer ?? record.correct_answer;
  const optionLabels = optionLabelsFromBulkUploadOptions(record.options);
  const correctLabels = correctAnswerLabels(correctAnswer);
  const inlineImages = inlineImageReferencesForQuestion(record, path);

  if (!questionText) {
    errors.push({ path: `${path}.question`, message: "Question text is required." });
  }

  inlineImages.forEach((image) => {
    if (/^(data:|blob:)/i.test(image.src)) {
      warnings.push({
        path: image.path,
        message: "Inline images should use a saved public asset URL, not a temporary data/blob URL.",
      });
    }
  });

  if (!VALID_QUESTION_TYPE_IDS.has(questionTypeId)) {
    errors.push({
      path: `${path}.question_type_id`,
      message: "Question type must be one of the five ATI TEAS-compatible types: 1, 2, 6, 7, or 9.",
    });
  }

  if (correctLabels.length === 0 && !hasNonLabelAnswer(correctAnswer)) {
    errors.push({ path: `${path}.correctAnswer`, message: "Correct answer is required." });
  }

  if (questionTypeId === 1) {
    validateOptionCount(path, optionLabels, 4, 4, errors);
    validateSingleCorrectLabel(path, optionLabels, correctLabels, errors);
  } else if (questionTypeId === 2) {
    validateOptionCount(path, optionLabels, 4, Infinity, errors);
    if (correctLabels.length < 2) {
      errors.push({
        path: `${path}.correctAnswer`,
        message: "Multiple select questions require at least two correct answers.",
      });
    }
    validateCorrectLabelsExist(path, optionLabels, correctLabels, errors);
  } else if (questionTypeId === 7) {
    if (optionLabels.length > 0) {
      warnings.push({
        path: `${path}.options`,
        message: "Fill-in-the-blank questions do not need options; bulk upload allows them but they should usually be omitted.",
      });
    }
  } else if (questionTypeId === 9) {
    if (!String(record.image_path || "").trim()) {
      errors.push({
        path: `${path}.image_path`,
        message: "Hot spot questions require image_path.",
      });
    }
    if (!hasHotSpotAnswer(correctAnswer)) {
      errors.push({
        path: `${path}.correctAnswer`,
        message: "Hot spot questions require coordinate/range answer data.",
      });
    }
  } else if (questionTypeId === 6) {
    validateOptionCount(path, optionLabels, 4, 6, errors);
    if (correctLabels.length !== optionLabels.length) {
      errors.push({
        path: `${path}.correctAnswer`,
        message: "Ordered response correctAnswer must include every option label in order.",
      });
    }
    validateCorrectLabelsExist(path, optionLabels, correctLabels, errors);
  }

  return { errors, warnings };
}

export function inlineImageReferencesForQuestion(
  question: Partial<TeasBulkUploadQuestion>,
  path = "$"
): TeasInlineImageReference[] {
  const references: TeasInlineImageReference[] = [];
  extractImageSources(String(question.question || "")).forEach((src, index) => {
    references.push({ path: `${path}.question.img[${index}]`, src });
  });

  optionHtmlEntries(question.options).forEach(({ label, html }) => {
    extractImageSources(html).forEach((src, index) => {
      references.push({ path: `${path}.options.${label}.img[${index}]`, src });
    });
  });

  extractImageSources(String(question.solution || "")).forEach((src, index) => {
    references.push({ path: `${path}.solution.img[${index}]`, src });
  });

  return references;
}

function validateOptionCount(
  path: string,
  optionLabels: string[],
  min: number,
  max: number,
  errors: TeasBulkUploadValidationIssue[]
) {
  const maxMessage = Number.isFinite(max) ? ` and no more than ${max}` : "";
  if (optionLabels.length < min || optionLabels.length > max) {
    errors.push({
      path: `${path}.options`,
      message: `Expected at least ${min}${maxMessage} options.`,
    });
  }
}

function validateSingleCorrectLabel(
  path: string,
  optionLabels: string[],
  correctLabelsValue: string[],
  errors: TeasBulkUploadValidationIssue[]
) {
  if (correctLabelsValue.length !== 1) {
    errors.push({
      path: `${path}.correctAnswer`,
      message: "Multiple choice questions require exactly one correct answer label.",
    });
    return;
  }
  validateCorrectLabelsExist(path, optionLabels, correctLabelsValue, errors);
}

function validateCorrectLabelsExist(
  path: string,
  optionLabels: string[],
  correctLabelsValue: string[],
  errors: TeasBulkUploadValidationIssue[]
) {
  const optionLabelSet = new Set(optionLabels);
  const missing = correctLabelsValue.filter((label) => !optionLabelSet.has(label));
  if (missing.length > 0) {
    errors.push({
      path: `${path}.correctAnswer`,
      message: `Correct answer labels not found in options: ${missing.join(", ")}.`,
    });
  }
}

function optionLabelsFromBulkUploadOptions(options: unknown) {
  const parsed = parseMaybeJson(options);
  if (!parsed) return [];
  if (Array.isArray(parsed)) {
    return parsed.map((_, index) => String.fromCharCode(65 + index));
  }
  if (typeof parsed === "object") {
    return Object.keys(parsed as Record<string, unknown>)
      .map((label) => label.trim().toUpperCase())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }
  return [];
}

function optionHtmlEntries(options: unknown) {
  const parsed = parseMaybeJson(options);
  if (!parsed) return [];
  if (Array.isArray(parsed)) {
    return parsed.map((option, index) => ({
      label: String.fromCharCode(65 + index),
      html: optionHtmlValue(option),
    }));
  }
  if (typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>).map(([label, option]) => ({
      label: label.trim().toUpperCase(),
      html: optionHtmlValue(option),
    }));
  }
  return [];
}

function optionHtmlValue(option: unknown): string {
  if (option === null || option === undefined) return "";
  if (typeof option !== "object") return String(option);
  if (Array.isArray(option)) return option.map(optionHtmlValue).filter(Boolean).join(" ");
  const record = option as Record<string, unknown>;
  return optionHtmlValue(
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

function extractImageSources(html: string) {
  const sources: string[] = [];
  const imageTagPattern = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imageTagPattern.exec(html))) {
    const source = (match[1] || match[2] || match[3] || "").trim();
    if (source) sources.push(source);
  }
  return sources;
}

function correctAnswerLabels(answer: unknown) {
  const parsed = parseMaybeJson(answer);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
  }
  if (typeof parsed === "string") {
    return parsed
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => /^[A-Z]$/.test(item));
  }
  return [];
}

function hasNonLabelAnswer(answer: unknown) {
  if (answer === null || answer === undefined) return false;
  const parsed = parseMaybeJson(answer);
  if (Array.isArray(parsed)) return parsed.length > 0;
  if (typeof parsed === "string") return parsed.trim().length > 0;
  if (typeof parsed === "number" || typeof parsed === "boolean") return true;
  return Boolean(parsed && typeof parsed === "object" && Object.keys(parsed).length > 0);
}

function hasHotSpotAnswer(answer: unknown) {
  const parsed = parseNestedJson(answer);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    return (
      (Array.isArray(record.xRanges) && Array.isArray(record.yRanges)) ||
      (Array.isArray(record.areas) && record.areas.length > 0) ||
      (typeof record.target === "string" && record.target.trim().length > 0)
    );
  }
  return false;
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!/^[\[{"]/.test(trimmed)) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function parseNestedJson(value: unknown): unknown {
  let current = value;
  for (let index = 0; index < 4; index += 1) {
    const parsed = parseMaybeJson(current);
    if (parsed === current) break;
    current = parsed;
  }
  return current;
}
