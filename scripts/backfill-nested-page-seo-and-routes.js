const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const SITE_URL = "https://www.nursingmocks.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/nursing-mocks-logo.png`;

const PILLARS = [
  {
    id: "nursing-entrance-exam",
    label: "Nursing Entrance Exams",
    slug: "nursing-entrance-exam",
    childCollection: "quizzes",
  },
  {
    id: "nursing-test-bank",
    label: "Nursing Test Bank",
    slug: "nursing-test-bank",
    childCollection: "topics",
  },
  {
    id: "nursing-exit-exam",
    label: "Nursing Exit Exams",
    slug: "nursing-exit-exam",
    childCollection: "quizzes",
  },
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

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(value, fallback) {
  return String(value || fallback || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^\/+|\/+$/g, "");
}

function absoluteUrl(slug) {
  const cleanSlug = normalizeSlug(slug, "");
  return cleanSlug ? `${SITE_URL}/${cleanSlug}` : SITE_URL;
}

function pageTitle(data, fallbackSlug) {
  return (
    cleanText(data.pageName) ||
    cleanText(data.heading) ||
    cleanText(data.hero?.title) ||
    cleanText(data.title) ||
    normalizeSlug(fallbackSlug, "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function pageDescription(data, title) {
  return (
    cleanText(data.meta?.description) ||
    cleanText(data.description) ||
    cleanText(data.cardDescription) ||
    cleanText(data.publicDescription) ||
    `Review ${title} practice resources on NursingMocks.`
  );
}

function visibleFaqs(data) {
  return Array.isArray(data.faqs)
    ? data.faqs
        .map((faq) => ({
          question: cleanText(faq.question),
          answer: cleanText(faq.answer),
        }))
        .filter((faq) => faq.question && faq.answer)
    : [];
}

function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }

  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      const compacted = compact(child);
      if (compacted !== undefined) next[key] = compacted;
    }
    return Object.keys(next).length ? next : undefined;
  }

  if (value === undefined || value === "") return undefined;
  return value;
}

async function childItemsForNestedPage(db, pillar, subPageId, nestedPageId) {
  const snapshot = await db
    .collection("pillarPages")
    .doc(pillar.id)
    .collection("subPages")
    .doc(subPageId)
    .collection("nestedSubPages")
    .doc(nestedPageId)
    .collection(pillar.childCollection)
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const slug = normalizeSlug(data.slug, doc.id);
      return {
        name: pageTitle(data, slug),
        slug,
        description: pageDescription(data, pageTitle(data, slug)),
      };
    })
    .filter((item) => item.name && item.slug);
}

function buildNestedSchema({ pillar, slug, title, description, parentTitle, parentSlug, childItems, faqs }) {
  const pageUrl = absoluteUrl(slug);
  const breadcrumbNodes = [
    { name: "Home", slug: "" },
    { name: pillar.label, slug: pillar.slug },
    { name: parentTitle, slug: parentSlug },
    { name: title, slug },
  ].filter((item) => cleanText(item.name));

  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "NursingMocks",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "NursingMocks",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      about: [
        { "@type": "Thing", name: pillar.label },
        { "@type": "Thing", name: parentTitle },
        { "@type": "Thing", name: title },
      ],
      mainEntity:
        childItems.length > 0
          ? { "@id": `${pageUrl}#content-list` }
          : faqs.length > 0
            ? { "@id": `${pageUrl}#faq` }
            : undefined,
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbNodes.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.slug),
      })),
    },
  ];

  if (childItems.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#content-list`,
      name: `${title} pages`,
      itemListElement: childItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description,
        url: absoluteUrl(item.slug),
      })),
    });
  }

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
      inLanguage: "en-US",
    });
  }

  return JSON.stringify(compact({ "@context": "https://schema.org", "@graph": graph }), null, 2);
}

