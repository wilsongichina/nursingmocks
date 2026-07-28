import fs from "fs";
import path from "path";

function arg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pageByNumber(pages, pageNumber) {
  return pages.find((page) => Number(page.page) === pageNumber);
}

function main() {
  const file = arg("file");
  const promptPageNumber = Number(arg("prompt-page"));
  const choicesPageNumber = Number(arg("choices-page"));
  const imagePath = arg("image-path");
  const output = arg("output");

  if (!file || !Number.isFinite(promptPageNumber) || !Number.isFinite(choicesPageNumber)) {
    throw new Error("Pass --file, --prompt-page, and --choices-page.");
  }

  const structured = readJson(file);
  const pages = Array.isArray(structured.pages) ? structured.pages : [];
  const promptPage = pageByNumber(pages, promptPageNumber);
  const choicesPage = pageByNumber(pages, choicesPageNumber);

  if (!promptPage?.questionColumn || !choicesPage?.questionColumn) {
    throw new Error("Both pages must have questionColumn data.");
  }

  const promptColumn = promptPage.questionColumn;
  const choicesColumn = choicesPage.questionColumn;

  promptColumn.choiceLines = Array.isArray(choicesColumn.choiceLines) ? choicesColumn.choiceLines : [];
  promptColumn.selectedAnswer = choicesColumn.selectedAnswer || promptColumn.selectedAnswer || "";
  promptColumn.markerScores = choicesColumn.markerScores || promptColumn.markerScores || [];
  promptColumn.selectedAnswerScore = choicesColumn.selectedAnswerScore || promptColumn.selectedAnswerScore || 0;
  promptColumn.secondAnswerScore = choicesColumn.secondAnswerScore || promptColumn.secondAnswerScore || 0;
  promptColumn.selectedAnswerConfidenceRatio =
    choicesColumn.selectedAnswerConfidenceRatio || promptColumn.selectedAnswerConfidenceRatio || 0;
  promptColumn.warnings = [];

  if (imagePath && Array.isArray(promptColumn.exhibits)) {
    promptColumn.exhibits = promptColumn.exhibits.map((exhibit) => {
      const type = String(exhibit?.type || "").toLowerCase();
      if (type !== "image" && type !== "chart") return exhibit;
      return {
        ...exhibit,
        inline: true,
        requiresCrop: false,
        imagePath,
      };
    });
  }

  const repairedPages = pages.filter((page) => Number(page.page) !== choicesPageNumber);
  const repaired = {
    ...structured,
    repairedFrom: {
      ...(structured.repairedFrom || {}),
      splitPages: [
        ...(structured.repairedFrom?.splitPages || []),
        {
          promptPage: promptPageNumber,
          choicesPage: choicesPageNumber,
          imagePath: imagePath || "",
          repairedAt: Date.now(),
        },
      ],
    },
    pageCount: repairedPages.length,
    pages: repairedPages,
  };

  const outputFile =
    output ||
    path.join(path.dirname(file), `teas-ocr-structured-${Date.now()}-split-repaired.json`);
  fs.writeFileSync(outputFile, JSON.stringify(repaired, null, 2), "utf8");
  console.log(JSON.stringify({ outputFile, pageCount: repairedPages.length }, null, 2));
}

main();
