import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const cwd = process.cwd();
loadDotEnv(path.join(cwd, ".env.local"));

const outputPath = process.argv[2] || "C:\\Users\\wilso\\OneDrive\\Desktop\\sampletext.html";
const collectionName = "teasScannedQuestions";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

function firebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured in .env.local.");
  }
  return cert({ projectId, clientEmail, privateKey });
}

function firebaseApp() {
  return getApps()[0] || initializeApp({ credential: firebaseCredential() });
}

function timestampToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value.seconds) return new Date(value.seconds * 1000).toISOString();
  return String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJson(value) {
  return escapeHtml(JSON.stringify(value ?? null, null, 2));
}

function optionRows(options) {
  if (!options || typeof options !== "object") return "";
  return Object.entries(options)
    .map(([label, option]) => {
      const choice = typeof option === "object" && option !== null ? option.choice : option;
      return `<tr><th>${escapeHtml(label)}</th><td>${choice || ""}</td></tr>`;
    })
    .join("");
}

function partList(title, value) {
  if (!Array.isArray(value) || value.length === 0) return "";
  return `
    <section class="subsection">
      <h4>${escapeHtml(title)}</h4>
      <ol>${value.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ol>
    </section>
  `;
}

function recordHtml(doc) {
  const record = doc.data();
  const parts = record.questionParts || {};
  const metadata = parts.metadata || {};
  const legacyQuestionHtml = typeof record.question === "string" ? record.question : record.question?.html || "";
  const passage = record.passage || null;
  const questionBlock = record.questionContent || (typeof record.question === "object" ? record.question : null) || {};
  const bodyHtml = record.combinedHtml || parts.bodyHtml || legacyQuestionHtml || "";
  const passageHtml = passage?.html || parts.passageHtml || record.passageHtml || "";
  const questionHtml = questionBlock.html || parts.questionHtml || record.questionHtml || bodyHtml;
  const exhibits = record.exhibits || parts.exhibits || [];
  const setName = record.set?.name || record.setName || "";
  const setSlug = record.set?.slug || record.setSlug || "";
  const warnings = record.review?.warnings || [];
  return `
    <article class="record">
      <header class="record-header">
        <div>
          <p class="eyebrow">Saved Scan</p>
          <h2>Question ${escapeHtml(metadata.questionNumber || record.questionNumber || doc.id)}</h2>
        </div>
        <div class="badges">
          <span>${escapeHtml(record.status || "unknown")}</span>
          ${record.needsReview ? "<span class=\"warning\">Needs Review</span>" : "<span class=\"ready\">Ready</span>"}
          ${record.sourceImageRequired ? "<span>Source Image</span>" : ""}
        </div>
      </header>

      <section class="grid">
        <div class="card">
          <h3>Metadata Fields</h3>
          <dl>
            <dt>Document ID</dt><dd>${escapeHtml(doc.id)}</dd>
            <dt>Question Number</dt><dd>${escapeHtml(metadata.questionNumber || record.questionNumber || "")}</dd>
            <dt>Question Progress</dt><dd>${escapeHtml(metadata.questionProgress || record.questionProgress || "")}</dd>
            <dt>Exam Title</dt><dd>${escapeHtml(metadata.examTitle || record.examTitle || "")}</dd>
            <dt>Subject</dt><dd>${escapeHtml(metadata.subject || record.subject || "")}</dd>
            <dt>Set Name</dt><dd>${escapeHtml(setName)}</dd>
            <dt>Set Slug</dt><dd>${escapeHtml(setSlug)}</dd>
            <dt>Has Passage</dt><dd>${escapeHtml(record.hasPassage || Boolean(passageHtml))}</dd>
            <dt>Question Type</dt><dd>${escapeHtml(record.questionTypeId || "")}</dd>
            <dt>Correct Answer</dt><dd><code>${escapeHtml(JSON.stringify(record.correctAnswer ?? ""))}</code></dd>
            <dt>Source File</dt><dd>${escapeHtml(record.sourceFileName || "")}</dd>
            <dt>Created</dt><dd>${escapeHtml(timestampToText(record.createdAt))}</dd>
            <dt>Updated</dt><dd>${escapeHtml(timestampToText(record.updatedAt))}</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Review Fields</h3>
          <dl>
            <dt>Needs Review</dt><dd>${escapeHtml(record.needsReview)}</dd>
            <dt>Issue Count</dt><dd>${escapeHtml(record.issueCount || 0)}</dd>
            <dt>Warning Count</dt><dd>${escapeHtml(record.warningCount || 0)}</dd>
            <dt>Validation Errors</dt><dd>${escapeHtml(record.validationErrorCount || 0)}</dd>
            <dt>Exhibit Count</dt><dd>${escapeHtml(record.exhibitCount || 0)}</dd>
            <dt>Image Exhibit Count</dt><dd>${escapeHtml(record.imageExhibitCount || 0)}</dd>
          </dl>
          ${warnings.length ? `<h4>Warnings</h4><ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : ""}
        </div>
      </section>

      <section class="card">
        <h3>Passage Field</h3>
        <div class="rendered">${passageHtml || "<p>No passage saved for this question.</p>"}</div>
      </section>

      <section class="card">
        <h3>Question Field</h3>
        <div class="rendered">${questionHtml || "<p>No question text saved.</p>"}</div>
      </section>

      <section class="card">
        <h3>Combined Body Markup</h3>
        <div class="rendered">${bodyHtml || "<p>No question body saved.</p>"}</div>
      </section>

      <section class="card">
        <h3>Options</h3>
        <table class="options"><tbody>${optionRows(record.options) || "<tr><td>No options saved.</td></tr>"}</tbody></table>
      </section>

      <section class="card">
        <h3>Modular Question Parts</h3>
        ${partList("Header Lines", parts.headerLines)}
        ${partList("Passage Lines", parts.passageLines)}
        ${partList("Passage HTML Lines", parts.passageHtmlLines)}
        ${partList("Prompt Lines", parts.promptLines)}
        ${partList("Prompt HTML Lines", parts.promptHtmlLines)}
        ${partList("Exhibits", exhibits)}
        <details>
          <summary>Raw questionParts JSON</summary>
          <pre>${safeJson(parts)}</pre>
        </details>
      </section>
    </article>
  `;
}

const snapshot = await getFirestore(firebaseApp())
  .collection(collectionName)
  .orderBy("createdAt", "desc")
  .get();

const docs = snapshot.docs;
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TEAS Saved Scans Sample Text</title>
  <style>
    :root { color-scheme: light; --border:#d7dbe5; --muted:#64748b; --ink:#0f172a; --bg:#f3f4f6; --card:#fff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Arial, Helvetica, sans-serif; line-height: 1.5; }
    main { width: min(1500px, calc(100% - 48px)); margin: 0 auto; padding: 28px 0 60px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    h2 { margin: 0; font-size: 22px; }
    h3 { margin: 0 0 12px; font-size: 16px; }
    h4 { margin: 14px 0 8px; font-size: 13px; color: #334155; }
    .summary { margin: 0 0 24px; color: var(--muted); }
    .record { margin: 0 0 28px; padding: 18px; border: 1px solid var(--border); background: #eef2ff; }
    .record-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    .eyebrow { margin: 0 0 4px; color: #4338ca; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
    .badges span { border: 1px solid var(--border); background: #fff; padding: 4px 8px; font-size: 12px; font-weight: 700; }
    .badges .warning { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
    .badges .ready { background: #ecfdf5; border-color: #22c55e; color: #166534; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
    .card { margin: 0 0 14px; padding: 14px; border: 1px solid var(--border); background: var(--card); }
    dl { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 6px 12px; margin: 0; font-size: 13px; }
    dt { color: var(--muted); font-weight: 700; }
    dd { margin: 0; word-break: break-word; }
    .rendered { padding: 14px; border: 1px dashed #9ca3af; background: #fff; }
    .rendered table, .options { width: 100%; border-collapse: collapse; }
    .rendered th, .rendered td, .options th, .options td { border: 1px solid var(--border); padding: 8px; text-align: left; vertical-align: top; }
    .options th { width: 80px; background: #f8fafc; }
    pre { max-height: 460px; overflow: auto; background: #111827; color: #e5e7eb; padding: 12px; font-size: 12px; }
    details { margin-top: 12px; }
    summary { cursor: pointer; color: #4338ca; font-weight: 700; }
    @media (max-width: 900px) { main { width: min(100% - 24px, 1500px); } .grid { grid-template-columns: 1fr; } dl { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>TEAS Saved Scans Sample Text</h1>
    <p class="summary">Generated ${escapeHtml(new Date().toISOString())}. Records: ${docs.length}. This file shows modular storage fields and rendered body markup.</p>
    ${docs.map(recordHtml).join("\n")}
  </main>
</body>
</html>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(`Wrote ${docs.length} records to ${outputPath}`);
