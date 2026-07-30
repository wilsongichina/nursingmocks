const AUTH_DEFERRED_PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/guarantees",
  "/prices",
  "/money-back-guarantee",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookie-policy",
  "/ati-teas-practice-test",
  "/teas-english-practice-test-set-1",
  "/teas-reading-practice-test-set-1",
  "/teas-science-practice-test-set-1",
  "/teas-math-practice-test-set-1",
]);

export function shouldDeferAuthForPublicPath(pathname: string) {
  const cleanPath = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  return AUTH_DEFERRED_PUBLIC_PATHS.has(cleanPath);
}

export function shouldSkipChatForPublicPath(pathname: string) {
  return shouldDeferAuthForPublicPath(pathname);
}
