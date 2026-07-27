import { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Create Account | NursingMocks",
  description:
    "Create a NursingMocks account to choose your exam focus, access ATI TEAS, HESI A2, RN and LPN practice, and manage your study dashboard.",
  keywords:
    "NursingMocks register, create account, nursing exam practice account, ATI TEAS signup, HESI A2 signup",
  openGraph: {
    title: "Create Account | NursingMocks",
    description:
      "Create your NursingMocks account, complete guided setup, and open your personalized nursing exam dashboard.",
    url: "https://nursingmocks.com/register",
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

