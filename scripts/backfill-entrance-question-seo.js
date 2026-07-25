const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLAR_ID = "nursing-entrance-exam";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com").replace(/\/$/, "");

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

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function cleanQuestionSeoText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function truncateSeoText(value, maxLength) {
  const clean = cleanQuestionSeoText(value);
  if (clean.length <= maxLength) return clean;
  const truncated = clean.slice(0, maxLength + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const base =
    lastSpace >= Math.floor(maxLength * 0.65)
      ? truncated.slice(0, lastSpace)
      : truncated.slice(0, maxLength);
  return base.replace(/[.,;:!?-]+$/g, "").trim();
}

function questionAnswerText(value, options) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanQuestionSeoText(item)).filter(Boolean).join(", ");
  }
  const answer = cleanQuestionSeoText(value);
  if (!answer || !Array.isArray(options)) return answer;

  const labelIndex = "ABCDEFGH".indexOf(answer.toUpperCase());
  if (labelIndex >= 0 && options[labelIndex]) {
    return cleanQuestionSeoText(options[labelIndex]);
  }
  return answer;
}

function buildQuestionSeo({ question, questionId, quiz, parent, nested }) {
  const slug = textValue(question.slug, questionId);
  const canonicalUrl = slug ? `${SITE_URL}/${slug.replace(/^\/+/, "")}` : SITE_URL;
  const questionText = cleanQuestionSeoText(question.question);
  const fallbackTitle = textValue(quiz.pageName, quiz.quizName, quiz.title, "Nursing Entrance Exam Question");
  const titleSuffix = " | NursingMocks";
  const titleBase = truncateSeoText(questionText || fallbackTitle, Math.max(20, 60 - titleSuffix.length));
  const metaTitle = `${titleBase || "Nursing Entrance Exam Question"}${titleSuffix}`;
  const metaDescription = truncateSeoText(questionText || `Practice ${fallbackTitle} question.`, 155);
  const answerText = questionAnswerText(question.correctAnswer, question.options);
  const explanationText = cleanQuestionSeoText(question.explanation || question.solution);
  const parentName = textValue(parent.pageName, parent.hero?.title, parent.title, parent.slug);
  const nestedName = textValue(nested.pageName, nested.hero?.title, nested.title, nested.slug);
  const quizName = textValue(quiz.pageName, quiz.quizName, quiz.title, quiz.slug, fallbackTitle);

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Nursing Entrance Exam", item: `${SITE_URL}/nursing-entrance-exam` },
    parentName ? { "@type": "ListItem", position: 3, name: parentName, item: `${SITE_URL}/${textValue(parent.slug)}` } : null,
    nestedName ? { "@type": "ListItem", position: 4, name: nestedName, item: `${SITE_URL}/${textValue(nested.slug)}` } : null,
    quizName ? { "@type": "ListItem", position: 5, name: quizName, item: `${SITE_URL}/${textValue(quiz.slug)}` } : null,
    { "@type": "ListItem", position: 6, name: titleBase || "Question", item: canonicalUrl },
  ].filter(Boolean);

  const schema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: metaTitle,
          description: metaDescription,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
          mainEntity: { "@id": `${canonicalUrl}#question` },
          inLanguage: "en-US",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: breadcrumbItems,
        },
        {
          "@type": "Question",
          "@id": `${canonicalUrl}#question`,
          name: titleBase || "Nursing Entrance Exam Question",
          text: questionText,
          acceptedAnswer: answerText
            ? {
                "@type": "Answer",
                text: explanationText ? `${answerText}. ${explanationText}` : answerText,
              }
            : undefined,
          isPartOf: quizName
            ? {
                "@type": "Quiz",
                name: quizName,
                url: `${SITE_URL}/${textValue(quiz.slug)}`,
              }
            : undefined,
          inLanguage: "en-US",
        },
      ],
    },
    null,
    2
  );

  return {
    meta: {
      title: metaTitle,
      description: metaDescription,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ogImage: `${SITE_URL}/nursing-mocks-logo.png`,
      canonicalUrl,
    },
    schema,
  };
}

function generatedPatch(question, generated) {
  const currentMeta = question.meta || {};
  const meta = {
    ...currentMeta,
    title: textValue(currentMeta.title) || generated.meta.title,
    description: textValue(currentMeta.description) || generated.meta.description,
    ogTitle: textValue(currentMeta.ogTitle) || generated.meta.ogTitle,
    ogDescription: textValue(currentMeta.ogDescription) || generated.meta.ogDescription,
    ogImage: textValue(currentMeta.ogImage) || generated.meta.ogImage,
    canonicalUrl: textValue(currentMeta.canonicalUrl) || generated.meta.canonicalUrl,
  };
  const patch = {};
  if (JSON.stringify(currentMeta) !== JSON.stringify(meta)) patch.meta = meta;
  if (!textValue(question.schema)) patch.schema = generated.schema;
  if (Object.keys(patch).length > 0) {
    patch.questionSeoBackfilledAt = FieldValue.serverTimestamp();
  }
  return patch;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const subPagesSnapshot = await db.collection("pillarPages").doc(PILLAR_ID).collection("subPages").get();
  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedSubPages: subPagesSnapshot.size,
    scannedNestedPages: 0,
    scannedQuizzes: 0,
    scannedQuestions: 0,
    updatesNeeded: 0,
    updated: 0,
    unchanged: 0,
    samples: [],
  };

  let batch = db.batch();
  let batchSize = 0;

  async function commitIfNeeded(force = false) {
    if (batchSize === 0 || (!force && batchSize < 450)) return;
    await batch.commit();
    batch = db.batch();
    batchSize = 0;
  }

  for (const subPageDoc of subPagesSnapshot.docs) {
    const parent = subPageDoc.data();
    const nestedSnapshot = await subPageDoc.ref.collection("nestedSubPages").get();
    report.scannedNestedPages += nestedSnapshot.size;

    for (const nestedDoc of nestedSnapshot.docs) {
      const nested = nestedDoc.data();
      const quizzesSnapshot = await nestedDoc.ref.collection("quizzes").get();
      report.scannedQuizzes += quizzesSnapshot.size;

      for (const quizDoc of quizzesSnapshot.docs) {
        const quiz = quizDoc.data();
        const questionsSnapshot = await quizDoc.ref.collection("questions").get();
        report.scannedQuestions += questionsSnapshot.size;

        for (const questionDoc of questionsSnapshot.docs) {
          const question = questionDoc.data();
          const generated = buildQuestionSeo({
            question,
            questionId: questionDoc.id,
            quiz,
            parent,
            nested,
          });
          const patch = generatedPatch(question, generated);

          if (Object.keys(patch).length === 0) {
            report.unchanged += 1;
            continue;
          }

          report.updatesNeeded += 1;
          if (report.samples.length < 20) {
            report.samples.push({
              path: questionDoc.ref.path,
              title: generated.meta.title,
              description: generated.meta.description,
              fields: Object.keys(patch),
            });
          }

          if (apply) {
            batch.set(questionDoc.ref, patch, { merge: true });
            batchSize += 1;
            report.updated += 1;
            await commitIfNeeded();
          }
        }
      }
    }
  }

  if (apply) await commitIfNeeded(true);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
