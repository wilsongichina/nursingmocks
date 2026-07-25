import path from "path";
import { access, appendFile, readdir, readFile, rm, stat, writeFile } from "fs/promises";

export const DEFAULT_NAXLEX_SOURCE_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex";

const DEFAULT_NAXLEX_SOURCE_PATHS = [DEFAULT_NAXLEX_SOURCE_ROOT];

const NAXLEX_IMAGE_PUBLIC_PATH = "/naxlex-images";
const NATURAL_PATH_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

type RawQuestion = {
  id?: unknown;
  question?: unknown;
  question_type_id?: unknown;
  questionTypeId?: unknown;
  image_path?: unknown;
};

export type NaxlexFolderImageRecord = {
  questionId: string;
  questionTypeId: string;
  fieldPath: string;
  sourceName: string;
  jsonPath: string;
  relativeJsonPath: string;
  questionHtml: string;
  imageSourceUrl: string;
  fileName: string;
  targetPath: string;
  publicPath: string;
  existsLocally: boolean;
};

export type NaxlexFolderImageScanResult = {
  folderPath: string;
  sourceName: string;
  directJsonFiles: number;
  images: NaxlexFolderImageRecord[];
};

type ImageFolderProgressStatus = "complete" | "needs-review";

type ImageFolderProgressEntry = {
  folderPath: string;
  status: ImageFolderProgressStatus;
  updatedAt: string;
  jsonFiles: number;
  images: number;
  unsaved: number;
  reportPath: string;
};

type ImageFolderProgress = {
  updatedAt: string;
  folders: Record<string, ImageFolderProgressEntry>;
};

export function scanSourcePaths() {
  const configured = process.env.NAXLEX_SCAN_SOURCE_PATHS;
  const paths = configured
    ? configured
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_NAXLEX_SOURCE_PATHS;

  return (paths.length > 0 ? paths : DEFAULT_NAXLEX_SOURCE_PATHS).map((rootPath) =>
    path.resolve(rootPath)
  );
}

function progressKey(folderPath: string) {
  return path.resolve(folderPath).toLowerCase();
}

function progressPathForSourceRoot(sourceRoot: string) {
  return path.join(sourceRoot, "image-source-progress.json");
}

async function readImageFolderProgress(sourceRoot: string): Promise<ImageFolderProgress> {
  try {
    const parsed = JSON.parse(await readFile(progressPathForSourceRoot(sourceRoot), "utf8")) as Partial<ImageFolderProgress>;
    return {
      updatedAt: String(parsed.updatedAt || ""),
      folders: parsed.folders && typeof parsed.folders === "object" ? parsed.folders : {},
    };
  } catch {
    return { updatedAt: "", folders: {} };
  }
}

async function writeImageFolderProgress(sourceRoot: string, progress: ImageFolderProgress) {
  await writeFile(
    progressPathForSourceRoot(sourceRoot),
    `${JSON.stringify(progress, null, 2)}\r\n`,
    "utf8"
  );
}

export async function imageFolderProgressStatus(folderPath: string) {
  const { resolvedFolder, sourceRoot } = ensureFolderInsideSourceRoots(folderPath);
  const progress = await readImageFolderProgress(sourceRoot);
  return progress.folders[progressKey(resolvedFolder)]?.status || null;
}

async function collectJsonFolders(rootPath: string) {
  const folders: string[] = [];

  async function visit(folderPath: string) {
    const entries = (await readdir(folderPath, { withFileTypes: true })).sort((a, b) =>
      NATURAL_PATH_COLLATOR.compare(a.name, b.name)
    );
    if (entries.some((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))) {
      folders.push(folderPath);
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await visit(path.join(folderPath, entry.name));
      }
    }
  }

  await visit(rootPath);
  return folders;
}

export async function listNaxlexJsonFolders() {
  const folders: string[] = [];
  for (const sourcePath of scanSourcePaths().sort((a, b) => NATURAL_PATH_COLLATOR.compare(a, b))) {
    try {
      const sourceStats = await stat(sourcePath);
      if (sourceStats.isDirectory()) {
        folders.push(...(await collectJsonFolders(sourcePath)));
      }
    } catch {
      continue;
    }
  }

  return folders;
}

