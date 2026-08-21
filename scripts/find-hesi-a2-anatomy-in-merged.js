const fs = require("fs");
const path = require("path");
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";
const targets = [
  "Which anatomical structure houses the malleus, incus, and stapes",
  "Which muscle of the quadriceps femoris group lies on the side surface",
  "A tissue examined under the microscope exhibits the following characteristics",
  "What is the primary hormone secreted by the thyroid",
  "What is the largest organ in the human body",
];
function loadLocalEnv(){ for(const filename of [".env.local",".env"]){ const filePath=path.join(process.cwd(),filename); if(!fs.existsSync(filePath)) continue; for(const line of fs.readFileSync(filePath,"utf8").split(/\r?\n/)){ const trimmed=line.trim(); if(!trimmed||trimmed.startsWith("#")) continue; const separator=trimmed.indexOf("="); if(separator<0) continue; const key=trimmed.slice(0,separator).trim(); const value=trimmed.slice(separator+1).trim().replace(/^["']|["']$/g,""); if(key&&process.env[key]===undefined) process.env[key]=value; } } }
function mimeTypeForFile(filePath){ return path.extname(filePath).toLowerCase()===".png"?"image/png":"image/jpeg"; }
function pageNumber(filePath){ const m=path.basename(filePath).match(/page-(\d+)/i); return m?Number(m[1]):0; }
function stripJsonFence(text){ const trimmed=String(text||"").trim(); const fenced=trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i); return fenced?fenced[1].trim():trimmed; }
async function scanBatch(model, apiKey, files){
  const prompt = `Search these HESI A2 merged-document page images for Anatomy and Physiology content, especially these target question phrases:\n${targets.map((t,i)=>`${i+1}. ${t}`).join("\n")}\n\nFor each image, report whether it contains any target phrase or looks like an Anatomy and Physiology page. Also identify any visible exam set number/section label. Return only JSON: {"pages":[{"page":1,"containsTarget":false,"matchedTargetNumbers":[],"looksLikeAnatomy":false,"examSet":"Set 1|Set 2|Set 3|Set 4|unknown","visibleSubject":"","firstVisibleQuestion":"","notes":""}]}. Do not extract full questions.`;
  const content = [{ type:"text", text: prompt }, ...files.map(filePath=>({ type:"image_url", image_url:{ url:`data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`, detail:"low" }}))];
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL,{ method:"POST", headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json" }, body:JSON.stringify({ model, messages:[{role:"user", content}], response_format:{type:"json_object"}, temperature:0 }) });
  const body = await response.json();
  if(!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
  const text = (body.choices||[]).map(c=>c.message?.content||"").join("").trim();
  const parsed = JSON.parse(stripJsonFence(text));
  return (Array.isArray(parsed.pages)?parsed.pages:[]).map((p,i)=>({...p, actualPage:pageNumber(files[i]), fileName:path.basename(files[i])}));
}
async function main(){
  loadLocalEnv();
  const apiKey=process.env.OPENAI_API_KEY||""; if(!apiKey) throw new Error("OPENAI_API_KEY missing");
  const model=process.env.OPENAI_HESI_A2_IMAGE_MODEL||process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL||"gpt-4o";
  const imageDir=path.join(HESI_ROOT,"images",SOURCE);
  const all=fs.readdirSync(imageDir).filter(n=>/\.(png|jpe?g|webp)$/i.test(n)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(n=>path.join(imageDir,n));
  const rows=[];
  for(let i=0;i<all.length;i+=10){
    const batch=all.slice(i,i+10);
    console.log(`Searching pages ${pageNumber(batch[0])}-${pageNumber(batch[batch.length-1])}`);
    rows.push(...await scanBatch(model,apiKey,batch));
  }
  const matches=rows.filter(r=>r.containsTarget||r.looksLikeAnatomy||/anatomy|physiology/i.test(`${r.visibleSubject} ${r.notes}`));
  const outDir=path.join(HESI_ROOT,"review-reports"); fs.mkdirSync(outDir,{recursive:true});
  const outPath=path.join(outDir,"hesi-a2-merged-anatomy-target-search.json");
  fs.writeFileSync(outPath,JSON.stringify({source:SOURCE,pageCount:all.length,targetPhrases:targets,matches,rows},null,2),"utf8");
  console.log(JSON.stringify({outPath,totalPages:all.length,matches:matches.length,matchesPreview:matches.slice(0,20)},null,2));
}
main().catch(error=>{ console.error(error instanceof Error ? error.stack||error.message : error); process.exit(1); });
