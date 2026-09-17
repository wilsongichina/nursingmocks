// Read-only audit: reads public content metadata and public pages; never writes to Firebase.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const ROOT = process.cwd();
const OUT = path.resolve(ROOT, process.env.ROUTING_AUDIT_OUT || 'reports/routing-and-breadcrumbs-2026-09-17');
fs.mkdirSync(OUT, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
const read = name => JSON.parse(fs.readFileSync(path.join(OUT, name), 'utf8'));
function loadTs(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(name => dependencies[name] ?? require(name), module, module.exports);
  return module.exports;
}
const canonical = loadTs('src/lib/public-route-canonicalization.ts');
function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walkFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const appFiles = walkFiles(path.join(ROOT, 'src/app'));
const fileRoutes = appFiles.filter(f => /[\\/](page\.tsx|route\.ts)$/.test(f)).map(f => ({
  file: path.relative(ROOT, f).replaceAll('\\', '/'),
  path: '/' + path.relative(path.join(ROOT, 'src/app'), path.dirname(f)).replaceAll('\\', '/'),
  kind: f.endsWith('page.tsx') ? 'page' : 'api',
}));
const staticPages = new Set(fileRoutes.filter(r => r.kind === 'page' && !r.path.includes('[')).map(r => r.path));
async function snapshot() {
  require('@next/env').loadEnvConfig(ROOT);
  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  const credential = json ? cert(JSON.parse(json.replace(/\\n/g, '\n'))) : cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
  const db = getFirestore(initializeApp({ credential }));
  const routes = (await db.collection('routeMappings').get()).docs.map(d => ({ id: d.id, ...d.data() }));
  const fields = ['slug','seoSlug','publicSlug','pageName','seoLabel','title','heading','quizName','hero.title','pillarId','type','routeType','parentId','parentSubPageId','status','meta.canonicalUrl'];
  const documents = new Map();
  for (const group of ['subPages', 'nestedSubPages', 'topics', 'quizzes']) {
    const result = await db.collectionGroup(group).select(...fields).get();
    for (const d of result.docs) if (d.ref.path.startsWith('pillarPages/')) documents.set(d.ref.path, { path: d.ref.path, id: d.id, data: d.data() });
    console.log(`Read ${group}: ${result.size} metadata records`);
  }
  const extraPaths = [...new Set(routes.map(r => r.refPath).filter(p => p && !documents.has(p)))];
  for (let i = 0; i < extraPaths.length; i += 200) {
    const docs = await db.getAll(...extraPaths.slice(i, i + 200).map(p => db.doc(p)), { fieldMask: fields });
    for (const d of docs) if (d.exists) documents.set(d.ref.path, { path: d.ref.path, id: d.id, data: d.data() });
  }
  save('snapshot.json', { at: new Date().toISOString(), routes, documents: [...documents.values()] });
}

async function analyze() {
  const source = read('snapshot.json');
  const routes = source.routes;
  const docs = new Map(source.documents.map(d => [d.path, d]));
  const groups = new Map();
  for (const r of routes) { const slug = String(r.slug || '').toLowerCase(); if (!groups.has(slug)) groups.set(slug, []); groups.get(slug).push(r); }
  function resolve(url) {
    const pathname = canonical.canonicalizePublicPath(url.split(/[?#]/)[0]);
    if (staticPages.has(pathname)) return { static: true, path: pathname };
    for (const candidate of canonical.getPublicRouteLookupSlugs(pathname)) {
      const matches = groups.get(candidate);
      if (matches?.length) return { path: pathname, routes: matches, route: matches[0], exists: docs.has(matches[0].refPath) };
    }
    return { path: pathname, missing: true };
  }
  function dbQuery(records, filters = [], count = Infinity) {
    return {
      where: (key, op, value) => { if (op !== '==') throw Error('Unexpected query operator'); return dbQuery(records, [...filters, [key,value]], count); },
      limit: n => dbQuery(records, filters, n),
      get: async () => { const selected = records.filter(r => filters.every(([k,v]) => r[k] === v)).slice(0,count); return { empty: !selected.length, docs: selected.map(r => ({ id:r.id, data:()=>r })) }; },
    };
  }
  const buildOps = loadTs('src/lib/firestore-build-operations.ts', {
    react: { cache: fn => fn },
    '@/lib/public-route-canonicalization': canonical,
    '@/lib/server/firebase-admin': { getAdminDb: () => ({
      collection: p => { if (p !== 'routeMappings') throw Error('Unexpected audit collection'); return dbQuery(routes); },
      doc: p => ({ get: async () => ({ exists: docs.has(p), id: docs.get(p)?.id, data: () => docs.get(p)?.data }) }),
    }) },
  });
  // Execute the current breadcrumb functions extracted by TypeScript AST, against
  // the read-only snapshot, rather than reimplementing their selection logic.
  const pageSource = fs.readFileSync(path.join(ROOT,'src/app/[slug]/page.tsx'),'utf8');
  const ast = ts.createSourceFile('page.tsx', pageSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ['stripHtml','titleCaseWords','getPublicPillarBreadcrumbLabel','getPublicContentLabel','getRouteSlugByContentId','buildGeneratedPageBreadcrumbItems'];
  const statements = ast.statements.filter(s => ts.isVariableStatement(s) && s.declarationList.declarations.some(d => names.includes(d.name.getText(ast))));
  if (statements.length !== names.length) throw Error('Breadcrumb implementation changed; update audit extraction.');
  const code = ts.transpileModule(statements.map(s => s.getText(ast)).join('\n')+'\nexport {buildGeneratedPageBreadcrumbItems};', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('getRouteMappingById','getPageByContentPath','canonicalizePublicPath','exports',code)(buildOps.getRouteMappingById,buildOps.getPageByContentPath,canonical.canonicalizePublicPath,module.exports);
  const inventory = [], findings = [];
  const add = (category, route, detail) => findings.push({ category, path: route, detail });
  for (const r of routes) {
    const target = docs.get(r.refPath), pathname = '/' + (r.slug || '');
    const parts = String(r.refPath || '').split('/');
    const expectedType = parts.includes('quizzes') ? 'quiz' : parts.includes('topics') ? 'topic' : parts.includes('nestedSubPages') ? 'nested' : parts.includes('subPages') ? 'sub' : 'other';
    if (!target) add('missing_target',pathname,r.refPath || '(no refPath)');
    if (!r.slug) add('missing_slug',pathname,r.id);
    if (expectedType !== 'other' && r.type !== expectedType) add('wrong_type',pathname,`${r.type} instead of ${expectedType}`);
    for (const [collection,key] of [['pillarPages','pillarId'],['subPages','subPageId'],['nestedSubPages','nestedPageId'],['topics','topicId'],['quizzes','quizId']]) {
      const i=parts.indexOf(collection); if(i>=0 && r[key]!==parts[i+1]) add('wrong_hierarchy_id',pathname,`${key}: ${r[key]} does not match ${parts[i+1]}`);
    }
    const destination=resolve(pathname);
    if(destination.static) add('static_route_shadow',pathname,`App Router static page overrides ${r.refPath}`);
    else if(destination.route?.refPath!==r.refPath) add('wrong_resolved_target',pathname,`Resolves to ${destination.route?.refPath || 'no mapping'}, expected ${r.refPath}`);
    const storedSlug=target?.data.slug||target?.data.seoSlug||target?.data.publicSlug;
    if(storedSlug && canonical.canonicalizePublicPath('/'+storedSlug)!==canonical.canonicalizePublicPath(pathname)) add('different_content_slug',pathname,storedSlug);
    let breadcrumbs=[];
    if(target) {
      breadcrumbs=await module.exports.buildGeneratedPageBreadcrumbItems({slug:r.slug,mapping:r,pageData:target.data});
      const ancestorPaths=[];
      for(let i=2;i<parts.length-2;i+=2) ancestorPaths.push(parts.slice(0,i+2).join('/'));
      if(r.refPath.startsWith('knowledgeBase/')) {
        const parent=source.documents.find(d=>d.id===(target.data.parentId||target.data.parentSubPageId)&&d.path.startsWith('pillarPages/'));
        if(parent)ancestorPaths.push(parent.path);
        else add('kb_missing_parent',pathname,`Article parent ${target.data.parentId||target.data.parentSubPageId||'(none)'} does not exist in the content hierarchy`);
      }
      const linked=breadcrumbs.slice(2,-1);
      if(linked.length!==ancestorPaths.length) add('breadcrumb_depth',pathname,`${linked.length} parent links; expected ${ancestorPaths.length}`);
      linked.forEach((crumb,i)=>{
        const resolved=resolve(crumb.url||'');
        if(resolved.missing||!resolved.exists||resolved.route?.refPath!==ancestorPaths[i]) add('breadcrumb_wrong_parent',pathname,`${crumb.name} (${crumb.url}) resolves to ${resolved.route?.refPath||'no content'}, expected ${ancestorPaths[i]}`);
        if(crumb.url!==canonical.canonicalizePublicPath(crumb.url||'')) add('breadcrumb_redirect',pathname,`${crumb.url} redirects to ${canonical.canonicalizePublicPath(crumb.url)}`);
        if(!crumb.name || /^[a-zA-Z0-9]{20}$/.test(crumb.name)) add('breadcrumb_raw_id_label',pathname,`${crumb.name} at ${crumb.url}`);
      });
    }
    inventory.push({path:pathname,canonicalPath:canonical.canonicalizePublicPath(pathname),type:r.type,pillar:r.pillarId,refPath:r.refPath,targetExists:!!target,title:target?.data.pageName||target?.data.title||target?.data.quizName||'',breadcrumbs});
  }
  for(const [slug,group] of groups)if(group.length>1)add('duplicate_slug','/'+slug,group.map(r=>`${r.id} -> ${r.refPath}`).join('; '));
  const referenced=new Set(routes.map(r=>r.refPath));
  const unmapped=source.documents.filter(d=>!referenced.has(d.path)&&(d.data.slug||d.data.seoSlug||d.data.publicSlug));
  for(const d of unmapped)add('unmapped_content','/'+(d.data.slug||d.data.seoSlug||d.data.publicSlug),d.path);
  const links=[];
  for(const file of walkFiles(path.join(ROOT,'src')).filter(f=>/\.tsx?$/.test(f)&&!f.includes('__tests__'))) {
    const text=fs.readFileSync(file,'utf8');
    for(const m of text.matchAll(/(?:href|url)\s*(?:=|:)\s*["'](\/[^"'\s]*)["']/g)){
      const url=m[1];if(url.startsWith('//')||url.startsWith('/api/')||/\.(ico|png|jpg|svg|pdf|css|js)$/.test(url))continue;
      const clean=url.split(/[?#]/)[0]; const result=resolve(clean);
      const knownPattern=fileRoutes.some(r=>r.path.includes('[')&&r.path!=='/[slug]'&&new RegExp('^'+r.path.replace(/\[[^\]]+\]/g,'[^/]+')+'$').test(clean));
      links.push({url,file:path.relative(ROOT,file).replaceAll('\\','/'),known:!result.missing||knownPattern});
    }
  }
  const sidebar=loadTs('src/lib/data/sidebar-data.ts').sidebarData;
  const sidebarLinks=[];
  function inspect(value,location){if(!value||typeof value!=='object')return;
    if(!Array.isArray(value)&&value.slug){const url='/'+value.slug;const r=resolve(url);sidebarLinks.push({path:url,location,known:!r.missing,targetExists:r.static||r.exists||false});}
    Object.entries(value).forEach(([k,v])=>{if(typeof v==='object')inspect(v,location+'.'+k);});}
  inspect(sidebar,'sidebarData');
  const counts={};findings.forEach(f=>counts[f.category]=(counts[f.category]||0)+1);
  const summary={at:source.at,routeMappings:routes.length,contentRecords:source.documents.length,filePages:fileRoutes.filter(r=>r.kind==='page').length,apiRoutes:fileRoutes.filter(r=>r.kind==='api').length,counts,sourceLinks:links.length,unknownSourceLinks:links.filter(l=>!l.known).length,sidebarLinks:sidebarLinks.length,invalidSidebarLinks:sidebarLinks.filter(l=>!l.known||!l.targetExists).length};
  save('inventory.json',inventory);save('findings.json',findings);save('source-links.json',links);save('sidebar-links.json',sidebarLinks);save('file-routes.json',fileRoutes);save('summary.json',summary);
  console.log(JSON.stringify(summary,null,2));
}

async function httpAudit(extrasOnly = false) {
  const inventory=read('inventory.json');
  const paths=extrasOnly ? [...new Set(read('extra-public-routes.json').map(r=>r.path))] : [...new Set([...inventory.map(r=>r.canonicalPath),...fileRoutes.filter(r=>r.kind==='page'&&!r.path.includes('[')&&!/^\/(admin|dashboard|profile|payments|onboarding|referrals|progress-reports|thank-you|teas\/thank-you|reset-password)/.test(r.path)).map(r=>r.path),...read('source-links.json').filter(l=>!l.known).map(l=>l.url.split(/[?#]/)[0])])];
  const output=path.join(OUT,extrasOnly ? 'http-extra-results.jsonl' : 'http-results.jsonl');
  const done=new Set(fs.existsSync(output)?fs.readFileSync(output,'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l).path):[]);
  const queue=paths.filter(p=>!done.has(p));let index=0,completed=done.size;
  console.log(`HTTP audit: ${paths.length} public URLs, ${queue.length} remaining, 4 concurrent requests`);
  async function worker(){while(index<queue.length){const urlPath=queue[index++];const start=Date.now();let row={path:urlPath};
    try{
      const res=await fetch('https://www.nursingmocks.com'+urlPath,{signal:AbortSignal.timeout(30000)});const html=await res.text();
      const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
      const breadcrumbs=[];
      for(const m of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)){
        try{const payload=JSON.parse(m[1])[1];if(typeof payload!=='string')continue;
          // Flight text chunks can end immediately before the next row without a
          // newline. Extract the simple breadcrumb array before parsing whole rows.
          for(const b of payload.matchAll(/"initialBreadcrumbItems":(\[[\s\S]*?\])[,}]/g)){
            try{breadcrumbs.push(JSON.parse(b[1]));}catch{}
          }
          for(const line of payload.split('\n')){const colon=line.indexOf(':');if(colon<0)continue;let value;try{value=JSON.parse(line.slice(colon+1));}catch{continue;}
            const visit=v=>{if(!v||typeof v!=='object')return;if(Array.isArray(v.initialBreadcrumbItems))breadcrumbs.push(v.initialBreadcrumbItems);Object.values(v).forEach(visit);};visit(value);
          }
        }catch{}
      }
      row={...row,status:res.status,finalPath:new URL(res.url).pathname,title:html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'',heading:visible.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g,'')||'',questionList:visible.includes('id="questions-start"'),questionListInPayload:html.includes('questions-start'),breadcrumbs:breadcrumbs[0]||[],soft404:html.includes('NEXT_HTTP_ERROR_FALLBACK;404')||/404: This page could not be found/.test(html),canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]||''};
    }catch(e){row.error=e.name+': '+e.message;}
    row.ms=Date.now()-start;fs.appendFileSync(output,JSON.stringify(row)+'\n');completed++;
    if(completed%25===0)console.log(`Checked ${completed}/${paths.length}`);
  }}
  await Promise.all(Array.from({length:4},worker));
  console.log('HTTP audit complete');
}
(async()=>{const mode=process.argv[2]||'snapshot';if(mode==='snapshot'){await snapshot();await analyze();}else if(mode==='analyze')await analyze();else if(mode==='http')await httpAudit();else if(mode==='http-extras')await httpAudit(true);else throw Error('Unknown mode');})().catch(e=>{console.error(e.message);process.exitCode=1;});
