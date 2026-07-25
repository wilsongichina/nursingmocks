import TeasExamsBrowser from "@/components/teas-exams/TeasExamsBrowser";

export default async function TeasExamsPage() {
  return <TeasExamsBrowser dataUrl="/data/teas-exams-preview.json" />;
}
