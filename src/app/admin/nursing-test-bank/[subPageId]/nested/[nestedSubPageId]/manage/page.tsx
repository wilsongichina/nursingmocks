import { redirect } from "next/navigation";

export default function DeprecatedManageTopicsPage() {
  redirect("/admin/nursing-test-bank?tab=topics");
}
