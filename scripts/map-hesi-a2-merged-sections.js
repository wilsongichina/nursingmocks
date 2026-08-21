const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";
const BATCH_SIZE = Number(process.env.HESI_A2_SECTION_MAP_BATCH_SIZE || 8);

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

function mimeTypeForFile(filePath) {
  return path.extname(filePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
}

function pageNumber(filePath) {
  const match = path.basename(filePath).match(/page-(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function stripJsonFence(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseQuestionNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeSubject(value) {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();
  if (/math/.test(lower)) return "Mathematics";
  if (/vocab/.test(lower)) return "Vocabulary";
  if (/grammar|language/.test(lower)) return "Grammar";
  if (/reading/.test(lower)) return "Reading";
  if (/biology/.test(lower)) return "Biology";
  if (/chemistry/.test(lower)) return "Chemistry";
  if (/anatomy|physiology|a&p|a and p/.test(lower)) return "Anatomy and Physiology";
  if (/physics/.test(lower)) return "Physics";
  return raw || "unknown";
}

function inferSections(rows) {
  const sorted = [...rows].sort((a, b) => a.actualPage - b.actualPage);
  const sections = [];
  let current = null;
  let currentSetNumber = null;
  let inferredSetCounter = 0;
  let lastSubject = "";
  let lastQuestion = null;

  for (const row of sorted) {
    const subject = normalizeSubject(row.subject || row.visibleSubject);
    const firstQuestion = parseQuestionNumber(row.firstQuestion);
    const explicitSet = String(row.examSet || row.visibleSetHeader || "").match(/set\s*(\d+)/i);
    if (explicitSet) currentSetNumber = Number(explicitSet[1]);

    const startsByModel = Boolean(row.startsSection);
    const startsByQuestionReset = firstQuestion === 1 && lastQuestion !== null && lastQuestion > 1;
    const startsBySubjectChange = subject !== "unknown" && lastSubject && lastSubject !== "unknown" && subject !== lastSubject;
    const startsNew = !current || startsByModel || startsByQuestionReset || startsBySubjectChange;

    if (startsNew) {
      if (current) {
        current.endPage = row.actualPage - 1;
        sections.push(current);
      }

      if (subject === "Mathematics" && firstQuestion === 1 && !explicitSet) {
        inferredSetCounter += 1;
        if (!currentSetNumber || inferredSetCounter > currentSetNumber) currentSetNumber = inferredSetCounter;
      }
      if (!currentSetNumber) currentSetNumber = inferredSetCounter || 1;

      current = {
        setNumber: currentSetNumber,
        setLabel: `Set ${currentSetNumber}`,
        subject,
        startPage: row.actualPage,
        endPage: row.actualPage,
        firstQuestion: firstQuestion || "unknown",
        lastQuestion: parseQuestionNumber(row.lastQuestion) || firstQuestion || "unknown",
        questionTotal: row.questionTotal || "unknown",
        confidence: row.startsSection || firstQuestion === 1 || explicitSet ? "medium" : "low",
        notes: [],
      };
      if (!explicitSet) current.notes.push("Set number inferred from sequence; confirm visually before import.");
      if (subject === "unknown") current.notes.push("Subject unknown on section start; review boundary.");
    } else if (current) {
      current.endPage = row.actualPage;
      const last = parseQuestionNumber(row.lastQuestion) || parseQuestionNumber(row.firstQuestion);
      if (last) current.lastQuestion = last;
      if (row.questionTotal && row.questionTotal !== "unknown") current.questionTotal = row.questionTotal;
      if (subject !== "unknown" && current.subject === "unknown") current.subject = subject;
    }

    if (subject !== "unknown") lastSubject = subject;
    const last = parseQuestionNumber(row.lastQuestion) || firstQuestion;
    if (last) lastQuestion = last;
  }
  if (current) sections.push(current);

  return sections.map((section, index) => ({
    id: index + 1,
    ...section,
    suggestedQuizTitle: `HESI A2 Actual Exam ${section.setLabel} - ${section.subject}`,
    suggestedSlug: slugify(`HESI A2 Actual Exam ${section.setLabel} ${section.subject}`),
  }));
}

function slugify(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function scanBatch(model, apiKey, files, knownContext) {
  const prompt = `You are mapping a merged HESI A2 Actual Exam image document into sections.\n\nKnown previous context: ${knownContext || "none"}\n\nFor each provided image, identify only section metadata. Do not extract full questions.\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "pages": [\n    {\n      "pageImageIndex": 1,\n      "examSet": "Set 1|Set 2|Set 3|Set 4|Set 5|unknown",\n      "visibleSetHeader": "visible text if any",\n      "subject": "Mathematics|Vocabulary|Grammar|Reading|Biology|Chemistry|Anatomy and Physiology|Physics|unknown",\n      "visibleSubjectHeader": "visible text if any",\n      "firstQuestion": "first visible question number or unknown",\n      "lastQuestion": "last visible question number or unknown",\n      "questionTotal": "total shown in 'Question X of Y' or unknown",\n      "startsSection": true,\n      "continuesPreviousSection": false,\n      "visibleHeader": "generic top header text",\n      "notes": "brief notes only"\n    }\n  ]\n}\n\nRules:\n- startsSection is true when a new subject heading appears, question numbering resets, or a set header appears.\n- If the page only has a generic 'HESI A2 Actual Exam' header, infer subject from visible question content and nearby context when possible.\n- If you cannot infer subject, use unknown.\n- Preserve uncertainty in notes.`;

  const content = [
    { type: "text", text: prompt },
    ...files.map((filePath) => ({
      type: "image_url",
      image_url: {
        url: `data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`,
        detail: "low",
      },
    })),
  ];

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
  const text = (body.choices || []).map((choice) => choice.message?.content || "").join("").trim();
  const parsed = JSON.parse(stripJsonFence(text));
  const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
  return pages.map((page, index) => ({
    ...page,
    actualPage: pageNumber(files[index]),
    fileName: path.basename(files[index]),
  }));
}

async function main() {
  loadLocalEnv();
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const model = process.env.OPENAI_HESI_A2_IMAGE_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o";
  const imageDir = path.join(HESI_ROOT, "images", SOURCE);
  const images = fs.readdirSync(imageDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(imageDir, name));

  const rows = [];
  let context = "Start of document.";
  for (let index = 0; index < images.length; index += BATCH_SIZE) {
    const batch = images.slice(index, index + BATCH_SIZE);
    const start = pageNumber(batch[0]);
    const end = pageNumber(batch[batch.length - 1]);
    console.log(`Mapping pages ${start}-${end}`);
    const mapped = await scanBatch(model, apiKey, batch, context);
    rows.push(...mapped);
    const last = mapped[mapped.length - 1] || {};
    context = `Previous page ${last.actualPage || end}: set=${last.examSet || "unknown"}, subject=${last.subject || "unknown"}, lastQuestion=${last.lastQuestion || "unknown"}, total=${last.questionTotal || "unknown"}.`;
  }

  const sections = inferSections(rows);
  const report = {
    source: SOURCE,
    model,
    pageCount: images.length,
    mappedPageCount: rows.length,
    sectionCount: sections.length,
    sections,
    pages: rows,
    generatedAt: new Date().toISOString(),
    reviewRequired: sections.filter((s) => s.confidence === "low" || s.subject === "unknown" || String(s.notes || []).includes("confirm")).length,
  };
  const outDir = path.join(HESI_ROOT, "review-reports");
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "hesi-a2-merged-section-map.json");
  const csvPath = path.join(outDir, "hesi-a2-merged-section-map.csv");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const headers = ["id", "setNumber", "subject", "startPage", "endPage", "firstQuestion", "lastQuestion", "questionTotal", "confidence", "suggestedQuizTitle", "suggestedSlug", "notes"];
  const csv = [headers.join(","), ...sections.map((row) => headers.map((key) => `"${String(Array.isArray(row[key]) ? row[key].join("; ") : row[key] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  fs.writeFileSync(csvPath, `${csv}\n`, "utf8");
  console.log(JSON.stringify({ jsonPath, csvPath, pageCount: images.length, mappedPageCount: rows.length, sectionCount: sections.length, reviewRequired: report.reviewRequired }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
