import path from "path";
import { createHash } from "crypto";
import { access, mkdir, readdir, readFile, stat, writeFile } from "fs/promises";

const DEFAULT_NAXLEX_SOURCE_PATHS = ["C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex"];

const SUPPORTED_PUBLIC_QUESTION_TYPES = new Set(["1", "2", "3", "6", "7", "10", "11"]);
const NAXLEX_IMAGE_CACHE_DIR = path.join(process.cwd(), "public", "naxlex-images");
const NAXLEX_IMAGE_PUBLIC_PATH = "/naxlex-images";
const LEGACY_HOTSPOT_ARTWORK_CACHE_DIR = path.join(process.cwd(), "public", "naxlex-hotspot-artwork");
const LEGACY_HOTSPOT_ARTWORK_PUBLIC_PATH = "/naxlex-hotspot-artwork";

type RawQuestion = {
  id?: unknown;
  question?: unknown;
  question_type_id?: unknown;
  questionTypeId?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  correct_answer?: unknown;
  solution?: unknown;
  explanation?: unknown;
  tabs?: unknown;
  subquestions?: unknown;
  match_option?: unknown;
  image_path?: unknown;
  units?: unknown;
  subtopic?: unknown;
};

export type NaxlexQuestionTypeSample = {
  questionId: string;
  sourceName: string;
  fileName: string;
  relativePath: string;
  program: string;
  vendor: string;
  subject: string;
  prompt: string;
  optionShape: string;
  correctAnswerShape: string;
  hasTabs: boolean;
  hasSubquestions: boolean;
  hasMatchOption: boolean;
  hasImage: boolean;
  hasUnits: boolean;
};

export type NaxlexQuestionTypeRenderSample = {
  questionId: string;
  questionTypeId: string;
  sourceName: string;
  relativePath: string;
  program: string;
  vendor: string;
  subject: string;
  questionHtml: string;
  tabs: Array<{ label: string; html: string }>;
  options: Array<{ label: string; html: string }>;
  matchOptions: Array<{ label: string; html: string }>;
  dropdownGroups: Array<{
    label: string;
    displayLabel: string;
    options: Array<{ label: string; html: string }>;
  }>;
  dragDropGroups: Array<{
    label: string;
    displayLabel: string;
    options: Array<{ label: string; html: string }>;
    correctLabels: string[];
  }>;
  imagePath: string;
  imageSourceUrl: string;
  units: string;
  correctAnswer: string;
  correctAnswerMap: Record<string, string[]>;
  explanationHtml: string;
};

export type NaxlexQuestionTypeSummary = {
  questionTypeId: string;
  publicSupport: "supported" | "unsupported";
  questionCount: number;
  fileCount: number;
  sources: string[];
  programs: string[];
  vendors: string[];
  subjects: string[];
  subtopics: string[];
  optionShapes: Record<string, number>;
  correctAnswerShapes: Record<string, number>;
  featureCounts: {
    withTabs: number;
    withSubquestions: number;
    withMatchOption: number;
    withImage: number;
    withUnits: number;
  };
  sampleQuestions: NaxlexQuestionTypeSample[];
  renderSample?: NaxlexQuestionTypeRenderSample;
  renderSamples?: NaxlexQuestionTypeRenderSample[];
  sampleFiles: string[];
};

export type NaxlexQuestionTypeFileSummary = {
  sourceName: string;
  relativePath: string;
  fileName: string;
  program: string;
  vendor: string;
  subject: string;
  questionCount: number;
  questionTypes: Record<string, number>;
};

export type NaxlexQuestionTypeFolderSummary = {
  sourceName: string;
  relativePath: string;
  depth: number;
  childFolderCount: number;
  directJsonFileCount: number;
  branchJsonFileCount: number;
  isLeaf: boolean;
  sampleFiles: string[];
};

export type NaxlexImageSourceRecord = {
  questionId: string;
  questionTypeId: string;
  sourceName: string;
  relativePath: string;
  program: string;
  vendor: string;
  subject: string;
  questionHtml: string;
  imageSourceUrl: string;
  imagePath: string;
};

export type NaxlexQuestionTypeScanResult = {
  rootPath: string;
  sourceRoots: Array<{ sourceName: string; rootPath: string }>;
  scannedAt: string;
  totals: {
    foldersScanned: number;
    filesFound: number;
    filesScanned: number;
    questionsScanned: number;
    questionTypesFound: number;
    parseErrors: number;
  };
  questionTypes: NaxlexQuestionTypeSummary[];
  images: NaxlexImageSourceRecord[];
  folders: NaxlexQuestionTypeFolderSummary[];
  files: NaxlexQuestionTypeFileSummary[];
  errors: Array<{ relativePath: string; message: string }>;
};

