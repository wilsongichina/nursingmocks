import { NextResponse, type NextRequest } from "next/server";
import { canonicalizePublicPath } from "@/lib/public-route-canonicalization";

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
  const canonicalPath = canonicalizePublicPath(pathname);

  if (canonicalPath !== pathname) {
    const destination = request.nextUrl.clone();
    destination.pathname = canonicalPath;
    return NextResponse.redirect(destination, 308);
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
