const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const DOC_PATH = "pillarPages/nursing-entrance-exam/subPages/yrdSf0KpOcuybL1SLnw7";

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  throw new Error("Firebase Admin credentials are not configured.");
}

function getDb() {
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

const bodyContent = "<p></p>";

const schema = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.nursingmocks.com/#organization",
        name: "NursingMocks",
        url: "https://www.nursingmocks.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.nursingmocks.com/nursing-mocks-logo.png",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.nursingmocks.com/#website",
        url: "https://www.nursingmocks.com",
        name: "NursingMocks",
        publisher: {
          "@id": "https://www.nursingmocks.com/#organization",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "CollectionPage",
        "@id": "https://www.nursingmocks.com/teas-7-practice-test#webpage",
        url: "https://www.nursingmocks.com/teas-7-practice-test",
        name: "ATI TEAS 7",
        description:
          "Practice ATI TEAS 7 subjects with exam-style questions for Reading, Mathematics, Science, and English and Language Usage.",
        isPartOf: {
          "@id": "https://www.nursingmocks.com/#website",
        },
        breadcrumb: {
          "@id": "https://www.nursingmocks.com/teas-7-practice-test#breadcrumb",
        },
        about: [
          {
            "@type": "Thing",
            name: "Nursing Entrance Exams",
          },
          {
            "@type": "Thing",
            name: "ATI TEAS 7",
          },
        ],
        mainEntity: {
          "@id": "https://www.nursingmocks.com/teas-7-practice-test#content-list",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.nursingmocks.com/teas-7-practice-test#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.nursingmocks.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Nursing Entrance Exams",
            item: "https://www.nursingmocks.com/nursing-entrance-exam",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "ATI TEAS 7",
            item: "https://www.nursingmocks.com/teas-7-practice-test",
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://www.nursingmocks.com/teas-7-practice-test#content-list",
        name: "ATI TEAS 7 practice test subjects",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "TEAS Reading Practice Test",
            description:
              "Practice ATI TEAS Reading questions covering Key Ideas and Details, Craft and Structure, and Integration of Knowledge and Ideas.",
            url: "https://www.nursingmocks.com/teas-reading-practice-test",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "TEAS Math Practice Test",
            description:
              "Practice ATI TEAS Math questions covering Numbers and Algebra plus Measurement and Data.",
            url: "https://www.nursingmocks.com/teas-math-practice-test",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "TEAS Science Practice Test",
            description:
              "Practice ATI TEAS Science questions covering Human Anatomy and Physiology, Biology, Chemistry, and Scientific Reasoning.",
            url: "https://www.nursingmocks.com/teas-science-practice-test",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "TEAS English Practice Test",
            description:
              "Practice ATI TEAS English and Language Usage questions covering Standard English conventions, language knowledge, and vocabulary in writing.",
            url: "https://www.nursingmocks.com/teas-english-practice-test",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.nursingmocks.com/teas-7-practice-test#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this ATI TEAS practice organized by subject?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. NursingMocks organizes ATI TEAS practice by subject so students can focus on Reading, Mathematics, Science, and English and Language Usage separately.",
            },
          },
          {
            "@type": "Question",
            name: "Can I start with a free preview?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. Available preview questions let students try the practice experience before unlocking full access.",
            },
          },
          {
            "@type": "Question",
            name: "Are answers and explanations included?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. Answers and explanations are used for review so students can understand the reasoning behind each question.",
            },
          },
          {
            "@type": "Question",
            name: "Should I practice every subject at once?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Most students benefit from choosing one subject first, reviewing results, and then moving to the next area based on their study plan.",
            },
          },
          {
            "@type": "Question",
            name: "Is NursingMocks affiliated with ATI?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "No. NursingMocks is an independent practice resource and is not affiliated with ATI. All trademarks belong to their respective owners.",
            },
          },
        ],
        inLanguage: "en-US",
      },
    ],
  },
  null,
  2
);

const nextData = {
  pageName: "ATI TEAS 7",
  seoLabel: "ATI TEAS 7 Practice Test",
  heading: "ATI TEAS 7",
  description:
    "<p>Practice ATI TEAS 7 subjects with exam-style questions for Reading, Mathematics, Science, and English and Language Usage.</p>",
  bodyContent,
  meta: {
    title: "ATI TEAS 7 Practice Test | NursingMocks",
    description:
      "Practice ATI TEAS 7 subjects with exam-style questions, free preview access, answers, and explanations for Reading, Mathematics, Science, and English and Language Usage.",
    keywords:
      "ATI TEAS practice test, ATI TEAS 7 practice test, TEAS reading practice, TEAS math practice, TEAS science practice, TEAS English practice",
    ogTitle: "ATI TEAS 7 Practice Test | NursingMocks",
    ogDescription:
      "Practice ATI TEAS 7 subjects with exam-style questions, free preview access, answers, and explanations.",
    ogImage: "/nursing-mocks-logo.png",
    canonicalUrl: "https://www.nursingmocks.com/teas-7-practice-test",
  },
  schema,
  faqs: [
    {
      question: "Is this ATI TEAS practice organized by subject?",
      answer:
        "Yes. NursingMocks organizes ATI TEAS practice by subject so students can focus on Reading, Mathematics, Science, and English and Language Usage separately.",
    },
    {
      question: "Can I start with a free preview?",
      answer:
        "Yes. Available preview questions let students try the practice experience before unlocking full access.",
    },
    {
      question: "Are answers and explanations included?",
      answer:
        "Yes. Answers and explanations are used for review so students can understand the reasoning behind each question.",
    },
    {
      question: "Should I practice every subject at once?",
      answer:
        "Most students benefit from choosing one subject first, reviewing results, and then moving to the next area based on their study plan.",
    },
    {
      question: "Is NursingMocks affiliated with ATI?",
      answer:
        "No. NursingMocks is an independent practice resource and is not affiliated with ATI. All trademarks belong to their respective owners.",
    },
  ],
};

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const ref = db.doc(DOC_PATH);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error(`Document not found: ${DOC_PATH}`);
  const before = snapshot.data();

  const report = {
    mode: apply ? "apply" : "dry-run",
    path: DOC_PATH,
    before: {
      pageName: before.pageName,
      seoLabel: before.seoLabel,
      heading: before.heading,
      metaTitle: before.meta?.title,
      metaDescription: before.meta?.description,
      bodyLength: String(before.bodyContent || "").length,
      faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
    },
  after: {
    pageName: nextData.pageName,
    seoLabel: nextData.seoLabel,
    heading: nextData.heading,
    metaTitle: nextData.meta.title,
    metaDescription: nextData.meta.description,
    bodyLength: bodyContent.length,
    bodyStandardized: true,
    faqCount: nextData.faqs.length,
  },
};

  if (apply) {
    await ref.update({
      ...nextData,
      updatedAt: FieldValue.serverTimestamp(),
      publicContentCleanedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