type MutableQuestionTypeSummary = Omit<
  NaxlexQuestionTypeSummary,
  "sources" | "programs" | "vendors" | "subjects" | "subtopics" | "sampleFiles"
> & {
  filePaths: Set<string>;
  sources: Set<string>;
  programs: Set<string>;
  vendors: Set<string>;
  subjects: Set<string>;
  subtopics: Set<string>;
  sampleFiles: Set<string>;
};

function scanRootPath() {
  return "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex";
}

function scanSourcePaths() {
  // This scanner is intentionally local-development only by default. Set the
  // env var to a semicolon-delimited list if exports move to another path.
  const configured = process.env.NAXLEX_SCAN_SOURCE_PATHS;
  const paths = configured
    ? configured
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_NAXLEX_SOURCE_PATHS;

  return paths.map((rootPath) => ({
    rootPath,
    sourceName: path.basename(rootPath),
  }));
}

async function collectScanTargets(rootPath: string) {
  const files: string[] = [];
  const folders = new Set<string>(["."]);

  async function walk(currentPath: string) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        folders.add(path.relative(rootPath, entryPath) || ".");
        await walk(entryPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        files.push(entryPath);
      }
    }
  }

  await walk(rootPath);
  return {
    files: files.sort((a, b) => a.localeCompare(b)),
    folders: Array.from(folders).sort((a, b) => {
      const depthA = a === "." ? 0 : a.split(path.sep).length;
      const depthB = b === "." ? 0 : b.split(path.sep).length;
      return depthA - depthB || a.localeCompare(b);
    }),
  };
}

function asQuestionArray(parsed: unknown): RawQuestion[] {
  if (Array.isArray(parsed)) return parsed as RawQuestion[];
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { questions?: unknown }).questions)
  ) {
    return (parsed as { questions: RawQuestion[] }).questions;
  }
  return [];
}

function normalizeTypeId(question: RawQuestion) {
  const rawType = question.question_type_id ?? question.questionTypeId ?? "unknown";
  const typeId = String(rawType || "unknown").trim();
  return typeId || "unknown";
}

function isMeaningful(value: unknown) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== "null" && trimmed !== "[]";
  }
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}

function parseJsonString(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !/^[\[{"]/.test(trimmed)) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function classifyOptions(options: unknown) {
  if (!isMeaningful(options)) return "missing";
  const parsed = parseJsonString(options);
  if (Array.isArray(parsed)) return "array";
  if (parsed && typeof parsed === "object") {
    const keys = Object.keys(parsed);
    if (keys.some((key) => key.startsWith("dropdown-group-"))) {
      return "dropdown-groups";
    }
    if (keys.some((key) => key.startsWith("drag-drop-group-"))) {
      return "drag-drop-groups";
    }
    if (keys.every((key) => /^[A-H]$/i.test(key))) {
      return "lettered-options";
    }
    if (keys.length > 0) return "object";
  }
  if (typeof parsed === "string") return "string";
  return typeof parsed;
}

function classifyCorrectAnswer(answer: unknown) {
  if (!isMeaningful(answer)) return "missing";
  const parsed = parseJsonString(answer);
  if (Array.isArray(parsed)) return "array";
  if (parsed && typeof parsed === "object") {
    const keys = Object.keys(parsed);
    if (keys.some((key) => key.startsWith("dropdown-group-"))) {
      return "dropdown-map";
    }
    return "object-map";
  }
  return typeof parsed;
}

function optionTextForRender(option: unknown) {
  if (option === null || option === undefined) return "";
  if (typeof option === "string") return option.trim();
  if (typeof option === "number" || typeof option === "boolean") return String(option).trim();
  if (typeof option === "object") {
    const optionObject = option as Record<string, unknown>;
    const choice =
      optionObject.choice ??
      optionObject.exp ??
      optionObject.option ??
      optionObject.text ??
      optionObject.label ??
      optionObject.answer ??
      optionObject.value ??
      optionObject.html ??
      optionObject.content ??
      optionObject.body ??
      optionObject.title;
    if (choice !== undefined && choice !== null) return optionTextForRender(choice);
    const firstMeaningfulValue = Object.values(optionObject).find(
      (value) =>
        value !== null &&
        value !== undefined &&
        typeof value !== "object" &&
        String(value).trim().length > 0
    );
    if (firstMeaningfulValue !== undefined) return String(firstMeaningfulValue).trim();
  }
  return "";
}

function parseLetteredOptions(options: unknown) {
  const parsed = parseJsonString(options);
  if (Array.isArray(parsed)) {
    return parsed
      .map((option, index) => ({
        label: String.fromCharCode(65 + index),
        html: optionTextForRender(option),
      }))
      .filter((option) => option.html && option.html.toLowerCase() !== "none");
  }
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([key]) => /^[A-H]$/i.test(key))
      .map(([key, option]) => ({
        label: key.toUpperCase(),
        html: optionTextForRender(option),
      }))
      .filter((option) => option.html && option.html.toLowerCase() !== "none");
  }
  return [];
}

function parseHotSpotAnswer(answer: unknown) {
  const parsed = parseJsonString(answer);
  if (parsed && typeof parsed === "object") {
    return JSON.stringify(parsed, null, 2);
  }
  return String(answer || "");
}

function resolveNaxlexAssetUrl(value: unknown) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://naxlex.com/nursing/${trimmed.replace(/^\/+/, "")}`;
}

