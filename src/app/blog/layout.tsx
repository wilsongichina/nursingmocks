import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "NursingMocks Blog",
  alternates: { canonical: `${getCanonicalSiteUrl()}/blog` },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
