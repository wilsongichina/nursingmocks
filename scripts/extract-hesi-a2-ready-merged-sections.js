const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const mapPath = path.join(HESI_ROOT, "review-reports", "hesi-a2-merged-extraction-map-reviewed.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, ""));
const reportDir = path.join(HESI_ROOT, "review-reports");

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const limit = argValue("--limit") == null ? null : Number(argValue("--limit"));
const fromId = argValue("--from-id") == null ? null : Number(argValue("--from-id"));
const onlyId = argValue("--id") == null ? null : Number(argValue("--id"));
const provider = String(argValue("--provider", process.env.HESI_A2_IMAGE_PROVIDER || "gemini")).toLowerCase();
const model = argValue("--model", process.env.HESI_A2_IMAGE_MODEL || process.env.GEMINI_HESI_A2_IMAGE_MODEL || (provider === "openai" ? "gpt-4o-mini" : "gemini-3.6-flash"));
const chunkSize = Number(argValue("--chunk-size", "2"));
const overlap = Number(argValue("--overlap", "1"));
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const includeClean = process.argv.includes("--include-clean");

function existingReport(section) {
  const reportPath = path.join(reportDir, `${section.suggestedSlug}-review-report.json`);
  if (!fs.existsSync(reportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function isComplete(section) {
  const report = existingReport(section);
  if (!report) return false;
  const expected = Number(section.expectedQuestions || 0);
  const actual = Number(report.questionCount || report.actualQuestions || 0);
  const issues = Number(report.issueCount || 0);
  return expected > 0 && actual === expected && issues === 0;
}

const ready = (map.sections || [])
  .filter((section) => section.mapStatus === "ready_for_section_extraction")
  .filter((section) => !Number.isFinite(onlyId) || Number(section.id) === onlyId)
  .filter((section) => !Number.isFinite(fromId) || Number(section.id) >= fromId)
  .filter((section) => includeClean || !isComplete(section));
const selected = Number.isFinite(limit) && limit > 0 ? ready.slice(0, limit) : ready;

if (dryRun) {
  console.log(JSON.stringify({
    dryRun: true,
    provider,
    model,
    chunkSize,
    overlap,
    force,
    includeClean,
    selectedCount: selected.length,
    skippedCompleteCount: (map.sections || []).filter((section) => section.mapStatus === "ready_for_section_extraction" && isComplete(section)).length,
    selected: selected.map((section) => ({
      id: section.id,
      title: section.suggestedQuizTitle,
      pages: [section.startPage, section.endPage],
      expectedQuestions: section.expectedQuestions,
      existingClean: isComplete(section),
    })),
  }, null, 2));
  process.exit(0);
}

const results = [];
for (const section of selected) {
  console.log(`\n=== Extracting section ${section.id}: ${section.suggestedQuizTitle} (${section.startPage}-${section.endPage}) via ${provider}/${model} ===`);
  const args = [
    "scripts/extract-hesi-a2-merged-section-chunked.js",
    "--id", String(section.id),
    "--provider", provider,
    "--model", model,
    "--chunk-size", String(chunkSize),
    "--overlap", String(overlap),
  ];
  if (force) args.push("--force");
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
    timeout: Number(process.env.HESI_A2_SECTION_TIMEOUT_MS || 300000),
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  results.push({
    id: section.id,
    title: section.suggestedQuizTitle,
    slug: section.suggestedSlug,
    provider,
    model,
    status: result.status === 0 ? "ok" : "failed",
    exitCode: result.status,
    signal: result.signal,
  });
}

const outPath = path.join(HESI_ROOT, "review-reports", "hesi-a2-ready-section-extraction-run.json");
fs.writeFileSync(outPath, JSON.stringify({
  selectedCount: selected.length,
  skippedCompleteCount: (map.sections || []).filter((section) => section.mapStatus === "ready_for_section_extraction" && isComplete(section)).length,
  force,
  includeClean,
  fromId: Number.isFinite(fromId) ? fromId : null,
  onlyId: Number.isFinite(onlyId) ? onlyId : null,
  provider,
  model,
  chunkSize,
  overlap,
  results,
  generatedAt: new Date().toISOString(),
}, null, 2), "utf8");
console.log(`\nRun report: ${outPath}`);
const failures = results.filter((result) => result.status !== "ok");
process.exit(failures.length ? 1 : 0);