export async function resetNaxlexImageScanProgress() {
  const removedFiles: string[] = [];
  const removedDirectories: string[] = [];

  for (const sourceRoot of scanSourcePaths()) {
    for (const filePath of [
      progressPathForSourceRoot(sourceRoot),
      path.join(sourceRoot, "image-source-scan-log.txt"),
    ]) {
      try {
        await rm(filePath, { force: true });
        removedFiles.push(filePath);
      } catch {
        continue;
      }
    }
  }

  for (const folderPath of await listNaxlexJsonFolders()) {
    const reportPath = path.join(folderPath, "unsaved-images.txt");
    try {
      await rm(reportPath, { force: true });
      removedFiles.push(reportPath);
    } catch {
      continue;
    }
  }

  const publicImageRoot = path.join(process.cwd(), "public", "naxlex-images");
  try {
    await rm(publicImageRoot, { force: true, recursive: true });
    removedDirectories.push(publicImageRoot);
  } catch {
    // The cache may not exist on a fresh machine.
  }

  return {
    reset: true,
    removedDirectories,
    removedFiles,
  };
}

export async function getAdjacentNaxlexJsonFolder(
  folderPath: string,
  direction: "first" | "next" | "previous",
  skipCompleted = false
) {
  const { resolvedFolder, sourceRoot } = ensureFolderInsideSourceRoots(folderPath);
  let folders = await listNaxlexJsonFolders();
  if (folders.length === 0) {
    throw new Error("No Naxlex folders with direct JSON files were found.");
  }
  if (skipCompleted) {
    const progress = await readImageFolderProgress(sourceRoot);
    folders = folders.filter((candidate) => !progress.folders[progressKey(candidate)]?.status);
    if (folders.length === 0) {
      throw new Error("No uncompleted Naxlex folders with direct JSON files were found.");
    }
  }

  if (direction === "first") {
    return {
      folderPath: folders[0],
      currentIndex: 0,
      totalFolders: folders.length,
      atStart: true,
      atEnd: folders.length === 1,
    };
  }

  const currentIndex = folders.findIndex((candidate) => path.resolve(candidate) === resolvedFolder);
  const fallbackIndex = folders.findIndex((candidate) => candidate.localeCompare(resolvedFolder) >= 0);
  if (currentIndex < 0) {
    const nearestIndex = fallbackIndex >= 0 ? fallbackIndex : folders.length - 1;
    return {
      folderPath: folders[nearestIndex],
      currentIndex: nearestIndex,
      totalFolders: folders.length,
      atStart: nearestIndex === 0,
      atEnd: nearestIndex === folders.length - 1,
    };
  }

  const index = currentIndex;
  const nextIndex =
    direction === "next"
      ? Math.min(index + 1, folders.length - 1)
      : Math.max(index - 1, 0);

  return {
    folderPath: folders[nextIndex],
    currentIndex: nextIndex,
    totalFolders: folders.length,
    atStart: nextIndex === 0,
    atEnd: nextIndex === folders.length - 1,
  };
}

export function ensureFolderInsideSourceRoots(folderPath: string) {
  const resolvedFolder = path.resolve(folderPath);
  const sourceRoot = scanSourcePaths().find((candidate) => {
    const relative = path.relative(candidate, resolvedFolder);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  });

  if (!sourceRoot) {
    throw new Error("Folder must be inside a configured Naxlex source folder.");
  }

  return {
    resolvedFolder,
    sourceRoot,
    sourceName: path.basename(sourceRoot),
  };
}

function questionArray(parsed: unknown): RawQuestion[] {
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

function resolveNaxlexAssetUrl(value: unknown) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://naxlex.com/nursing/${trimmed.replace(/^\/+/, "")}`;
}

