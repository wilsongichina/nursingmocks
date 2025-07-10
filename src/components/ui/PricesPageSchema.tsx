export default function PricesPageSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://teasgurus.com/#organization",
              name: "Teas Gurus",
              url: "https://teasgurus.com/",
              logo: "https://teasgurus.com/teas-gurus-logo.png",
              sameAs: [
                "https://instagram.com/teasgurus",
                "https://www.linkedin.com/company/teasgurus",
                "https://tiktok.com/@teas.gurus",
                "https://www.youtube.com/@teasgurus",
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://teasgurus.com/#website",
              url: "https://teasgurus.com/",
              name: "Teas Gurus",
              publisher: {
                "@id": "https://teasgurus.com/#organization",
              },
              inLanguage: "en",
            },
            {
              "@type": "WebPage",
              "@id": "https://teasgurus.com/prices#webpage",
              url: "https://teasgurus.com/prices",
              name: "Pricing | Take My TEAS Exam Cost – TeasGurus",
              description:
                "Explore our pricing for TEAS exam services including Math, Science, Reading & English help. Affordable rates to take your TEAS test or get real ATI TEAS practice questions.",
              isPartOf: {
                "@id": "https://teasgurus.com/#website",
              },
              about: {
                "@id": "https://teasgurus.com/#organization",
              },
              breadcrumb: {
                "@id": "https://teasgurus.com/prices#breadcrumb",
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://teasgurus.com/prices#breadcrumb",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://teasgurus.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Pricing",
                  item: "https://teasgurus.com/prices",
                },
              ],
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/prices#tests-quizzes",
              name: "TEAS Tests & Quizzes",
              description:
                "Get access to real TEAS exams and quizzes with a fast turnaround time. Guaranteed 88% score.",
              provider: {
                "@id": "https://teasgurus.com/#organization",
              },
              offers: {
                "@type": "Offer",
                price: "150",
                priceCurrency: "USD",
                url: "https://teasgurus.com/prices",
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/prices#take-my-exam",
              name: "Take My TEAS Exam Service",
              description:
                "Let our experts take your full ATI TEAS exam for you with regular progress updates and a guaranteed 88%+ score.",
              provider: {
                "@id": "https://teasgurus.com/#organization",
              },
              offers: {
                "@type": "Offer",
                price: "600",
                priceCurrency: "USD",
                url: "https://teasgurus.com/prices",
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/prices#full-classes",
              name: "Full Classes",
              description:
                "Hire us to take your full TEAS course. Guaranteed A or B. Includes status updates and payment plans.",
              provider: {
                "@id": "https://teasgurus.com/#organization",
              },
              offers: {
                "@type": "Offer",
                price: "500",
                priceCurrency: "USD",
                url: "https://teasgurus.com/prices",
                availability: "https://schema.org/InStock",
              },
            },
          ],
        }),
      }}
    />
  );
}
