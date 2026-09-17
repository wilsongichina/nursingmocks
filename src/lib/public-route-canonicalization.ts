export const ATI_TEAS_SET_NUMBERS = [
  "1",
  "2",
  "3",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
] as const;

export const ATI_TEAS_SUBJECTS = ["english", "math", "reading", "science"] as const;

const ATI_TEAS_SET_NUMBER_SET = new Set(ATI_TEAS_SET_NUMBERS);

export type AtiTeasPathParts =
  | { kind: "parent" }
  | { kind: "subject"; subject: (typeof ATI_TEAS_SUBJECTS)[number]; setNumber?: string };

function normalizedPath(path: string) {
  const normalized = `/${String(path || "").replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return normalized === "/" ? "/" : normalized.toLowerCase();
}

// These navigation labels used URLs that never had their own content pages.
const PUBLIC_PATH_ALIASES: Record<string, string> = {
  "/hesi-a2": "/hesi-a2-practice-test",
  "/nursing": "/nursing-test-bank",
  "/nursing-exit-exam/rn-exit-exams": "/rn-exit-exams",
  "/nursing-exit-exam/lpn-exit-exams": "/lpn-exit-exams",
  "/nursing-exit-exam/rn-exit-exams-exit-exam": "/rn-exit-exams",
  "/nursing-exit-exam/lpn-exit-exams-exit-exam": "/lpn-exit-exams",
};

export function isRetiredPublicPath(path: string) {
  return normalizedPath(path) === "/ati-teas";
}

export function isPublicKnowledgeBaseArticle(article: Record<string, unknown>) {
  const slug = String(article.slug || "").trim();
  return Boolean(slug) && !isRetiredPublicPath(slug) &&
    (!article.status || String(article.status).toLowerCase() === "published");
}

/**
 * Keep legacy TEAS links pointing at the canonical public route family.
 * Sets 4 and 5 are intentionally excluded because those records do not exist.
 */
export function canonicalizePublicPath(path: string) {
  const normalized = normalizedPath(path);
  if (PUBLIC_PATH_ALIASES[normalized]) return PUBLIC_PATH_ALIASES[normalized];

  if (
    normalized === "/teas-7-practice" ||
    normalized === "/teas-7-practice-test" ||
    normalized === "/teas-practice-test" ||
    normalized === "/ati-teas-7-practice-test"
  ) {
    return "/ati-teas-practice-test";
  }

  const match = normalized.match(
    /^\/teas-(english|math|reading|science)-practice-test(?:-set-(\d+))?$/
  );
  if (!match || !ATI_TEAS_SUBJECTS.includes(match[1] as (typeof ATI_TEAS_SUBJECTS)[number])) {
    return normalized;
  }

  const setNumber = match[2];
  if (setNumber && !ATI_TEAS_SET_NUMBER_SET.has(setNumber as (typeof ATI_TEAS_SET_NUMBERS)[number])) {
    return normalized;
  }

  return `/ati-teas-${match[1]}-practice-test${setNumber ? `-set-${setNumber}` : ""}`;
}

export function isCanonicalPublicPath(path: string) {
  return normalizedPath(path) === canonicalizePublicPath(path);
}

export function getPublicRouteLookupSlugs(slug: string): string[] {
  const normalized = normalizedPath(slug.toLowerCase().replace(/\s+/g, "-").trim()).slice(1);
  if (isRetiredPublicPath(normalized)) return [];
  const canonical = canonicalizePublicPath(`/${normalized}`).slice(1);
  const parts = getAtiTeasPathParts(canonical);
  if (parts?.kind !== "subject") return [normalized];

  // The public URL was renamed before the stored quiz routes. Resolve both names
  // to their saved record; never infer a quiz ID from a subject or set number.
  return [canonical, canonical.replace(/^ati-teas-/, "teas-")];
}

export function getAtiTeasPathParts(path: string): AtiTeasPathParts | null {
  const normalized = normalizedPath(path);
  if (normalized === "/ati-teas-practice-test") {
    return { kind: "parent" };
  }

  const match = normalized.match(
    /^\/ati-teas-(english|math|reading|science)-practice-test(?:-set-(\d+))?$/
  );
  if (!match) return null;

  const subject = match[1] as (typeof ATI_TEAS_SUBJECTS)[number];
  const setNumber = match[2];
  if (setNumber && !ATI_TEAS_SET_NUMBER_SET.has(setNumber as (typeof ATI_TEAS_SET_NUMBERS)[number])) {
    return null;
  }

  return { kind: "subject", subject, setNumber };
}

export function getKnownAtiTeasCanonicalPaths() {
  const subjectPaths = ATI_TEAS_SUBJECTS.map(
    (subject) => `/ati-teas-${subject}-practice-test`
  );
  const setPaths = ATI_TEAS_SUBJECTS.flatMap((subject) =>
    ATI_TEAS_SET_NUMBERS.map(
      (setNumber) => `/ati-teas-${subject}-practice-test-set-${setNumber}`
    )
  );

  return ["/ati-teas-practice-test", ...subjectPaths, ...setPaths];
}
