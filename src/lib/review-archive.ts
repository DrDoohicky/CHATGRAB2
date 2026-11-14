import type {ConversationThread} from '../types';
import {digestBridge} from './crew-bridge';
import {openDb,saveAssetBatch} from './assets';
import {analysisPrompt,secondOpinionPrompt,parseAnalysis,parseSecondOpinion,type ReviewContext} from './ai-review';
export const ARCHIVE_CHANGE='chatgrab-reviews-changed',ARCHIVE_LIMIT=3*1024*1024;
export type ReviewRecord={schema:'chatgrab-saved-review/1';id:string;createdAt:string;context:ReviewContext;selectionOrder:string[];prompt:string;response:string;provider:string;model:string;attribution:'user-supplied-unverified';kind:'analysis'|'second-opinion';analysisText?:string;analysisDigest?:string;parentId?:string;confirmed:true;citationCheck:{method:'literal-source-quotes/1';status:'checked'|'unchecked';count:number};digest:string};
export type ReviewEvent={id:string;recordId:string;at:string;action:'archived'|'withdrawn'|'active';digest:string};
export type ReviewArchive={schema:'chatgrab-review-archive/1';revision:number;records:ReviewRecord[];events:ReviewEvent[];links:Record<string,Record<string,string>>};
export const emptyArchive=():ReviewArchive=>({schema:'chatgrab-review-archive/1',revision:0,records:[],events:[],links:{}});
const bytes=(v:unknown)=>new TextEncoder().encode(JSON.stringify(v)).length;
function string(v:unknown,max:number,empty=false){if(typeof v!=='string'||v.length>max||(!empty&&!v.trim()))throw Error('Review text or identifier is missing or too large.');}
function date(v:unknown){string(v,40);if(!Number.isFinite(Date.parse(v as string)))throw Error('Invalid review timestamp.');}
export async function sealRecord(body:Omit<ReviewRecord,'digest'>):Promise<ReviewRecord>{const record={...body,digest:await digestBridge(body)};await validateRecord(record);return record;}
export async function validateRecord(r:ReviewRecord){
 if(!r||r.schema!=='chatgrab-saved-review/1'||r.confirmed!==true||r.attribution!=='user-supplied-unverified'||!['analysis','second-opinion'].includes(r.kind))throw Error('Unsupported or unconfirmed saved review.');
 string(r.id,160);date(r.createdAt);string(r.prompt,160000);string(r.response,250000);string(r.provider,120);string(r.model,120,true);if(r.parentId)string(r.parentId,160);
 const {digest,...body}=r;if(await digestBridge(body)!==digest)throw Error('Saved review integrity check failed.');
 const c=r.context;if(c?.schema!=='chatgrab-review-context/1'||!Array.isArray(c.threads)||!c.threads.length||c.threads.length>40)throw Error('Invalid review source snapshot.');
 const {digest:cd,...cb}=c;if(await digestBridge(cb)!==cd)throw Error('Source snapshot integrity check failed.');
 const keys:string[]=[];let total=0;const threadIds=new Set<string>();
 for(const t of c.threads){string(t.id,160);string(t.title,500);if(threadIds.has(t.id)||!Array.isArray(t.messages))throw Error('Duplicate or invalid source.');threadIds.add(t.id);for(const m of t.messages){string(m.id,160);string(m.role,100);string(m.content,12000,true);total+=m.content.length;const key=t.id+'::'+m.id;if(keys.includes(key))throw Error('Duplicate source message.');keys.push(key);}}
 if(!keys.length||keys.length>40||total>60000||!Array.isArray(r.selectionOrder)||r.selectionOrder.length!==keys.length||new Set(r.selectionOrder).size!==keys.length||r.selectionOrder.some(k=>!keys.includes(k)))throw Error('Invalid selected-source order or size.');
 if(!r.citationCheck||r.citationCheck.method!=='literal-source-quotes/1')throw Error('Missing citation check method.');
 let count=0;const structured=/^(?:\{|```)/.test(r.response.trim());
 if(r.kind==='analysis'){
  if(r.prompt!==analysisPrompt(c))throw Error('Saved request does not match its exact source packet.');
  if(structured){const a=parseAnalysis(r.response,c);count=a.findings.reduce((n,f)=>n+f.evidence.length,0);if(r.citationCheck.status!=='checked')throw Error('Structured response requires citation checking.');}
  else if(r.citationCheck.status!=='unchecked')throw Error('Plain text must remain citation-unchecked.');
 }else{
  string(r.analysisText,250000);string(r.analysisDigest,64);if(await digestBridge(r.analysisText)!==r.analysisDigest)throw Error('Second opinion analysis digest failed.');
  if(r.prompt!==(await secondOpinionPrompt(c,r.analysisText!)).prompt)throw Error('Second opinion request differs from its retained source and analysis.');const a=parseSecondOpinion(r.response,c,r.analysisText!,r.analysisDigest!);count=a.checks.reduce((n,f)=>n+f.evidence.length,0);if(r.citationCheck.status!=='checked')throw Error('Second opinion citations must be checked.');
 }
 if(r.citationCheck.count!==count)throw Error('Citation check count does not match its source.');
}
export async function validateArchive(value:unknown):Promise<ReviewArchive>{
 const a=value as ReviewArchive;if(!a||a.schema!=='chatgrab-review-archive/1'||!Number.isSafeInteger(a.revision)||a.revision<0||!Array.isArray(a.records)||!Array.isArray(a.events)||!a.links||Array.isArray(a.links)||bytes(a)>ARCHIVE_LIMIT||a.records.length>100||a.events.length>1000)throw Error('Review archive is corrupt, unsupported or exceeds its 3 MB / 100 review limit. Existing data was preserved.');
 const ids=new Set<string>();for(const r of a.records){await validateRecord(r);if(ids.has(r.id))throw Error('Duplicate review ID.');ids.add(r.id);const links=a.links[r.id];if(!links||Object.keys(links).length!==r.context.threads.length)throw Error('Missing restored source links.');for(const t of r.context.threads)string(links[t.id],160);}
 for(const r of a.records)if(r.parentId&&(!ids.has(r.parentId)||r.parentId===r.id))throw Error('Review correction parent is missing.');
 const eventIds=new Set<string>();for(const e of a.events){if(!e||!ids.has(e.recordId)||!['archived','withdrawn','active'].includes(e.action)||eventIds.has(e.id))throw Error('Invalid review history event.');string(e.id,160);date(e.at);const {digest,...body}=e;if(await digestBridge(body)!==digest)throw Error('Review history integrity check failed.');eventIds.add(e.id);}
 return a;
}
export async function readArchive(scope='local'):Promise<ReviewArchive>{const db=await openDb();const raw=await new Promise<unknown>((resolve,reject)=>{const tx=db.transaction('reviews'),r=tx.objectStore('reviews').get(scope);tx.oncomplete=()=>{db.close();resolve(r.result)};tx.onerror=()=>{db.close();reject(tx.error)}});return raw===undefined?emptyArchive():validateArchive(raw);}
export async function appendReview(record:ReviewRecord,scope='local'){await validateRecord(record);const a=await readArchive(scope);if(a.records.some(r=>r.id===record.id))throw Error('Review ID already exists; original preserved.');const next={...a,revision:a.revision+1,records:[...a.records,record],links:{...a.links,[record.id]:Object.fromEntries(record.context.threads.map(t=>[t.id,t.id]))}};await validateArchive(next);await saveAssetBatch([],{value:next,expectedRevision:a.revision,scope});}
export async function changeReviewState(recordId:string,action:ReviewEvent['action'],scope='local'){const a=await readArchive(scope);const body={id:crypto.randomUUID(),recordId,at:new Date().toISOString(),action};const event={...body,digest:await digestBridge(body)};const next={...a,revision:a.revision+1,events:[...a.events,event]};await validateArchive(next);await saveAssetBatch([],{value:next,expectedRevision:a.revision,scope});}
export function reviewState(a:ReviewArchive,id:string){return a.events.filter(e=>e.recordId===id).at(-1)?.action||'active';}
export function sourceStatus(a:ReviewArchive,r:ReviewRecord,threads:ConversationThread[]){let stale=false;for(const source of r.context.threads){const live=threads.find(t=>t.id===a.links[r.id]?.[source.id]);if(!live)return 'Source missing locally; retained snapshot available';for(const m of source.messages){const now=live.messages.find(v=>v.id===m.id);if(!now||now.content!==m.content||now.role!==m.role)stale=true;}}return stale?'Source changed; saved snapshot retained':'Source matches saved message snapshot';}
export async function mergeArchives(existing:ReviewArchive,incoming:ReviewArchive,threadMap:Map<string,string>){
 await validateArchive(existing);await validateArchive(incoming);const next=structuredClone(existing);next.revision++;
 for(const r of incoming.records){const old=next.records.find(v=>v.id===r.id);if(old){if(old.digest!==r.digest)throw Error('Conflicting review IDs; restore into a fresh browser profile instead. Nothing replaced.');const remapped=Object.fromEntries(Object.entries(incoming.links[r.id]).map(([origin,live])=>[origin,threadMap.get(live)||live]));if(await digestBridge(remapped)!==await digestBridge(next.links[r.id]))throw Error('Conflicting source links for an existing review; restore into a fresh browser profile. Nothing replaced.');continue;}next.records.push(r);next.links[r.id]=Object.fromEntries(Object.entries(incoming.links[r.id]).map(([origin,live])=>[origin,threadMap.get(live)||live]));}
 for(const e of incoming.events){const old=next.events.find(v=>v.id===e.id);if(old){if(old.digest!==e.digest)throw Error('Conflicting review history; nothing replaced.');}else next.events.push(e);}
 next.events.sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));await validateArchive(next);return next;
}
