import type {ConversationThread,ChatMessage} from '../types';
// Capture time is not evidence of the source conversation's original date/model.
export function capturedRecord(data:any,sourceUrl?:string):ConversationThread {
 if(!data||!Array.isArray(data.messages)||!data.messages.length)throw Error('The capture returned no source messages. Your existing library is unchanged.');
 const seen=new Set<string>();
 const messages:ChatMessage[]=data.messages.map((m:any,i:number)=>{
  if(!m||!['user','assistant','system'].includes(m.role)||typeof m.content!=='string')throw Error('The capture returned an unsupported message. Your existing library is unchanged.');
  let id=typeof m.id==='string'&&m.id?m.id:'message-'+i;if(seen.has(id))id=crypto.randomUUID();seen.add(id);
  return {...m,id};
 });
 const original=typeof data.originalCreatedAt==='string'&&Number.isFinite(Date.parse(data.originalCreatedAt))?data.originalCreatedAt:undefined;
 return {id:'thread-'+crypto.randomUUID(),title:typeof data.title==='string'&&data.title.trim()?data.title:'Captured Conversation',sourceUrl:typeof data.sourceUrl==='string'?data.sourceUrl:sourceUrl,capturedAt:new Date().toISOString(),...(original?{originalCreatedAt:original}:{}),model:typeof data.model==='string'&&data.model?data.model:'Unknown',messages};
}
export function sameCapturedSource(a:ConversationThread,b:ConversationThread){
 if(!a.sourceUrl||!b.sourceUrl)return false;
 const canonical=(url:string)=>{try{const u=new URL(url);return ['chatgpt.com','chat.openai.com'].includes(u.hostname)?'chatgpt.com'+u.pathname.replace(/\/$/,''):url;}catch{return url}};
 return canonical(a.sourceUrl)===canonical(b.sourceUrl)&&JSON.stringify(a.messages)===JSON.stringify(b.messages);
}
export function addCapturedRecord(existing:ConversationThread[],incoming:ConversationThread){
 if(existing.some(t=>sameCapturedSource(t,incoming)))return existing;
 // A changed source is a new snapshot; never overwrite a previous capture.
 return [{...incoming,...(existing.some(t=>t.id===incoming.id)?{id:'thread-'+crypto.randomUUID()}:{} )},...existing];
}
