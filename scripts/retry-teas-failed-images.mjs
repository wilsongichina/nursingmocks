import fs from "fs";
import path from "path";
import { exportGeminiTeasStructuredOcr } from "../src/lib/admin/google-gemini-teas-image-extract.ts";
import { teasOcrImageInputPath, teasOcrOutputPath } from "../src/lib/admin/teas-ocr-paths.ts";

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

function parseArgs() {
  const folderIndex = process.argv.indexOf("--folder");
  const pagesIndex = process.argv.indexOf("--pages");
  const providerIndex = process.argv.indexOf("--provider");
  const delayIndex = process.argv.indexOf("--delay-seconds");
  const folder = folderIndex >= 0 ? process.argv[folderIndex + 1] : "";
  const pages = pagesIndex >= 0
    ? process.argv[pagesIndex + 1].split(",").map((page) => Number(page.trim())).filter(Number.isFinite)
    : [];
  const provider = providerIndex >= 0 ? process.argv[providerIndex + 1] : "";
  const delaySeconds = delayIndex >= 0 ? Number(process.argv[delayIndex + 1]) : 0;
  return { folder, pages, provider, delaySeconds: Number.isFinite(delaySeconds) && delaySeconds > 0 ? delaySeconds : 0 };
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  loadLocalEnv();
  const { folder, pages, provider, delaySeconds } = parseArgs();
  if (!folder) throw new Error("Pass --folder with the TEAS set or ati-logo-removed folder path.");
  if (pages.length === 0) throw new Error("Pass --pages with comma-separated page numbers.");

  const inputPath = teasOcrImageInputPath(folder);
  const outputPath = teasOcrOutputPath(inputPath);
  const resultFiles = [];

  for (const page of pages) {
    const outputFile = await exportGeminiTeasStructuredOcr({
      inputPath,
      outputPath,
      start: page,
      end: page,
      providerMode: provider === "openai-only" ? "openai_only" : "default",
      onPageStart: (pageNumber, fileName) => {
        console.log(`${String(pageNumber).padStart(4, "0")} retry processing ${fileName}`);
      },
      onPageMessage: (pageNumber, fileName, message) => {
        console.log(`${String(pageNumber).padStart(4, "0")} retry ${message} ${fileName}`);
      },
      onPage: (pageNumber, fileName, rowCount) => {
        console.log(`${String(pageNumber).padStart(4, "0")} retry ${rowCount} lines ${fileName}`);
      },
    });
    resultFiles.push(outputFile);
    if (delaySeconds > 0 && page !== pages[pages.length - 1]) {
      console.log(`waiting ${delaySeconds}s before next page`);
      await sleep(delaySeconds * 1000);
    }
  }

  console.log(JSON.stringify({ inputPath, outputPath, pages, provider: provider || "default", delaySeconds, resultFiles }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
