import { Metadata } from "next";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password | TEAS Gurus - Set New Password",
  description:
    "Reset your TEAS Gurus account password. Enter your new password to complete the reset process.",
  keywords:
    "TEAS Gurus reset password, change password, password reset, TEAS exam account",
  openGraph: {
    title: "Reset Password | TEAS Gurus - Set New Password",
    description:
      "Reset your TEAS Gurus account password. Enter your new password to complete the reset process.",
    url: "https://teasgurus.com/reset-password",
  },
  alternates: {
    canonical: "/reset-password",
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}

