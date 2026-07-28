import { getSiteUrl, getSiteName } from "@/lib/config";

export default function AboutPageSchema() {
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
              "@id": `${siteUrl}/about#webpage`,
              url: `${siteUrl}/about`,
              name: "About NursingMocks | Trusted TEAS Exam Help & Expert Support | NursingMocks",
              description:
                "Learn about NursingMocks—your trusted partner for TEAS exam success. We provide expert real ATI TEAS questions, and professional test-taking services tailored for nursing students.",
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
              about: {
                "@id": `${siteUrl}/#organization`,
              },
              breadcrumb: {
                "@id": `${siteUrl}/about#breadcrumb`,
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${siteUrl}/about#breadcrumb`,
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
                  name: "About Us",
                  item: `${siteUrl}/about`,
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
