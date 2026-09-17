import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Nursing Test Bank",
  alternates: { canonical: `${getCanonicalSiteUrl()}/nursing-test-bank` },
};

export default function NursingTestBankLayout({ children }: { children: React.ReactNode }) {
  return children;
}
