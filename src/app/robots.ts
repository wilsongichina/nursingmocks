import { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

const INDEXABLE_PATHS = [
  "/$",
  "/about$",
  "/contact$",
  "/guarantees$",
  "/prices$",
  "/money-back-guarantee$",
  "/terms-and-conditions$",
  "/privacy-policy$",
  "/cookie-policy$",
  "/register$",
  "/login$",
  "/forgot-password$",
  "/reset-password$",
  "/onboarding$",
  "/thank-you$",
  "/teas-english-practice-test-set-1$",
  "/teas-reading-practice-test-set-1$",
  "/teas-science-practice-test-set-1$",
  "/teas-math-practice-test-set-1$",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/robots.txt",
          "/sitemap.xml",
          ...INDEXABLE_PATHS,
          "/_next/static/",
          "/favicon.ico",
          "/favicon.png",
          "/nursing-mocks-logo.png",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${getCanonicalSiteUrl()}/sitemap.xml`,
  };
}
