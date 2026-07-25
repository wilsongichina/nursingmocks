import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RepairProvider = "both" | "gemini" | "openai";

type RepairQuestion = {
  index?: number;
  subject?: string;
  marker?: string;
  passageMarker?: string;
  passageLines?: string[];
  passageCandidates?: Array<{ marker?: string; lines?: string[] }>;
  prompt?: string;
  choices?: string[];
  boldAnswers?: string[];
  warnings?: string[];
};

type ProviderRepairResult = {
  provider: "gemini" | "openai";
  model: string;
  status: "repaired" | "skipped" | "error";
  data?: unknown;
  error?: string;
};

const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const provider = providerFromBody(body.provider);
    const question = sanitizeQuestion(body.question);
    if (!question) {
      return NextResponse.json({ error: "Question payload is required." }, { status: 400 });
    }

    const providers = provider === "both" ? (["gemini", "openai"] as const) : ([provider] as const);
    const results: ProviderRepairResult[] = [];
    for (const selectedProvider of providers) {
      if (selectedProvider === "gemini") {
        results.push(await repairWithGemini(question));
      } else {
        results.push(await repairWithOpenAI(question));
      }
    }

    if (results.every((result) => result.status === "skipped")) {
      return NextResponse.json({ error: "No LLM provider key is configured.", results }, { status: 400 });
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not repair DOCX question." },
      { status: 400 }
    );
  }
}

function providerFromBody(value: unknown): RepairProvider {
  if (value === "gemini" || value === "openai" || value === "both") return value;
  return "both";
}

function sanitizeQuestion(value: unknown): RepairQuestion | null {
  if (!value || typeof value !== "object") return null;
  const source = value as RepairQuestion;
  return {
    index: Number(source.index || 0),
    subject: String(source.subject || ""),
    marker: String(source.marker || ""),
    passageMarker: String(source.passageMarker || ""),
    passageLines: Array.isArray(source.passageLines) ? source.passageLines.map(String).filter(Boolean) : [],
    passageCandidates: Array.isArray(source.passageCandidates)
      ? source.passageCandidates
          .map((candidate) => ({
            marker: String(candidate?.marker || ""),
            lines: Array.isArray(candidate?.lines) ? candidate.lines.map(String).filter(Boolean) : [],
          }))
          .filter((candidate) => candidate.marker || candidate.lines.length > 0)
      : [],
    prompt: String(source.prompt || ""),
    choices: Array.isArray(source.choices) ? source.choices.map(String).filter(Boolean) : [],
    boldAnswers: Array.isArray(source.boldAnswers) ? source.boldAnswers.map(String).filter(Boolean) : [],
    warnings: Array.isArray(source.warnings) ? source.warnings.map(String).filter(Boolean) : [],
  };
}

async function repairWithGemini(question: RepairQuestion): Promise<ProviderRepairResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  const model = process.env.GEMINI_TEAS_DOC_MODEL || process.env.GEMINI_TEAS_MODEL || "gemini-3.5-flash-lite";
  if (!apiKey) return { provider: "gemini", model, status: "skipped", error: "Missing GEMINI_API_KEY." };

  try {
    const response = await fetchWithTimeout(
      `${GEMINI_GENERATE_CONTENT_URL}/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
          contents: [{ role: "user", parts: [{ text: buildRepairPrompt(question) }] }],
        }),
      },
      Number(process.env.GEMINI_TEAS_DOC_TIMEOUT_MS || 45000)
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || "Gemini repair request failed.");
    const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("\n") || "";
    return { provider: "gemini", model, status: "repaired", data: parseJsonText(text) };
  } catch (error) {
    return { provider: "gemini", model, status: "error", error: error instanceof Error ? error.message : "Gemini repair failed." };
  }
}

async function repairWithOpenAI(question: RepairQuestion): Promise<ProviderRepairResult> {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_TEAS_DOC_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o";
  if (!apiKey) return { provider: "openai", model, status: "skipped", error: "Missing OPENAI_API_KEY." };

  try {
    const response = await fetchWithTimeout(
      OPENAI_CHAT_COMPLETIONS_URL,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You repair ATI TEAS DOCX question extraction. Return strict JSON only and do not invent unrelated content.",
            },
            { role: "user", content: buildRepairPrompt(question) },
          ],
        }),
      },
      Number(process.env.OPENAI_TEAS_DOC_TIMEOUT_MS || 90000)
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || "OpenAI repair request failed.");
    const text = payload?.choices?.[0]?.message?.content || "";
    return { provider: "openai", model, status: "repaired", data: parseJsonText(text) };
  } catch (error) {
    return { provider: "openai", model, status: "error", error: error instanceof Error ? error.message : "OpenAI repair failed." };
  }
}

function buildRepairPrompt(question: RepairQuestion) {
  return `Repair this ATI TEAS DOCX extraction.

Use only the provided DOCX text. If the prompt is missing, reconstruct the most likely question from the passage/choice context only when the source text supports it. If evidence is not enough, leave prompt empty and explain in notes.
For Reading questions, use the passage only when it belongs to the same DOCX stimulus group as the question. Do not attach a previous passage to a question unless the passageMarker/source context shows it belongs to that question. If the candidate passage does not support the question, return an empty passage and explain in notes.
When passageCandidates are present, choose the candidate that best supports the question and return its marker as passageMarker. If none supports it, return an empty passage and an empty passageMarker.

Return JSON with this exact shape:
{
  "subject": "Reading | Mathematics | Science | English and Language Usage | Unknown",
  "marker": "Question marker from source",
  "passageMarker": "Stimulus marker that belongs to this question, or empty",
  "passage": { "text": "passage if present, otherwise empty", "lines": [] },
  "question": { "text": "question prompt only", "lines": [] },
  "choices": ["choice text"],
  "correctAnswerText": "answer text if known",
  "questionTypeId": 1,
  "atiFormat": "multiple_choice | multiple_select | fill_in_the_blank | hot_spot | ordered_response",
  "confidence": 0,
  "notes": "short explanation of what was repaired or why it remains uncertain"
}

DOCX extraction:
${JSON.stringify(question, null, 2)}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonText(text: string) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { raw: trimmed };
  }
}
