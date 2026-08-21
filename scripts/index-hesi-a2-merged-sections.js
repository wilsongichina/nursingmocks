const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";

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
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}
function mimeTypeForFile(filePath) { return path.extname(filePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg"; }
function pageNumber(filePath) { const m = path.basename(filePath).match(/page-(\d+)/i); return m ? Number(m[1]) : 0; }
function stripJsonFence(text) { const trimmed = String(text || "").trim(); const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i); return fenced ? fenced[1].trim() : trimmed; }

async function scanBatch(model, apiKey, files) {
  const prompt = `Inspect these HESI A2 merged-document page images. For each image, identify visible exam set number if shown or infer from nearby header on the page, visible subject/section heading if shown, first visible question number, last visible question number, total question count if shown, and whether the page starts a new subject/section. Return only JSON: {"pages":[{"page":1,"examSet":"Set 1|unknown","subject":"Mathematics|Vocabulary|Grammar|Reading|Biology|Chemistry|Anatomy and Physiology|Physics|unknown","firstQuestion":"","lastQuestion":"","questionTotal":"","startsSection":true,"visibleHeader":"","notes":""}]}. Do not extract full questions.`;
  const content = [
    { type: "text", text: prompt },
    ...files.map((filePath) => ({
      type: "image_url",
      image_url: { url: `data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`, detail: "low" },
    })),
  ];
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content }], response_format: { type: "json_object" }, temperature: 0 }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
  const text = (body.choices || []).map((choice) => choice.message?.content || "").join("").trim();
  const parsed = JSON.parse(stripJsonFence(text));
  const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
  return pages.map((page, index) => ({ ...page, actualPage: pageNumber(files[index]), fileName: path.basename(files[index]) }));
}

async function main() {
  loadLocalEnv();
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  const model = process.env.OPENAI_HESI_A2_IMAGE_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o";
  const imageDir = path.join(HESI_ROOT, "images", SOURCE);
  const all = fs.readdirSync(imageDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((name) => path.join(imageDir, name));
  const selected = all.filter((_, index) => index % 5 === 0 || index < 12 || index > all.length - 8);
  const rows = [];
  for (let i = 0; i < selected.length; i += 8) {
    const batch = selected.slice(i, i + 8);
    console.log(`Scanning pages ${batch.map(pageNumber).join(", ")}`);
    rows.push(...await scanBatch(model, apiKey, batch));
  }
  const outDir = path.join(HESI_ROOT, "review-reports");
  fs.mkdirSync(outDir, { recursive: true });
  const output = { source: SOURCE, strategy: "sampled every 5 pages plus first/last pages", pageCount: all.length, scannedPageCount: selected.length, rows };
  const outPath = path.join(outDir, "hesi-a2-merged-section-index-sampled.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(JSON.stringify({ outPath, pageCount: all.length, scannedPageCount: selected.length, rows: rows.length }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : error); process.exit(1); });
