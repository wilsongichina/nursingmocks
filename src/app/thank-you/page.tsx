import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import { TikTokThankYouPurchaseScript } from "@/components/analytics/TikTokThankYouPurchaseScript";
import { ThankYouNursingMocksDesign } from "@/components/thank-you/ThankYouNursingMocksDesign";

export const metadata: Metadata = {
  title: "Thank You — NursingMocks",
  description:
    "Your NursingMocks purchase is complete. Open your Dropbox folder to access your TEAS study files.",
  keywords:
    "thank you, NursingMocks, TEAS practice, purchase confirmation, Dropbox",
  openGraph: {
    title: "Thank You — NursingMocks",
    description:
      "Your NursingMocks purchase is complete. Open your Dropbox folder to access your TEAS study files.",
    url: "https://teasgurus.com/thank-you",
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
