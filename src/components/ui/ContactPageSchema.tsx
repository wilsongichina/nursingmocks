export default function ContactPageSchema() {
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
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                telephone: "+1-579-501-1983",
                email: "teasgurus@gmail.com",
                url: "https://teasgurus.com/contact",
                availableLanguage: "English",
                hoursAvailable: {
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
              },
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
              "@id": "https://teasgurus.com/contact#webpage",
              url: "https://teasgurus.com/contact",
              name: "Contact TeasGurus | Get Help with Your TEAS Exam Today | TEAS Gurus",
              description:
                "Have questions or need help with your TEAS exam? Contact TeasGurus for expert support, real ATI TEAS questions, and professional exam-taking services. We're here to assist you 24/7.",
              isPartOf: {
                "@id": "https://teasgurus.com/#website",
              },
              about: {
                "@id": "https://teasgurus.com/#organization",
              },
              breadcrumb: {
                "@id": "https://teasgurus.com/contact#breadcrumb",
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://teasgurus.com/contact#breadcrumb",
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
                  name: "Contact",
                  item: "https://teasgurus.com/contact",
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
