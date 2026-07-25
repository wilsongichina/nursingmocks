import fs from "fs";
import path from "path";
import { teasOcrImageInputPath, teasOcrOutputPath } from "../src/lib/admin/teas-ocr-paths.ts";

function parseArgs() {
  const folderIndex = process.argv.indexOf("--folder");
  const fileIndex = process.argv.indexOf("--file");
  return {
    folder: folderIndex >= 0 ? process.argv[folderIndex + 1] : "",
    file: fileIndex >= 0 ? process.argv[fileIndex + 1] : "",
  };
}

function latestStructuredFile(outputPath) {
  return fs
    .readdirSync(outputPath)
    .filter((fileName) => /^teas-ocr-structured-\d+\.json$/i.test(fileName))
    .map((fileName) => {
      const filePath = path.join(outputPath, fileName);
      return { fileName, filePath, modifiedMs: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.modifiedMs - a.modifiedMs)[0]?.filePath;
}

function columnOf(page) {
  return page?.questionColumn && typeof page.questionColumn === "object" ? page.questionColumn : {};
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function shortLines(lines) {
  return arr(lines).map(text).filter(Boolean).join(" ").slice(0, 160);
}

function main() {
  const { folder, file } = parseArgs();
  const inputPath = folder ? teasOcrImageInputPath(folder) : "";
  const outputPath = inputPath ? teasOcrOutputPath(inputPath) : "";
  const filePath = file || latestStructuredFile(outputPath);
  if (!filePath) throw new Error("Pass --file or --folder with a folder containing structured OCR output.");

  const structured = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const pages = Array.isArray(structured.pages) ? structured.pages : [];

  const missingChoices = [];
  const missingAnswers = [];
  const needsReview = [];
  const failedPages = [];
  const openAiRecovered = [];
  const promptless = [];
  const seenNumbers = new Map();
  const duplicateQuestionNumbers = [];
  const typeCounts = {};

  pages.forEach((page, index) => {
    const column = columnOf(page);
    const number = text(column.questionNumber);
    const typeId = Number(column.questionTypeId || 1);
    const choiceCount = arr(column.choiceLines).length;
    const selectedAnswer = text(column.selectedAnswer).toUpperCase();
    const warnings = arr(column.warnings).map(text).filter(Boolean);
    typeCounts[typeId] = (typeCounts[typeId] || 0) + 1;

    if (number) {
      const existing = seenNumbers.get(number) || [];
      existing.push(page.page || index + 1);
      seenNumbers.set(number, existing);
    }

    if (page?.error || column.layoutMode === "google_gemini_image_failed") {
      failedPages.push({
        page: page.page,
        file: page.fileName,
        error: page.error || warnings[0] || "",
      });
    }
    if (typeId !== 6 && choiceCount !== 4) {
      missingChoices.push({
        page: page.page || index + 1,
        file: page.fileName || "",
        questionNumber: number,
        optionCount: choiceCount,
        layoutMode: column.layoutMode || "",
        extractionModel: column.extractionModel || "",
        preview: shortLines(column.promptLines),
      });
    }
    if (typeId !== 6 && !/^[A-F]$/.test(selectedAnswer)) {
      missingAnswers.push({
        page: page.page || index + 1,
        file: page.fileName || "",
        questionNumber: number,
        selectedAnswer,
        layoutMode: column.layoutMode || "",
        extractionModel: column.extractionModel || "",
        preview: shortLines(column.promptLines),
      });
    }
    if (warnings.length > 0) {
      needsReview.push({
        page: page.page || index + 1,
        file: page.fileName || "",
        questionNumber: number,
        layoutMode: column.layoutMode || "",
        extractionModel: column.extractionModel || "",
        warnings,
      });
    }
    if (String(column.layoutMode || "").includes("openai")) {
      openAiRecovered.push({
        page: page.page || index + 1,
        file: page.fileName || "",
        questionNumber: number,
        layoutMode: column.layoutMode || "",
        extractionModel: column.extractionModel || "",
        prompt: shortLines(column.promptLines),
      });
    }
    if (arr(column.promptLines).length === 0) {
      promptless.push({
        page: page.page || index + 1,
        file: page.fileName || "",
        questionNumber: number,
        layoutMode: column.layoutMode || "",
        extractionModel: column.extractionModel || "",
      });
    }
  });

  for (const [number, indexes] of seenNumbers.entries()) {
    if (number && indexes.length > 1) duplicateQuestionNumbers.push({ number, indexes });
  }

  const report = {
    filePath,
    sourceFolder: structured.sourceFolder || "",
    pageCount: pages.length,
    structuredFailedPageCount: structured.failedPageCount || failedPages.length,
    parsedQuestionCountEstimate: pages.length,
    typeCounts,
    failedPages,
    promptlessCount: promptless.length,
    promptless,
    openAiRecoveredCount: openAiRecovered.length,
    openAiRecovered,
    missingChoicesCount: missingChoices.length,
    missingChoices: missingChoices.slice(0, 30),
    missingAnswersCount: missingAnswers.length,
    missingAnswers: missingAnswers.slice(0, 30),
    needsReviewCount: needsReview.length,
    needsReview: needsReview.slice(0, 40),
    duplicateQuestionNumbers,
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
