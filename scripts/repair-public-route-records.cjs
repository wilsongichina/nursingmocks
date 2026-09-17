// Targeted repair from the September 17 route audit. Dry run unless --apply is passed.
// Never edits questions, purchases, users, or access assignments.
const fs = require('node:fs');
const path = require('node:path');
require('@next/env').loadEnvConfig(process.cwd());
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
const db = getFirestore(initializeApp({ credential: json ? cert(JSON.parse(json.replace(/\\n/g, '\n'))) : cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) }));
const OUT = path.join(process.cwd(), 'reports', 'routing-repairs-2026-09-17');
fs.mkdirSync(OUT, { recursive: true });
const parents = [
  { id: 'pxxCHZxblBsuB7nBLbaK', old: '1WMx3RnRNKLogjLSuXRs', parent: 'S4vSoa5bxDgZ1L5kLOJe', pillar: 'nursing-exit-exam', slug: 'rn-test-kb-df', parentSlug: 'rn-exit-exams' },
  { id: 'zoSxJO20FZLDobu2KKXf', old: 'HlwBIiFowhZveV5Yq5Sr', parent: 'z0xzINtS3EohZNaKosBz', pillar: 'nursing-test-bank', slug: 'lpn-kb-article', parentSlug: 'lpn-exams' },
  { id: '63KhIXE69eSgyh4EX3jz', old: 'zJycvVhmofAy1ETc14ax', parent: 'yrdSf0KpOcuybL1SLnw7', pillar: 'nursing-entrance-exam', slug: 'teas-test-4-knowledge-base', parentSlug: 'ati-teas-practice-test' },
];
const quizPath = 'pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi/nestedSubPages/Fnnd4c6ae0Uiurk2KUSc/topics/APcgmC0wCfmDFfXIZdxZ/quizzes/HxkVhdqgOz6vhZhobU7B';
const quizSlug = 'mental-health-ati-rn-proctored-exam-practice-questions';
const retiredPath = 'knowledgeBase/ItrvamPHl4v0qYDMW8rW';
const retiredRoutePath = 'routeMappings/ETeanPNoU86NmkMo9Hlo';
const mappingPath = 'routeMappings/repair-HxkVhdqgOz6vhZhobU7B';
const assert = (value, message) => { if (!value) throw new Error(message); };

