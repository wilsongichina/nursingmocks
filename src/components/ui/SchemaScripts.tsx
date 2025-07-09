export default function SchemaScripts() {
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
              "@id": "https://teasgurus.com/#webpage",
              url: "https://teasgurus.com/",
              name: "Pay Someone to Take My Teas Exam for Me | Teas Gurus",
              description:
                "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
              isPartOf: {
                "@id": "https://teasgurus.com/#website",
              },
              about: {
                "@id": "https://teasgurus.com/#organization",
              },
              inLanguage: "en",
            },
            {
              "@type": "FAQPage",
              "@id": "https://teasgurus.com/#faq",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What credentials do your TEAS exam specialists possess?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our highly skilled professionals with solid academic backgrounds in health sciences are our TEAS exam experts. Many have obtained a Doctor of Nursing Practice (DNP), and the majority have degrees in Allied Health. We are able to provide more than just basic tutoring thanks to these credentials, which enable us to guarantee high scores with genuine academic insight. Our staff has received specialized training in time management, proctored platforms, and test-taking strategies. They are fully aware of what to anticipate and how to function under duress. Each expert is carefully chosen by us based on their experience, academic credentials, and track record of assisting students in passing the ATI TEAS exam.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How can the security and confidentiality of a student's exam be guaranteed?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Security and confidentiality are very important to us. Your identity is fully protected when working with Teas Gurus. No personal information about the students they are helping is ever given to our exam takers. They see it as just another exam that needs to be passed in a discrete and professional manner. To ensure that your data is secure from the first message to the end result, we employ private access systems, secure login processes, and encrypted communication. You can rest assured that your privacy will be completely protected, and neither your school nor the testing platform will ever be aware that you received assistance. Our professional promise is that.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What occurs if I'm not happy with the outcomes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We place a great deal of importance on your satisfaction. Even though the majority of our clients are ecstatic about their high scores, we recognize that unexpected events do occur. We provide a complete money-back guarantee in the extremely unlikely event that you're not satisfied with your outcomes. This implies that you will receive a complete refund without any complexities or fine print. We implemented this policy to demonstrate our appreciation for your confidence and investment. It's a commitment to accountability rather than merely a promise. We completely support the idea that we only succeed when you do.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Even if I'm not in the US, can I still get help with the TEAS exam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Indeed! Anywhere in the world, you can get professional TEAS exam assistance. Teas Gurus is a worldwide service that works around the clock to accommodate students' needs in all time zones. We can help you whether you're studying in the UK, Canada, Australia, Africa, or Asia. All you need is a laptop or desktop computer and a reliable internet connection because our system is fully online. No matter where you are, we will walk you through every step once you get in touch with us. Our services have been successfully utilized by students from more than 20 countries. Even though it is midnight your time, we are only a message away.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I retake the TEAS exam for free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Unfortunately, there is a cost associated with retaking the TEAS exam. The exam fee is the same whether you are taking it for the first time or again, and you will need to pay it through ATI Testing or your test center. This can be discouraging, particularly if you failed by a slim margin. Because of this, we advise students to do things correctly the first time, and our team assists you in doing just that. When you use Teas Gurus, you're investing in outcomes that save you money, time, and stress by removing the need for pricey retakes. You're not just paying someone to take your test.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What TEAS score is regarded as passing?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Depending on your school's requirements, a passing score on the TEAS test can vary, but it usually hovers around 65%. While some nursing programs may accept a lower score, others may require a minimum of 70% or even 75% for admission. But why settle for less? Our professionals at Teas Gurus routinely receive scores of 85% and higher, and many of our clients end up in the 90th percentile. Therefore, we help you stand out as a top applicant rather than just meeting the cutoff. Our goal is to get you recognized for your excellence, so don't worry about merely 'passing.'",
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
