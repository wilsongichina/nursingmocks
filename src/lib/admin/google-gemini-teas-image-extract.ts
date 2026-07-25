import fs from "fs";
import path from "path";

type GeminiQuestion = {
  questionNumber: string;
  subject: string;
  headerLines: string[];
  promptLines: string[];
  promptHtmlLines: string[];
  passageLines: string[];
  passageHtmlLines: string[];
  exhibits: GeminiExhibit[];
  choiceLines: string[];
  selectedAnswer: string;
  questionTypeId: number;
  atiFormat: string;
  warnings: string[];
};

type GeminiExhibit = {
  id: string;
  type: "table" | "chart" | "image" | "text";
  title: string;
  placement: GeminiExhibitPlacement;
  inline: boolean;
  requiresCrop: boolean;
  alt: string;
  imagePath: string;
  headers: string[];
  rows: string[][];
  textLines: string[];
  description: string;
};

type GeminiExhibitPlacement =
  | "before_passage"
  | "inside_passage"
  | "between_passage_and_question"
  | "inside_question"
  | "after_question"
  | "inside_choice"
  | "after_choices"
  | "unknown";

type GeminiGenerateContentResponse = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      "@type"?: string;
      retryDelay?: string;
    }>;
  };
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export type GeminiTeasImageExtractOptions = {
  inputPath: string;
  outputPath: string;
  start?: string | number;
  end?: string | number;
  providerMode?: "default" | "openai_only";
  onPageStart?: (page: number, fileName: string) => void;
  onPageMessage?: (page: number, fileName: string, message: string) => void;
  onPage?: (page: number, fileName: string, rowCount: number) => void;
};

const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export function pageNumberFromImageName(name: string) {
  const pageMatch = name.match(/page-(\d+)/i);
  if (pageMatch) return Number(pageMatch[1]);
  const zeroBasedImageMatch = name.match(/(?:^|[-_\s])(?:del-)?images-(\d+)\.(jpe?g|png|webp)$/i);
  if (zeroBasedImageMatch) return Number(zeroBasedImageMatch[1]) + 1;
  const plainMatch = name.match(/^(\d+)(?:[_-][^.]+)?\.(jpe?g|png|webp)$/i);
  return plainMatch ? Number(plainMatch[1]) : null;
}

export function imageFilesInRange(folderPath: string, start: unknown, end: unknown) {
  if (!fs.existsSync(folderPath)) return [];
  const startPage = Number(start || 1);
  const endPage = Number(end || Infinity);
  const filesByPage = new Map<number, { name: string; page: number; filePath: string }>();
  fs
    .readdirSync(folderPath)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .map((name) => ({ name, page: pageNumberFromImageName(name), filePath: path.join(folderPath, name) }))
    .filter((file): file is { name: string; page: number; filePath: string } => Boolean(file.page))
    .filter((file) => file.page >= startPage && file.page <= endPage)
    .sort((a, b) => a.page - b.page || imageVariantRank(a.name) - imageVariantRank(b.name))
    .forEach((file) => {
      if (!filesByPage.has(file.page)) filesByPage.set(file.page, file);
    });
  return Array.from(filesByPage.values()).sort((a, b) => a.page - b.page);
}

