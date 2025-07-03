import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "TEAS Gurus - Master the TEAS Exam with Expert Guidance",
    template: "%s | TEAS Gurus",
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
  authors: [{ name: "TEAS Gurus" }],
  creator: "TEAS Gurus",
  publisher: "TEAS Gurus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://teasgurus.com"),
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
    url: "https://teasgurus.com",
    siteName: "TEAS Gurus",
    title: "TEAS Gurus - Master the TEAS Exam with Expert Guidance",
    description:
      "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
    images: [
      {
        url: "/teas-gurus-logo.png",
        width: 1200,
        height: 630,
        alt: "TEAS Gurus - TEAS Exam Preparation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEAS Gurus - Master the TEAS Exam with Expert Guidance",
    description:
      "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
    images: ["/teas-gurus-logo.png"],
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
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "TEAS Gurus",
              description:
                "Comprehensive TEAS exam preparation with personalized study plans, practice tests, and expert tutoring.",
              url: "https://teasgurus.com",
              logo: "https://teasgurus.com/teas-gurus-logo.png",
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
                "https://www.facebook.com/teasgurus",
                "https://twitter.com/teasgurus",
                "https://www.linkedin.com/company/teasgurus",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is it safe to pay someone to take my proctored exam for me?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, Teas Gurus ensures full confidentiality and secure exam-taking services.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What platforms do you support for proctored exams?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We support ProctorU, Honorlock, Respondus, Examity, and other major systems.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
