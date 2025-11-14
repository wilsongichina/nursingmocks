import { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Login | TEAS Gurus - Sign In to Your Account",
  description:
    "Sign in to your TEAS Gurus account to access study materials, track your progress, and manage your TEAS exam preparation.",
  keywords:
    "TEAS Gurus login, sign in, TEAS exam account, student portal, TEAS study materials",
  openGraph: {
    title: "Login | TEAS Gurus - Sign In to Your Account",
    description:
      "Sign in to your TEAS Gurus account to access study materials, track your progress, and manage your TEAS exam preparation.",
    url: "https://teasgurus.com/login",
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}

