export default function SchemaScripts() {
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "TEAS Gurus",
            description:
              "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
            url: "https://teasgurus.com/",
            logo: "https://teasgurus.com/teas-gurus-logo.png",
            sameAs: [
              "https://www.instagram.com/teasgurus",
              "https://www.tiktok.com/@teas.gurus",
              "www.youtube.com/@TeasGurus",
              "https://www.linkedin.com/company/teasgurus/",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "1-579-501-1983",
              contactType: "customer service",
              availableLanguage: "English",
            },
            address: {
              "@type": "PostalAddress",
              addressCountry: {
                "@type": "Country",
                name: "US",
              },
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much should I pay someone to take my online TEAS exam Reddit?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "According to Reddit users, the cost of hiring someone to take your online TEAS exam can go up to $500, depending on the tutor's qualifications, success rate, and exam difficulty.",
                },
              },
              {
                "@type": "Question",
                name: "Can I pay someone to take my remote TEAS exam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Teas Gurus offers professional remote TEAS exam assistance with MSN-qualified tutors. You can contact support or request a quote to begin.",
                },
              },
              {
                "@type": "Question",
                name: "Where can I pay someone to take my TEAS entrance exam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Online platforms like Teas Gurus offer confidential, convenient, and reliable services to help with TEAS entrance exams.",
                },
              },
              {
                "@type": "Question",
                name: "How much should I pay someone to take my online TEAS exam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Teas Gurus charges $400 per exam, with a full money-back guarantee, secure environment, and optional payment plans.",
                },
              },
              {
                "@type": "Question",
                name: "Is Teas Gurus legit?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Teas Gurus is a credible platform with verified student testimonials and transparent service and payment policies.",
                },
              },
              {
                "@type": "Question",
                name: "Does Teas Gurus have enough TEAS exam takers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, Teas Gurus has a large team of experienced exam takers available to assist students at any time.",
                },
              },
              {
                "@type": "Question",
                name: "Can I take my TEAS exam online or remotely?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Most institutions, including ATI, offer remote proctored TEAS exams. Teas Gurus can help you take the test remotely using secure tools and expert support.",
                },
              },
              {
                "@type": "Question",
                name: "How do you properly take the TEAS exam with Teas Gurus?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Register via the ATI website, choose the remote option, install AnyDesk, and share the code. Teas Gurus will handle the rest using a bypass tool and professional guidance.",
                },
              },
              {
                "@type": "Question",
                name: "Are there legit TEAS taker experts?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Teas Gurus has a team of qualified and experienced experts ready to help you pass your TEAS exam.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
