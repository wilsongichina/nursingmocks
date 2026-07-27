import type { Metadata } from "next";
import TermsAndConditionsPageClient from "./TermsAndConditionsPageClient";

export const metadata: Metadata = {
  title: "Terms & Conditions | NursingMocks",
  description:
    "Read the NursingMocks terms and conditions for account use, exam practice content, payments, subscriptions, refunds, and student responsibilities.",
  keywords:
    "NursingMocks terms, terms and conditions, nursing exam practice terms, account terms, subscription terms",
  openGraph: {
    title: "Terms & Conditions | NursingMocks",
    description:
      "Review the terms that apply when using NursingMocks exam practice, account, payment, and support features.",
    url: "/terms-and-conditions",
  },
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return <TermsAndConditionsPageClient />;
}