async function upsertRouteMapping(db, mapping) {
  const routeMappingsRef = db.collection("routeMappings");
  const refPathSnapshot = await routeMappingsRef.where("refPath", "==", mapping.refPath).limit(1).get();
  const payload = {
    ...mapping,
    lastUpdated: new Date().toISOString(),
  };

  if (!refPathSnapshot.empty) {
    await refPathSnapshot.docs[0].ref.set(payload, { merge: true });
    return refPathSnapshot.docs[0].id;
  }

  const slugSnapshot = await routeMappingsRef
    .where("pillarId", "==", mapping.pillarId)
    .where("slug", "==", mapping.slug)
    .limit(1)
    .get();

  if (!slugSnapshot.empty) {
    await slugSnapshot.docs[0].ref.set(payload, { merge: true });
    return slugSnapshot.docs[0].id;
  }

  const ref = await routeMappingsRef.add(payload);
  return ref.id;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const results = [];

  for (const pillar of PILLARS) {
    const subPagesSnapshot = await db
      .collection("pillarPages")
      .doc(pillar.id)
      .collection("subPages")
      .get();

    for (const subPageDoc of subPagesSnapshot.docs) {
      const subPage = subPageDoc.data();
      const parentSlug = normalizeSlug(subPage.slug, subPageDoc.id);
      const parentTitle = pageTitle(subPage, parentSlug);
      const nestedSnapshot = await subPageDoc.ref.collection("nestedSubPages").get();

      for (const nestedDoc of nestedSnapshot.docs) {
        const nested = nestedDoc.data();
        const slug = normalizeSlug(nested.slug, nestedDoc.id);
        if (!slug) continue;

        const title = pageTitle(nested, slug);
        const description = pageDescription(nested, title);
        const childItems = await childItemsForNestedPage(db, pillar, subPageDoc.id, nestedDoc.id);
        const faqs = visibleFaqs(nested);
        const schema = buildNestedSchema({
          pillar,
          slug,
          title,
          description,
          parentTitle,
          parentSlug,
          childItems,
          faqs,
        });
        const canonicalUrl = absoluteUrl(slug);
        const refPath = `pillarPages/${pillar.id}/subPages/${subPageDoc.id}/nestedSubPages/${nestedDoc.id}`;
        const beforeMeta = nested.meta || {};
        const update = {
          meta: {
            ...beforeMeta,
            ogImage: DEFAULT_OG_IMAGE,
            canonicalUrl,
          },
          seoSlug: slug,
          schema,
          contentPath: refPath,
          parentId: subPageDoc.id,
          parentSubPageId: subPageDoc.id,
          pillarId: pillar.id,
          type: "nested",
          updatedAt: FieldValue.serverTimestamp(),
          lastUpdated: new Date().toISOString(),
        };

        let mappingId = null;
        if (apply) {
          await nestedDoc.ref.set(update, { merge: true });
          mappingId = await upsertRouteMapping(db, {
            type: "nested",
            pillarId: pillar.id,
            slug,
            subPageId: subPageDoc.id,
            nestedPageId: nestedDoc.id,
            topicId: null,
            quizId: null,
            refPath,
            examAccessProductId: nested.examAccessProductId || subPage.examAccessProductId || null,
          });
        }

        results.push({
          pillarId: pillar.id,
          parentId: subPageDoc.id,
          nestedId: nestedDoc.id,
          pageName: title,
          slug,
          canonicalUrl,
          previousCanonicalUrl: beforeMeta.canonicalUrl || null,
          previousOgImage: beforeMeta.ogImage || null,
          childItemCount: childItems.length,
          faqCount: faqs.length,
          schemaHasFaq: schema.includes('"FAQPage"'),
          mappingId,
        });
      }
    }
  }

  const summary = {
    mode: apply ? "apply" : "dry-run",
    totalNestedPages: results.length,
    byPillar: PILLARS.reduce((acc, pillar) => {
      acc[pillar.id] = results.filter((item) => item.pillarId === pillar.id).length;
      return acc;
    }, {}),
    changedCanonicalCount: results.filter((item) => item.previousCanonicalUrl !== item.canonicalUrl).length,
    changedOgImageCount: results.filter((item) => item.previousOgImage !== DEFAULT_OG_IMAGE).length,
    results,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
