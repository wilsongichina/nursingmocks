import { Metadata } from "next";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Forgot Password | NursingMocks",
  description:
    "Reset your NursingMocks account password. Enter your email address and we will send you a secure password reset link.",
  keywords:
    "NursingMocks forgot password, reset password, password recovery, nursing exam account",
  openGraph: {
    title: "Forgot Password | NursingMocks",
    description:
      "Reset your NursingMocks account password. Enter your email address and we will send you a secure password reset link.",
    url: "/forgot-password",
  },
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}