function extensionFromUrl(url: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (/^\.(png|jpe?g|gif|webp)$/i.test(ext)) return ext;
  } catch {
    // Fall back to jpg when the source URL cannot be parsed cleanly.
  }
  return ".jpg";
}

function sourceFileNameFromUrl(url: string) {
  try {
    const fileName = path.basename(decodeURIComponent(new URL(url).pathname));
    return fileName || "";
  } catch {
    return "";
  }
}

function imagePublicPath(fileName: string) {
  return `${NAXLEX_IMAGE_PUBLIC_PATH}/${encodeURIComponent(fileName)}`;
}

function imageNestedPublicPath(relativeFolderPath: string, fileName: string) {
  const encodedParts = relativeFolderPath
    .split(/[\\/]+/)
    .filter(Boolean)
    .map((part) => encodeURIComponent(part));
  return `${NAXLEX_IMAGE_PUBLIC_PATH}/${[...encodedParts, encodeURIComponent(fileName)].join("/")}`;
}

function cacheRelativeFolderPath(context: ReturnType<typeof pathContext>) {
  const relativeFolderPath = path.dirname(`${context.sourceName}\\${context.relativePath}`);
  return context.sourceName.toLowerCase() === "naxlex"
    ? path.dirname(context.relativePath)
    : relativeFolderPath;
}

function legacyArtworkPublicPath(fileName: string) {
  return `${LEGACY_HOTSPOT_ARTWORK_PUBLIC_PATH}/${encodeURIComponent(fileName)}`;
}

function legacyArtworkNestedPublicPath(relativeFolderPath: string, fileName: string) {
  const encodedParts = relativeFolderPath
    .split(/[\\/]+/)
    .filter(Boolean)
    .map((part) => encodeURIComponent(part));
  return `${LEGACY_HOTSPOT_ARTWORK_PUBLIC_PATH}/${[...encodedParts, encodeURIComponent(fileName)].join("/")}`;
}

