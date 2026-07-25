import path from "path";
import fs from "fs";

export const ATI_LOGO_REMOVED_FOLDER_NAME = "ati-logo-removed";

export function teasOcrImageInputPath(inputPath: string) {
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

export function teasSetFolderPath(inputPath: string) {
  const resolved = path.resolve(inputPath);
  return path.basename(resolved).toLowerCase() === ATI_LOGO_REMOVED_FOLDER_NAME
    ? path.dirname(resolved)
    : resolved;
}

export function teasOcrOutputPath(inputPath: string) {
  return path.join(teasOcrImageInputPath(inputPath), "teas-ocr-output");
}
