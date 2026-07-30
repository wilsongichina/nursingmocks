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
]);

const TEAS_SET_PAGE_PATTERN =
  /^\/teas-(english|reading|science|math)-practice-test-set-\d+$/;

function cleanPublicPath(pathname: string) {
  return pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
}

export function shouldDeferAuthForPublicPath(pathname: string) {
  const cleanPath = cleanPublicPath(pathname);
  return AUTH_DEFERRED_PUBLIC_PATHS.has(cleanPath);
}

export function shouldLazyLoadAuthForPublicPath(pathname: string) {
  const cleanPath = cleanPublicPath(pathname);
  return TEAS_SET_PAGE_PATTERN.test(cleanPath);
}

export function shouldSkipChatForPublicPath(pathname: string) {
  return (
    shouldDeferAuthForPublicPath(pathname) ||
    shouldLazyLoadAuthForPublicPath(pathname)
  );
}
