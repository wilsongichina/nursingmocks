import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATI TEAS Math Questions & Practice Tests | TeasGurus",
  description:
    "Master the ATI TEAS math section with our comprehensive practice tests. Practice the most common TEAS math questions for algebra, data interpretation, measurements, and word problems.",
  keywords:
    "ATI TEAS math questions, TEAS math practice test, TEAS exam math section, TEAS math preparation, nursing school math",
  openGraph: {
    title: "ATI TEAS Math Questions & Practice Tests | TeasGurus",
    description:
      "Master the ATI TEAS math section with our comprehensive practice tests. Practice the most common TEAS math questions for algebra, data interpretation, measurements, and word problems.",
    url: "https://teasgurus.com/math",
  },
  alternates: {
    canonical: "/math",
  },
};

export default function MathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
