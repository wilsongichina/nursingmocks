import { getSiteUrl, getSiteName } from "@/lib/config";

export default function ContactPageSchema() {
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
                "https://instagram.com/nursingmocks",
                "https://www.linkedin.com/company/nursingmocks",
                "https://tiktok.com/@teas.gurus",
                "https://www.youtube.com/@nursingmocks",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                telephone: "+1-579-501-1983",
                email: "support@nursingmocks.com",
                url: `${siteUrl}/contact`,
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
              "@id": `${siteUrl}/contact#webpage`,
              url: `${siteUrl}/contact`,
              name: "Contact NursingMocks | Get Help with Your TEAS Exam Today | NursingMocks",
              description:
                "Have questions or need help with your TEAS exam? Contact NursingMocks for expert support, real ATI TEAS questions, and professional exam-taking services. We're here to assist you 24/7.",
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
              about: {
                "@id": `${siteUrl}/#organization`,
              },
              breadcrumb: {
                "@id": `${siteUrl}/contact#breadcrumb`,
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${siteUrl}/contact#breadcrumb`,
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
                  name: "Contact",
                  item: `${siteUrl}/contact`,
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