export async function exportGeminiTeasStructuredOcr(options: GeminiTeasImageExtractOptions) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Set GEMINI_API_KEY before starting Gemini TEAS image extraction.");
  }

  const files = imageFilesInRange(options.inputPath, options.start, options.end);
  fs.mkdirSync(options.outputPath, { recursive: true });

  const pages = [];
  const failedPages: Array<{ page: number; fileName: string; error: string }> = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    options.onPageStart?.(file.page, file.name);
    try {
      const extracted =
        options.providerMode === "openai_only"
          ? await extractQuestionFromImageWithOpenAIOnly(file.filePath, file.page, (message) => {
              options.onPageMessage?.(file.page, file.name, message);
            })
          : await extractQuestionFromImage(file.filePath, file.page, apiKey, (message) => {
              options.onPageMessage?.(file.page, file.name, message);
            });
      pages.push(extracted);
      const rowCount =
        extracted.questionColumn.promptLines.length +
        extracted.questionColumn.choiceLines.length +
        extracted.questionColumn.passageLines.length;
      options.onPage?.(file.page, file.name, rowCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini image extraction failed.";
      pages.push(failedPage(file.page, file.name, message));
      failedPages.push({ page: file.page, fileName: file.name, error: message });
      options.onPageMessage?.(file.page, file.name, `recorded failure: ${message}`);
      options.onPage?.(file.page, file.name, 0);

      if (message.toLowerCase().includes("quota exceeded")) {
        files.slice(index + 1).forEach((remaining) => {
          const skippedMessage = "Skipped because Gemini quota was exhausted earlier in this run.";
          pages.push(failedPage(remaining.page, remaining.name, skippedMessage));
          failedPages.push({ page: remaining.page, fileName: remaining.name, error: skippedMessage });
          options.onPageMessage?.(remaining.page, remaining.name, skippedMessage);
          options.onPage?.(remaining.page, remaining.name, 0);
        });
        break;
      }
    }
  }

  const timestamp = Date.now();
  const outputFile = path.join(options.outputPath, `teas-ocr-structured-${timestamp}.json`);
  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      {
        sourceFolder: options.inputPath,
        generatedAt: timestamp,
        ocrProvider: "google_gemini_image",
        pageCount: pages.length,
        failedPageCount: failedPages.length,
        failedPages,
        pages,
      },
      null,
      2
    ),
    "utf8"
  );
  return outputFile;
}

function failedPage(page: number, fileName: string, error: string) {
  return {
    page,
    fileName,
    width: null,
    height: null,
    subject: "",
    rowCount: 0,
    lineCount: 0,
    contentText: "",
    regionText: {
      header: "",
      left_context: "",
      question_column: "",
      footer: "",
    },
    questionColumn: {
      headerLines: [],
      promptLines: [],
      passageLines: [],
      choiceLines: [],
      selectedAnswer: "",
      markerScores: [],
      selectedAnswerScore: 0,
      secondAnswerScore: 0,
      selectedAnswerConfidenceRatio: 0,
      layoutMode: "google_gemini_image_failed",
      questionTypeId: 1,
      atiFormat: "multiple_choice",
      warnings: [error],
    },
    rows: [],
    lines: [],
    error,
  };
}

