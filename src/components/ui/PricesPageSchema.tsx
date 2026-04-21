import { getSiteUrl, getSiteName } from "@/lib/config";

export default function PricesPageSchema() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: siteName,
              url: `${siteUrl}/`,
              logo: `${siteUrl}/nursing-mocks-logo.png`,
              sameAs: [
                "https://instagram.com/teasgurus",
                "https://www.linkedin.com/company/teasgurus",
                "https://tiktok.com/@teas.gurus",
                "https://www.youtube.com/@teasgurus",
              ],
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              url: `${siteUrl}/`,
              name: siteName,
              publisher: {
                "@id": `${siteUrl}/#organization`,
              },
              inLanguage: "en",
            },
            {
              "@type": "WebPage",
              "@id": `${siteUrl}/prices#webpage`,
              url: `${siteUrl}/prices`,
              name: "Pricing | Take My TEAS Exam Cost – TeasGurus",
              description:
                "Explore our pricing for TEAS exam services including Math, Science, Reading & English help. Affordable rates to take your TEAS test or get real ATI TEAS practice questions.",
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
              about: {
                "@id": `${siteUrl}/#organization`,
              },
              breadcrumb: {
                "@id": `${siteUrl}/prices#breadcrumb`,
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${siteUrl}/prices#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: `${siteUrl}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Pricing",
                  item: `${siteUrl}/prices`,
                },
              ],
            },
            {
              "@type": "Service",
              "@id": `${siteUrl}/prices#tests-quizzes`,
              name: "TEAS Tests & Quizzes",
              description:
                "Get access to real TEAS exams and quizzes with a fast turnaround time. Guaranteed 88% score.",
              provider: {
                "@id": `${siteUrl}/#organization`,
              },
              offers: {
                "@type": "Offer",
                price: "150",
                priceCurrency: "USD",
                url: `${siteUrl}/prices`,
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@type": "Service",
              "@id": `${siteUrl}/prices#take-my-exam`,
              name: "Take My TEAS Exam Service",
              description:
                "Let our experts take your full ATI TEAS exam for you with regular progress updates and a guaranteed 88%+ score.",
              provider: {
                "@id": `${siteUrl}/#organization`,
              },
              offers: {
                "@type": "Offer",
                price: "600",
                priceCurrency: "USD",
                url: `${siteUrl}/prices`,
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@type": "Service",
              "@id": `${siteUrl}/prices#full-classes`,
              name: "Full Classes",
              description:
                "Hire us to take your full TEAS course. Guaranteed A or B. Includes status updates and payment plans.",
              provider: {
                "@id": `${siteUrl}/#organization`,
              },
              offers: {
                "@type": "Offer",
                price: "500",
                priceCurrency: "USD",
                url: `${siteUrl}/prices`,
                availability: "https://schema.org/InStock",
              },
            },
          ],
        }),
      }}
    />
  );
}
