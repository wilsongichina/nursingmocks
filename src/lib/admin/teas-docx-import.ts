import fs from "fs";
import path from "path";
import zlib from "zlib";

export type TeasDocxParagraph = {
  text: string;
  bold: boolean;
  underline: boolean;
};

export type TeasDocxParsedQuestion = {
  index: number;
  subject: string;
  marker: string;
  passageMarker: string;
  passageLines: string[];
  prompt: string;
  choices: string[];
  boldAnswers: string[];
  needsLlmQuestion: boolean;
  warnings: string[];
};

export type TeasDocxParseResult = {
  sourcePath: string;
  fileName: string;
  paragraphCount: number;
  mediaCount: number;
  subjectHeaders: string[];
  questions: TeasDocxParsedQuestion[];
  warnings: string[];
};

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

const SUBJECT_LABELS = [
  "Reading",
  "Mathematics",
  "Math",
  "Science",
  "English and Language Usage",
  "English",
];

const CHOICE_INTRO_PATTERN = /^(which of the following|what|where|when|why|how|select|identify|place|order|solve|simplify|according to|based on)\b/i;

export function parseTeasDocxFile(filePath: string): TeasDocxParseResult {
  const resolved = path.resolve(filePath);
  const bytes = fs.readFileSync(resolved);
  const entries = readZipEntries(bytes);
  const documentXml = readZipText(bytes, entries, "word/document.xml");
  const mediaCount = entries.filter((entry) => entry.name.startsWith("word/media/")).length;
  const paragraphs = extractParagraphs(documentXml);
  const subjectHeaders = paragraphs
    .map((paragraph) => paragraph.text)
    .filter((text) => /^TEAS\s+7\s+/i.test(text) && /section\b/i.test(text));
  const questions = parseParagraphQuestions(paragraphs);

  return {
    sourcePath: resolved,
    fileName: path.basename(resolved),
    paragraphCount: paragraphs.length,
    mediaCount,
    subjectHeaders,
    questions,
    warnings: questions
      .filter((question) => question.needsLlmQuestion)
      .map((question) => `${question.marker || `Question ${question.index}`} is missing a reliable prompt and needs LLM review.`),
  };
}

function readZipEntries(bytes: Buffer): ZipEntry[] {
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const centralDirectorySize = bytes.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = bytes.readUInt32LE(eocdOffset + 16);
  const end = centralDirectoryOffset + centralDirectorySize;
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;

  while (offset < end) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) break;
    const compressionMethod = bytes.readUInt16LE(offset + 10);
    const compressedSize = bytes.readUInt32LE(offset + 20);
    const fileNameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const localHeaderOffset = bytes.readUInt32LE(offset + 42);
    const name = bytes.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf8");
    entries.push({ name, compressionMethod, compressedSize, localHeaderOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(bytes: Buffer) {
  const minOffset = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= minOffset; offset -= 1) {
    if (bytes.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("DOCX zip directory could not be read.");
}

function readZipText(bytes: Buffer, entries: ZipEntry[], name: string) {
  const entry = entries.find((item) => item.name === name);
  if (!entry) throw new Error(`${name} was not found in the DOCX file.`);
  const offset = entry.localHeaderOffset;
  if (bytes.readUInt32LE(offset) !== 0x04034b50) throw new Error(`Invalid DOCX zip header for ${name}.`);
  const fileNameLength = bytes.readUInt16LE(offset + 26);
  const extraLength = bytes.readUInt16LE(offset + 28);
  const dataOffset = offset + 30 + fileNameLength + extraLength;
  const compressed = bytes.subarray(dataOffset, dataOffset + entry.compressedSize);
  if (entry.compressionMethod === 0) return compressed.toString("utf8");
  if (entry.compressionMethod === 8) return zlib.inflateRawSync(compressed).toString("utf8");
  throw new Error(`Unsupported DOCX compression method ${entry.compressionMethod}.`);
}

function extractParagraphs(documentXml: string): TeasDocxParagraph[] {
  const paragraphs: TeasDocxParagraph[] = [];
  const paragraphMatches = documentXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
  paragraphMatches.forEach((paragraphXml) => {
    const runs = paragraphXml.match(/<w:r[\s\S]*?<\/w:r>/g) || [];
    const parts: string[] = [];
    let bold = false;
    let underline = false;
    runs.forEach((runXml) => {
      const runText = Array.from(runXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
        .map((match) => decodeXml(match[1]))
        .join("");
      if (!runText) return;
      parts.push(runText);
      if (/<w:b\b/.test(runXml)) bold = true;
      if (/<w:u\b/.test(runXml)) underline = true;
    });
    const text = normalizeText(parts.join(""));
    if (text) paragraphs.push({ text, bold, underline });
  });
  return paragraphs;
}

function parseParagraphQuestions(paragraphs: TeasDocxParagraph[]) {
  const questions: TeasDocxParsedQuestion[] = [];
  let subject = "";
  let activePassageMarker = "";
  let activePassageLines: string[] = [];
  let collectingPassage = false;
  let active: TeasDocxParsedQuestion | null = null;

  const finishActive = () => {
    if (!active) return;
    active.needsLlmQuestion = !active.prompt || active.choices.length < 2;
    questions.push(active);
    active = null;
  };

  paragraphs.forEach((paragraph) => {
    const subjectMatch = subjectFromHeader(paragraph.text);
    if (subjectMatch) {
      finishActive();
      subject = subjectMatch;
      activePassageMarker = "";
      activePassageLines = [];
      collectingPassage = false;
      return;
    }

    if (/^Stimulus:\s*\d+\s+of\s+\d+/i.test(paragraph.text)) {
      finishActive();
      activePassageMarker = paragraph.text;
      activePassageLines = [];
      collectingPassage = true;
      return;
    }

    if (/^Question\s*:?\s*\d+\s+of\s+\d+/i.test(paragraph.text)) {
      finishActive();
      active = {
        index: questions.length + 1,
        subject,
        marker: paragraph.text,
        passageMarker: activePassageMarker,
        passageLines: [...activePassageLines],
        prompt: "",
        choices: [],
        boldAnswers: [],
        needsLlmQuestion: false,
        warnings: [],
      };
      return;
    }

    if (!active) {
      // Only text explicitly under a Stimulus block is treated as a passage.
      // Subject headings and other loose document labels should not leak into
      // unrelated questions as passage context.
      if (collectingPassage) activePassageLines.push(paragraph.text);
      return;
    }

    if (!active.prompt && CHOICE_INTRO_PATTERN.test(paragraph.text)) {
      active.prompt = paragraph.text;
      return;
    }

    if (active.prompt) {
      active.choices.push(paragraph.text);
      if (paragraph.bold) active.boldAnswers.push(paragraph.text);
    } else {
      active.passageLines.push(paragraph.text);
    }
  });

  finishActive();
  return questions;
}

function subjectFromHeader(text: string) {
  const normalized = normalizeText(text);
  if (!/^TEAS\s+7\s+/i.test(normalized)) return "";
  const subject = SUBJECT_LABELS.find((label) => new RegExp(`\\b${escapeRegExp(label)}\\b`, "i").test(normalized));
  if (!subject) return "";
  if (subject === "Math") return "Mathematics";
  if (subject === "English") return "English and Language Usage";
  return subject;
}

function normalizeText(value: string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