function isDownloadableImageReference(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^data:image\//i.test(trimmed)) return false;
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif)(?:[?#].*)?$/i.test(trimmed);
}

function isStudyGuideImageReference(value: string) {
  const normalized = value.replace(/\\/g, "/").toLowerCase();
  try {
    return new URL(normalized).pathname.includes("/study_guides/");
  } catch {
    return normalized.includes("/study_guides/") || normalized.startsWith("study_guides/");
  }
}

function extractDownloadableImageReferences(value: string) {
  const references = new Set<string>();
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (isDownloadableImageReference(trimmed) && !/[<>]/.test(trimmed)) {
    references.add(trimmed);
  }

  const attributePattern =
    /\b(?:src|href|data-src|data-original|data-lazy-src|srcset)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  for (const match of trimmed.matchAll(attributePattern)) {
    const rawValue = match[1] || match[2] || match[3] || "";
    const candidates = rawValue
      .split(",")
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter(Boolean);
    for (const candidate of candidates) {
      if (isDownloadableImageReference(candidate)) {
        references.add(candidate);
      }
    }
  }

  const urlPattern = /https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|svg|bmp|avif)(?:[?#][^\s"'<>]*)?/gi;
  for (const match of trimmed.matchAll(urlPattern)) {
    if (isDownloadableImageReference(match[0])) {
      references.add(match[0]);
    }
  }

  return Array.from(references);
}

function collectImageReferences(value: unknown, basePath = "$"): Array<{ fieldPath: string; value: string }> {
  const references: Array<{ fieldPath: string; value: string }> = [];

  function visit(current: unknown, currentPath: string) {
    if (typeof current === "string") {
      for (const reference of extractDownloadableImageReferences(current)) {
        references.push({ fieldPath: currentPath, value: reference });
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${currentPath}[${index}]`));
      return;
    }

    if (current && typeof current === "object") {
      for (const [key, item] of Object.entries(current as Record<string, unknown>)) {
        visit(item, `${currentPath}.${key}`);
      }
    }
  }

  visit(value, basePath);
  return references;
}

function sourceFileNameFromUrl(url: string) {
  try {
    return path.basename(decodeURIComponent(new URL(url).pathname));
  } catch {
    return "";
  }
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function publicImagePath(relativeTargetPath: string) {
  return `${NAXLEX_IMAGE_PUBLIC_PATH}/${relativeTargetPath
    .split(path.sep)
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

export async function scanNaxlexImageFolder(folderPath: string): Promise<NaxlexFolderImageScanResult> {
  const { resolvedFolder, sourceRoot, sourceName } = ensureFolderInsideSourceRoots(folderPath);
  const folderStats = await stat(resolvedFolder);
  if (!folderStats.isDirectory()) {
    throw new Error("Folder path must point to a directory.");
  }

  const entries = await readdir(resolvedFolder, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => path.join(resolvedFolder, entry.name))
    .sort((a, b) => NATURAL_PATH_COLLATOR.compare(path.basename(a), path.basename(b)));

  const images: NaxlexFolderImageRecord[] = [];

  for (const jsonPath of jsonFiles) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(jsonPath, "utf8"));
    } catch {
      continue;
    }

    const relativeJsonPath = path.relative(sourceRoot, jsonPath);
    const relativeJsonFolder = path.dirname(relativeJsonPath);

    for (const [questionIndex, question] of questionArray(parsed).entries()) {
      const imageReferences = collectImageReferences(question, `questions[${questionIndex}]`);
      const seenQuestionUrls = new Set<string>();

      for (const imageReference of imageReferences) {
        const imageSourceUrl = resolveNaxlexAssetUrl(imageReference.value);
        const fileName = sourceFileNameFromUrl(imageSourceUrl);
        if (!imageSourceUrl || !fileName) continue;
        if (isStudyGuideImageReference(imageSourceUrl)) continue;
        if (seenQuestionUrls.has(imageSourceUrl)) continue;
        seenQuestionUrls.add(imageSourceUrl);

        // When scanning from the top-level Naxlex folder, the relative JSON folder already
        // includes the first source segment, e.g. "Nursing Exit Exams".
        const relativeTargetPath =
          sourceName.toLowerCase() === "naxlex"
            ? path.join(relativeJsonFolder, fileName)
            : path.join(sourceName, relativeJsonFolder, fileName);
        const targetPath = path.join(process.cwd(), "public", "naxlex-images", relativeTargetPath);

        images.push({
          questionId: String(question.id || "unknown"),
          questionTypeId: String(question.question_type_id ?? question.questionTypeId ?? "unknown"),
          fieldPath: imageReference.fieldPath,
          sourceName,
          jsonPath,
          relativeJsonPath: path.join(sourceName, relativeJsonPath),
          questionHtml: String(question.question || ""),
          imageSourceUrl,
          fileName,
          targetPath,
          publicPath: publicImagePath(relativeTargetPath),
          existsLocally: await pathExists(targetPath),
        });
      }
    }
  }

  return {
    folderPath: resolvedFolder,
    sourceName,
    directJsonFiles: jsonFiles.length,
    images,
  };
}

export type UnsavedImageFailure = {
  imageSourceUrl?: unknown;
  fieldPath?: unknown;
  error?: unknown;
};

export async function writeUnsavedImageReport(
  folderPath: string,
  failures: UnsavedImageFailure[] = []
) {
  const scan = await scanNaxlexImageFolder(folderPath);
  const { sourceRoot } = ensureFolderInsideSourceRoots(scan.folderPath);
  const failureMessages = new Map(
    failures.map((failure) => [
      `${String(failure.imageSourceUrl || "").trim()}::${String(failure.fieldPath || "").trim()}`,
      String(failure.error || "").trim(),
    ])
  );
  const unsavedImages = scan.images.filter((image) => !image.existsLocally);
  const reportPath = path.join(scan.folderPath, "unsaved-images.txt");
  const scanLogPath = path.join(sourceRoot, "image-source-scan-log.txt");
  const lines = [
    `Unsaved image report`,
    `Folder: ${scan.folderPath}`,
    `Generated: ${new Date().toISOString()}`,
    `Unsaved images: ${unsavedImages.length}`,
    "",
  ];

  if (unsavedImages.length === 0) {
    lines.push("No unsaved images found.");
  } else {
    for (const [index, image] of unsavedImages.entries()) {
      const error = failureMessages.get(`${image.imageSourceUrl}::${image.fieldPath}`);
      lines.push(
        `${index + 1}. Question: ${image.questionId}`,
        `   Type: ${image.questionTypeId}`,
        `   JSON: ${image.relativeJsonPath}`,
        `   Field: ${image.fieldPath}`,
        `   File: ${image.fileName}`,
        `   URL: ${image.imageSourceUrl}`,
        `   Target: ${image.targetPath}`,
        ...(error ? [`   Error: ${error}`] : []),
        ""
      );
    }
  }

  await writeFile(reportPath, `${lines.join("\r\n")}\r\n`, "utf8");
  const status: ImageFolderProgressStatus = unsavedImages.length === 0 ? "complete" : "needs-review";
  const progress = await readImageFolderProgress(sourceRoot);
  progress.updatedAt = new Date().toISOString();
  progress.folders[progressKey(scan.folderPath)] = {
    folderPath: scan.folderPath,
    status,
    updatedAt: progress.updatedAt,
    jsonFiles: scan.directJsonFiles,
    images: scan.images.length,
    unsaved: unsavedImages.length,
    reportPath,
  };
  await writeImageFolderProgress(sourceRoot, progress);
  await appendFile(
    scanLogPath,
    [
      new Date().toISOString(),
      `folder=${scan.folderPath}`,
      `jsonFiles=${scan.directJsonFiles}`,
      `images=${scan.images.length}`,
      `unsaved=${unsavedImages.length}`,
      `report=${reportPath}`,
    ].join("\t") + "\r\n",
    "utf8"
  );
  return {
    reportPath,
    scanLogPath,
    status,
    unsavedCount: unsavedImages.length,
  };
}
