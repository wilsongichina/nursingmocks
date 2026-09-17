import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Nursing Entrance Exams",
  alternates: { canonical: `${getCanonicalSiteUrl()}/nursing-entrance-exam` },
};

export default function NursingEntranceExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
