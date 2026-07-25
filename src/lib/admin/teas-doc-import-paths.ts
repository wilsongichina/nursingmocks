import fs from "fs";
import path from "path";

export const TEAS_DOC_IMPORT_PATHS = [
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Teas Version 7 Real Exams\\Teas Version 7 Real Exams\\Set 4\\ATI TEAS Version 7 - Update 4.docx",
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Teas Version 7 Real Exams\\Teas Version 7 Real Exams\\Set 5\\ATI TEAS Version 7 - Update 5 August(NEW).docx",
];

export const TEAS_DOC_IMPORT_ROOT =
  process.env.TEAS_DOC_SOURCE_ROOT || "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru";

export type TeasDocImportFile = {
  path: string;
  relativePath: string;
  folder: string;
  name: string;
  bytes: number;
  lastModified: number;
  exists: boolean;
};

export function allowedTeasDocxFiles(): TeasDocImportFile[] {
  const root = path.resolve(TEAS_DOC_IMPORT_ROOT);
  return TEAS_DOC_IMPORT_PATHS.map((filePath) => {
    const resolved = path.resolve(filePath);
    const stat = fs.existsSync(resolved) ? fs.statSync(resolved) : null;
    return {
      path: resolved,
      relativePath: path.relative(root, resolved),
      folder: path.dirname(path.relative(root, resolved)),
      name: path.basename(resolved),
      bytes: stat?.size || 0,
      lastModified: stat?.mtimeMs || 0,
      exists: Boolean(stat?.isFile()),
    };
  });
}

export function resolveAllowedTeasDocxPath(filePath: string) {
  const resolved = path.resolve(filePath);
  const allowed = new Set(TEAS_DOC_IMPORT_PATHS.map((item) => path.resolve(item).toLowerCase()));
  if (!allowed.has(resolved.toLowerCase())) {
    throw new Error("Select one of the configured TEAS DOCX source files.");
  }
  return resolved;
}
