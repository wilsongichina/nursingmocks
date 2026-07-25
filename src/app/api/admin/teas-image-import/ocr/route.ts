import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import { teasOcrImageInputPath, teasOcrOutputPath } from "@/lib/admin/teas-ocr-paths";
import {
  exportGeminiTeasStructuredOcr,
  imageFilesInRange,
} from "@/lib/admin/google-gemini-teas-image-extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OcrJobStatus = "running" | "done" | "failed";

type OcrJob = {
  id: string;
  status: OcrJobStatus;
  mode: "structured";
  provider: "google_gemini_image";
  code: number | null;
  stdout: string;
  stderr: string;
  completed: number;
  total: number;
  inputPath: string;
  outputPath: string;
  startedAt: number;
  lastActivityAt: number;
  finishedAt: number | null;
};

const jobs = new Map<string, OcrJob>();

function pageCountInRange(folderPath: string, start: unknown, end: unknown) {
  return imageFilesInRange(folderPath, start, end).length;
}

function startOcrJob(options: {
  inputPath: string;
  outputPath: string;
  start?: string | number;
  end?: string | number;
}) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const job: OcrJob = {
    id,
    status: "running",
    mode: "structured",
    provider: "google_gemini_image",
    code: null,
    stdout: "",
    stderr: "",
    completed: 0,
    total: pageCountInRange(options.inputPath, options.start, options.end),
    inputPath: options.inputPath,
    outputPath: options.outputPath,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    finishedAt: null,
  };
  jobs.set(id, job);
  job.stdout += `Starting Google Gemini image extraction for ${job.total} page${job.total === 1 ? "" : "s"}.\n`;
  const stallTimeoutMs = Number(process.env.GEMINI_TEAS_JOB_STALL_TIMEOUT_MS || 90000);
  const watchdog = setInterval(() => {
    if (job.status !== "running") {
      clearInterval(watchdog);
      return;
    }
    const stalledFor = Date.now() - job.lastActivityAt;
    if (stalledFor > stallTimeoutMs) {
      job.code = 1;
      job.status = "failed";
      job.finishedAt = Date.now();
      job.stderr += `Gemini image extraction stalled for ${Math.round(stalledFor / 1000)} seconds without progress. Retry a smaller range or check Gemini quota/model availability.\n`;
      clearInterval(watchdog);
    }
  }, 5000);

  void exportGeminiTeasStructuredOcr({
    inputPath: options.inputPath,
    outputPath: options.outputPath,
    start: options.start,
    end: options.end,
    onPageStart: (page, fileName) => {
      job.lastActivityAt = Date.now();
      job.stdout += `${String(page).padStart(4, "0")} google_gemini_image processing ${fileName}\n`;
    },
    onPageMessage: (page, fileName, message) => {
      job.lastActivityAt = Date.now();
      job.stdout += `${String(page).padStart(4, "0")} google_gemini_image ${message} ${fileName}\n`;
    },
    onPage: (page, fileName, rowCount) => {
      job.lastActivityAt = Date.now();
      job.completed = Math.min(job.total || job.completed + 1, job.completed + 1);
      job.stdout += `${String(page).padStart(4, "0")} google_gemini_image ${rowCount} lines ${fileName}\n`;
    },
  })
    .then((outputFile) => {
      job.code = 0;
      job.status = "done";
      job.finishedAt = Date.now();
      clearInterval(watchdog);
      job.stdout += `Structured output: ${outputFile}\n`;
      job.stdout += `Load Latest Structured can now read this output, including any recorded page failures.\n`;
      if (job.total && job.completed > job.total) job.completed = job.total;
    })
    .catch((error) => {
      job.code = 1;
      job.status = "failed";
      job.finishedAt = Date.now();
      clearInterval(watchdog);
      const message = error instanceof Error ? error.message : "Google Gemini image extraction failed";
      job.stderr += message.includes("quota exceeded")
        ? `${message}\nOpen Google AI Studio, enable billing for this API project, then retry a small page range.\n`
        : message;
    });

  return job;
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const requestedInputPath = path.resolve(String(body.inputPath || ""));
    const inputPath = teasOcrImageInputPath(requestedInputPath);
    const outputPath = path.resolve(String(body.outputPath || teasOcrOutputPath(requestedInputPath)));

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Set GEMINI_API_KEY before starting Gemini TEAS image extraction." },
        { status: 400 }
      );
    }
    if (!fs.existsSync(inputPath)) {
      return NextResponse.json({ error: `Input folder not found: ${inputPath}` }, { status: 400 });
    }

    fs.mkdirSync(outputPath, { recursive: true });
    const job = startOcrJob({
      inputPath,
      outputPath,
      start: body.start,
      end: body.end,
    });

    return NextResponse.json({ jobId: job.id, job });
  } catch (error) {
    console.error("TEAS OCR job start failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start TEAS OCR job" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    const job = jobs.get(id);
    if (!job) return NextResponse.json({ error: "OCR job not found" }, { status: 404 });
    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load TEAS OCR job" },
      { status: 400 }
    );
  }
}
