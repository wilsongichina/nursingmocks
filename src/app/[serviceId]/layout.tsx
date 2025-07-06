import { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{ serviceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

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
      url: `https://teasgurus.com/${serviceId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Take My ${title} Exam for Me - Professional TEAS Exam Help`,
      description: `Get professional help with your ${title} exam. Our expert tutors ensure high scores and guaranteed results.`,
    },
  };
}

export default function ServiceLayout({ children }: Props) {
  return children;
}
