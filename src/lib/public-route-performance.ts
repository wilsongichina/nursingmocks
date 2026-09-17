const AUTH_DEFERRED_PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/how-it-works",
  "/faqs",
  "/ati-teas",
  "/guarantees",
  "/prices",
  "/money-back-guarantee",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookie-policy",
  "/ati-teas-practice-test",
  "/ati-teas-reading-practice-test",
  "/ati-teas-math-practice-test",
  "/ati-teas-science-practice-test",
  "/ati-teas-english-practice-test",
  "/teas-reading-practice-test",
  "/teas-math-practice-test",
  "/teas-science-practice-test",
  "/teas-english-practice-test",
]);

const TEAS_SET_PAGE_PATTERN =
  /^\/(?:ati-)?teas-(english|reading|science|math)-practice-test-set-\d+$/;

function cleanPublicPath(pathname: string) {
  return pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
}

export function shouldDeferAuthForPublicPath(pathname: string) {
  const cleanPath = cleanPublicPath(pathname);
  return AUTH_DEFERRED_PUBLIC_PATHS.has(cleanPath);
}

export function shouldLazyLoadAuthForPublicPath(pathname: string) {
  const cleanPath = cleanPublicPath(pathname);
  // Public articles and category pages (including their not-found screens)
  // must render before the browser-only Firebase provider initialises.
  return TEAS_SET_PAGE_PATTERN.test(cleanPath) ||
    cleanPath === "/blog" || cleanPath.startsWith("/blog/") ||
    cleanPath === "/knowledge-base" || cleanPath.startsWith("/knowledge-base/");
}

export function shouldSkipChatForPublicPath(pathname: string) {
  return (
    shouldDeferAuthForPublicPath(pathname) ||
    TEAS_SET_PAGE_PATTERN.test(cleanPublicPath(pathname))
  );
}

export function shouldSkipSupportWidgetForPublicPath(pathname: string) {
  return shouldSkipChatForPublicPath(pathname);
}
