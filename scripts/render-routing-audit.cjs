const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(process.cwd(), 'reports/routing-and-breadcrumbs-2026-09-17');
const read = name => JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const lines = name => fs.readFileSync(path.join(dir,name),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const summary=read('summary.json'), inventory=read('inventory.json'), findings=read('findings.json');
const http=new Map([...lines('http-results.jsonl'),...lines('http-extra-results.jsonl'),...read('http-rechecks.json')].map(r=>[r.path,r]));
const mapped=new Map(inventory.map(r=>[r.canonicalPath,r]));
const redirects=read('redirect-audit.json'), sitemap=read('sitemap-audit.json');
const unresolved=read('source-links.json').filter(r=>!r.known);
const extras=new Map(read('extra-public-routes.json').map(r=>[r.path,r]));
const kbFailures=new Set(findings.filter(f=>f.category==='breadcrumb_wrong_parent').map(f=>f.path));
const canonicalIssues=[];
const routeRows=[];
for(const [pathname,h] of http){
  const r=mapped.get(pathname), flags=[];
  if(h.error||h.status!==200)flags.push('HTTP failure');
  if(h.soft404)flags.push('Not-found content');
  if(r?.type==='quiz'&&!h.questionListInPayload)flags.push('Question list missing');
  if(r&&JSON.stringify(r.breadcrumbs)!==JSON.stringify(h.breadcrumbs))flags.push('Live breadcrumb differs');
  if(kbFailures.has(r?.path))flags.push('Broken breadcrumb parent');
  if(r&&h.canonical&&new URL(h.canonical).pathname!==pathname){flags.push('Wrong SEO canonical');canonicalIssues.push({path:pathname,canonical:h.canonical});}
  const isProbe=extras.get(pathname)?.kind.startsWith('nonexistent');
  const routingIssues=flags.filter(f=>f!=='Wrong SEO canonical');
  routeRows.push({path:pathname,title:r?.title||h.title,type:r?.type||extras.get(pathname)?.kind||'static/public',status:h.status,finalPath:h.finalPath,flags,
    result:isProbe?'Probe':pathname==='/favicon.ico'?'Asset':routingIssues.length?'Needs attention':r?'Checked':'HTTP only',
    sourcePath:r?.refPath||'',liveBreadcrumbs:h.breadcrumbs||[],expectedBreadcrumbs:r?.breadcrumbs||[],canonical:h.canonical||''});
}
routeRows.sort((a,b)=>a.path.localeCompare(b.path));
const missingQuizzes=routeRows.filter(r=>r.flags.includes('Question list missing'));
const mappedPassing=routeRows.filter(r=>mapped.has(r.path)&&r.result==='Checked').length;
const metrics={checkedAt:new Date().toISOString(),pageUrls:routeRows.filter(r=>r.result!=='Asset').length,routeMappings:inventory.length,mappedRoutingAndBreadcrumbChecksPassed:mappedPassing,atiTeasSetsMissingQuestions:missingQuizzes.length,knowledgeBaseBreadcrumbFailures:kbFailures.size,unmappedPublishedQuizQuestions:read('unmapped-quiz-audit.json').actualQuestionCount,brokenNavigationDestinations:new Set(unresolved.map(r=>r.url)).size,redirectsChecked:redirects.length,redirectsLosingQuery:redirects.filter(r=>!r.queryPreserved).length,wrongCanonicalPages:canonicalIssues.length,sitemapUrls:sitemap.urls.length};
fs.writeFileSync(path.join(dir,'final-summary.json'),JSON.stringify(metrics,null,2));
fs.writeFileSync(path.join(dir,'route-results.json'),JSON.stringify(routeRows,null,2));
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
fs.writeFileSync(path.join(dir,'route-results.csv'),['Path,Result,Type,HTTP,Title,Findings,Live breadcrumbs,Expected breadcrumbs,Source document',...routeRows.map(r=>[r.path,r.result,r.type,r.status,r.title,r.flags.join('; '),r.liveBreadcrumbs.map(b=>b.name+(b.url?' ['+b.url+']':'')).join(' > '),r.expectedBreadcrumbs.map(b=>b.name+(b.url?' ['+b.url+']':'')).join(' > '),r.sourcePath].map(csv).join(','))].join('\n'));
const issues=[
  ['P1','56 ATI TEAS set pages render a generic fallback','All four subjects are affected. The live URLs return 200 but omit the selected question list and the ATI TEAS/subject breadcrumb parents.','Deploy the previously tested local alias lookup, review-link and preview-loading fixes, then repeat the live checks.'],
  ['P1','Published quiz has no public route','Mental Health ATI RN Proctored Exam Practice Questions contains 34 stored questions. Its URL returns not-found content.','Restore its mapping to the existing quiz document after confirming its intended public name. Keep its questions and IDs.'],
  ['P1','Five knowledge-base breadcrumb parents are broken','Article IDs are used as parent page IDs. All five resulting parent URLs lead to not-found content. Four articles also reference absent parent records.','Build article breadcrumbs from the actual parent relationship. Reassign the four orphaned articles to valid parents; do not guess the destination.'],
  ['P1','Four navigation destinations do not exist','/hesi-a2, /nursing, /how-it-works and /faqs return not-found content. Found in the header and other source components.','Use the existing HESI hub; decide the intended Nursing destination. Create or remove the How It Works and FAQ links.'],
  ['P2','62 of 64 legacy redirects discard query parameters','The destination path is correct, but mode=review and the test source parameter are lost.','The local middleware fix preserves query parameters; verify it after deployment.'],
  ['P2','Two generated legacy exit-exam URLs do not load','/nursing-exit-exam/rn-exit-exams-exit-exam and its LPN equivalent are generated by generateStaticParams but return not-found content. Their unsuffixed counterparts load.','Redirect these aliases to the existing canonical RN/LPN exit category routes, or stop generating unsupported variants.'],
  ['P2',metrics.wrongCanonicalPages+' mapped pages declare the homepage as their SEO canonical','These pages can route correctly while telling search engines that the homepage is their preferred URL. Includes HESI quizzes and knowledge-base articles.','Correct canonical metadata to each page’s real URL. This is separate from click navigation.'],
  ['Review','Sitemap includes only 56 ATI TEAS sets','The live sitemap omits the other mapped pages, including HESI, Nursing Test Bank, Nursing Exit Exam and knowledge-base pages.','Confirm whether this restriction is intentional; include other published canonical pages if they should be discoverable.'],
  ['P2','Invalid blog and knowledge-base URLs return success responses','The blog handler returns null when no article matches. The knowledge-base handler renders “Sub-page not found” without notFound(). Live negative probes returned 200.','Use explicit not-found handling. Some streamed Next.js 404 responses also use HTTP 200, so verify the rendered result and noindex behavior instead of status alone.'],
];
const md=`# NursingMocks route and breadcrumb audit

Date: 17 September 2026. Live site: https://www.nursingmocks.com

## Verdict

**Not every route is correct.** ${metrics.pageUrls.toLocaleString()} public page URLs were requested, covering all ${inventory.length.toLocaleString()} saved route mappings plus static pages, additional route families and negative probes. ${mappedPassing.toLocaleString()} mapped pages pass the route-identity and breadcrumb checks. This excludes separate SEO canonical warnings.

No production content, permissions, routes or database records were changed by this audit. The earlier ATI TEAS repair remains local and undeployed.

## Coverage and method

- Read all ${inventory.length} route mappings and ${summary.contentRecords} public content metadata records; confirmed mapped targets exist and IDs match their hierarchy.
- No duplicate saved slugs, mismatched mapping types, conflicting resolved destinations or static-route collisions found.
- Executed the current source breadcrumb builder against the metadata snapshot for all mapped pages and compared parent destinations with actual ancestors.
- Parsed breadcrumb data delivered by production and compared it with the source/data result. Desktop and mobile generated pages share these initial breadcrumb items.
- Requested all mapped canonical URLs, static public routes, the published blog, seven knowledge-base category routes, four legacy exit-exam routes, missing-link destinations and three negative probes.
- Checked ${redirects.length} legacy redirects separately: all retained the correct destination path, ${metrics.redirectsLosingQuery} lost the query string.
- Checked 33 generated sidebar URLs: all resolve to existing content. Audited 560 literal source link references; 11 references point to four nonexistent destinations. Some references are in legacy components; counts are source references, not click counts.
- Inventoried ${summary.filePages} page route files and ${summary.apiRoutes} API route files. Private admin/dashboard flows, arbitrary dynamic IDs, post-login transitions and API operations were **not** exercised. No user accounts were impersonated and no write APIs were called.
- The checks validate routing and hierarchy, not the correctness of every question/answer. Many pages render their visible UI after hydration; their returned server component data was inspected. No connected browser was available for an interactive desktop/mobile walkthrough.

## Findings and priorities

| Priority | Finding | Evidence | Next action |
| --- | --- | --- | --- |
${issues.map(r=>'| '+r.map(v=>v.replaceAll('|','/')).join(' | ')+' |').join('\n')}

## Breadcrumb result

- ${inventory.length-kbFailures.size} mapped hierarchy chains pass the local source/data check.
- Production omits two parent levels on all 56 ATI TEAS set pages because the wrong fallback is rendered.
- Five knowledge-base chains contain invalid parent links. Four underlying article parent IDs are missing from the current hierarchy.
- Correct ATI TEAS Reading example: Home → Nursing Entrance Exam → ATI TEAS Practice Test → ATI TEAS Reading Practice Test → TEAS Reading Practice Test Set 16.
- Blog source explicitly builds Home → Blog → article title. Knowledge-base category and other client-generated breadcrumbs need an interactive post-hydration check; HTTP 200 alone is not a pass for these trails.

### Knowledge-base pages with invalid breadcrumb parents

${inventory.filter(r=>kbFailures.has(r.path)).map(r=>'- ['+r.path+'](https://www.nursingmocks.com'+r.path+'): '+r.breadcrumbs.slice(2,-1).map(b=>'`'+b.url+'`').join(', ')).join('\n')}

### SEO canonical mismatches (separate from routing)

${canonicalIssues.map(r=>'- `'+r.path+'` → `'+r.canonical+'`').join('\n')}

## Suggested repair order

1. Publish the existing ATI TEAS repair and recheck all 56 sets and legacy query strings.
2. Restore the published 34-question quiz route and fix the four dead navigation destinations.
3. Repair knowledge-base parent relationships and breadcrumb construction, preserving real content IDs.
4. Correct the exit aliases, invalid-URL handling and SEO canonical metadata; confirm the intended sitemap scope.
5. Run this audit again, then complete signed-in desktop/mobile navigation checks.

## Artifacts

- [Interactive HTML report](index.html): searchable results with live and expected breadcrumbs.
- [Every checked URL as CSV](route-results.csv).
- [Route and breadcrumb data](route-results.json).
- [Final counts](final-summary.json).
- [Database mapping findings](findings.json), [source links](source-links.json), [redirect evidence](redirect-audit.json).
- [Live response evidence](http-results.jsonl), [additional probes](http-extra-results.jsonl), [breadcrumb extraction recheck](http-rechecks.json).

Audit code: \`scripts/audit-routing-and-breadcrumbs.cjs\`; report renderer: \`scripts/render-routing-audit.cjs\`. The snapshot stores only routing/content metadata, not student data or question bodies. This is a point-in-time audit; new content can change the result.
`;
fs.writeFileSync(path.join(dir,'REPORT.md'),md);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=JSON.stringify(routeRows).replaceAll('<','\\u003c');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NursingMocks — Route & breadcrumb audit</title><style>
:root{font-family:system-ui,sans-serif;color:#17233a;background:#f3f5fa;line-height:1.6}*{box-sizing:border-box}body{margin:0}main{max-width:1440px;margin:auto;padding:32px 24px 64px}header{padding:24px 0}h1{font-size:clamp(28px,4vw,44px);line-height:1.15;margin:10px 0}h2{margin:0 0 12px;font-size:23px}h3{margin:0 0 6px;font-size:17px}p{margin:8px 0}a{color:#4b35b4;overflow-wrap:anywhere}small,.muted{color:#617087}.eyebrow{color:#6b4bb7;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.banner{padding:20px;border:1px solid #f4c989;background:#fff8e9;border-radius:14px}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0}.metric,section{background:white;border:1px solid #e0e5ef;border-radius:14px;padding:20px}.metric strong{display:block;font-size:30px}.metric span{font-size:13px;color:#617087}section{margin:20px 0}.issues{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px}.issue{border-top:3px solid #e9af68;padding:14px;background:#fafbfe;border-radius:8px}.pill{display:inline-block;padding:2px 9px;border-radius:99px;background:#eee8fc;color:#5432a0;font-size:12px;font-weight:700;margin-bottom:6px}.good{background:#e8f5ee;color:#166139}.bad{background:#fff0eb;color:#9a3625}.filters{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:16px 0}input,select,button{font:inherit;border:1px solid #cbd4e2;border-radius:8px;padding:10px 12px;background:white}input{flex:1;min-width:min(260px,100%)}button{cursor:pointer;color:#5432a0}button:disabled{opacity:.5;cursor:default}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px}th,td{padding:14px 10px;vertical-align:top;border-bottom:1px solid #e2e7ef;text-align:left;overflow-wrap:anywhere}th{background:#f6f8fc}th:first-child{width:31%}th:nth-child(2){width:16%}.trail{margin:8px 0;padding-left:12px;border-left:2px solid #d6c9f5}.trail span{display:block}.pager{display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:16px}.files{display:flex;flex-wrap:wrap;gap:18px}details summary{cursor:pointer;font-weight:650}.coverage li{margin:6px 0}code{overflow-wrap:anywhere;font-size:.9em}@media(max-width:760px){main{padding:16px}section{padding:14px}thead{display:none}table,tbody,tr,td{display:block;width:100%}tr{margin-bottom:20px;border:1px solid #ddd;border-radius:10px}td::before{content:attr(data-label);display:block;font-weight:700;color:#617087;margin-bottom:8px}.pager{justify-content:center}}@media print{.filters,.pager{display:none}main{max-width:none;padding:0}.issue{break-inside:avoid}a{color:inherit}}
</style></head><body><main><header><div class="eyebrow">NursingMocks · 17 September 2026</div><h1>Routes & breadcrumbs</h1><p class="muted">A read-only audit of the live website, saved content destinations and local route code.</p></header>
<div class="banner"><strong>Action required: not every route reaches the correct page.</strong><p>All 56 ATI TEAS set pages are still affected on production. The earlier fix exists locally and has not been deployed. Additional issues are listed below.</p></div>
<div class="metrics"><div class="metric"><strong>${metrics.pageUrls.toLocaleString()}</strong><span>Public page URLs requested</span></div><div class="metric"><strong>${inventory.length.toLocaleString()}</strong><span>Saved mappings audited</span></div><div class="metric"><strong>${mappedPassing.toLocaleString()}</strong><span>Mapped route + breadcrumb checks passed</span></div><div class="metric"><strong>56 + 5</strong><span>ATI TEAS failures + KB breadcrumb failures</span></div></div>
<section><h2>What to address</h2><div class="issues">${issues.map(r=>`<article class="issue"><span class="pill">${esc(r[0])}</span><h3>${esc(r[1])}</h3><p>${esc(r[2])}</p><p><strong>Next:</strong> ${esc(r[3])}</p></article>`).join('')}</div></section>
<section class="coverage"><h2>What the checks establish</h2><ul><li>All 1,889 saved mappings point to existing records, with correct hierarchy IDs and no duplicate slugs.</li><li>All mapped canonical URLs were requested; page identity and serialized breadcrumb data were compared with the saved hierarchy. A 200 response alone was not counted as proof.</li><li>33 generated sidebar links resolve. 64 legacy redirects have correct destinations; 62 drop query parameters.</li><li>1,884 breadcrumb chains pass in the local code/data audit. Production loses two parent levels on 56 ATI TEAS set pages. Five knowledge-base parent links are invalid.</li><li>Desktop/mobile generated pages share the validated breadcrumb data. Visual interaction, sign-in flows, private admin/dashboard operations, arbitrary dynamic IDs, and API operations remain unverified. The inventory includes 104 page files and 50 API files.</li><li>Question/answer correctness was outside scope. No student data or question bodies are embedded in this report. No production changes were made.</li></ul><p><strong>Expected Reading trail:</strong> Home → Nursing Entrance Exam → ATI TEAS Practice Test → ATI TEAS Reading Practice Test → Set 16.</p><p class="muted">“Checked” means route identity and breadcrumb checks passed. SEO warnings may still appear. “HTTP only” means the response was obtained but its client-generated page identity/breadcrumbs were not fully validated. “Probe” is an intentionally invalid URL.</p></section>
<section><h2>Explore every checked URL</h2><div class="filters"><input id="search" type="search" aria-label="Search routes" placeholder="Search a route, title, or finding…"><select id="filter" aria-label="Filter results"><option value="all">All pages</option><option value="attention">Needs routing attention</option><option value="seo">SEO canonical warnings</option><option value="checked">Passed route checks</option><option value="http">HTTP only / probes</option></select></div><p id="count" class="muted" aria-live="polite"></p><table><thead><tr><th>Page</th><th>Result</th><th>Breadcrumb evidence</th></tr></thead><tbody id="rows"></tbody></table><div class="pager"><button id="prev">Previous</button><span id="page"></span><button id="next">Next</button></div></section>
<section><h2>Evidence & files</h2><div class="files"><a href="REPORT.md">Written report</a><a href="route-results.csv">All results (CSV)</a><a href="route-results.json">Results (JSON)</a><a href="findings.json">Mapping findings</a><a href="redirect-audit.json">Redirect checks</a><a href="file-routes.json">Page/API file inventory</a></div><p class="muted">Point-in-time audit. Source snapshot: ${esc(summary.at)}. Completed: ${esc(metrics.checkedAt)}. Counts overlap; the same page can have more than one finding.</p></section>
<script>const data=${data};let page=0;const size=30;const $=id=>document.getElementById(id);function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}function trail(items){return items.length?'<div class="trail">'+items.map(b=>'<span>'+esc(b.name)+(b.url?' <small>'+esc(b.url)+'</small>':'')+'</span>').join('')+'</div>':'<p class="muted">No server-provided trail captured.</p>';}function render(){const query=$('search').value.toLowerCase(),filter=$('filter').value;const rows=data.filter(r=>r.result!=='Asset'&&(!query||JSON.stringify(r).toLowerCase().includes(query))&&(filter==='all'||filter==='attention'&&r.result==='Needs attention'||filter==='seo'&&r.flags.includes('Wrong SEO canonical')||filter==='checked'&&r.result==='Checked'||filter==='http'&&['HTTP only','Probe'].includes(r.result)));const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages-1);$('count').textContent=rows.length.toLocaleString()+' matching URLs';$('rows').innerHTML=rows.slice(page*size,(page+1)*size).map(r=>'<tr><td data-label="Page"><a target="_blank" rel="noopener noreferrer" href="https://www.nursingmocks.com'+esc(r.path)+'">'+esc(r.path)+'</a><p>'+esc(r.title)+'</p><small>'+esc(r.type)+'</small></td><td data-label="Result"><span class="pill '+(r.result==='Checked'?'good':r.result==='Needs attention'?'bad':'')+'">'+esc(r.result)+'</span><p>HTTP '+esc(r.status)+'</p>'+r.flags.map(f=>'<p>'+esc(f)+'</p>').join('')+'</td><td data-label="Breadcrumbs"><strong>Live</strong>'+trail(r.liveBreadcrumbs)+(r.expectedBreadcrumbs.length?'<details><summary>Expected from saved hierarchy</summary>'+trail(r.expectedBreadcrumbs)+'<small>'+esc(r.sourcePath)+'</small></details>':'')+'</td></tr>').join('');$('page').textContent=(page+1)+' / '+pages;$('prev').disabled=page===0;$('next').disabled=page>=pages-1;}$('search').addEventListener('input',()=>{page=0;render()});$('filter').addEventListener('change',()=>{page=0;render()});$('prev').onclick=()=>{page--;render()};$('next').onclick=()=>{page++;render()};render();</script></main></body></html>`;
fs.writeFileSync(path.join(dir,'index.html'),html);
console.log(JSON.stringify(metrics,null,2));
console.log('Report written to '+path.join(dir,'index.html'));
