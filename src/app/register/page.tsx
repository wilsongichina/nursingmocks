import { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Register | TEAS Gurus - Create Your Account",
  description:
    "Join TEAS Gurus today and get access to expert study materials, practice tests, and personalized exam preparation support for your TEAS exam.",
  keywords:
    "TEAS Gurus register, sign up, create account, TEAS exam preparation, student registration",
  openGraph: {
    title: "Register | TEAS Gurus - Create Your Account",
    description:
      "Join TEAS Gurus today and get access to expert study materials, practice tests, and personalized exam preparation support.",
    url: "https://teasgurus.com/register",
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

