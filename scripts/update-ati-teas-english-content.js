const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUGS = [
  "ati-teas-english-practice-test",
  "teas-english-practice-test",
];

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

const englishFaqs = [
  {
    question: "How do NursingMocks ATI TEAS English practice sets work?",
    answer:
      "Choose an English set, answer the questions, and review your results after the set. The page is built for English-only practice, so you can focus on conventions, language clarity, vocabulary, and revision without moving through the other TEAS subjects.",
  },
  {
    question: "What English topics can I practice on NursingMocks?",
    answer:
      "NursingMocks English practice is organized around the ATI TEAS English and Language Usage areas: Conventions of Standard English, Knowledge of Language, and Vocabulary Acquisition. Use the sets to see whether your missed questions are mostly rules, meaning, word choice, or revision.",
  },
  {
    question: "Are NursingMocks English questions official ATI questions?",
    answer:
      "No. NursingMocks is an independent practice resource. It does not provide official ATI questions and does not claim affiliation, authorization, or endorsement from ATI.",
  },
  {
    question: "Can I use NursingMocks English practice to review missed questions?",
    answer:
      "Yes. After completing a set, use your missed answers to find the pattern behind the score. The issue may be a convention error, meaning and context error, audience and purpose error, or revision and organization error.",
  },
  {
    question: "Is ATI TEAS English only grammar?",
    answer:
      "No. Grammar and punctuation are important, but the official English and Language Usage section also includes Knowledge of Language and Vocabulary Acquisition. Practice should include sentence clarity, paragraph organization, word meaning, and revision decisions.",
  },
  {
    question: "How should I choose my next NursingMocks English set?",
    answer:
      "Choose the next set based on what your last review showed. If you missed punctuation and sentence-structure questions, practice conventions. If you missed word meaning or revision questions, spend more time on vocabulary, context, and clearer sentence choices.",
  },
];