async function cacheNaxlexImage(imagePath: unknown, context: ReturnType<typeof pathContext>) {
  const sourceUrl = resolveNaxlexAssetUrl(imagePath);
  if (!sourceUrl) return "";

  const sourceFileName = sourceFileNameFromUrl(sourceUrl);
  const relativeFolderPath = cacheRelativeFolderPath(context);
  if (sourceFileName) {
    const manualNestedLocalPath = path.join(
      NAXLEX_IMAGE_CACHE_DIR,
      ...relativeFolderPath.split(/[\\/]+/).filter(Boolean),
      sourceFileName
    );
    try {
      await access(manualNestedLocalPath);
      return imageNestedPublicPath(relativeFolderPath, sourceFileName);
    } catch {
      // No manually saved folder-scoped image exists; continue to flat lookup.
    }

    const manualLocalPath = path.join(NAXLEX_IMAGE_CACHE_DIR, sourceFileName);
    try {
      await access(manualLocalPath);
      return imagePublicPath(sourceFileName);
    } catch {
      // No manually saved source-named image exists; continue to hashed cache.
    }

    const legacyNestedLocalPath = path.join(
      LEGACY_HOTSPOT_ARTWORK_CACHE_DIR,
      ...relativeFolderPath.split(/[\\/]+/).filter(Boolean),
      sourceFileName
    );
    try {
      await access(legacyNestedLocalPath);
      return legacyArtworkNestedPublicPath(relativeFolderPath, sourceFileName);
    } catch {
      // Keep reading older hotspot cache folders while the new general cache fills.
    }

    const legacyLocalPath = path.join(LEGACY_HOTSPOT_ARTWORK_CACHE_DIR, sourceFileName);
    try {
      await access(legacyLocalPath);
      return legacyArtworkPublicPath(sourceFileName);
    } catch {
      // No legacy source-named image exists; continue to hashed cache.
    }
  }

  const cacheKey = createHash("sha1").update(sourceUrl).digest("hex");
  const extension = extensionFromUrl(sourceUrl);
  const fileName = `${cacheKey}${extension}`;
  const localPath = path.join(NAXLEX_IMAGE_CACHE_DIR, fileName);
  const publicPath = imagePublicPath(fileName);

  try {
    await access(localPath);
    return publicPath;
  } catch {
    // Cache miss; download below.
  }

  try {
    await mkdir(NAXLEX_IMAGE_CACHE_DIR, { recursive: true });
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://naxlex.com/nursing/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    await writeFile(localPath, Buffer.from(arrayBuffer));
    return publicPath;
  } catch (error) {
    console.warn("Could not cache Naxlex image", {
      sourceUrl,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return sourceUrl;
  }
}

async function createImageSourceRecord(
  question: RawQuestion,
  questionTypeId: string,
  context: ReturnType<typeof pathContext>
): Promise<NaxlexImageSourceRecord | null> {
  if (!isMeaningful(question.image_path)) return null;
  const imageSourceUrl = resolveNaxlexAssetUrl(question.image_path);
  if (!imageSourceUrl) return null;

  return {
    questionId: String(question.id || "unknown"),
    questionTypeId,
    sourceName: context.sourceName,
    relativePath: `${context.sourceName}\\${context.relativePath}`,
    program: context.program,
    vendor: context.vendor,
    subject: context.subject,
    questionHtml: String(question.question || ""),
    imageSourceUrl,
    imagePath: await cacheNaxlexImage(question.image_path, context),
  };
}

function parseTabPanels(tabs: unknown) {
  const parsed = parseJsonString(tabs);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return Object.entries(parsed as Record<string, unknown>)
      .map(([label, html]) => ({
        label,
        html: String(html || ""),
      }))
      .filter((tab) => tab.label && tab.html);
  }
  return [];
}

function parseMatchOptions(matchOption: unknown) {
  const parsed = parseJsonString(matchOption);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return Object.entries(parsed as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, option]) => ({
        label: label.toUpperCase(),
        html: optionTextForRender(option),
      }))
      .filter((option) => option.html);
  }
  return [];
}

function parseCorrectAnswerMap(answer: unknown) {
  const parsed = parseJsonString(answer);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([key, value]) => {
      const answerValue =
        value && typeof value === "object" && "answers" in value
          ? (value as { answers?: unknown }).answers
          : value;
      const answers = String(answerValue || "")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);
      return [key.toUpperCase(), answers];
    })
  );
}

function titleCaseLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferTypeTenMatchOptions(
  question: RawQuestion,
  correctAnswerMap: Record<string, string[]>
) {
  const labels = Array.from(new Set(Object.values(correctAnswerMap).flat()))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  if (labels.length === 0) return [];

  const solutionText = stripHtml(question.solution || "").toLowerCase();
  const inferredByKeyword: Record<string, string> = {};
  if (solutionText.includes("pain control") || solutionText.includes("absence of reported pain")) {
    inferredByKeyword.A = "Pain Control";
  }
  if (
    solutionText.includes("hypovolemia") ||
    solutionText.includes("circulating volume") ||
    solutionText.includes("fluid resuscitation")
  ) {
    inferredByKeyword.B = "Managing Hypovolemia";
  }
  if (
    solutionText.includes("preventing infection") ||
    solutionText.includes("infection is being prevented") ||
    solutionText.includes("pathogens")
  ) {
    inferredByKeyword.C = "Preventing Infection";
  }

  return labels.map((label) => ({
    label,
    html: inferredByKeyword[label] || `Column ${titleCaseLabel(label)}`,
  }));
}

function parseDropdownGroups(options: unknown) {
  const parsed = parseJsonString(options);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];

  return Object.entries(parsed as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([groupLabel, group], index) => {
      const choices =
        group && typeof group === "object" && !Array.isArray(group)
          ? Object.entries(group as Record<string, unknown>)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([label, value]) => ({
                label: label.toUpperCase(),
                html: optionTextForRender(value),
              }))
              .filter((option) => option.html)
          : [];

      return {
        label: groupLabel,
        displayLabel: `Dropdown ${index + 1}`,
        options: choices,
      };
    })
    .filter((group) => group.options.length > 0);
}

