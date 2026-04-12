import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
import TawkToChat from "@/components/ui/TawkToChat";
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

const tiktokPixelScript = `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


  ttq.load('D6PV3SJC77U1CBCKK130');
  ttq.page();
}(window, document, 'ttq');`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* TikTok Pixel Code Start */}
        <script
          id="tiktok-pixel"
          dangerouslySetInnerHTML={{ __html: tiktokPixelScript }}
        />
        {/* TikTok Pixel Code End */}
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProviderWrapper>
          {children}
          <TawkToChat />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