async function extractQuestionFromImage(
  filePath: string,
  page: number,
  apiKey: string,
  onMessage?: (message: string) => void
) {
  const models = geminiModelsToTry();
  const failedImageModels = geminiFailedImageModelsToTry(models);
  let lastError: unknown = null;
  for (const model of models) {
    try {
      onMessage?.(`using ${model}`);
      return await extractQuestionWithModel(filePath, page, apiKey, model);
    } catch (error) {
      lastError = error;
      onMessage?.(`failed ${model}: ${error instanceof Error ? error.message : "unknown error"}`);
      if (error instanceof NonRetryableGeminiError) {
        throw error;
      }
    }
  }

  for (const model of failedImageModels) {
    try {
      onMessage?.(`retrying failed image with ${model}`);
      return await extractQuestionWithModel(filePath, page, apiKey, model, "google_gemini_image_failed_retry");
    } catch (error) {
      lastError = error;
      onMessage?.(`failed retry ${model}: ${error instanceof Error ? error.message : "unknown error"}`);
      if (error instanceof NonRetryableGeminiError) {
        throw error;
      }
    }
  }

  for (const model of failedImageModels) {
    try {
      onMessage?.(`retrying failed image with relaxed JSON ${model}`);
      return await extractQuestionWithModel(
        filePath,
        page,
        apiKey,
        model,
        "google_gemini_image_relaxed_retry",
        "relaxed_json"
      );
    } catch (error) {
      lastError = error;
      onMessage?.(`failed relaxed retry ${model}: ${error instanceof Error ? error.message : "unknown error"}`);
      if (error instanceof NonRetryableGeminiError) {
        throw error;
      }
    }
  }

  const openAiApiKey = process.env.OPENAI_API_KEY || "";
  const openAiModels = openAiFailedImageModelsToTry();
  if (!openAiApiKey && openAiModels.length > 0) {
    onMessage?.("OpenAI failed-image fallback skipped: set OPENAI_API_KEY");
  }
  if (openAiApiKey) {
    for (const model of openAiModels) {
      try {
        onMessage?.(`retrying failed image with OpenAI ${model}`);
        return await extractQuestionWithOpenAIModel(filePath, page, openAiApiKey, model);
      } catch (error) {
        lastError = error;
        onMessage?.(`failed OpenAI retry ${model}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini image extraction failed.");
}

async function extractQuestionFromImageWithOpenAIOnly(
  filePath: string,
  page: number,
  onMessage?: (message: string) => void
) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("Set OPENAI_API_KEY before using OpenAI TEAS image extraction.");
  let lastError: unknown = null;
  for (const model of openAiFailedImageModelsToTry()) {
    try {
      onMessage?.(`using OpenAI ${model}`);
      return await extractQuestionWithOpenAIModel(filePath, page, apiKey, model, "openai_visual_retry");
    } catch (error) {
      lastError = error;
      onMessage?.(`failed OpenAI ${model}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("OpenAI image extraction failed.");
}

async function extractQuestionWithModel(
  filePath: string,
  page: number,
  apiKey: string,
  model: string,
  layoutMode = "google_gemini_image",
  responseMode: "schema" | "relaxed_json" = "schema"
) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.GEMINI_TEAS_PAGE_TIMEOUT_MS || 45000);
  const timeout = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 45000
  );
  let response: Response;
  try {
    response = await fetch(`${GEMINI_GENERATE_CONTENT_URL}/${model}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeTypeForFile(filePath),
                  data: fs.readFileSync(filePath).toString("base64"),
                },
              },
              {
                text: geminiPrompt(responseMode),
              },
            ],
          },
        ],
        generationConfig: geminiGenerationConfig(responseMode),
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const body = (await response.json()) as GeminiGenerateContentResponse;
  if (!response.ok) {
    const message = body.error?.message || JSON.stringify(body);
    const status = body.error?.status || "";
    if (response.status === 429 || status === "RESOURCE_EXHAUSTED") {
      throw new NonRetryableGeminiError(
        `Gemini quota exceeded for ${path.basename(filePath)}. Enable billing or wait for quota reset. Details: ${message}`
      );
    }
    if (response.status === 503 || status === "UNAVAILABLE") {
      const retryDelay = retryDelayMs(body) || 15000;
      await sleep(retryDelay);
      throw new Error(`Gemini model temporarily unavailable after retry delay (${retryDelay}ms): ${message}`);
    }
    throw new Error(`Gemini image extraction failed for ${path.basename(filePath)}: ${message}`);
  }

  const parsed = JSON.parse(geminiText(body)) as GeminiQuestion;
  return structuredPageFromQuestion(parsed, filePath, page, layoutMode, model);
}

async function extractQuestionWithOpenAIModel(
  filePath: string,
  page: number,
  apiKey: string,
  model: string,
  layoutMode = "openai_failed_image_retry"
) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_TEAS_PAGE_TIMEOUT_MS || 90000);
  const timeout = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 90000
  );
  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: geminiPrompt("relaxed_json"),
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const body = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!response.ok) {
    throw new Error(`OpenAI image extraction failed for ${path.basename(filePath)}: ${body.error?.message || JSON.stringify(body)}`);
  }

  const text = (body.choices || [])
    .map((choice) => choice.message?.content || "")
    .join("")
    .trim();
  if (!text) {
    throw new Error("OpenAI image extraction returned no text.");
  }

  const parsed = JSON.parse(text) as GeminiQuestion;
  return structuredPageFromQuestion(parsed, filePath, page, layoutMode, model);
}

function structuredPageFromQuestion(
  parsed: GeminiQuestion,
  filePath: string,
  page: number,
  layoutMode: string,
  model: string
) {
  const questionNumber = cleanText(parsed.questionNumber);
  const headerLines = safeStringArray(parsed.headerLines);
  const promptLines = safeStringArray(parsed.promptLines);
  const promptHtmlLines = safeFormattedLines(parsed.promptHtmlLines);
  const passageLines = safeStringArray(parsed.passageLines);
  const passageHtmlLines = safeFormattedLines(parsed.passageHtmlLines);
  const exhibits = safeExhibits(parsed.exhibits);
  const choiceLines = safeStringArray(parsed.choiceLines);
  const selectedAnswer = cleanText(parsed.selectedAnswer).toUpperCase();
  const subject = normalizedSubject(parsed.subject);
  const textLineCount = headerLines.length + promptLines.length + passageLines.length + exhibitLineCount(exhibits) + choiceLines.length;

  return {
    page,
    fileName: path.basename(filePath),
    width: null,
    height: null,
    subject,
    rowCount: textLineCount,
    lineCount: textLineCount,
    contentText: [
      ...headerLines,
      ...passageLines,
      ...exhibits.flatMap(exhibitTextLines),
      ...promptLines,
      ...choiceLines,
    ].join("\n"),
    regionText: {
      header: "",
      left_context: passageLines.join("\n"),
      question_column: [...promptLines, ...choiceLines].join("\n"),
      footer: "",
    },
    questionColumn: {
      questionNumber,
      headerLines,
      promptLines,
      promptHtmlLines,
      passageLines,
      passageHtmlLines,
      exhibits,
      choiceLines,
      selectedAnswer,
      markerScores: [],
      selectedAnswerScore: selectedAnswer ? 100 : 0,
      secondAnswerScore: 0,
      selectedAnswerConfidenceRatio: selectedAnswer ? 100 : 0,
      layoutMode,
      extractionModel: model,
      questionTypeId: normalizedQuestionType(parsed.questionTypeId),
      atiFormat: cleanText(parsed.atiFormat),
      warnings: safeStringArray(parsed.warnings),
    },
    rows: [],
    lines: [],
  };
}

function geminiPrompt(responseMode: "schema" | "relaxed_json") {
  const basePrompt = [
    responseMode === "relaxed_json"
      ? "Extract the visible ATI TEAS question from this screenshot and return one valid JSON object only."
      : "Extract exactly one ATI TEAS question from this screenshot.",
                  "Return only text visible in the image. Do not invent missing words.",
                  "Extract the visible question number into questionNumber when present, without the word Question.",
                  "Subject must be exactly one of: Reading, Mathematics, Science, English and Language Usage.",
                  "Preserve meaningful non-passage/non-question header text in headerLines, including section titles, exhibit titles, or table headings. Ignore app chrome.",
                  "If the passage has its own visible title or heading, keep it inline as the first passageHtmlLines entry using <strong>Title</strong>. Do not return separate title fields.",
                  "If the question/prompt has its own visible title or heading, keep it inline as the first promptHtmlLines entry using <strong>Title</strong>. Do not return separate title fields.",
                  "Do not put exam title text such as ATI TEAS Version 7 - Reading or subject labels such as Subject: Reading in promptLines, promptHtmlLines, passageLines, or passageHtmlLines. Store those only in subject/header metadata.",
                  "Detect passage separately from the question prompt. Not every question has a passage.",
                  "Put passage text in passageLines only when the screenshot shows a separate passage, reading excerpt, paragraph, scenario, case, or exhibit narrative before the question. If there is no separate passage, passageLines and passageHtmlLines must be empty.",
                  "Do not put the actual question prompt inside passageLines. Do not put passage sentences inside promptLines.",
                  "Preserve prompt line structure as separate promptLines. promptLines must contain only the direct question stem, instructions, or fill-in blank text that the student answers.",
                  "Use promptHtmlLines and passageHtmlLines to preserve visible bold, italic, superscript, subscript, and paragraph/line breaks with only these tags: <strong>, <em>, <sup>, <sub>, <br>.",
                  "Keep passage headings in headerLines and passage body in passageLines.",
                  "If the screenshot contains a visible grid or rows/columns, always classify it as a table exhibit. Do not classify visible tables as image, chart, or text.",
                  "For every visible table, extract headers and rows exactly as shown. Preserve row order, column order, blank visible cells as empty strings, and visible header labels.",
                  "For table exhibits, put column labels only in headers and body cells only in rows. Do not put CSV, pipe-delimited table text, or table row strings in textLines.",
                  "If a table has row labels, include the row-label heading as the first header when visible; if the row-label heading is blank, use an empty string as the first header.",
                  "For table rows, return each visual table row as an array of cell strings with the same column count as headers.",
                  "Tables are additional structured exhibits, not replacements for passage, prompt, or answer-choice text. Always extract all readable surrounding text too.",
                  "For table exhibits, preserve the table as structured rows and describe the original visual table view because the preview will show the source screenshot.",
                  "When an inline image, diagram, graph, chart, map, or figure is required to answer the question, add an exhibit with type image or chart, inline true, requiresCrop true, imagePath empty, and describe the visible labels/data.",
                  "For every exhibit, set id to exhibit_1, exhibit_2, etc. Set placement to one of: before_passage, inside_passage, between_passage_and_question, inside_question, after_question, inside_choice, after_choices, unknown.",
                  "For every inline exhibit, including tables, include a short alt text and place a matching placeholder in the nearest promptHtmlLines or passageHtmlLines position: <figure data-exhibit-id=\"exhibit_1\"></figure>.",
                  "For charts, diagrams, and images, describe only visible labels/data in description and textLines; do not guess missing values.",
                  "Put answer choices in choiceLines without A/B/C/D labels.",
                  "Ignore calculator UI, navigation buttons, time, flag, question counters, and unrelated app chrome.",
                  "Identify selectedAnswer from the visibly selected radio/checkbox marker. Return A, B, C, D, E, or F. If not visually clear, return an empty string and add a warning.",
                  "Classify questionTypeId using NursingMocks IDs: 1 multiple choice, 2 multiple select, 6 ordered response, 7 fill in blank, 9 hot spot.",
  ];
  if (responseMode === "relaxed_json") {
    basePrompt.push(
      "Return JSON with these exact keys: subject, questionNumber, headerLines, promptLines, promptHtmlLines, passageLines, passageHtmlLines, exhibits, choiceLines, selectedAnswer, questionTypeId, atiFormat, warnings.",
      "Use arrays for all line fields. If a field is not visible, return an empty string or empty array."
    );
  }
  return basePrompt.join("\n");
}

function geminiGenerationConfig(responseMode: "schema" | "relaxed_json") {
  if (responseMode === "relaxed_json") {
    return {
      responseMimeType: "application/json",
    };
  }
  return {
    responseMimeType: "application/json",
    responseSchema: geminiQuestionSchema(),
  };
}

function geminiQuestionSchema() {
  return {
    type: "object",
    properties: {
      subject: { type: "string" },
      questionNumber: { type: "string" },
      headerLines: { type: "array", items: { type: "string" } },
      promptLines: { type: "array", items: { type: "string" } },
      promptHtmlLines: { type: "array", items: { type: "string" } },
      passageLines: { type: "array", items: { type: "string" } },
      passageHtmlLines: { type: "array", items: { type: "string" } },
      exhibits: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["table", "chart", "image", "text"] },
            title: { type: "string" },
            placement: {
              type: "string",
              enum: [
                "before_passage",
                "inside_passage",
                "between_passage_and_question",
                "inside_question",
                "after_question",
                "inside_choice",
                "after_choices",
                "unknown",
              ],
            },
            inline: { type: "boolean" },
            requiresCrop: { type: "boolean" },
            alt: { type: "string" },
            imagePath: { type: "string" },
            headers: { type: "array", items: { type: "string" } },
            rows: {
              type: "array",
              items: { type: "array", items: { type: "string" } },
            },
            textLines: { type: "array", items: { type: "string" } },
            description: { type: "string" },
          },
          required: [
            "id",
            "type",
            "title",
            "placement",
            "inline",
            "requiresCrop",
            "alt",
            "imagePath",
            "headers",
            "rows",
            "textLines",
            "description",
          ],
        },
      },
      choiceLines: { type: "array", items: { type: "string" } },
      selectedAnswer: { type: "string" },
      questionTypeId: { type: "integer" },
      atiFormat: {
        type: "string",
        enum: ["multiple_choice", "multiple_select", "fill_in_blank", "hot_spot", "ordered_response"],
      },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "subject",
      "questionNumber",
      "headerLines",
      "promptLines",
      "promptHtmlLines",
      "passageLines",
      "passageHtmlLines",
      "exhibits",
      "choiceLines",
      "selectedAnswer",
      "questionTypeId",
      "atiFormat",
      "warnings",
    ],
  };
}

function geminiText(body: GeminiGenerateContentResponse) {
  const text = (body.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
  if (!text) {
    throw new Error("Gemini image extraction returned no text.");
  }
  return text;
}

function mimeTypeForFile(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

function safeStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => cleanText(item)).filter(Boolean) : [];
}

function safeFormattedLines(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanFormattedText(item)).filter(Boolean)
    : [];
}

function safeExhibits(value: unknown): GeminiExhibit[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Partial<GeminiExhibit>) : {};
      const type = ["table", "chart", "image", "text"].includes(String(record.type))
        ? (String(record.type) as GeminiExhibit["type"])
        : "text";
      const placement = ([
        "before_passage",
        "inside_passage",
        "between_passage_and_question",
        "inside_question",
        "after_question",
        "inside_choice",
        "after_choices",
        "unknown",
      ] as GeminiExhibitPlacement[]).includes(String(record.placement) as GeminiExhibitPlacement)
        ? (String(record.placement) as GeminiExhibitPlacement)
        : "unknown";
      const isVisual = type === "image" || type === "chart";
      return {
        id: cleanText(record.id),
        type,
        title: cleanText(record.title),
        placement,
        inline: Boolean(record.inline) || isVisual,
        requiresCrop: Boolean(record.requiresCrop) || isVisual,
        alt: cleanText(record.alt || record.description || record.title),
        imagePath: cleanText(record.imagePath),
        headers: safeStringArray(record.headers),
        rows: Array.isArray(record.rows)
          ? record.rows.map((row) => safeStringArray(row)).filter((row) => row.length > 0)
          : [],
        textLines: safeStringArray(record.textLines),
        description: cleanText(record.description),
      };
    })
    .filter((exhibit) => {
      return (
        exhibit.title ||
        exhibit.description ||
        exhibit.headers.length > 0 ||
        exhibit.rows.length > 0 ||
        exhibit.textLines.length > 0
      );
    });
}

function exhibitLineCount(exhibits: GeminiExhibit[]) {
  return exhibits.reduce((total, exhibit) => total + exhibitTextLines(exhibit).length, 0);
}

function exhibitTextLines(exhibit: GeminiExhibit) {
  return [
    exhibit.title,
    exhibit.description,
    ...exhibit.headers,
    ...exhibit.rows.flat(),
    ...exhibit.textLines,
  ].filter(Boolean);
}

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFormattedText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s*(<br\s*\/?>)\s*/gi, "$1")
    .trim();
}

function normalizedSubject(value: unknown) {
  const subject = cleanText(value).toLowerCase();
  if (subject.includes("math")) return "Mathematics";
  if (subject.includes("science")) return "Science";
  if (subject.includes("english") || subject.includes("language")) return "English and Language Usage";
  if (subject.includes("read")) return "Reading";
  return cleanText(value) || "";
}

function normalizedQuestionType(value: unknown) {
  const parsed = Number(value);
  return [1, 2, 6, 7, 9].includes(parsed) ? parsed : 1;
}

function geminiModelsToTry() {
  const configured = process.env.GEMINI_TEAS_IMAGE_MODELS
    ? process.env.GEMINI_TEAS_IMAGE_MODELS.split(",").map((model) => model.trim())
    : [process.env.GEMINI_TEAS_IMAGE_MODEL, process.env.GEMINI_TEAS_MODEL, "gemini-3.5-flash-lite"];
  return configured.filter((model, index, models): model is string => Boolean(model) && models.indexOf(model) === index);
}

function geminiFailedImageModelsToTry(primaryModels: string[]) {
  const configured = process.env.GEMINI_TEAS_FAILED_IMAGE_MODELS
    ? process.env.GEMINI_TEAS_FAILED_IMAGE_MODELS.split(",").map((model) => model.trim())
    : [process.env.GEMINI_TEAS_FAILED_IMAGE_MODEL];
  const models = configured.filter((model): model is string => Boolean(model));
  return models.filter((model, index) => models.indexOf(model) === index && !primaryModels.includes(model));
}

function openAiFailedImageModelsToTry() {
  const configured = process.env.OPENAI_TEAS_FAILED_IMAGE_MODELS
    ? process.env.OPENAI_TEAS_FAILED_IMAGE_MODELS.split(",").map((model) => model.trim())
    : [process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL, "gpt-4o"];
  const models = configured.filter((model): model is string => Boolean(model));
  return models.filter((model, index) => models.indexOf(model) === index);
}

function imageVariantRank(name: string) {
  if (/_no-ati-logo/i.test(name)) return 0;
  return 1;
}

function retryDelayMs(body: GeminiGenerateContentResponse) {
  const retryDelay = (body.error?.details || []).find((detail) => detail.retryDelay)?.retryDelay || "";
  const seconds = Number(retryDelay.replace(/s$/, ""));
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class NonRetryableGeminiError extends Error {}
