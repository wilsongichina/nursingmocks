export default function AboutPageSchema() {
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
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "00:00",
                  closes: "23:59",
                },
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
              "@id": "https://teasgurus.com/about#webpage",
              url: "https://teasgurus.com/about",
              name: "About TeasGurus | Trusted TEAS Exam Help & Expert Support | TEAS Gurus",
              description:
                "Learn about TeasGurus—your trusted partner for TEAS exam success. We provide expert real ATI TEAS questions, and professional test-taking services tailored for nursing students.",
              isPartOf: {
                "@id": "https://teasgurus.com/#website",
              },
              about: {
                "@id": "https://teasgurus.com/#organization",
              },
              breadcrumb: {
                "@id": "https://teasgurus.com/about#breadcrumb",
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://teasgurus.com/about#breadcrumb",
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
                  name: "About Us",
                  item: "https://teasgurus.com/about",
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
