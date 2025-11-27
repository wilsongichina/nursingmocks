/**
 * Site configuration utilities
 * Centralized configuration for site URL and domain
 */

export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com";
};

export const getSiteDomain = (): string => {
  const url = getSiteUrl();
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "teasgurus.com";
  }
};
