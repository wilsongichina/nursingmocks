import { NextResponse, type NextRequest } from "next/server";

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
  "/teas-english-practice-test-set-1",
  "/teas-reading-practice-test-set-1",
  "/teas-science-practice-test-set-1",
  "/teas-math-practice-test-set-1",
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
