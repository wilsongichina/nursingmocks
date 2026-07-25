const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUG = "teas-4-nested-sub-page-test";

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

const bodyContent = [
  '<h2 class="custom-heading">How This Nested Test Page Should Read</h2>',
  "<p>This is human-written placeholder content for checking the nested sub-page layout. It should feel like a normal study guide, not repeated filler text, while still giving every public content block enough room to render clearly.</p>",
  '<div data-type="callout" class="callout callout-info"><p>Use this page to confirm that nested sub pages match the same public layout, spacing, headings, quiz cards, and inline modules used by standard sub pages.</p></div>',
  '<div data-type="dotted-separator" class="dotted-separator"></div>',
  '<h2 class="custom-heading">Practice Flow Snapshot</h2>',
  "<p>A student landing here should be able to scan the page, understand what the practice flow covers, open related pages, and interact with a small static quiz preview without waiting for client-only content to appear.</p>",
  '<section data-eyebrow="Layout test" data-title="Start a focused TEAS 4 review" data-description="Use this call-to-action block to confirm button spacing, copy wrapping, and card alignment inside a nested sub-page guide section." data-button-label="Open Parent Page" data-button-href="/teas-4-sub-page-test" data-type="cta-block" class="public-cta-block"><div class="public-cta-block-copy"><div class="public-cta-block-eyebrow">Layout test</div><h3>Start a focused TEAS 4 review</h3><p>Use this call-to-action block to confirm button spacing, copy wrapping, and card alignment inside a nested sub-page guide section.</p></div><a class="public-cta-block-button" href="/teas-4-sub-page-test">Open Parent Page</a></section>',
  '<aside data-title="TEAS 4 Sub Page Test" data-description="Return to the parent sub page to compare the nested page against the standard sub-page render." data-link-label="View Parent Sub Page" data-link-href="/teas-4-sub-page-test" data-type="internal-link-card" class="public-internal-link-card"><div class="public-internal-link-card-icon">Open</div><div class="public-internal-link-card-copy"><h3>TEAS 4 Sub Page Test</h3><p>Return to the parent sub page to compare the nested page against the standard sub-page render.</p><a href="/teas-4-sub-page-test">View Parent Sub Page</a></div></aside>',
  '<aside data-question="What should this nested test page prove?" data-answer="It should prove that nested sub pages can render saved Tiptap content, inline blocks, section navigation, and quiz previews with the same public presentation as sub pages." data-type="faq-content-block" class="public-faq-content-block"><div class="public-faq-content-block-badge">Question</div><h3>What should this nested test page prove?</h3><p>It should prove that nested sub pages can render saved Tiptap content, inline blocks, section navigation, and quiz previews with the same public presentation as sub pages.</p></aside>',
  '<h2 class="custom-heading">Comparison Cards And Tables</h2>',
  "<p>This section checks dense structured content. The table should stay readable on desktop and mobile, and it should remain inside the same guide content area as the rest of the Tiptap body.</p>",
  '<section data-title="Nested sub-page rendering checks" data-column-one-heading="Block" data-column-two-heading="What to verify" data-row-one-left="CTA block" data-row-one-right="Button, heading, eyebrow, and description render as one inline module." data-row-two-left="Internal link card" data-row-two-right="The card links to another public page without breaking the guide layout." data-row-three-left="FAQ content block" data-row-three-right="Question and answer copy use the module typography." data-row-four-left="Quiz card" data-row-four-right="Selected questions render statically in the public page content." data-type="comparison-table-block" class="public-comparison-table-block"><h3>Nested sub-page rendering checks</h3><div class="public-comparison-table"><div class="public-comparison-table-row public-comparison-table-head"><div>Block</div><div>What to verify</div></div><div class="public-comparison-table-row"><div>CTA block</div><div>Button, heading, eyebrow, and description render as one inline module.</div></div><div class="public-comparison-table-row"><div>Internal link card</div><div>The card links to another public page without breaking the guide layout.</div></div><div class="public-comparison-table-row"><div>FAQ content block</div><div>Question and answer copy use the module typography.</div></div><div class="public-comparison-table-row"><div>Quiz card</div><div>Selected questions render statically in the public page content.</div></div></div></section>',
  '<table><tbody><tr><th>Test area</th><th>Expected result</th></tr><tr><td>H2 navigation</td><td>Only these H2 headings should appear in the left guide menu.</td></tr><tr><td>Inline modules</td><td>Blocks should sit inside the active guide section, not become separate tabs.</td></tr><tr><td>Typography</td><td>Paragraphs, cards, and table content should share the public page style.</td></tr></tbody></table>',
  '<h2 class="custom-heading">Static Quiz Card Test</h2>',
  "<p>The quiz card below is intentionally limited to a few selected questions. It should render as part of the static page content so the preview does not appear late or disappear on reload.</p>",
  '<div data-pillar-id="nursing-entrance-exam" data-sub-page-id="yrdSf0KpOcuybL1SLnw7" data-nested-sub-page-id="e9EcRCWTbyKVpyLXUKzd" data-quiz-id="2QdoLJuYSDjx7T06i3ot" data-quiz-title="TEAS Math Mini Preview" data-selected-question-ids="[&quot;1&quot;,&quot;10&quot;,&quot;11&quot;,&quot;12&quot;,&quot;13&quot;]" data-type="quiz-card" class="quiz-card-wrapper"></div>',
  '<div data-type="callout" class="callout callout-success"><p>If this success callout appears after the quiz card, the renderer is continuing through mixed static content parts correctly.</p></div>',
  '<h2 class="custom-heading">Final Mobile Spacing Check</h2>',
  "<p>On mobile, the content should stack cleanly with no overlapping labels, clipped buttons, or cards pushed outside the page width. The copy is long enough to expose wrapping issues without looking artificial.</p>",
  '<div data-type="callout" class="callout callout-warning"><p>This warning callout is here to test a second callout tone and confirm that alert-style cards still match the public typography.</p></div>',
  '<p><strong>Admin note:</strong> This page uses test content only. Replace it before publishing any real student-facing TEAS 4 material.</p>',
].join("");

