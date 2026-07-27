import type { Metadata } from "next";
import OnboardingPageClient from "./OnboardingPageClient";

export const metadata: Metadata = {
  title: "Account Setup | NursingMocks",
  description:
    "Complete your NursingMocks account setup by choosing your exam focus and expected exam date before opening your personalized exam dashboard.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Account Setup | NursingMocks",
    description:
      "Choose your NursingMocks exam focus and expected exam date to personalize your study dashboard.",
    url: "/onboarding",
  },
  alternates: {
    canonical: "/onboarding",
  },
};

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
