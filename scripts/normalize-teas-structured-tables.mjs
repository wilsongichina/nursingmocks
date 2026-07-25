import fs from "fs";
import path from "path";

const ATI_LOGO_REMOVED_FOLDER_NAME = "ati-logo-removed";

function teasOcrImageInputPath(inputPath) {
  const resolved = path.resolve(inputPath);
  if (path.basename(resolved).toLowerCase() === ATI_LOGO_REMOVED_FOLDER_NAME) {
    return resolved;
  }
  const logoRemovedPath = path.join(resolved, ATI_LOGO_REMOVED_FOLDER_NAME);
  if (fs.existsSync(logoRemovedPath) && fs.statSync(logoRemovedPath).isDirectory()) {
    return logoRemovedPath;
  }
  return resolved;
}

function teasOcrOutputPath(inputPath) {
  return path.join(teasOcrImageInputPath(inputPath), "teas-ocr-output");
}

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
      return { filePath, modifiedMs: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.modifiedMs - a.modifiedMs)[0]?.filePath;
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePlacement(value) {
  const placement = clean(value).toLowerCase();
  return ["before_passage", "inside_passage", "between_passage_and_question", "inside_question", "after_question", "after_choices"].includes(
    placement
  )
    ? placement
    : "unknown";
}

function metadataOnlyLine(value, subject, questionNumber) {
  const line = clean(value);
  if (!line) return true;
  if (/^question\s*:?\s*\d+\s+of\s+\d+$/i.test(line)) return true;
  if (/^ati\s+teas/i.test(line)) return true;
  if (subject && line.toLowerCase() === `subject: ${subject}`.toLowerCase()) return true;
  if (subject && line.toLowerCase() === subject.toLowerCase()) return true;
  if (questionNumber && line.toLowerCase() === `question ${questionNumber}`.toLowerCase()) return true;
  return false;
}

function tableTitlePromotion(page, exhibits) {
  const subject = clean(page?.subject);
  const questionNumber = clean(page?.questionColumn?.questionNumber);
  const contentHeaderLines = Array.isArray(page?.questionColumn?.headerLines)
    ? page.questionColumn.headerLines.filter((line) => !metadataOnlyLine(line, subject, questionNumber)).map(clean)
    : [];
  const firstTable = exhibits.find((exhibit) => clean(exhibit?.type).toLowerCase() === "table");
  if (
    contentHeaderLines.length === 0 ||
    !firstTable ||
    clean(firstTable.title) ||
    !["", "before_passage", "between_passage_and_question", "inside_question", "unknown"].includes(
      normalizePlacement(firstTable.placement)
    )
  ) {
    return { title: "", remainingHeaderLines: page?.questionColumn?.headerLines };
  }
  return {
    title: contentHeaderLines[0],
    remainingHeaderLines: Array.isArray(page?.questionColumn?.headerLines)
      ? page.questionColumn.headerLines.filter((line) => clean(line) !== contentHeaderLines[0])
      : [],
  };
}

function normalizeComparableTableText(value) {
  return clean(value).replace(/[^\w%]+/g, " ").toLowerCase().trim();
}

function removeDuplicateTableTitleHeader(headers, title) {
  const normalizedTitle = normalizeComparableTableText(title);
  const nextHeaders = Array.isArray(headers) ? headers.map(clean) : [];
  if (!normalizedTitle || nextHeaders.length === 0) return nextHeaders;
  if (nextHeaders.length === 1 && normalizeComparableTableText(nextHeaders[0]) === normalizedTitle) return [];
  if (
    nextHeaders.length === 2 &&
    !clean(nextHeaders[0]) &&
    normalizeComparableTableText(nextHeaders[1]) === normalizedTitle
  ) {
    return [];
  }
  return nextHeaders;
}

function tableFromTextLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return null;
  const separator = lines.some((line) => String(line).includes("|"))
    ? "|"
    : lines.some((line) => String(line).includes(","))
      ? ","
      : "";
  if (!separator) return null;
  const rows = lines
    .map((line) => String(line).split(separator).map(clean))
    .filter((row) => row.length > 1);
  if (rows.length < 2) return null;
  return { headers: rows[0], rows: rows.slice(1) };
}

function normalizeTable(headers, rows, title = "") {
  const nextRows = Array.isArray(rows)
    ? rows.map((row) => (Array.isArray(row) ? row.map(clean) : [])).filter((row) => row.length > 0)
    : [];
  const nextHeaders = removeDuplicateTableTitleHeader(headers, title);
  const widestRow = nextRows.reduce((max, row) => Math.max(max, row.length), 0);

  if (nextHeaders.length > 0 && widestRow === nextHeaders.length + 1) {
    nextHeaders.unshift("");
  }
  const columnCount = Math.max(nextHeaders.length, widestRow);
  while (nextHeaders.length > 0 && nextHeaders.length < columnCount) nextHeaders.push("");

  return {
    headers: nextHeaders,
    rows: nextRows.map((row) => {
      const nextRow = [...row];
      while (nextRow.length < columnCount) nextRow.push("");
      return nextRow;
    }),
  };
}

function main() {
  const { folder, file } = parseArgs();
  const inputPath = folder ? teasOcrImageInputPath(folder) : "";
  const outputPath = inputPath ? teasOcrOutputPath(inputPath) : "";
  const filePath = file || latestStructuredFile(outputPath);
  if (!filePath) throw new Error("Pass --file or --folder with a structured OCR output.");

  const structured = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let normalizedTableCount = 0;
  let promotedTitleCount = 0;
  for (const page of structured.pages || []) {
    const exhibits = page?.questionColumn?.exhibits;
    if (!Array.isArray(exhibits)) continue;
    const promotion = tableTitlePromotion(page, exhibits);
    let promotionUsed = false;
    for (const exhibit of exhibits) {
      if (exhibit?.type !== "table") continue;
      const promotedTitle = promotion.title && !promotionUsed && !clean(exhibit.title) ? promotion.title : "";
      if (promotedTitle) {
        exhibit.title = promotedTitle;
        if (page?.questionColumn) page.questionColumn.headerLines = promotion.remainingHeaderLines;
        promotionUsed = true;
        promotedTitleCount += 1;
      }
      const fromText = (!Array.isArray(exhibit.rows) || exhibit.rows.length === 0)
        ? tableFromTextLines(exhibit.textLines)
        : null;
      const normalized = normalizeTable(fromText?.headers || exhibit.headers, fromText?.rows || exhibit.rows, exhibit.title);
      exhibit.headers = normalized.headers;
      exhibit.rows = normalized.rows;
      if (fromText) exhibit.textLines = [];
      exhibit.requiresCrop = false;
      normalizedTableCount += 1;
    }
  }

  const outputFile = path.join(path.dirname(filePath), `teas-ocr-structured-${Date.now()}.json`);
  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      {
        ...structured,
        tableNormalizedFrom: path.basename(filePath),
        tableNormalizedAt: Date.now(),
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(JSON.stringify({ inputFile: filePath, outputFile, normalizedTableCount, promotedTitleCount }, null, 2));
}

main();
