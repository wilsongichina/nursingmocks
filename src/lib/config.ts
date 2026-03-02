/**
 * Site configuration utilities
 * Centralized configuration for site URL, domain, and name
 */

export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com";
};

export const getSiteDomain = (): string => {
  const url = getSiteUrl();
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "nursingmocks.com";
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
  const siteUrl = getSiteUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${siteUrl}${cleanPath}`;
};