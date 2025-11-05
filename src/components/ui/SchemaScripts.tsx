import React from "react";

interface SchemaScriptsProps {
  schema?: any;
}

export default function SchemaScripts({ schema }: SchemaScriptsProps) {
  if (schema) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: typeof schema === "string" ? schema : JSON.stringify(schema),
        }}
      />
    );
  }
  // Default schema
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
              "@id": "https://teasgurus.com/#webpage",
              url: "https://teasgurus.com/",
              name: "Take My TEAS Exam for Me | Guaranteed High Scores Online",
              description:
                "Need to pay someone to take my TEAS exam? Teas Gurus can take my TEAS test for me with U.S.-based professionals, top results, and guaranteed confidentiality.",
              isPartOf: {
                "@id": "https://teasgurus.com/#website",
              },
              about: {
                "@id": "https://teasgurus.com/#organization",
              },
              breadcrumb: {
                "@id": "https://teasgurus.com/#breadcrumb",
              },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://teasgurus.com/#breadcrumb",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://teasgurus.com/",
                },
              ],
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/#pay-someone",
              serviceType: "Pay Someone to Take My TEAS Exam",
              provider: { "@id": "https://teasgurus.com/#organization" },
              areaServed: { "@type": "Country", name: "United States" },
              description:
                "Looking to pay someone to take your TEAS exam online? Teas Gurus connects you with qualified ATI TEAS exam takers who ensure top scores in Reading, Math, Science, and English. We guarantee confidentiality and success when you pay someone to take your TEAS test through us.",
              availableChannel: {
                "@type": "ServiceChannel",
                serviceUrl: "https://teasgurus.com/",
                availableLanguage: "English",
              },
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/#take-my-exam",
              serviceType: "Take My TEAS Exam",
              provider: { "@id": "https://teasgurus.com/#organization" },
              areaServed: { "@type": "Country", name: "United States" },
              description:
                "Need someone to take your TEAS exam? Teas Gurus offers expert ATI TEAS exam takers who will handle your online or proctored TEAS test professionally. If you're searching for 'take my TEAS exam' services, we provide a reliable and secure solution.",
              availableChannel: {
                "@type": "ServiceChannel",
                serviceUrl: "https://teasgurus.com/",
                availableLanguage: "English",
              },
            },
            {
              "@type": "Service",
              "@id": "https://teasgurus.com/#take-my-exam-for-me",
              serviceType: "Take My TEAS Exam for Me",
              provider: { "@id": "https://teasgurus.com/#organization" },
              areaServed: { "@type": "Country", name: "United States" },
              description:
                "Want a professional to take your TEAS exam for you? Teas Gurus provides reliable, confidential, and high-score guaranteed ATI TEAS test-taking services. Whether it's a proctored exam or remote, our experts will take your TEAS exam for you safely and discreetly.",
              availableChannel: {
                "@type": "ServiceChannel",
                serviceUrl: "https://teasgurus.com/",
                availableLanguage: "English",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Can I pay someone to take my TEAS exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. You can pay someone to take your TEAS exam online with Teas Gurus. We provide experienced and professional exam takers who ensure top scores in a safe, secure, and discreet environment.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I find someone to take my TEAS exam for me?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can hire a trusted expert at Teas Gurus to take your TEAS exam for you. Just contact us through our homepage, provide your test details, and we'll handle the rest—including proctored exams.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is it safe to have someone take my TEAS exam online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. At Teas Gurus, all TEAS exams taken on your behalf are managed with complete confidentiality, privacy, and professionalism. Our process is secure, even for proctored exams.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much should I pay someone to take my online TEAS exam Reddit?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "According to Reddit discussions, prices to hire someone to take your TEAS exam online can reach up to $500. However, prices vary depending on the exam difficulty, tutor's success rate, and their qualifications.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I pay someone to take my remote TEAS exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. You can pay someone to take your remote TEAS exams through Teas Gurus. Our expert MSN tutors handle the full process and guarantee high scores while maintaining complete discretion.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Where can I pay someone to take my TEAS entrance exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The best place to pay someone to take your TEAS entrance exam is online. Teas Gurus offers confidential, professional help with flexible access and a wide range of exam services.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much should I pay someone to take my online TEAS exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "While others may charge over $500, Teas Gurus offers affordable pricing at $400 per exam. You also get a money-back guarantee, secure testing, and the option to pay in installments.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is Teas Gurus legit?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Teas Gurus is a legitimate and trusted platform with real student testimonials. Our pricing is transparent, our services are proven, and our results speak for themselves.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is Teas Gurus legit and do they have enough exam takers?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. Teas Gurus has been helping students for years. We have a strong team of expert exam takers ready to assist with your TEAS test anytime you need.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I take my TEAS exam online or remotely?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The TEAS exam can be taken online or remotely. Most institutions now support remote proctoring. Teas Gurus offers support to help you complete your exam from anywhere with ease.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do you properly take the TEAS exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "To take the TEAS exam properly, register through the ATI website, choose the remote option, and select your date. Teas Gurus can help install software like AnyDesk and Respondus bypass to handle the exam securely on your behalf.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Are there legit TEAS taker experts?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Teas Gurus is home to expert TEAS exam takers who are qualified, experienced, and available to help you pass your test professionally and securely.",
                  },
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
