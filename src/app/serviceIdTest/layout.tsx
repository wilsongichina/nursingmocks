import { Metadata } from "next";
import { getNursingEntranceExamSubPage } from "@/lib/firestore-operations";

interface Props {
  children: React.ReactNode;
  params: Promise<{ serviceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  // Check if this is a Nursing Entrance Exam sub-page
  // If so, return minimal metadata to let [subPageId] handle it
  const subPageResult = await getNursingEntranceExamSubPage(serviceId);
  if (subPageResult.success && subPageResult.data) {
    // This is a sub-page, let [subPageId] handle the metadata
    return {
      title: "",
      description: "",
    };
  }

  // Convert serviceId to readable title
  const title =
    serviceId || serviceId.charAt(0).toUpperCase() + serviceId.slice(1);

  return {
    title: `Take My ${title} Exam for Me - Professional TEAS Exam Help`,
    description: `Get professional help with your ${title} exam. Our expert tutors ensure high scores and guaranteed results. Contact us today for reliable TEAS exam assistance.`,
    keywords: [
      `TEAS ${title}`,
      `Take my ${title} exam`,
      `${title} exam help`,
      "TEAS exam assistance",
      "Professional exam help",
      "Guaranteed TEAS scores",
    ],
    openGraph: {
      title: `Take My ${title} Exam for Me - Professional TEAS Exam Help`,
      description: `Get professional help with your ${title} exam. Our expert tutors ensure high scores and guaranteed results.`,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${serviceId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Take My ${title} Exam for Me - Professional TEAS Exam Help`,
      description: `Get professional help with your ${title} exam. Our expert tutors ensure high scores and guaranteed results.`,
    },
  };
}

export default async function ServiceLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  // Check if this is a Nursing Entrance Exam sub-page
  // If so, don't render this layout - let [subPageId] handle it
  try {
    const subPageResult = await getNursingEntranceExamSubPage(serviceId);
    if (subPageResult.success && subPageResult.data) {
      // This is a sub-page, return children without this layout wrapper
      // This allows the [subPageId] route to handle it
      return <>{children}</>;
    }
  } catch (error) {
    console.error("Error checking sub-page in layout:", error);
  }

  return children;
}
