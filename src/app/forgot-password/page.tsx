import { Metadata } from "next";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Forgot Password | TEAS Gurus - Reset Your Password",
  description:
    "Reset your TEAS Gurus account password. Enter your email address and we'll send you a link to reset your password.",
  keywords:
    "TEAS Gurus forgot password, reset password, password recovery, TEAS exam account",
  openGraph: {
    title: "Forgot Password | TEAS Gurus - Reset Your Password",
    description:
      "Reset your TEAS Gurus account password. Enter your email address and we'll send you a link to reset your password.",
    url: "https://teasgurus.com/forgot-password",
  },
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}

