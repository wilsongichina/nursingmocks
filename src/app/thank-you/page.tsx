import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import { TikTokThankYouPurchaseScript } from "@/components/analytics/TikTokThankYouPurchaseScript";
import { ThankYouNursingMocksDesign } from "@/components/thank-you/ThankYouNursingMocksDesign";

export const metadata: Metadata = {
  title: "Thank You | NursingMocks",
  description:
    "Your NursingMocks purchase is complete. Continue to your account for exam access, practice materials, and study support.",
  keywords:
    "thank you, NursingMocks, nursing exam practice, purchase confirmation, exam access",
  openGraph: {
    title: "Thank You | NursingMocks",
    description:
      "Your NursingMocks purchase is complete. Continue to your account to access your exam practice materials.",
    url: "https://nursingmocks.com/thank-you",
  },
  alternates: {
    canonical: "/thank-you",
  },
};

export default function ThankYouPage() {
  return (
    <Layout showSidebar={false} showHeader={false}>
      <ThankYouNursingMocksDesign />
      <TikTokThankYouPurchaseScript />
    </Layout>
  );
}