function parseDragDropGroups(subquestions: unknown) {
  if (!Array.isArray(subquestions)) return [];

  return subquestions
    .map((subquestion, index) => {
      if (!subquestion || typeof subquestion !== "object") return null;
      const record = subquestion as {
        question?: unknown;
        choices?: unknown;
        answer?: unknown;
      };
      const parsedChoices = parseJsonString(record.choices);
      const options =
        parsedChoices && typeof parsedChoices === "object" && !Array.isArray(parsedChoices)
          ? Object.entries(parsedChoices as Record<string, unknown>)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([label, value]) => ({
                label: label.toUpperCase(),
                html: optionTextForRender(value),
              }))
              .filter((option) => option.html)
          : [];

      return {
        label: `drag-drop-group-${index + 1}`,
        displayLabel: stripHtml(record.question) || `Group ${index + 1}`,
        options,
        correctLabels: parseCorrectAnswerList(record.answer).map((label) => label.toUpperCase()),
      };
    })
    .filter(
      (
        group
      ): group is {
        label: string;
        displayLabel: string;
        options: Array<{ label: string; html: string }>;
        correctLabels: string[];
      } => Boolean(group && group.options.length > 0)
    );
}

function parseCorrectAnswerList(answer: unknown) {
  const parsed = parseJsonString(answer);
  if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  const raw = String(answer || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function orderedResponseExpectedCount(questionHtml: unknown, optionCount: number) {
  const questionText = stripHtml(questionHtml).toLowerCase();
  const wordNumbers: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
  };
  const firstCountMatch = questionText.match(/\bfirst\s+(one|two|three|four|five|six|seven|eight|\d+)\b/i);
  if (firstCountMatch) {
    const rawCount = firstCountMatch[1].toLowerCase();
    const count = wordNumbers[rawCount] || Number(rawCount);
    if (Number.isFinite(count) && count > 0) return Math.min(count, optionCount);
  }
  if (/\buse all (?:the )?steps\b/i.test(questionText)) return optionCount;
  return optionCount;
}

function parseOrderedResponseLabelsFromSolution(solutionHtml: unknown, validLabels: string[]) {
  const validLabelSet = new Set(validLabels.map((label) => label.toUpperCase()));
  const text = String(solutionHtml || "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&");
  const labels: string[] = [];
  for (const match of text.matchAll(/(?:^|\n)\s*([A-H])\.\s+/g)) {
    const label = match[1].toUpperCase();
    if (validLabelSet.has(label) && !labels.includes(label)) {
      labels.push(label);
    }
  }
  return labels;
}

function orderedResponseCorrectAnswerList(
  question: RawQuestion,
  options: Array<{ label: string; html: string }>,
  answer: unknown
) {
  const answerLabels = parseCorrectAnswerList(answer).map((label) => label.toUpperCase());
  const expectedCount = orderedResponseExpectedCount(question.question, options.length);
  if (answerLabels.length >= expectedCount) return answerLabels;

  const solutionLabels = parseOrderedResponseLabelsFromSolution(
    question.solution,
    options.map((option) => option.label)
  );
  if (solutionLabels.length >= expectedCount) return solutionLabels.slice(0, expectedCount);
  return answerLabels;
}

function increment(map: Record<string, number>, key: string, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

function stripHtml(value: unknown) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trim()}...`;
}

function pathContext(sourceName: string, rootPath: string, filePath: string) {
  const relativePath = path.relative(rootPath, filePath);
  const parts = relativePath.split(path.sep);
  return {
    sourceName,
    relativePath,
    fileName: path.basename(filePath),
    program: parts[0] || "Unknown",
    vendor: parts[1] || "Unknown",
    subject: parts.length > 3 ? parts.slice(2, -1).join(" / ") : "Root",
  };
}

function createTypeSummary(questionTypeId: string): MutableQuestionTypeSummary {
  return {
    questionTypeId,
    publicSupport: SUPPORTED_PUBLIC_QUESTION_TYPES.has(questionTypeId)
      ? "supported"
      : "unsupported",
    questionCount: 0,
    fileCount: 0,
    filePaths: new Set<string>(),
    sources: new Set<string>(),
    programs: new Set<string>(),
    vendors: new Set<string>(),
    subjects: new Set<string>(),
    subtopics: new Set<string>(),
    optionShapes: {},
    correctAnswerShapes: {},
    featureCounts: {
      withTabs: 0,
      withSubquestions: 0,
      withMatchOption: 0,
      withImage: 0,
      withUnits: 0,
    },
    sampleQuestions: [],
    renderSample: undefined,
    renderSamples: [],
    sampleFiles: new Set<string>(),
  };
}

async function createRenderSample(
  question: RawQuestion,
  questionTypeId: string,
  context: ReturnType<typeof pathContext>
): Promise<NaxlexQuestionTypeRenderSample> {
  const correctAnswerValue = question.correctAnswer ?? question.correct_answer;
  const imageSourceUrl = resolveNaxlexAssetUrl(question.image_path);
  const renderOptions =
    questionTypeId === "1" ||
    questionTypeId === "2" ||
    questionTypeId === "3" ||
    questionTypeId === "10" ||
    questionTypeId === "11" ||
    questionTypeId === "14"
      ? parseLetteredOptions(question.options)
      : [];
  const orderedResponseOptions =
    questionTypeId === "6" ? parseLetteredOptions(question.options) : [];
  const correctAnswerMap =
    questionTypeId === "10" || questionTypeId === "13" || questionTypeId === "14"
      ? parseCorrectAnswerMap(question.correctAnswer ?? question.correct_answer)
      : {};
  const parsedMatchOptions =
    questionTypeId === "10" || questionTypeId === "14"
      ? parseMatchOptions(question.match_option)
      : [];

  return {
    questionId: String(question.id || "unknown"),
    questionTypeId,
    sourceName: context.sourceName,
    relativePath: `${context.sourceName}\\${context.relativePath}`,
    program: context.program,
    vendor: context.vendor,
    subject: context.subject,
    questionHtml: String(question.question || ""),
    tabs: parseTabPanels(question.tabs),
    options: questionTypeId === "6" ? orderedResponseOptions : renderOptions,
    matchOptions:
      questionTypeId === "10" && parsedMatchOptions.length === 0
        ? inferTypeTenMatchOptions(question, correctAnswerMap)
        : parsedMatchOptions,
    dropdownGroups: questionTypeId === "13" ? parseDropdownGroups(question.options) : [],
    dragDropGroups: questionTypeId === "12" ? parseDragDropGroups(question.subquestions) : [],
    imagePath: isMeaningful(question.image_path)
      ? await cacheNaxlexImage(question.image_path, context)
      : imageSourceUrl,
    imageSourceUrl,
    units: String(question.units || ""),
    correctAnswer:
      questionTypeId === "9"
        ? parseHotSpotAnswer(correctAnswerValue)
        : questionTypeId === "6"
        ? JSON.stringify(orderedResponseCorrectAnswerList(question, orderedResponseOptions, correctAnswerValue))
        : questionTypeId === "2" || questionTypeId === "7"
        ? JSON.stringify(parseCorrectAnswerList(correctAnswerValue))
        : String(correctAnswerValue ?? ""),
    correctAnswerMap,
    explanationHtml: String(question.solution || ""),
  };
}

export async function scanNaxlexNursingExitQuestionTypes(): Promise<NaxlexQuestionTypeScanResult> {
  const rootPath = scanRootPath();
  const sourceRoots = scanSourcePaths();
  const allFiles: Array<{ sourceName: string; rootPath: string; filePath: string }> = [];
  const allFolders: Array<{ sourceName: string; rootPath: string; relativePath: string }> = [];
  const summaries = new Map<string, MutableQuestionTypeSummary>();
  const fileSummaries: NaxlexQuestionTypeFileSummary[] = [];
  const imageRecords: NaxlexImageSourceRecord[] = [];
  const errors: Array<{ relativePath: string; message: string }> = [];
  let questionsScanned = 0;

  for (const source of sourceRoots) {
    try {
      const sourceStats = await stat(source.rootPath);
      if (!sourceStats.isDirectory()) {
        throw new Error(`Source path is not a directory: ${source.rootPath}`);
      }
      const { files, folders } = await collectScanTargets(source.rootPath);
      allFiles.push(
        ...files.map((filePath) => ({
          sourceName: source.sourceName,
          rootPath: source.rootPath,
          filePath,
        }))
      );
      allFolders.push(
        ...folders.map((relativePath) => ({
          sourceName: source.sourceName,
          rootPath: source.rootPath,
          relativePath,
        }))
      );
    } catch (error) {
      errors.push({
        relativePath: source.sourceName,
        message: error instanceof Error ? error.message : "Could not scan source",
      });
    }
  }

  for (const file of allFiles) {
    const context = pathContext(file.sourceName, file.rootPath, file.filePath);
    try {
      const raw = await readFile(file.filePath, "utf8");
      const parsed = JSON.parse(raw);
      const questions = asQuestionArray(parsed);
      const fileTypeCounts: Record<string, number> = {};

      for (const question of questions) {
        const questionTypeId = normalizeTypeId(question);
        const optionShape = classifyOptions(question.options);
        const correctAnswerShape = classifyCorrectAnswer(
          question.correctAnswer ?? question.correct_answer
        );
        const summary =
          summaries.get(questionTypeId) || createTypeSummary(questionTypeId);

        summary.questionCount += 1;
        summary.filePaths.add(`${context.sourceName}\\${context.relativePath}`);
        summary.sources.add(context.sourceName);
        summary.programs.add(context.program);
        summary.vendors.add(context.vendor);
        summary.subjects.add(context.subject);
        summary.sampleFiles.add(`${context.sourceName}\\${context.relativePath}`);
        if (isMeaningful(question.subtopic)) {
          summary.subtopics.add(String(question.subtopic));
        }
        increment(summary.optionShapes, optionShape);
        increment(summary.correctAnswerShapes, correctAnswerShape);

        const hasTabs = isMeaningful(question.tabs);
        const hasSubquestions = isMeaningful(question.subquestions);
        const hasMatchOption = isMeaningful(question.match_option);
        const hasImage = isMeaningful(question.image_path);
        const hasUnits = isMeaningful(question.units);
        if (hasTabs) summary.featureCounts.withTabs += 1;
        if (hasSubquestions) summary.featureCounts.withSubquestions += 1;
        if (hasMatchOption) summary.featureCounts.withMatchOption += 1;
        if (hasImage) summary.featureCounts.withImage += 1;
        if (hasUnits) summary.featureCounts.withUnits += 1;

        if (hasImage) {
          const imageRecord = await createImageSourceRecord(question, questionTypeId, context);
          if (imageRecord) {
            imageRecords.push(imageRecord);
          }
        }

        if (summary.sampleQuestions.length < 3) {
          summary.sampleQuestions.push({
            questionId: String(question.id || "unknown"),
            sourceName: context.sourceName,
            fileName: context.fileName,
            relativePath: `${context.sourceName}\\${context.relativePath}`,
            program: context.program,
            vendor: context.vendor,
            subject: context.subject,
            prompt: truncate(stripHtml(question.question), 220),
            optionShape,
            correctAnswerShape,
            hasTabs,
            hasSubquestions,
            hasMatchOption,
            hasImage,
            hasUnits,
          });
        }

        if (["1", "2", "3", "6", "7", "9", "10", "11", "12", "13", "14"].includes(questionTypeId)) {
          const renderSample = await createRenderSample(question, questionTypeId, context);
          if (!summary.renderSample) {
            summary.renderSample = renderSample;
          }
          if (questionTypeId === "1" || questionTypeId === "2" || questionTypeId === "3" || questionTypeId === "6" || questionTypeId === "7" || questionTypeId === "9" || questionTypeId === "10" || questionTypeId === "11" || questionTypeId === "12" || questionTypeId === "13" || questionTypeId === "14") {
            // Keep every interactive renderer sample available so admins can
            // page through shared shells and compare the source JSON shapes.
            summary.renderSamples?.push(renderSample);
          }
        }

        summaries.set(questionTypeId, summary);
        increment(fileTypeCounts, questionTypeId);
        questionsScanned += 1;
      }

      fileSummaries.push({
        ...context,
        questionCount: questions.length,
        questionTypes: fileTypeCounts,
      });
    } catch (error) {
      errors.push({
        relativePath: `${context.sourceName}\\${context.relativePath}`,
        message: error instanceof Error ? error.message : "Unknown parse error",
      });
    }
  }

  const questionTypes = Array.from(summaries.values())
    .map((summary) => ({
      questionTypeId: summary.questionTypeId,
      publicSupport: summary.publicSupport,
      questionCount: summary.questionCount,
      fileCount: summary.filePaths.size,
      sources: Array.from(summary.sources).sort(),
      programs: Array.from(summary.programs).sort(),
      vendors: Array.from(summary.vendors).sort(),
      subjects: Array.from(summary.subjects).sort().slice(0, 30),
      subtopics: Array.from(summary.subtopics).sort().slice(0, 20),
      optionShapes: summary.optionShapes,
      correctAnswerShapes: summary.correctAnswerShapes,
      featureCounts: summary.featureCounts,
      sampleQuestions: summary.sampleQuestions,
      renderSample: summary.renderSample,
      renderSamples:
        summary.questionTypeId === "1" ||
        summary.questionTypeId === "2" ||
        summary.questionTypeId === "3" ||
        summary.questionTypeId === "5" ||
        summary.questionTypeId === "6" ||
        summary.questionTypeId === "7" ||
        summary.questionTypeId === "9" ||
        summary.questionTypeId === "10" ||
        summary.questionTypeId === "11" ||
        summary.questionTypeId === "12" ||
        summary.questionTypeId === "13" ||
        summary.questionTypeId === "14"
          ? summary.renderSamples
          : undefined,
      sampleFiles: Array.from(summary.sampleFiles).sort().slice(0, 12),
    }))
    .sort((a, b) => {
      const numericA = Number(a.questionTypeId);
      const numericB = Number(b.questionTypeId);
      if (Number.isFinite(numericA) && Number.isFinite(numericB)) {
        return numericA - numericB;
      }
      return a.questionTypeId.localeCompare(b.questionTypeId);
    });

  const sourceHotSpotSummary = questionTypes.find((type) => type.questionTypeId === "9");
  const sourceHotSpotSample = sourceHotSpotSummary?.renderSample;
  const typeFiveSummary = questionTypes.find((type) => type.questionTypeId === "5");
  if (sourceHotSpotSample && typeFiveSummary) {
    // NursingMocks treats Type 5 as the Hot Spot renderer. The Naxlex export
    // currently stores coordinate-based hot spot samples under source type 9,
    // so reuse that real JSON question to preview the intended Type 5 UI.
    typeFiveSummary.renderSample = {
      ...sourceHotSpotSample,
      questionTypeId: "5",
    };
    typeFiveSummary.renderSamples = (sourceHotSpotSummary?.renderSamples || [sourceHotSpotSample]).map(
      (sample) => ({
        ...sample,
        questionTypeId: "5",
      })
    );
  }

  const folderSummaries = allFolders.map((folder) => {
    const folderPath = folder.relativePath;
    const sourceFolders = allFolders
      .filter((candidate) => candidate.sourceName === folder.sourceName)
      .map((candidate) => candidate.relativePath);
    const sourceFiles = allFiles.filter((candidate) => candidate.sourceName === folder.sourceName);
    const normalizedFolder = folderPath === "." ? "" : `${folderPath}${path.sep}`;
    const childFolderCount = sourceFolders.filter((candidate) => {
      if (candidate === "." || candidate === folderPath) return false;
      const normalizedCandidate = `${candidate}${path.sep}`;
      return (
        folderPath === "." ||
        normalizedCandidate.startsWith(normalizedFolder)
      ) && candidate.split(path.sep).length === (folderPath === "." ? 1 : folderPath.split(path.sep).length + 1);
    }).length;
    const directJsonFiles = sourceFiles.filter((candidate) => {
      const relativeFilePath = path.relative(candidate.rootPath, candidate.filePath);
      return path.dirname(relativeFilePath) === folderPath;
    });
    const branchJsonFiles = sourceFiles.filter((candidate) => {
      const relativeFilePath = path.relative(candidate.rootPath, candidate.filePath);
      return folderPath === "." || relativeFilePath.startsWith(normalizedFolder);
    });

    return {
      sourceName: folder.sourceName,
      relativePath: folderPath,
      depth: folderPath === "." ? 0 : folderPath.split(path.sep).length,
      childFolderCount,
      directJsonFileCount: directJsonFiles.length,
      branchJsonFileCount: branchJsonFiles.length,
      isLeaf: childFolderCount === 0,
      sampleFiles: directJsonFiles
        .map((candidate) => path.basename(candidate.filePath))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 8),
    };
  });

  return {
    rootPath,
    sourceRoots,
    scannedAt: new Date().toISOString(),
    totals: {
      foldersScanned: folderSummaries.length,
      filesFound: allFiles.length,
      filesScanned: fileSummaries.length,
      questionsScanned,
      questionTypesFound: questionTypes.length,
      parseErrors: errors.length,
    },
    questionTypes,
    images: imageRecords.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
    folders: folderSummaries,
    files: fileSummaries.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
    errors,
  };
}
