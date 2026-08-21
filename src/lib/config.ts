/**
 * Site configuration utilities
 * Centralized configuration for site URL, domain, and name
 */

export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com";
};

export const getSafeSiteUrl = (): string => {
  const configuredUrl = getSiteUrl();

  try {
    return new URL(configuredUrl).origin.replace(/\/$/, "");
  } catch {
    return "https://www.nursingmocks.com";
  }
};

export const getCanonicalSiteUrl = (): string => {
  const configuredUrl =
    process.env.NEXT_PUBLIC_CANONICAL_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.nursingmocks.com";

  try {
    const url = new URL(configuredUrl);
    const hostname = url.hostname.toLowerCase();

    // Structured data is stored in Firestore, so local admin sessions must not
    // persist localhost URLs that later render in production.
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".vercel.app")
    ) {
      return "https://www.nursingmocks.com";
    }

    return url.origin.replace(/\/$/, "");
  } catch {
    return "https://www.nursingmocks.com";
  }
};

export const getSiteDomain = (): string => {
  const url = getSiteUrl();
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "www.nursingmocks.com";
  }
};

export const getSiteName = (): string => {
  return process.env.NEXT_PUBLIC_SITE_NAME || "NursingMocks";
};

/**
 * Get full URL for an image path
 * @param imagePath - Relative image path (e.g., "/nursing-mocks-logo.png")
 * @returns Full URL with site domain
 */
export const getImageUrl = (imagePath: string): string => {
  const siteUrl = getSafeSiteUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${siteUrl}${cleanPath}`;
};
