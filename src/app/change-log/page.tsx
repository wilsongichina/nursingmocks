import { redirect } from "next/navigation";

export const metadata = {
  title: "Documentation | NursingMocks",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChangeLogRedirectPage() {
  redirect("/documentation");
}
