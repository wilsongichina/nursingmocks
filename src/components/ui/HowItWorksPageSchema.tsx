import { getSiteUrl, getSiteName } from "@/lib/config";

export default function HowItWorksPageSchema() {
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
              logo: `${siteUrl}/teas-gurus-logo.png`,
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
              "@id": `${siteUrl}/how-it-works#webpage`,
              url: `${siteUrl}/how-it-works`,
              name: "How It Works - TEAS Exam Process | TEAS Gurus",
              description:
                "Learn how our 6-step TEAS exam process works. From registration to payment, discover how TEAS Gurus helps you pass your nursing entrance exam with guaranteed results.",
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
              about: {
                "@id": `${siteUrl}/#organization`,
              },
              breadcrumb: {
                "@id": `${siteUrl}/how-it-works#breadcrumb`,
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${siteUrl}/how-it-works#breadcrumb`,
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
                  name: "How It Works",
                  item: `${siteUrl}/how-it-works`,
                },
              ],
            },
            {
              "@type": "HowTo",
              "@id": `${siteUrl}/how-it-works#howto`,
              name: "How It Works: Pay Someone to Take Your Online TEAS Exam",
              description:
                "Learn how Teas Gurus handles your ATI TEAS exam in 6 simple steps, from registering to making your final payment after results.",
              image: `${siteUrl}/logo.png`,
              totalTime: "PT15M",
              supply: [],
              tool: [],
              step: [
                {
                  "@type": "HowToStep",
                  name: "Register for The Online/Remote Exam",
                  text: "Visit www.atitesting.com and select 'I AM PREPARING FOR OR TAKING THE TEAS.' Click on Exam Registration, choose Register under the Remote Online option, and select ATI Remote Proctor. Pick your preferred date and time, review details, create an account if needed, and complete your payment.",
                },
                {
                  "@type": "HowToStep",
                  name: "Computer Access",
                  text: "Download and install RemotePC for Windows from the official site. After installation, copy your device code and send it to us. We'll use it to begin the secure setup on your machine.",
                },
                {
                  "@type": "HowToStep",
                  name: "Bypass Software Installation",
                  text: "Our team will remotely access your laptop to install a bypass utility that allows uninterrupted proctoring. The tool does not interfere with exam content or answers. It only facilitates smooth remote control.",
                },
                {
                  "@type": "HowToStep",
                  name: "ATI TEAS Dry Run Assessment",
                  text: "We conduct a test run to verify everything works as intended. This ensures you're familiar with the process and everything is functioning before exam day.",
                },
                {
                  "@type": "HowToStep",
                  name: "Exam Taking",
                  text: "On the scheduled day, sit at your computer and follow exam procedures while we take over and complete the test on your behalf, discreetly and efficiently.",
                },
                {
                  "@type": "HowToStep",
                  name: "Make Payment",
                  text: "After the exam is completed, results are available instantly. Once you pass, you make the final payment. We also offer a payment plan with partial upfront and balance after results.",
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
