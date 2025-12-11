"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface GetStartedButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function GetStartedButton({
  className = "",
  children = "Get Started Today",
}: GetStartedButtonProps) {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }

    if (currentUser) {
      e.preventDefault();
      router.push("/payments");
    } else {
      e.preventDefault();
      router.push("/register");
    }
  };

  // Show loading state or default link
  if (loading) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={currentUser ? "/payments" : "/register"}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}

