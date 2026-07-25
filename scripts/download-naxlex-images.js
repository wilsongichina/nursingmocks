const fs = require("fs/promises");
const path = require("path");

const DEFAULT_SOURCE_ROOTS = [
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex\\Nursing Exit Exams",
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex\\Nursing Test Bank",
];

const IMAGE_ROOT = path.join(process.cwd(), "public", "naxlex-images");
const MANIFEST_PATH = path.join(IMAGE_ROOT, "download-manifest.json");

function loadLocalEnv() {
  return fs
    .readFile(path.join(process.cwd(), ".env.local"), "utf8")
    .then((contents) => {
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    })
    .catch(() => undefined);
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    limit: Number.POSITIVE_INFINITY,
    sourceRoots: process.env.NAXLEX_SCAN_SOURCE_PATHS
      ? process.env.NAXLEX_SCAN_SOURCE_PATHS.split(";").map((item) => item.trim()).filter(Boolean)
      : DEFAULT_SOURCE_ROOTS,
  };

  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--force") args.force = true;
    if (arg.startsWith("--limit=")) {
      const limit = Number(arg.slice("--limit=".length));
      if (Number.isFinite(limit) && limit > 0) args.limit = limit;
    }
    if (arg.startsWith("--source-roots=")) {
      args.sourceRoots = arg
        .slice("--source-roots=".length)
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return args;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkJsonFiles(rootPath, output = []) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      await walkJsonFiles(entryPath, output);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      output.push(entryPath);
    }
  }
  return output;
}

function questionArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  return [];
}

function resolveNaxlexAssetUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://naxlex.com/nursing/${trimmed.replace(/^\/+/, "")}`;
}

function sourceFileNameFromUrl(url) {
  try {
    return path.basename(decodeURIComponent(new URL(url).pathname));
  } catch {
    return "";
  }
}

function targetFolderForJson(sourceRoot, filePath) {
  const sourceName = path.basename(sourceRoot);
  const relativeJsonPath = path.relative(sourceRoot, filePath);
  return path.join(IMAGE_ROOT, sourceName, path.dirname(relativeJsonPath));
}

async function collectNaxlexImages(sourceRoots) {
  const records = [];

  for (const sourceRoot of sourceRoots) {
    if (!(await pathExists(sourceRoot))) continue;
    const files = await walkJsonFiles(sourceRoot);
    for (const filePath of files) {
      let parsed;
      try {
        parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
      } catch {
        continue;
      }

      for (const question of questionArray(parsed)) {
        const sourceUrl = resolveNaxlexAssetUrl(question.image_path);
        const fileName = sourceFileNameFromUrl(sourceUrl);
        if (!sourceUrl || !fileName) continue;

        const questionTypeId = String(question.question_type_id ?? question.questionTypeId ?? "unknown").trim();
        const targetFolder = targetFolderForJson(sourceRoot, filePath);
        const targetPath = path.join(targetFolder, fileName);
        records.push({
          questionId: String(question.id || "unknown"),
          questionTypeId: questionTypeId || "unknown",
          sourceRoot,
          sourceName: path.basename(sourceRoot),
          jsonPath: filePath,
          relativeJsonPath: path.join(path.basename(sourceRoot), path.relative(sourceRoot, filePath)),
          sourceUrl,
          fileName,
          targetFolder,
          targetPath,
          publicPath: `/naxlex-images/${path
            .relative(IMAGE_ROOT, targetPath)
            .split(path.sep)
            .map((part) => encodeURIComponent(part))
            .join("/")}`,
        });
      }
    }
  }

  const deduped = new Map();
  for (const record of records) {
    deduped.set(record.targetPath, record);
  }
  return Array.from(deduped.values()).sort((a, b) => a.targetPath.localeCompare(b.targetPath));
}

async function main() {
  await loadLocalEnv();
  const args = parseArgs(process.argv);
  if (!args.dryRun) {
    throw new Error(
      "Bulk image downloads are disabled for the admin image workflow. Use --dry-run or download from /admin/image-sources one image at a time."
    );
  }

  const records = await collectNaxlexImages(args.sourceRoots);
  const selected = records.slice(0, args.limit);
  const manifest = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  await fs.mkdir(IMAGE_ROOT, { recursive: true });

  for (const record of selected) {
    const exists = await pathExists(record.targetPath);
    if (args.dryRun) {
      manifest.push({ ...record, status: exists ? "exists" : "would_download" });
      continue;
    }

    if (exists && !args.force) {
      skipped += 1;
      manifest.push({ ...record, status: "skipped_exists" });
      continue;
    }

    try {
      throw new Error("Bulk downloads are disabled for the admin image workflow.");
    } catch (error) {
      failed += 1;
      manifest.push({
        ...record,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.warn(`failed ${record.sourceUrl}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    JSON.stringify(
      {
        found: records.length,
        processed: selected.length,
        downloaded,
        skipped,
        failed,
        dryRun: args.dryRun,
        manifestPath: MANIFEST_PATH,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
