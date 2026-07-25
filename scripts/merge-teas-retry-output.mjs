import fs from "fs";
import path from "path";
import { teasOcrImageInputPath, teasOcrOutputPath } from "../src/lib/admin/teas-ocr-paths.ts";

function parseArgs() {
  const folderIndex = process.argv.indexOf("--folder");
  const replaceIndex = process.argv.indexOf("--replace-pages");
  const replacePages = replaceIndex >= 0
    ? process.argv[replaceIndex + 1].split(",").map((page) => Number(page.trim())).filter(Number.isFinite)
    : [];
  const folder = folderIndex >= 0 ? process.argv[folderIndex + 1] : "";
  return { folder, replacePages };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function structuredFiles(outputPath) {
  return fs
    .readdirSync(outputPath)
    .filter((fileName) => /^teas-ocr-structured-\d+\.json$/i.test(fileName))
    .map((fileName) => {
      const filePath = path.join(outputPath, fileName);
      return { fileName, filePath, modifiedMs: fs.statSync(filePath).mtimeMs, json: readJson(filePath) };
    })
    .filter((file) => Array.isArray(file.json.pages))
    .sort((a, b) => b.modifiedMs - a.modifiedMs);
}

function pageHasContent(page) {
  const column = page?.questionColumn || {};
  return (
    String(page?.contentText || "").trim() ||
    (Array.isArray(column.promptLines) && column.promptLines.length > 0) ||
    (Array.isArray(column.choiceLines) && column.choiceLines.length > 0) ||
    (Array.isArray(column.passageLines) && column.passageLines.length > 0)
  );
}

function pageIsFailed(page) {
  return (
    Boolean(page?.error) ||
    page?.questionColumn?.layoutMode === "google_gemini_image_failed" ||
    !pageHasContent(page)
  );
}

async function main() {
  const { folder, replacePages } = parseArgs();
  if (!folder) throw new Error("Pass --folder with the TEAS set or ati-logo-removed folder path.");

  const inputPath = teasOcrImageInputPath(folder);
  const outputPath = teasOcrOutputPath(inputPath);
  const files = structuredFiles(outputPath);
  const base = files.find((file) => file.json.pages.length > 1);
  if (!base) throw new Error(`No full structured OCR file found in ${outputPath}`);

  const replacements = new Map();
  const replacementModifiedAt = new Map();
  for (const file of files) {
    if (file.filePath === base.filePath || file.json.pages.length !== 1) continue;
    const page = file.json.pages[0];
    if (!pageHasContent(page)) continue;
    const pageNumber = Number(page.page);
    const existingModifiedAt = replacementModifiedAt.get(pageNumber) || 0;
    if (file.modifiedMs > existingModifiedAt) {
      replacements.set(pageNumber, page);
      replacementModifiedAt.set(pageNumber, file.modifiedMs);
    }
  }

  const replaceSet = new Set(replacePages);
  const appliedReplacements = [];
  const pages = base.json.pages.map((page) => {
    const replacement = replacements.get(Number(page.page));
    if (replacement && (pageIsFailed(page) || replaceSet.has(Number(page.page)))) {
      appliedReplacements.push(Number(page.page));
      return replacement;
    }
    return page;
  });
  const failedPages = pages
    .filter(pageIsFailed)
    .map((page) => ({
      page: Number(page.page),
      fileName: String(page.fileName || ""),
      error: String(page.error || page.questionColumn?.warnings?.[0] || "No extracted content"),
    }));

  const merged = {
    ...base.json,
    mergedFrom: {
      baseFile: base.fileName,
      replacementPages: Array.from(new Set(appliedReplacements)).sort((a, b) => a - b),
      mergedAt: Date.now(),
    },
    pageCount: pages.length,
    failedPageCount: failedPages.length,
    failedPages,
    pages,
  };

  const outputFile = path.join(outputPath, `teas-ocr-structured-${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), "utf8");

  console.log(
    JSON.stringify(
      {
        outputFile,
        baseFile: base.filePath,
        pageCount: pages.length,
        replacements: merged.mergedFrom.replacementPages,
        failedPageCount: failedPages.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
