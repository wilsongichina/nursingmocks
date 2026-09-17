import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Nursing Exit Exams",
  alternates: { canonical: `${getCanonicalSiteUrl()}/nursing-exit-exam` },
};

export default function NursingExitExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
