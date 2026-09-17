// Read-only local HTTP verification. Run with the Next dev server on port 3011.
const fs = require('node:fs');
const path = require('node:path');
const OUT = path.join(process.cwd(), 'reports/routing-repairs-2026-09-17');
const BASE = process.env.ROUTING_TEST_ORIGIN || 'http://127.0.0.1:3011';
const inventory = JSON.parse(fs.readFileSync(path.join(OUT, 'inventory.json'), 'utf8'));
const cases = [
  { path: '/ati-teas', status: 404 },
  { path: '/blog/route-audit-nonexistent-article', status: 404 },
  { path: '/knowledge-base/route-audit-nonexistent-category', status: 404 },
  { path: '/knowledge-base/mental-health-ati-rn-proctored-exam-practice-questions', status: 404 },
  ...['/how-it-works', '/faqs', '/ati-teas-practice-test', '/ati-teas-reading-practice-test', '/hesi-a2-practice-test', '/nursing-test-bank', '/rn-exit-exams', '/lpn-exit-exams', '/knowledge-base/ati-teas-practice-test'].map(path => ({ path, status: 200 })),
  ...['reading', 'math', 'science', 'english'].map(subject => ({ path: `/ati-teas-${subject}-practice-test-set-16`, status: 200, questions: true })),
  { path: '/mental-health-ati-rn-proctored-exam-practice-questions', status: 200, questionPayload: true },
  { path: '/hesi-a2-math-practice-test-set-1', status: 200, questionPayload: true },
  ...inventory.filter(r => r.refPath.startsWith('knowledgeBase/')).map(r => ({ path: r.canonicalPath, status: 200, kb: true })),
  ...[
    ['/hesi-a2', '/hesi-a2-practice-test'], ['/nursing', '/nursing-test-bank'],
    ['/nursing-exit-exam/rn-exit-exams-exit-exam', '/rn-exit-exams'],
    ['/nursing-exit-exam/lpn-exit-exams-exit-exam', '/lpn-exit-exams'],
    ['/teas-reading-practice-test-set-16', '/ati-teas-reading-practice-test-set-16'],
  ].map(([from, to]) => ({ path: `${from}?mode=review&source=audit`, status: 308, redirect: `${to}?mode=review&source=audit` })),
  { path: '/sitemap.xml', status: 200, sitemap: true },
].filter(test => !process.env.ROUTING_CASE_FILTER || new RegExp(process.env.ROUTING_CASE_FILTER).test(test.path));
const rows = [];
let sitemapXml;
let cursor = 0;
async function worker() {
  while (cursor < cases.length) {
    const test = cases[cursor++];
    const row = { path: test.path, errors: [] };
    try {
      const response = await fetch(BASE + test.path, { redirect: 'manual', signal: AbortSignal.timeout(120000) });
      const html = await response.text();
      row.status = response.status;
      if (response.status !== test.status) row.errors.push(`Expected ${test.status}, received ${response.status}`);
      if (test.redirect) {
        row.location = response.headers.get('location');
        const destination = row.location && new URL(row.location);
        if (!destination || destination.pathname + destination.search !== test.redirect) row.errors.push('Redirect destination/query mismatch');
      } else if (test.sitemap) {
        const urls = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        row.urlCount = urls.length;
        if (urls.length < 1800 || new Set(urls).size !== urls.length) row.errors.push('Sitemap missing coverage or contains duplicates');
        if (urls.some(url => new URL(url).origin !== 'https://www.nursingmocks.com')) row.errors.push('Wrong sitemap origin');
        if (urls.some(url => /\/(ati-teas|knowledge-base|admin)(\/|$)/.test(new URL(url).pathname))) row.errors.push('Retired or noindex/private route in sitemap');
        for (const required of ['/ati-teas-reading-practice-test-set-16', '/hesi-a2-practice-test', '/mental-health-ati-rn-proctored-exam-practice-questions']) if (!urls.includes('https://www.nursingmocks.com' + required)) row.errors.push(`Missing ${required}`);
        sitemapXml = html;
      } else if (test.status === 200) {
        const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
        row.canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] || '';
        row.questionList = visible.includes('id="questions-start"');
        row.questionListInPayload = html.includes('questions-start');
        row.heading = visible.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '') || '';
        if (html.includes('NEXT_HTTP_ERROR_FALLBACK;404')) row.errors.push('Soft 404');
        if (test.questions && !row.questionList) row.errors.push('Missing rendered question list');
        if (test.questionPayload) {
          // These existing routes initialise auth before rendering their client
          // shell. The question component receives a slug, not a database ID;
          // the authenticated quiz API resolves that slug through the registry.
          const flightText = [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)].map(match => {
            try { return JSON.parse(match[1])[1] || ''; } catch { return ''; }
          }).join('');
          row.quizSlugInPayload = flightText.includes(`"slug":"${test.path.slice(1)}","previewQuestions":`);
          if (!row.questionListInPayload || !row.quizSlugInPayload) row.errors.push('Missing exact quiz/question payload');
        }
        if (!row.canonical || new URL(row.canonical).pathname !== test.path) row.errors.push('Canonical does not match page');
        if (test.kb && !/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html)) row.errors.push('KB noindex lost');
        const breadcrumbArrays = [];
        for (const match of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)) {
          try {
            const payload = JSON.parse(match[1])[1];
            if (typeof payload !== 'string') continue;
            for (const crumb of payload.matchAll(/"initialBreadcrumbItems":(\[[\s\S]*?\])[,}]/g)) breadcrumbArrays.push(JSON.parse(crumb[1]));
          } catch {}
        }
        row.breadcrumbs = breadcrumbArrays[0] || [];
        const expected = inventory.find(r => r.canonicalPath === test.path)?.breadcrumbs;
        if (expected && JSON.stringify(row.breadcrumbs) !== JSON.stringify(expected)) row.errors.push('Rendered breadcrumbs differ from audited hierarchy');
        if (test.path === '/ati-teas-reading-practice-test') {
          row.reviewLinks = [...visible.matchAll(/href="(\/ati-teas-reading-practice-test-set-\d+#questions-start)"/g)].map(m => m[1]);
          if (new Set(row.reviewLinks).size !== 14) row.errors.push('Missing exact-set review links');
        }
        if (test.path.startsWith('/knowledge-base/') && /href="\/ati-teas"/.test(visible)) row.errors.push('Retired article still linked');
      }
    } catch (error) { row.errors.push(error.message); }
    rows.push(row);
    console.log(`${row.errors.length ? 'FAIL' : 'PASS'} ${test.path}${row.errors.length ? ': ' + row.errors.join('; ') : ''}`);
  }
}
Promise.all([worker(), worker(), worker()]).then(() => {
  // Writing files under the project can trigger Tailwind/Next dev reloads.
  // Save only after all requests complete to avoid recompiling during the audit.
  fs.writeFileSync(path.join(OUT, 'local-http-results.json'), JSON.stringify(rows, null, 2));
  if (sitemapXml) fs.writeFileSync(path.join(OUT, 'local-sitemap.xml'), sitemapXml);
  const failures = rows.filter(r => r.errors.length);
  console.log(`${rows.length - failures.length}/${rows.length} passed`);
  if (failures.length) process.exitCode = 1;
});
