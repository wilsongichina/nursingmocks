import { Metadata } from "next";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password | NursingMocks",
  description:
    "Reset your NursingMocks account password. Enter your new password to complete the reset process.",
  keywords:
    "NursingMocks reset password, change password, password reset, nursing exam account",
  openGraph: {
    title: "Reset Password | NursingMocks",
    description:
      "Reset your NursingMocks account password. Enter your new password to complete the reset process.",
    url: "/reset-password",
  },
  alternates: {
    canonical: "/reset-password",
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}

