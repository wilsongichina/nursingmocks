import fs from "fs";
import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

nextEnv.loadEnvConfig(process.cwd());

function arg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function credential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }
  return cert({ projectId, clientEmail, privateKey });
}

async function adminIdToken() {
  if (!getApps().length) initializeApp({ credential: credential() });
  const customToken = await getAuth().createCustomToken("codex-scan-maintenance", { admin: true });
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Could not exchange custom token.");
  return payload.idToken;
}

async function main() {
  const file = arg("file");
  const inputPath = arg("input-path");
  const outputPath = arg("output-path");
  const url = arg("url", "http://localhost:3000/api/admin/teas-image-import/scanned-questions");
  if (!file || !inputPath || !outputPath) {
    throw new Error("Pass --file, --input-path, and --output-path.");
  }

  const structured = JSON.parse(fs.readFileSync(file, "utf8"));
  const parsed = structuredToPayload(structured);
  const token = await adminIdToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        payload: parsed.payload,
      source: {
        inputPath,
        outputPath,
        ocrMode: "structured",
        ocrJobId: null,
      },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error || "Could not save scanned questions.");
  console.log(
    JSON.stringify(
      {
        file,
        questions: parsed.payload.questions.length,
        parserWarnings: parsed.warnings.length,
        response: payload,
      },
      null,
      2
    )
  );
}

function text(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stringArray(value) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function htmlLines(value, fallback) {
  const lines = stringArray(value);
  return lines.length > 0 ? lines : stringArray(fallback);
}

function paragraphs(lines) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function atiFormatForQuestionTypeId(questionTypeId) {
  if (questionTypeId === 2) return "multiple_select";
  if (questionTypeId === 6) return "ordered_response";
  if (questionTypeId === 7) return "fill_in_blank";
  if (questionTypeId === 9) return "hot_spot";
  return "multiple_choice";
}

function exhibitRequiresSourceImage(exhibit) {
  const type = String(exhibit?.type || "").toLowerCase();
  const hasStructuredTable = type === "table" && (Array.isArray(exhibit?.headers) || Array.isArray(exhibit?.rows));
  return !hasStructuredTable && (type === "image" || type === "chart" || Boolean(exhibit?.requiresCrop)) && !String(exhibit?.imagePath || "").trim();
}

function structuredToPayload(structured) {
  const pages = Array.isArray(structured?.pages) ? structured.pages : [];
  const warnings = [];
  const questions = pages.map((page, index) => {
    const column = page?.questionColumn && typeof page.questionColumn === "object" ? page.questionColumn : {};
    const promptLines = stringArray(column.promptLines);
    const promptHtmlLines = htmlLines(column.promptHtmlLines, column.promptLines);
    const passageHtmlLines = htmlLines(column.passageHtmlLines, column.passageLines);
    const choiceLines = stringArray(column.choiceLines);
    const questionTypeId = Number(column.questionTypeId || 1);
    const selectedAnswer = text(column.selectedAnswer).toUpperCase();
    const options = {};
    choiceLines.slice(0, 6).forEach((choice, choiceIndex) => {
      options[String.fromCharCode(65 + choiceIndex)] = { choice };
    });
    const exhibits = Array.isArray(column.exhibits) ? column.exhibits : [];
    const pageLabel = text(page?.fileName) || `page-${index + 1}`;
    const reviewWarnings = stringArray(column.warnings).map((warning) => `${pageLabel} ${warning}`);
    warnings.push(...reviewWarnings);

    return {
      id: `teas-structured-${index + 1}`,
      question: paragraphs(promptHtmlLines.length > 0 ? promptHtmlLines : promptLines),
      passage: passageHtmlLines.length > 0 ? paragraphs(passageHtmlLines) : "",
      options,
      correctAnswer: questionTypeId === 6 ? choiceLines.map((_, choiceIndex) => String.fromCharCode(65 + choiceIndex)) : selectedAnswer,
      solution: "",
      question_type_id: questionTypeId,
      ati_format: atiFormatForQuestionTypeId(questionTypeId),
      image_path: "",
      scanLayout: page,
      scanReview: {
        needsReview: reviewWarnings.length > 0,
        warnings: reviewWarnings,
        layoutMode: text(column.layoutMode),
        extractionModel: text(column.extractionModel),
        choiceCount: choiceLines.length,
        promptLineCount: promptLines.length,
        selectedAnswer,
        selectedAnswerScore: Number(column.selectedAnswerScore || 0),
        selectedAnswerConfidenceRatio: Number(column.selectedAnswerConfidenceRatio || 0),
        sourceFileName: pageLabel,
        questionNumber: text(column.questionNumber),
        questionProgress: text(column.questionProgress),
        examTitle: text(column.examTitle),
        subject: text(page?.subject),
        hasPassage: passageHtmlLines.length > 0,
        exhibitCount: exhibits.length,
        imageExhibitCount: exhibits.filter((exhibit) => ["image", "chart"].includes(String(exhibit?.type || "").toLowerCase())).length,
        inlineExhibitCount: exhibits.filter((exhibit) => Boolean(exhibit?.inline)).length,
        cropRequiredCount: exhibits.filter((exhibit) => Boolean(exhibit?.requiresCrop)).length,
        sourceImageRequired: exhibits.some(exhibitRequiresSourceImage),
      },
    };
  });
  return { payload: { questions }, warnings };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