const bodyContent = `
<h2 class="custom-heading"><strong>ATI TEAS English and Language Usage Section at a Glance</strong></h2>
<p>The official ATI TEAS English and Language Usage section gives you 37 minutes for 37 questions. ATI identifies 33 questions as scored and 4 as unscored pretest questions.</p>
<table style="min-width: 50px"><colgroup><col style="min-width: 25px"><col style="min-width: 25px"></colgroup><tbody>
<tr><td><p><strong>English and Language Usage detail</strong></p></td><td><p><strong>Value</strong></p></td></tr>
<tr><td><p>Total questions</p></td><td><p>37</p></td></tr>
<tr><td><p>Scored questions</p></td><td><p>33</p></td></tr>
<tr><td><p>Unscored pretest questions</p></td><td><p>4</p></td></tr>
<tr><td><p>Time limit</p></td><td><p>37 minutes</p></td></tr>
<tr><td><p>Conventions of Standard English</p></td><td><p>12 scored questions</p></td></tr>
<tr><td><p>Knowledge of Language</p></td><td><p>11 scored questions</p></td></tr>
<tr><td><p>Vocabulary Acquisition</p></td><td><p>10 scored questions</p></td></tr>
</tbody></table>
<p>This section is not only grammar. Conventions matter, but Knowledge of Language and Vocabulary Acquisition carry almost the same weight, so your practice should include sentence clarity, word meaning, paragraph organization, and revision decisions.</p>

<h2 class="custom-heading"><strong>What Is the NursingMocks ATI TEAS English Practice Test?</strong></h2>
<p>The NursingMocks ATI TEAS English Practice Test is a subject-focused practice page for students preparing for the English and Language Usage section of the ATI TEAS. It is an independent practice resource, not the official ATI TEAS exam, and it does not provide official ATI questions.</p>
<p>Use it when English feels easy in theory but messy in actual questions. A sentence can look fine at first glance, then hinge on punctuation, agreement, word choice, or whether the revision actually improves the meaning.</p>

<h2 class="custom-heading"><strong>What Topics Are Covered on ATI TEAS English and Language Usage?</strong></h2>
<p>ATI TEAS English and Language Usage is organized around Conventions of Standard English, Knowledge of Language, and Vocabulary Acquisition. Those areas are connected, but they are not the same task.</p>
<p>For practice, separate the decision you are making. Are you fixing an error? Choosing clearer wording? Understanding a word from context? Organizing a sentence or paragraph so the meaning is easier to follow?</p>

<h3><strong>Conventions of Standard English Practice Questions</strong></h3>
<p>Conventions questions focus on accepted written English. Practice may involve spelling, punctuation, capitalization where relevant, sentence structure, agreement, and usage.</p>
<p>Small marks matter here. A comma can separate ideas correctly or create confusion. A sentence may sound normal when spoken but still contain a fragment, run-on, or agreement problem in writing.</p>

<h3><strong>Knowledge of Language Practice Questions</strong></h3>
<p>Knowledge of Language questions focus on how language choices affect clarity, tone, purpose, and organization. You may need to choose the sentence that is clearest, the wording that fits the audience, or the revision that improves a paragraph.</p>
<p>Do not choose the longest option just because it sounds more formal. TEAS English often rewards clean, direct wording. If an answer adds clutter without improving meaning, be suspicious.</p>

<h3><strong>Vocabulary Acquisition Practice Questions</strong></h3>
<p>Vocabulary Acquisition questions focus on word meaning. You may need to use context clues, prefixes, suffixes, roots, or nearby sentence meaning to decide which word or phrase fits best.</p>
<p>The trap is choosing a word you recognize instead of the word the sentence actually needs. Slow down around answer choices that are close in meaning but different in tone, precision, or grammatical fit.</p>

<h2 class="custom-heading"><strong>ATI TEAS English Question Formats and Problem Styles</strong></h2>
<p>ATI TEAS questions can use standard and alternate item formats across the exam. On NursingMocks, answer using the format shown in the English set instead of assuming every set works the same way.</p>
<p>The more important difference is the English decision being tested. One question may ask you to fix punctuation. Another may ask which sentence improves clarity, which word fits the context, or which revision makes a paragraph more logical.</p>

<h2 class="custom-heading"><strong>How English Practice Works on NursingMocks</strong></h2>
<p>Open an English set, read the sentence or short prompt carefully, and answer based on the wording provided. When you finish, check the correct answers and review explanations when they are included.</p>
<p>Do not rush past the explanation. The score tells you how many you missed, but the explanation helps you see the pattern. A repeated punctuation miss needs different review than a vocabulary miss or a paragraph-organization miss.</p>

<h2 class="custom-heading"><strong>Timed ATI TEAS English Practice</strong></h2>
<p>The official English and Language Usage section allows 37 minutes for 37 questions, which averages about one minute per question. That sounds simple until a revision question makes you compare several answers that all look possible.</p>
<p>Move quickly on direct convention questions when the error is clear. Save more attention for questions involving tone, paragraph flow, or word meaning in context. Watch for prompt words such as best, most clearly, not, least, except, before, and after.</p>

<h2 class="custom-heading"><strong>Review Your English Answers, Explanations, and Results</strong></h2>
<p>Do not treat every missed English question as a grammar problem. Most misses come from one of four places:</p>
<ul>
<li><p><strong>Convention error:</strong> You missed a spelling, punctuation, sentence-structure, capitalization, or usage convention.</p></li>
<li><p><strong>Meaning and context error:</strong> You misunderstood the sentence meaning, a qualifier, or the relationship between ideas.</p></li>
<li><p><strong>Audience and purpose error:</strong> You chose wording that did not fit the intended tone, reader, or reason for writing.</p></li>
<li><p><strong>Revision and organization error:</strong> You chose an option that did not make the sentence or paragraph clearer, tighter, or better organized.</p></li>
</ul>
<p>This makes review more useful. If convention errors repeat, review the rule and practice similar questions. If revision errors repeat, compare the answer choices for clarity, concision, and logical flow instead of relying on which option sounds familiar.</p>

<h2 class="custom-heading"><strong>Start ATI TEAS English Practice</strong></h2>
<p>Start with one NursingMocks English set and let the results show what needs attention. Grammar may be part of the score, but English practice also asks you to notice meaning, word choice, sentence flow, and revision quality.</p>
`.trim();

