import type { Metadata } from "next";
import Script from "next/script";
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
const logoImageUrl = getImageUrl("/nursing-mocks-logo.png");
const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export const metadata: Metadata = {
  title: {
    default: `${siteName} - Nursing Exam Practice Tests and Study Support`,
    template: `%s | ${siteName}`,
  },
  description:
    "NursingMocks provides TEAS, HESI A2, nursing test bank, and nursing exit exam practice resources for nursing students.",
  keywords: [
    "NursingMocks",
    "nursing exam practice",
    "TEAS exam",
    "HESI A2",
    "nursing test bank",
    "nursing exit exam",
    "nursing school",
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
    title: `${siteName} - Nursing Exam Practice Tests and Study Support`,
    description:
      "TEAS, HESI A2, nursing test bank, and nursing exit exam practice resources for nursing students.",
    images: [
      {
        url: logoImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} - Nursing Exam Preparation`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Nursing Exam Practice Tests and Study Support`,
    description:
      "TEAS, HESI A2, nursing test bank, and nursing exit exam practice resources for nursing students.",
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

const tiktokPixelScript = tiktokPixelId ? `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


  ttq.load('${tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');` : "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {tiktokPixelScript && (
          <Script
            id="tiktok-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: tiktokPixelScript }}
          />
        )}
        <AuthProviderWrapper>
          {children}
          <TawkToChat />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
