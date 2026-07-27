import { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | NursingMocks",
  description:
    "Sign in to NursingMocks to open your exam dashboard, continue practice, manage access, and review nursing exam progress.",
  keywords:
    "NursingMocks login, sign in, nursing exam dashboard, ATI TEAS account, HESI A2 account",
  openGraph: {
    title: "Sign In | NursingMocks",
    description:
      "Sign in to NursingMocks to continue practice and manage your nursing exam dashboard.",
    url: "https://nursingmocks.com/login",
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}