const nextFields = {
  pageName: "TEAS 4 Nested Sub Page Test",
  seoLabel: "TEAS 4 Nested Sub Page Test",
  heading: "TEAS 4 Nested Sub Page Test",
  description:
    "A realistic nested sub-page test article for verifying public layout, inline Tiptap cards, static quiz rendering, and mobile spacing.",
  cardDescription:
    "Test nested sub-page rendering with all public Tiptap cards, guide sections, and a static quiz preview.",
  bodyContent,
  faqs: [
    {
      question: "Why does this page have so many content blocks?",
      answer:
        "It is a test page for checking every nested sub-page content module in one place before using the layout on real study pages.",
    },
    {
      question: "Should this copy be used as live exam content?",
      answer:
        "No. This is placeholder content for QA. Replace it with final student-facing copy before using the page as a real resource.",
    },
  ],
  meta: {
    title: "TEAS 4 Nested Sub Page Test | NursingMocks",
    description:
      "Test nested sub-page rendering for TEAS 4 content, Tiptap cards, static quiz previews, and public page typography.",
    keywords:
      "TEAS 4 nested sub page test, NursingMocks layout test, Tiptap content test",
    ogTitle: "TEAS 4 Nested Sub Page Test",
    ogDescription:
      "A NursingMocks nested sub-page test for public rendering and Tiptap content modules.",
    ogImage: "/nursing-mocks-logo.png",
    canonicalUrl: "https://nursingmocks.com/teas-4-nested-sub-page-test",
  },
};

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const mappingSnapshot = await db
    .collection("routeMappings")
    .where("slug", "==", TARGET_SLUG)
    .limit(1)
    .get();

  if (mappingSnapshot.empty) {
    throw new Error(`Route mapping not found for slug: ${TARGET_SLUG}`);
  }

  const mappingDoc = mappingSnapshot.docs[0];
  const mapping = mappingDoc.data();
  const refPath = mapping.refPath || mapping.contentPath;
  if (!refPath) {
    throw new Error(`Route mapping for ${TARGET_SLUG} has no refPath/contentPath.`);
  }

  const ref = db.doc(refPath);
  const beforeSnapshot = await ref.get();
  if (!beforeSnapshot.exists) {
    throw new Error(`Target document not found: ${refPath}`);
  }

  const before = beforeSnapshot.data();
  const update = {
    ...nextFields,
    slug: TARGET_SLUG,
    type: "nested",
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (apply) {
    await ref.set(update, { merge: true });
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    slug: TARGET_SLUG,
    mappingId: mappingDoc.id,
    refPath,
    before: {
      pageName: before.pageName,
      heading: before.heading,
      description: before.description,
      bodyLength: String(before.bodyContent || "").length,
      faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
    },
    after: {
      pageName: nextFields.pageName,
      heading: nextFields.heading,
      description: nextFields.description,
      bodyLength: bodyContent.length,
      faqCount: nextFields.faqs.length,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
