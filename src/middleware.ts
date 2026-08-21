import { NextResponse, type NextRequest } from "next/server";

const ATI_TEAS_PARENT_CANONICAL_PATH = "/ati-teas-practice-test";
const ATI_TEAS_PARENT_LEGACY_PATHS = new Set([
  "/teas-7-practice",
  "/teas-7-practice-test",
]);
const ATI_TEAS_SUBJECT_LEGACY_PATHS: Record<string, string> = {
  "/teas-reading-practice-test": "/ati-teas-reading-practice-test",
  "/teas-math-practice-test": "/ati-teas-math-practice-test",
  "/teas-science-practice-test": "/ati-teas-science-practice-test",
  "/teas-english-practice-test": "/ati-teas-english-practice-test",
};

const NOINDEX_EXACT_PATHS = new Set([
  "/dashboard",
  "/profile",
  "/payments",
  "/progress-reports",
  "/referrals",
  "/documentation",
  "/tiptap",
  "/typography",
  "/serviceIdTest",
]);

const NOINDEX_PREFIXES = [
  "/admin",
  "/dashboard/",
  "/profile/",
  "/payments/",
  "/progress-reports/",
  "/referrals/",
  "/knowledge-base/",
  "/serviceIdTest/",
];

const normalizePathname = (pathname: string) => {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

const shouldNoindex = (pathname: string) =>
  NOINDEX_EXACT_PATHS.has(pathname) ||
  NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname.replace(/\/{2,}/g, "/"));

  if (ATI_TEAS_PARENT_LEGACY_PATHS.has(pathname)) {
    return NextResponse.redirect(
      new URL(ATI_TEAS_PARENT_CANONICAL_PATH, request.url),
      308
    );
  }

  const canonicalSubjectPath = ATI_TEAS_SUBJECT_LEGACY_PATHS[pathname];
  if (canonicalSubjectPath) {
    return NextResponse.redirect(new URL(canonicalSubjectPath, request.url), 308);
  }

  const response = NextResponse.next();
  if (shouldNoindex(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static/|_next/image/|favicon.ico|favicon.png|nursing-mocks-logo.png|robots.txt|sitemap.xml).*)",
  ],
};