async function findTargetMapping(db) {
  for (const slug of TARGET_SLUGS) {
    const snapshot = await db.collection("routeMappings").where("slug", "==", slug).limit(1).get();
    if (!snapshot.empty) {
      return {
        slug,
        mappingDoc: snapshot.docs[0],
      };
    }
  }

  throw new Error(`No route mapping found for any target slug: ${TARGET_SLUGS.join(", ")}`);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const { slug, mappingDoc } = await findTargetMapping(db);
  const mapping = mappingDoc.data();
  const refPath = mapping.refPath || mapping.contentPath;

  if (!refPath) {
    throw new Error(`Route mapping ${mappingDoc.id} for ${slug} has no refPath/contentPath.`);
  }

  const ref = db.doc(refPath);
  const beforeSnapshot = await ref.get();
  if (!beforeSnapshot.exists) {
    throw new Error(`Target document does not exist: ${refPath}`);
  }

  const before = beforeSnapshot.data();
  const update = {
    bodyContent,
    faqs: englishFaqs,
    displayCopy: {
      ...(before.displayCopy || {}),
      primaryCtaLabel: "Start ATI TEAS English Practice Test",
      secondaryCtaLabel: "View ATI TEAS English Sets",
      practiceEyebrow: "Start By Exam Set",
      practiceTitle: "Choose an ATI TEAS English Practice Test",
      practiceDescription:
        "Choose an English set to start, continue, or review, then use missed-question patterns to spot whether the issue is conventions, meaning, vocabulary, or revision.",
      guideTitle: "",
      guideDescription:
        "Jump to any section of the guide to quickly find the TEAS English and Language Usage information you need.",
      faqTitle: "ATI TEAS English Practice Test FAQs",
      faqDescription:
        "Answers to common questions about using NursingMocks for ATI TEAS English practice.",
    },
    meta: {
      ...(before.meta || {}),
      title: "ATI TEAS English Practice Test | Questions and Answers",
      description:
        "Practice ATI TEAS English and Language Usage questions covering conventions, language clarity, vocabulary, and revision with NursingMocks.",
      keywords: "",
      ogTitle: "ATI TEAS English Practice Test | Questions and Answers",
      ogDescription:
        "Practice ATI TEAS English and Language Usage questions covering conventions, language clarity, vocabulary, and revision with NursingMocks.",
      ogImage: "https://www.nursingmocks.com/nursing-mocks-logo.png",
      canonicalUrl: "https://www.nursingmocks.com/ati-teas-english-practice-test",
    },
    publicDescription:
      "Practice ATI TEAS English and Language Usage questions on NursingMocks covering Conventions of Standard English, Knowledge of Language, and Vocabulary Acquisition.",
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (apply) {
    await ref.set(update, { merge: true });
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    slug,
    mappingId: mappingDoc.id,
    refPath,
    before: {
      pageName: before.pageName,
      heading: before.heading,
      bodyLength: String(before.bodyContent || "").length,
      faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
      faqTitle: before.displayCopy?.faqTitle || null,
      schemaHasFaq: String(before.schema || "").includes("FAQPage"),
      metaTitle: before.meta?.title || null,
    },
    after: {
      bodyLength: bodyContent.length,
      faqCount: englishFaqs.length,
      faqTitle: update.displayCopy.faqTitle,
      metaTitle: update.meta.title,
      canonicalUrl: update.meta.canonicalUrl,
      questions: englishFaqs.map((faq) => faq.question),
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
