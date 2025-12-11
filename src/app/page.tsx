import { Metadata } from "next";
import NewHomePageClient from "./NewHomePageClient";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "NursingMocks";

export const metadata: Metadata = {
  title: "NursingMocks – ATI TEAS, HESI A2, Nursing Test Banks & Exit Exams",
  description:
    "NursingMocks offers ATI TEAS practice tests, HESI A2 practice, RN & LPN nursing test banks, and nursing exit exam prep so you can move through nursing school with one organized hub.",
  keywords:
    "ATI TEAS, HESI A2, nursing test bank, nursing exit exams, TEAS practice, HESI practice, RN test bank, LPN test bank",
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NursingMocks – ATI TEAS, HESI A2, Nursing Test Banks & Exit Exams",
    description:
      "NursingMocks offers ATI TEAS practice tests, HESI A2 practice, RN & LPN nursing test banks, and nursing exit exam prep so you can move through nursing school with one organized hub.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com",
    siteName: siteName,
    images: [
      {
        url: "/nursingmocks-logo.png",
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
    title: "NursingMocks – ATI TEAS, HESI A2, Nursing Test Banks & Exit Exams",
    description:
      "NursingMocks offers ATI TEAS practice tests, HESI A2 practice, RN & LPN nursing test banks, and nursing exit exam prep.",
    images: ["/nursingmocks-logo.png"],
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
