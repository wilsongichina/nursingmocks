const fs = require("fs");
const path = require("path");

const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const inputDir = path.join(HESI_ROOT, "converted-json");
const outputDir = path.join(HESI_ROOT, "html-previews");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function optionEntries(options) {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((choice, index) => ({ label: String.fromCharCode(65 + index), choice: String(choice || "") }));
  }
  return Object.keys(options).sort().map((label) => {
    const value = options[label];
    return {
      label,
      choice: value && typeof value === "object" ? String(value.choice || "") : String(value || ""),
      reason: value && typeof value === "object" ? String(value.reason || "") : "",
    };
  });
}

function correctLabels(correctAnswer) {
  if (Array.isArray(correctAnswer)) return correctAnswer.map(String).map((x) => x.toUpperCase());
  return String(correctAnswer || "").split(/[;,]/).map((x) => x.trim().toUpperCase()).filter(Boolean);
}

function renderQuestion(question, index) {
  const correct = correctLabels(question.correctAnswer || question.correct_answer);
  const source = question.sourceMetadata || {};
  const options = optionEntries(question.options);
  const badges = [
    source.answerSource ? `Answer: ${source.answerSource}` : "",
    source.optionsSource ? `Options: ${source.optionsSource}` : "",
    source.explanationSource ? `Explanation: ${source.explanationSource}` : "",
    source.continuationMerged ? "Continuation merged" : "",
    source.needsReview ? "Needs review" : "",
  ].filter(Boolean);
  return `
    <article class="question ${source.needsReview ? "needs-review" : ""}" id="q${index + 1}">
      <div class="q-header">
        <div>
          <p class="eyebrow">Question ${index + 1}</p>
          <h2>${escapeHtml(question.question_slug || `question-${index + 1}`)}</h2>
        </div>
        <a href="#top" class="top-link">Top</a>
      </div>
      <section class="prompt">${question.question || "<p><strong>Missing question text.</strong></p>"}</section>
      <ol class="options" type="A">
        ${options.map((option) => {
          const isCorrect = correct.includes(String(option.label).toUpperCase());
          return `<li class="option ${isCorrect ? "correct" : ""}"><span class="label">${escapeHtml(option.label)}</span><span class="choice">${option.choice || "<em>Blank option</em>"}</span>${option.reason ? `<div class="reason">${option.reason}</div>` : ""}</li>`;
        }).join("\n")}
      </ol>
      <div class="answer-row">
        <strong>Correct answer:</strong> ${escapeHtml(correct.join(", ") || "Missing")}
      </div>
      <section class="solution">
        <h3>Rationale</h3>
        ${question.solution || "<p><em>No rationale provided.</em></p>"}
      </section>
      <section class="metadata">
        <h3>Source Metadata</h3>
        <div class="badges">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
        <dl>
          <dt>Source file</dt><dd>${escapeHtml(source.sourceFile || "")}</dd>
          <dt>Set</dt><dd>${escapeHtml(source.setLabel || "")}</dd>
          <dt>Source pages</dt><dd>${escapeHtml(Array.isArray(source.sourcePages) ? source.sourcePages.join(", ") : "")}</dd>
          <dt>Question type</dt><dd>${escapeHtml(question.question_type_id || "")}</dd>
          <dt>Review notes</dt><dd>${escapeHtml(source.reviewNotes || "")}</dd>
        </dl>
      </section>
    </article>`;
}