async function main() {
  const readPaths = [...new Set([
    ...parents.flatMap(p => [`knowledgeBase/${p.id}`, `pillarPages/${p.pillar}/subPages/${p.parent}`, `pillarPages/${p.pillar}/subPages/${p.old}`]),
    retiredPath, retiredRoutePath, quizPath, mappingPath,
    'pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi',
    'pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi/nestedSubPages/Fnnd4c6ae0Uiurk2KUSc',
    'pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi/nestedSubPages/Fnnd4c6ae0Uiurk2KUSc/topics/APcgmC0wCfmDFfXIZdxZ',
  ])];
  const snapshots = await db.getAll(...readPaths.map(p => db.doc(p)));
  const docs = new Map(snapshots.map(s => [s.ref.path, s]));
  const operations = [];
  for (const p of parents) {
    const article = docs.get(`knowledgeBase/${p.id}`).data();
    const parent = docs.get(`pillarPages/${p.pillar}/subPages/${p.parent}`).data();
    assert(article?.slug === p.slug && article.pillarId === p.pillar, `Article identity changed: ${p.id}`);
    assert(parent?.slug === p.parentSlug, `Replacement parent identity changed: ${p.parent}`);
    assert(!docs.get(`pillarPages/${p.pillar}/subPages/${p.old}`).exists, `Old parent exists: ${p.old}`);
    if (article.parentId === p.parent) continue;
    assert(article.parentId === p.old, `Parent changed since audit: ${p.id}`);
    const data = { parentId: p.parent };
    if (article.parentSubPageId === p.old) data.parentSubPageId = p.parent;
    operations.push({ action: 'update', path: `knowledgeBase/${p.id}`, data });
  }
  const retired = docs.get(retiredPath).data();
  assert(retired && (retired.slug === 'ati-teas' || (retired.slug === '' && retired.status === 'Draft')), 'Retired article identity changed');
  if (retired.slug === 'ati-teas') operations.push({ action: 'update', path: retiredPath, data: { slug: '', status: 'Draft' } });
  const retiredRoute = docs.get(retiredRoutePath);
  if (retiredRoute.exists) {
    assert(retiredRoute.data().slug === 'ati-teas' && retiredRoute.data().refPath === retiredPath, 'Retired route identity changed');
    operations.push({ action: 'delete', path: retiredRoutePath });
  }
  const quiz = docs.get(quizPath).data();
  assert(quiz?.slug === quizSlug && quiz.status === 'Published', 'Quiz identity or publication status changed');
  const count = (await db.collection(`${quizPath}/questions`).count().get()).data().count;
  assert(count === 34, `Question count changed: ${count}`);
  for (const p of readPaths.filter(p => p.startsWith('pillarPages/') && !p.includes('/quizzes/') && !parents.some(a => p.endsWith('/' + a.old)))) assert(docs.get(p).exists, `Missing ancestor: ${p}`);
  const sameSlug = await db.collection('routeMappings').where('slug', '==', quizSlug).get();
  const sameContent = await db.collection('routeMappings').where('refPath', '==', quizPath).get();
  assert(sameSlug.docs.every(d => d.ref.path === mappingPath) && sameContent.docs.every(d => d.ref.path === mappingPath), 'A quiz route was added since the audit; inspect it first');
  if (!docs.get(mappingPath).exists) operations.push({ action: 'create', path: mappingPath, data: {
    type: 'quiz', pillarId: 'nursing-test-bank', slug: quizSlug,
    subPageId: 'SuT1noZoNGEjKGR1vTbi', nestedPageId: 'Fnnd4c6ae0Uiurk2KUSc', topicId: 'APcgmC0wCfmDFfXIZdxZ', quizId: 'HxkVhdqgOz6vhZhobU7B',
    refPath: quizPath, contentPath: quizPath, title: quiz.pageName,
    examAccessProductId: 'nursing_test_bank', lastUpdated: new Date().toISOString(),
  } });
  const plan = { at: new Date().toISOString(), questionCount: count, operations };
  fs.writeFileSync(path.join(OUT, 'data-repair-plan.json'), JSON.stringify(plan, null, 2));
  console.log(JSON.stringify(plan, null, 2));
  if (!process.argv.includes('--apply') || !operations.length) return;
  // Save the complete affected records before the transaction. Do not overwrite
  // an earlier backup if this script is retried.
  const backup = operations.map(op => ({ path: op.path, exists: docs.get(op.path).exists, data: docs.get(op.path).data() || null }));
  const backupFile = path.join(OUT, `data-backup-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2), { flag: 'wx' });
  await db.runTransaction(async tx => {
    const current = await tx.getAll(...readPaths.map(p => db.doc(p)));
    for (const s of current) {
      const previous = docs.get(s.ref.path);
      assert(s.exists === previous.exists && (!s.exists || s.updateTime.isEqual(previous.updateTime)), `Concurrent edit: ${s.ref.path}`);
    }
    const slugCheck = await tx.get(db.collection('routeMappings').where('slug', '==', quizSlug));
    const contentCheck = await tx.get(db.collection('routeMappings').where('refPath', '==', quizPath));
    assert(slugCheck.docs.every(d => d.ref.path === mappingPath) && contentCheck.docs.every(d => d.ref.path === mappingPath), 'Concurrent route creation');
    for (const op of operations) {
      if (op.action === 'delete') tx.delete(db.doc(op.path));
      else if (op.action === 'create') tx.create(db.doc(op.path), op.data);
      else tx.update(db.doc(op.path), op.data);
    }
  });
  const after = await db.getAll(...operations.map(op => db.doc(op.path)));
  after.forEach((s, i) => {
    const op = operations[i];
    if (op.action === 'delete') assert(!s.exists, `Delete verification failed: ${op.path}`);
    else {
      const expected = op.action === 'create' ? op.data : { ...docs.get(op.path).data(), ...op.data };
      assert(require('node:util').isDeepStrictEqual(s.data(), expected), `Unexpected record change: ${op.path}`);
    }
  });
  assert((await db.collection(`${quizPath}/questions`).count().get()).data().count === 34, 'Question count verification failed');
  fs.writeFileSync(path.join(OUT, 'data-repair-result.json'), JSON.stringify({ ...plan, verified: true, backupFile }, null, 2));
  console.log(`Verified ${operations.length} record changes; questions unchanged. Backup: ${backupFile}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
