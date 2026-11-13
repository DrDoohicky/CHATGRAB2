import type {ConversationThread} from '../types';
import {listAssets,saveAssetBatch,type StoredAsset} from './assets';
import {parseConversationFile} from './importConversations';
export const BACKUP_LIMIT=60*1024*1024;
type EncodedAsset=Omit<StoredAsset,'blob'>&{base64:string;sha256:string};
export type PortableBackup={schema:'chatgrab-portable/1';createdAt:string;threads:ConversationThread[];assets:EncodedAsset[];layout?:unknown};
const digest=async(data:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data as BufferSource))).map(b=>b.toString(16).padStart(2,'0')).join('');
function encode(data:Uint8Array){let raw='';for(let i=0;i<data.length;i+=16384)raw+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(raw);}
export async function createPortableBackup(threads:ConversationThread[],layoutKey:string):Promise<string>{
 const rows=await listAssets();if(rows.some(a=>!a.blob))throw Error('An original supporting file is missing. Export a conversation-only backup and recover that file before creating a complete backup.');
 if(rows.reduce((n,a)=>n+a.blob!.size,0)>40*1024*1024)throw Error('Original files exceed the 40 MB portable-backup limit. Save larger originals separately.');
 const assets:EncodedAsset[]=[];
 for(const row of rows){const {blob,...meta}=row;const data=new Uint8Array(await blob!.arrayBuffer());assets.push({...meta,size:blob!.size,base64:encode(data),sha256:await digest(data)});}
 const raw=localStorage.getItem(layoutKey);const backup:PortableBackup={schema:'chatgrab-portable/1',createdAt:new Date().toISOString(),threads,assets,...(raw?{layout:JSON.parse(raw)}:{})};
 const text=JSON.stringify(backup);if(new Blob([text]).size>BACKUP_LIMIT)throw Error('Complete backup exceeds 60 MB. Reduce original file sizes first.');return text;
}
export async function validatePortableBackup(text:string):Promise<{backup:PortableBackup;assets:StoredAsset[]}>{
 if(new Blob([text]).size>BACKUP_LIMIT)throw Error('Portable backups are limited to 60 MB.');
 const b=JSON.parse(text);if(b?.schema!=='chatgrab-portable/1'||!Array.isArray(b.threads)||!Array.isArray(b.assets))throw Error('Choose a ChatGrab complete portable backup.');
 if(b.threads.length)parseConversationFile(JSON.stringify(b.threads),'backup.json',[]);
 const ids=new Set<string>();const assets:StoredAsset[]=[];let bytes=0;
 for(const a of b.assets){if(typeof a?.id!=='string'||!a.id||ids.has(a.id)||typeof a.name!=='string'||typeof a.type!=='string'||typeof a.base64!=='string'||!/^[a-f0-9]{64}$/.test(a.sha256))throw Error('A supporting file entry is invalid or duplicated.');ids.add(a.id);let raw:string;try{raw=atob(a.base64);}catch{throw Error('A supporting file has invalid encoding.');}const data=Uint8Array.from(raw,c=>c.charCodeAt(0));bytes+=data.length;if(bytes>40*1024*1024||data.length!==a.size||await digest(data)!==a.sha256)throw Error('Supporting file integrity check failed. Nothing has been restored.');const {base64,sha256,...meta}=a;assets.push({...meta,blob:new Blob([data],{type:a.type})});}
 if(b.layout!==undefined){const l=b.layout;if(l?.version!==1||!Array.isArray(l.folders)||!l.locations||!l.modified||l.folders.some((f:any)=>typeof f.id!=='string'||typeof f.name!=='string'||typeof f.parent!=='string'))throw Error('The folder layout is invalid.');}
 return {backup:b,assets};
}
export async function restorePortableBackup(text:string,existing:ConversationThread[],layoutKey:string):Promise<ConversationThread[]>{
 const {backup,assets}=await validatePortableBackup(text),oldAssets=await listAssets();
 const threadMap=new Map<string,string>();
 const threads=backup.threads.length?parseConversationFile(JSON.stringify(backup.threads),'backup.json',existing,threadMap):[];
 const assetMap=new Map<string,string>();const additions:StoredAsset[]=[];
 for(const a of assets){const old=oldAssets.find(x=>x.id===a.id);if(old?.blob&&old.name===a.name&&old.linkedThreadId===(a.linkedThreadId?(threadMap.get(a.linkedThreadId)||a.linkedThreadId):undefined)&&await digest(new Uint8Array(await old.blob.arrayBuffer()))===await digest(new Uint8Array(await a.blob!.arrayBuffer()))){assetMap.set(a.id,old.id);continue;}const id=old?crypto.randomUUID():a.id;assetMap.set(a.id,id);additions.push({...a,id,...(a.linkedThreadId?{linkedThreadId:threadMap.get(a.linkedThreadId)||a.linkedThreadId}:{})});}
 const next=[...threads.map(t=>({...t,...(t.supportAssetIds?{supportAssetIds:t.supportAssetIds.map(id=>assetMap.get(id)||id)}:{})})),...existing];
 const layoutOld=localStorage.getItem(layoutKey),corpusOld=localStorage.getItem('chatgrab_corpus_threads');
 // Merge folder IDs and locations, preserving unrelated local organization.
 let layoutText=layoutOld;
 if(backup.layout){const incoming=backup.layout as any,local=layoutOld?JSON.parse(layoutOld):{version:1,folders:[],locations:{},modified:{}};const folders=new Map<string,string>();for(const f of incoming.folders)folders.set(f.id,local.folders.some((x:any)=>x.id===f.id&&JSON.stringify(x)!==JSON.stringify(f))?'folder:'+crypto.randomUUID():f.id);
 const mapped=(id:string)=>folders.get(id)||(id.startsWith('thread:')?'thread:'+(threadMap.get(id.slice(7))||id.slice(7)):id.startsWith('asset:')?'asset:'+(assetMap.get(id.slice(6))||id.slice(6)):id);
 const locations={...local.locations},modified={...local.modified};for(const [id,parent] of Object.entries(incoming.locations)){const key=mapped(id);if(!Object.hasOwn(locations,key))locations[key]=mapped(String(parent));}for(const [id,date] of Object.entries(incoming.modified)){const key=mapped(id);if(!Object.hasOwn(modified,key))modified[key]=date;}
 layoutText=JSON.stringify({version:1,folders:[...local.folders,...incoming.folders.filter((f:any)=>!local.folders.some((x:any)=>x.id===mapped(f.id))).map((f:any)=>({...f,id:mapped(f.id),parent:mapped(f.parent)}))],locations,modified});}
 try{localStorage.setItem('chatgrab_corpus_threads',JSON.stringify(next));if(layoutText)localStorage.setItem(layoutKey,layoutText);await saveAssetBatch(additions);}
 catch(e){if(corpusOld===null)localStorage.removeItem('chatgrab_corpus_threads');else localStorage.setItem('chatgrab_corpus_threads',corpusOld);if(layoutOld===null)localStorage.removeItem(layoutKey);else localStorage.setItem(layoutKey,layoutOld);throw e;}
 return next;
}
