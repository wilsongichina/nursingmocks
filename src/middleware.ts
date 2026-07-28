import { NextResponse, type NextRequest } from "next/server";

const ATI_TEAS_INDEXABLE_SETS = [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const ATI_TEAS_SUBJECT_SLUGS = ["english", "reading", "science", "math"];

const ATI_TEAS_QUIZ_PATHS = ATI_TEAS_SUBJECT_SLUGS.flatMap((subject) =>
  ATI_TEAS_INDEXABLE_SETS.map((setNumber) => `/teas-${subject}-practice-test-set-${setNumber}`)
);

const INDEXABLE_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/guarantees",
  "/prices",
  "/money-back-guarantee",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookie-policy",
  "/register",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/thank-you",
  ...ATI_TEAS_QUIZ_PATHS,
]);

const normalizePathname = (pathname: string) => {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = normalizePathname(request.nextUrl.pathname);

  // Google must be allowed to crawl a page before it can see this noindex signal.
  if (!INDEXABLE_PATHS.has(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static/|_next/image/|favicon.ico|favicon.png|nursing-mocks-logo.png|robots.txt|sitemap.xml).*)",
  ],
};
