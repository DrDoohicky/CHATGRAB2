import type {ConversationThread,ChatMessage} from '../types';

export function parseConversationFile(text:string,name:string,existing:ConversationThread[]):ConversationThread[]{
 const now=new Date().toISOString();
 if(!name.toLowerCase().endsWith('.json')){
  if(!text.trim())throw new Error('The selected file is empty.');
  return [{id:crypto.randomUUID(),title:name,capturedAt:now,model:'Imported source',messages:[{id:'text-0',role:'user',content:text}]}];
 }
 const data=JSON.parse(text);
 const candidates=Array.isArray(data)&&data.every(item=>item&&Array.isArray(item.messages))?data:
  data&&Array.isArray(data.messages)?[data]:data?.data&&Array.isArray(data.data.messages)?[data.data]:
  Array.isArray(data)?[{title:name,messages:data}]:null;
 if(!candidates?.length)throw new Error('Choose a ChatGrab library backup, conversation JSON, or a nonempty messages array.');
 const ids=new Set(existing.map(t=>t.id));const remapped=new Map<string,string>();
 const imported=candidates.map((item:any)=>{
  if(!Array.isArray(item.messages)||!item.messages.length)throw new Error('Every imported conversation needs a nonempty messages array.');
  const messageIds=new Set<string>();
  const messages:ChatMessage[]=item.messages.map((m:any,i:number)=>{
   if(!m||typeof m.content!=='string'||!['user','assistant','system'].includes(m.role))throw new Error('Every imported message needs a supported role and text content.');
   let id=String(m.id??'message-'+i);if(messageIds.has(id))id=crypto.randomUUID();messageIds.add(id);
   return {...m,id,role:m.role,content:m.content};
  });
  const duplicate=existing.find(t=>t.id===item.id&&JSON.stringify(t.messages)===JSON.stringify(messages)&&t.title===item.title);
  if(duplicate)return null;
  const oldId=typeof item.id==='string'?item.id:'';
  const id=oldId&&!ids.has(oldId)?oldId:crypto.randomUUID();ids.add(id);if(oldId)remapped.set(oldId,id);
  return {...item,id,title:typeof item.title==='string'?item.title:name,capturedAt:typeof item.capturedAt==='string'?item.capturedAt:now,model:typeof item.model==='string'?item.model:'Imported source',messages} as ConversationThread;
 }).filter((t):t is ConversationThread=>!!t);
 return imported.map(t=>({...t,messages:t.messages.map(m=>({...m,...(m.sourceThreadId?{sourceThreadId:remapped.get(m.sourceThreadId)||m.sourceThreadId}:{})})),...(t.reintegrationMeta?{reintegrationMeta:{...t.reintegrationMeta,destinationId:remapped.get(t.reintegrationMeta.destinationId||'')||t.reintegrationMeta.destinationId,sources:t.reintegrationMeta.sources.map(s=>({...s,threadId:remapped.get(s.threadId)||s.threadId}))}}:{})}));
}