function renderHtml(payload, sourceFile) {
  const title = payload.subtopic?.name || payload.title || path.basename(sourceFile, ".json");
  const questions = Array.isArray(payload.questions) ? payload.questions : [];
  const needsReview = questions.filter((q) => q.sourceMetadata?.needsReview).length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} Preview</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#667085; --line:#d9e0ea; --bg:#f6f8fb; --surface:#fff; --accent:#2563eb; --ok:#15803d; --ok-bg:#ecfdf3; --warn:#b45309; --warn-bg:#fffbeb; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: Arial, Helvetica, sans-serif; color:var(--ink); background:var(--bg); line-height:1.55; }
    header { background:#111827; color:white; padding:32px 28px; }
    header h1 { margin:0 0 8px; font-size:30px; letter-spacing:0; }
    header p { margin:0; color:#cbd5e1; }
    main { display:grid; grid-template-columns:280px minmax(0, 1fr); gap:24px; max-width:1320px; margin:0 auto; padding:24px; }
    nav { position:sticky; top:16px; align-self:start; background:var(--surface); border:1px solid var(--line); padding:16px; }
    nav h2 { font-size:14px; margin:0 0 12px; text-transform:uppercase; color:var(--muted); }
    nav a { display:block; padding:7px 0; color:#1d4ed8; text-decoration:none; border-bottom:1px solid #eef2f7; font-size:14px; }
    nav a:hover { text-decoration:underline; }
    .summary { background:var(--surface); border:1px solid var(--line); padding:18px; margin-bottom:18px; }
    .summary-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px; }
    .metric { border-left:3px solid var(--accent); padding-left:10px; }
    .metric strong { display:block; font-size:22px; }
    .metric span { color:var(--muted); font-size:13px; }
    .question { background:var(--surface); border:1px solid var(--line); padding:22px; margin-bottom:18px; }
    .question.needs-review { border-color:#f59e0b; background:#fffdf5; }
    .q-header { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; border-bottom:1px solid #edf1f6; padding-bottom:12px; margin-bottom:16px; }
    .eyebrow { margin:0 0 4px; color:var(--muted); text-transform:uppercase; font-size:12px; font-weight:700; letter-spacing:.08em; }
    h2 { margin:0; font-size:17px; font-weight:700; color:#111827; }
    .top-link { color:var(--muted); font-size:13px; text-decoration:none; }
    .prompt { font-size:17px; margin-bottom:16px; }
    .prompt p:first-child { margin-top:0; }
    .options { list-style:none; margin:0 0 16px; padding:0; display:grid; gap:10px; }
    .option { display:grid; grid-template-columns:36px 1fr; gap:10px; border:1px solid #e3e8ef; padding:10px; background:#fbfdff; }
    .option.correct { border-color:#86efac; background:var(--ok-bg); }
    .label { width:26px; height:26px; display:inline-grid; place-items:center; border-radius:50%; background:#e5e7eb; font-weight:700; }
    .correct .label { background:#16a34a; color:white; }
    .reason { grid-column:2; color:var(--muted); font-size:14px; margin-top:4px; }
    .answer-row { padding:10px 12px; background:#eff6ff; border:1px solid #bfdbfe; margin-bottom:14px; }
    .solution { border-top:1px solid #edf1f6; padding-top:14px; }
    .solution h3, .metadata h3 { margin:0 0 8px; font-size:15px; }
    .metadata { border-top:1px solid #edf1f6; padding-top:14px; margin-top:14px; color:var(--muted); font-size:13px; }
    .badges { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
    .badges span { background:#eef2ff; color:#3730a3; padding:4px 8px; border:1px solid #c7d2fe; }
    dl { display:grid; grid-template-columns:130px 1fr; gap:4px 12px; margin:0; }
    dt { font-weight:700; color:#475467; }
    dd { margin:0; }
    @media (max-width: 900px) { main { grid-template-columns:1fr; padding:16px; } nav { position:static; } .summary-grid { grid-template-columns:repeat(2, 1fr); } }
  </style>
</head>
<body>
  <header id="top">
    <h1>${escapeHtml(title)}</h1>
    <p>Import preview generated from ${escapeHtml(path.basename(sourceFile))}. Review question text, options, answers, rationales, and source metadata before import.</p>
  </header>
  <main>
    <nav>
      <h2>Questions</h2>
      ${questions.map((_, index) => `<a href="#q${index + 1}">Question ${index + 1}</a>`).join("\n")}
    </nav>
    <section>
      <section class="summary">
        <div class="summary-grid">
          <div class="metric"><strong>${questions.length}</strong><span>Questions</span></div>
          <div class="metric"><strong>${escapeHtml(payload.setLabel || payload.subtopic?.setLabel || "")}</strong><span>Set</span></div>
          <div class="metric"><strong>${needsReview}</strong><span>Needs review</span></div>
          <div class="metric"><strong>${escapeHtml(payload.subtopic?.sourceFile || "")}</strong><span>Source</span></div>
        </div>
      </section>
      ${questions.map(renderQuestion).join("\n")}
    </section>
  </main>
</body>
</html>`;
}

function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith(".json")).sort();
  const outputs = [];
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
    const base = slugify(payload.subtopic?.name || path.basename(file, ".json"));
    const outputPath = path.join(outputDir, `${base}.html`);
    fs.writeFileSync(outputPath, renderHtml(payload, filePath), "utf8");
    outputs.push(outputPath);
  }
  console.log(JSON.stringify({ outputDir, count: outputs.length, outputs }, null, 2));
}

main();
