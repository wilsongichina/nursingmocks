const fs = require("fs");
const path = require("path");
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const convertedDir = path.join(HESI_ROOT, "converted-json");
const previewDir = path.join(HESI_ROOT, "html-previews");
const reportDir = path.join(HESI_ROOT, "review-reports");
function slugify(value) {
  return String(value || "").replace(/\u00a0/g, " ").trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function updateFile(oldBase, versionNumber) {
  const oldPath = path.join(convertedDir, `${oldBase}.json`);
  if (!fs.existsSync(oldPath)) throw new Error(`Missing ${oldPath}`);
  const payload = JSON.parse(fs.readFileSync(oldPath, "utf8"));
  const title = `HESI A2 Anatomy and Physiology Version ${versionNumber}`;
  const slug = slugify(title);
  payload.subtopic = {
    ...payload.subtopic,
    id: `hesi-a2-anatomy-and-physiology-version-${versionNumber}`,
    name: title,
    slug,
    sourceVersion: versionNumber,
    sourceVersionLabel: `Version ${versionNumber} of 2`,
    setNumber: versionNumber,
    setLabel: `Version ${versionNumber}`,
    setNumberMeaning: "Standalone Anatomy PDF version, not merged HESI A2 Actual Exam set number",
  };
  payload.setNumber = versionNumber;
  payload.setLabel = `Version ${versionNumber}`;
  payload.setNumberMeaning = "Standalone Anatomy PDF version, not merged HESI A2 Actual Exam set number";
  payload.sourceVersion = versionNumber;
  payload.sourceVersionLabel = `Version ${versionNumber} of 2`;
  payload.questions = (payload.questions || []).map((question) => ({
    ...question,
    subtopic: title,
    subtopic_slug: slug,
    sourceMetadata: {
      ...(question.sourceMetadata || {}),
      setNumber: versionNumber,
      setLabel: `Version ${versionNumber}`,
      setNumberMeaning: "Standalone Anatomy PDF version, not merged HESI A2 Actual Exam set number",
      sourceVersion: versionNumber,
      sourceVersionLabel: `Version ${versionNumber} of 2`,
    },
  }));
  const newPath = path.join(convertedDir, `${slug}.json`);
  fs.writeFileSync(newPath, JSON.stringify(payload, null, 2), "utf8");
  if (newPath !== oldPath) fs.unlinkSync(oldPath);
  return { oldPath, newPath, questionCount: payload.questions.length };
}
const changes = [
  updateFile("hesi-a2-anatomy-and-physiology-set-1", 1),
  updateFile("hesi-a2-anatomy-and-physiology-set-2", 2),
];
for (const oldPreview of ["hesi-a2-anatomy-and-physiology-set-1.html", "hesi-a2-anatomy-and-physiology-set-2.html"]) {
  const filePath = path.join(previewDir, oldPreview);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
const summary = {
  reason: "Standalone Anatomy files are labeled as Anatomy Version 1/2, while the merged document uses separate HESI A2 Actual Exam Set numbers. The standalone files were not matched to merged set pages in the target search, so they should not be named Actual Exam Set 1/2.",
  changes,
  updatedAt: new Date().toISOString(),
};
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, "hesi-a2-anatomy-version-label-normalization.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
