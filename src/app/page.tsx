import { Metadata } from "next";
import NewHomePageClient from "./NewHomePageClient";
import { getSiteUrl, getSiteName, getImageUrl } from "@/lib/config";

const siteName = getSiteName();
const siteUrl = getSiteUrl();
const logoImageUrl = getImageUrl("/nursing-mocks-logo.png");

export const metadata: Metadata = {
  title: "NursingMocks - ATI TEAS, HESI A2, Nursing Practice Tests & Exit Exams",
  description:
    "NursingMocks offers ATI TEAS Practice Tests, HESI A2 Practice, RN & LPN Nursing Practice Tests, and Nursing Exit Exam prep so you can move through nursing school with one organized hub.",
  keywords:
    "ATI TEAS, HESI A2, Nursing Practice Tests, Nursing Exit Exams, TEAS Practice, HESI Practice, RN Nursing Practice Tests, LPN Nursing Practice Tests",
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
  openGraph: {
    title: "NursingMocks - ATI TEAS, HESI A2, Nursing Practice Tests & Exit Exams",
    description:
      "NursingMocks offers ATI TEAS Practice Tests, HESI A2 Practice, RN & LPN Nursing Practice Tests, and Nursing Exit Exam prep so you can move through nursing school with one organized hub.",
    url: siteUrl,
    siteName: siteName,
    images: [
      {
        url: logoImageUrl,
        width: 1200,
        height: 630,
        alt: "NursingMocks - Nursing Exam Preparation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NursingMocks - ATI TEAS, HESI A2, Nursing Practice Tests & Exit Exams",
    description:
      "NursingMocks offers ATI TEAS Practice Tests, HESI A2 Practice, RN & LPN Nursing Practice Tests, and Nursing Exit Exam prep.",
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

export default function HomePage() {
  return <NewHomePageClient />;
}
