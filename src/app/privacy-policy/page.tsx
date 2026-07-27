import type { Metadata } from "next";
import PrivacyPolicyPageClient from "./PrivacyPolicyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy | NursingMocks",
  description:
    "Learn how NursingMocks collects, uses, protects, and shares account, billing, support, and nursing exam practice data.",
  keywords:
    "NursingMocks privacy policy, data protection, nursing exam account privacy, study data privacy",
  openGraph: {
    title: "Privacy Policy | NursingMocks",
    description:
      "Understand how NursingMocks handles account details, billing records, support requests, and exam practice activity.",
    url: "/privacy-policy",
  },
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
