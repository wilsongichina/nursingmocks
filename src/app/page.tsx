import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import AdditionalContentSection from "@/components/sections/AdditionalContentSection";
import FAQSection from "@/components/sections/FAQSection";
import ClientWhatsAppPopup from "@/components/ui/ClientWhatsAppPopup";

export const metadata: Metadata = {
  title: "Pay Someone to Take My Teas Exam for Me | Teas Gurus",
  description:
    "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
  keywords:
    "take my TEAS exam for me, take my TEAS test for me, pay someone to take my TEAS exam, pay someone to take my proctored exam",
  authors: [{ name: "Teas Gurus" }],
  creator: "Teas Gurus",
  publisher: "Teas Gurus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.teasgurus.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pay Someone to Take My teas Exam for Me | Teas Gurus",
    description:
      "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
    url: "https://www.teasgurus.com",
    siteName: "Teas Gurus",
    images: [
      {
        url: "/teas-gurus-logo.png",
        width: 1200,
        height: 630,
        alt: "Teas Gurus - TEAS Exam Preparation",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pay Someone to Take My teas Exam for Me | Teas Gurus",
    description:
      "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
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

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      {/* <TrustIndicators /> */}
      <FeaturesSection />
      <HowItWorksSection />
      <AdditionalContentSection />
      <FAQSection />
      <ClientWhatsAppPopup />
    </Layout>
  );
}
