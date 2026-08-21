const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";
const BATCH_SIZE = Number(process.env.HESI_A2_OFFICIAL_MAP_BATCH_SIZE || 5);
const CANONICAL_SUBJECTS = [
  "Mathematics",
  "Reading Comprehension",
  "Vocabulary",
  "Grammar",
  "Biology",
  "Chemistry",
  "Anatomy and Physiology",
  "Physics",
  "unknown",
];

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

function imagePageNumber(filePath) {
  const match = path.basename(filePath).match(/page-(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function stripJsonFence(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function normalizeSubject(value) {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();
  if (/math/.test(lower)) return "Mathematics";
  if (/reading|comprehension/.test(lower)) return "Reading Comprehension";
  if (/vocab/.test(lower)) return "Vocabulary";
  if (/grammar|language/.test(lower)) return "Grammar";
  if (/biology/.test(lower)) return "Biology";
  if (/chemistry/.test(lower)) return "Chemistry";
  if (/anatomy|physiology|a\s*&\s*p|a\s+and\s+p/.test(lower)) return "Anatomy and Physiology";
  if (/physics/.test(lower)) return "Physics";
  return "unknown";
}

function parseNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
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

async function scanBatch(model, apiKey, files, context) {
  const expectedPages = files.map(imagePageNumber);
  const prompt = `Map these HESI A2 Actual Exam page images into official/recommended HESI A2 subjects.\n\nUse these canonical subject labels only unless unknown:\n- Mathematics\n- Reading Comprehension\n- Vocabulary\n- Grammar\n- Biology\n- Chemistry\n- Anatomy and Physiology\n- Physics\n- unknown\n\nOfficial/recommended HESI A2 review subjects are Mathematics, Reading Comprehension, Vocabulary, Grammar, Biology, Chemistry, and Anatomy and Physiology. Physics may appear in some schools/sources, so use it only if visibly supported.\n\nPrevious continuity context:\n${context}\n\nYou are given these exact image page numbers, in order: ${expectedPages.join(", ")}.\n\nReturn exactly one row per image page number. Do not skip pages. Do not extract full questions.\n\nReturn ONLY valid JSON:\n{\n  "pages": [\n    {\n      "actualPage": 1,\n      "examSetNumber": 1,\n      "examSetEvidence": "visible header|inferred from previous page|unknown",\n      "subject": "Mathematics|Reading Comprehension|Vocabulary|Grammar|Biology|Chemistry|Anatomy and Physiology|Physics|unknown",\n      "subjectEvidence": "visible heading|question content|inferred from previous page|unknown",\n      "visibleSetHeader": "",\n      "visibleSubjectHeader": "",\n      "firstQuestionNumber": 1,\n      "lastQuestionNumber": 5,\n      "questionTotal": 38,\n      "startsNewSection": true,\n      "continuesPreviousSection": false,\n      "confidence": "high|medium|low",\n      "notes": "brief notes"\n    }\n  ]\n}\n\nRules:\n- startsNewSection=true if a subject heading appears, a set title appears, or question numbering resets to 1 after a previous section.\n- Use question content to infer subject when the heading is generic. Example: equations/conversions -> Mathematics; word meanings -> Vocabulary; sentence correction/punctuation -> Grammar; passages -> Reading Comprehension; cells/genetics/ecology -> Biology; atoms/reactions/elements -> Chemistry; body systems/organs/bones/muscles/hormones -> Anatomy and Physiology.\n- If the page starts mid-question, use continuesPreviousSection=true.\n- Use null for unknown numeric values.\n- The actualPage values in JSON must match the supplied page numbers exactly.`;

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
  const byPage = new Map(pages.map((page) => [Number(page.actualPage), page]));
  return files.map((filePath) => {
    const actualPage = imagePageNumber(filePath);
    const page = byPage.get(actualPage) || {};
    return {
      actualPage,
      fileName: path.basename(filePath),
      examSetNumber: parseNumber(page.examSetNumber),
      examSetEvidence: page.examSetEvidence || "missing_model_row",
      subject: normalizeSubject(page.subject),
      subjectEvidence: page.subjectEvidence || "missing_model_row",
      visibleSetHeader: page.visibleSetHeader || "",
      visibleSubjectHeader: page.visibleSubjectHeader || "",
      firstQuestionNumber: parseNumber(page.firstQuestionNumber),
      lastQuestionNumber: parseNumber(page.lastQuestionNumber),
      questionTotal: parseNumber(page.questionTotal),
      startsNewSection: Boolean(page.startsNewSection),
      continuesPreviousSection: Boolean(page.continuesPreviousSection),
      confidence: ["high", "medium", "low"].includes(String(page.confidence)) ? page.confidence : "low",
      notes: page.notes || (byPage.has(actualPage) ? "" : "Model omitted this page; row filled for continuity."),
    };
  });
}

function fillContinuity(rows) {
  let currentSet = null;
  let currentSubject = "unknown";
  return rows.map((row) => {
    const next = { ...row };
    if (next.examSetNumber) currentSet = next.examSetNumber;
    else if (currentSet) {
      next.examSetNumber = currentSet;
      next.examSetEvidence = next.examSetEvidence === "missing_model_row" ? next.examSetEvidence : "inferred from previous page";
    }
    if (next.subject !== "unknown") currentSubject = next.subject;
    else if (currentSubject !== "unknown") {
      next.subject = currentSubject;
      next.subjectEvidence = next.subjectEvidence === "missing_model_row" ? next.subjectEvidence : "inferred from previous page";
    }
    return next;
  });
}

function inferSections(rows) {
  const sections = [];
  let current = null;
  let previousQuestion = null;
  for (const row of rows) {
    const startsByQuestionReset = row.firstQuestionNumber === 1 && previousQuestion !== null && previousQuestion > 1;
    const startsByFlag = Boolean(row.startsNewSection);
    const startsBySubjectChange = current && row.subject !== "unknown" && row.subject !== current.subject;
    const startsBySetChange = current && row.examSetNumber && row.examSetNumber !== current.setNumber;
    const starts = !current || startsByQuestionReset || startsByFlag || startsBySubjectChange || startsBySetChange;
    if (starts) {
      if (current) {
        current.endPage = row.actualPage - 1;
        sections.push(current);
      }
      current = {
        id: sections.length + 1,
        setNumber: row.examSetNumber || null,
        setLabel: row.examSetNumber ? `Set ${row.examSetNumber}` : "Set unknown",
        subject: row.subject,
        startPage: row.actualPage,
        endPage: row.actualPage,
        firstQuestion: row.firstQuestionNumber || "unknown",
        lastQuestion: row.lastQuestionNumber || row.firstQuestionNumber || "unknown",
        questionTotal: row.questionTotal || "unknown",
        confidence: row.confidence,
        notes: [],
      };
      if (!row.examSetNumber) current.notes.push("Missing set number; review visually.");
      if (row.subject === "unknown") current.notes.push("Missing subject; review visually.");
      if (row.confidence !== "high") current.notes.push(`Section starts with ${row.confidence} page confidence.`);
    } else if (current) {
      current.endPage = row.actualPage;
      if (row.lastQuestionNumber) current.lastQuestion = row.lastQuestionNumber;
      else if (row.firstQuestionNumber) current.lastQuestion = row.firstQuestionNumber;
      if (row.questionTotal) current.questionTotal = row.questionTotal;
      if (row.confidence === "low" && !current.notes.includes("Contains low-confidence page rows.")) current.notes.push("Contains low-confidence page rows.");
    }
    previousQuestion = row.lastQuestionNumber || row.firstQuestionNumber || previousQuestion;
  }
  if (current) sections.push(current);
  return sections.map((section, index) => ({
    ...section,
    id: index + 1,
    suggestedQuizTitle: section.setNumber
      ? `HESI A2 Actual Exam Set ${section.setNumber} - ${section.subject}`
      : `HESI A2 Actual Exam - ${section.subject}`,
    suggestedSlug: slugify(section.setNumber
      ? `HESI A2 Actual Exam Set ${section.setNumber} ${section.subject}`
      : `HESI A2 Actual Exam ${section.subject}`),
  }));
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => `"${String(Array.isArray(row[header]) ? row[header].join("; ") : row[header] ?? "").replace(/"/g, '""')}"`).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
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
  let context = "Document start; no prior page.";
  for (let index = 0; index < images.length; index += BATCH_SIZE) {
    const batch = images.slice(index, index + BATCH_SIZE);
    const pages = batch.map(imagePageNumber);
    console.log(`Official-map pages ${pages[0]}-${pages[pages.length - 1]}`);
    const mapped = await scanBatch(model, apiKey, batch, context);
    rows.push(...mapped);
    const last = mapped[mapped.length - 1];
    context = `Previous page ${last.actualPage}: set=${last.examSetNumber || "unknown"}, subject=${last.subject}, firstQ=${last.firstQuestionNumber || "unknown"}, lastQ=${last.lastQuestionNumber || "unknown"}, total=${last.questionTotal || "unknown"}.`;
  }
  const continuityRows = fillContinuity(rows);
  const sections = inferSections(continuityRows);
  const outDir = path.join(HESI_ROOT, "review-reports");
  fs.mkdirSync(outDir, { recursive: true });
  const report = {
    source: SOURCE,
    officialSubjectSource: "Elsevier HESI Admission Assessment Exam Review subject list: Mathematics, Reading Comprehension, Vocabulary, Grammar, Biology, Chemistry, Anatomy and Physiology; Physics kept only if visible in source.",
    canonicalSubjects: CANONICAL_SUBJECTS,
    model,
    pageCount: images.length,
    mappedPageCount: continuityRows.length,
    sectionCount: sections.length,
    lowConfidencePageRows: continuityRows.filter((row) => row.confidence === "low").length,
    sectionsNeedingReview: sections.filter((section) => section.subject === "unknown" || !section.setNumber || section.confidence !== "high" || section.notes.length > 0).length,
    sections,
    pages: continuityRows,
    generatedAt: new Date().toISOString(),
  };
  const jsonPath = path.join(outDir, "hesi-a2-merged-section-map-official.json");
  const sectionCsvPath = path.join(outDir, "hesi-a2-merged-section-map-official.csv");
  const pageCsvPath = path.join(outDir, "hesi-a2-merged-page-map-official.csv");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeCsv(sectionCsvPath, sections, ["id", "setNumber", "subject", "startPage", "endPage", "firstQuestion", "lastQuestion", "questionTotal", "confidence", "suggestedQuizTitle", "suggestedSlug", "notes"]);
  writeCsv(pageCsvPath, continuityRows, ["actualPage", "examSetNumber", "examSetEvidence", "subject", "subjectEvidence", "firstQuestionNumber", "lastQuestionNumber", "questionTotal", "startsNewSection", "continuesPreviousSection", "confidence", "visibleSetHeader", "visibleSubjectHeader", "notes", "fileName"]);
  console.log(JSON.stringify({ jsonPath, sectionCsvPath, pageCsvPath, pageCount: images.length, mappedPageCount: continuityRows.length, sectionCount: sections.length, lowConfidencePageRows: report.lowConfidencePageRows, sectionsNeedingReview: report.sectionsNeedingReview }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
