import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
import { getSiteUrl, getSiteName, getImageUrl } from "@/lib/config";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const siteName = getSiteName();
const siteUrl = getSiteUrl();
const logoImageUrl = getImageUrl("/teas-gurus-logo.png");

export const metadata: Metadata = {
  title: {
    default: `${siteName} - Master the TEAS Exam with Expert Guidance`,
    template: `%s | ${siteName}`,
  },
  description:
    "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring. Join thousands of successful students who achieved their nursing school dreams.",
  keywords: [
    "TEAS exam",
    "TEAS test preparation",
    "nursing school",
    "TEAS practice tests",
    "TEAS study materials",
    "TEAS tutoring",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Master the TEAS Exam with Expert Guidance`,
    description:
      "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
    images: [
      {
        url: logoImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} - TEAS Exam Preparation`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Master the TEAS Exam with Expert Guidance`,
    description:
      "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
    images: [logoImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: siteName,
              description:
                "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
              url: siteUrl,
              logo: logoImageUrl,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "1-579-501-1983",
                contactType: "customer service",
                availableLanguage: "English",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "US",
              },
              sameAs: [
                "https://instagram.com/teasgurus",
                "https://www.linkedin.com/company/teasgurus",
                "https://tiktok.com/@teas.gurus",
                "https://www.youtube.com/@teasgurus",
              ],
            }),
          }}
        />
      </head>
      <body 
        className={`${outfit.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
