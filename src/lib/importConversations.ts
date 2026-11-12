import type {ConversationThread,ChatMessage} from '../types';

// ChatGPT exports are trees. Import the selected branch, not every alternative reply.
function fromChatGPTExport(item:any){
 if(!item?.mapping||typeof item.mapping!=='object')return item;
 const nodes=item.mapping;let cursor=item.current_node;
 if(typeof cursor!=='string'||!nodes[cursor])throw new Error('ChatGPT export is missing its selected conversation branch (current_node).');
 const branch:any[]=[];const seen=new Set<string>();
 while(cursor){
  if(seen.has(cursor)||!nodes[cursor])throw new Error('ChatGPT export contains a broken or circular message chain.');
  seen.add(cursor);const node=nodes[cursor];branch.push(node);cursor=node.parent;
 }
 const messages=branch.reverse().flatMap(node=>{
  const m=node.message;const role=m?.author?.role;
  if(!m||!['user','assistant','system'].includes(role)||m.metadata?.is_visually_hidden_from_conversation)return [];
  const parts=m.content?.parts;
  const content=Array.isArray(parts)?parts.filter((p:any)=>typeof p==='string').join('\n\n'):typeof m.content?.text==='string'?m.content.text:'';
  // Do not silently omit images, audio, files or other non-text content.
  if(m.metadata?.attachments?.length||(Array.isArray(parts)&&parts.some((p:any)=>typeof p!=='string'))||(m.content?.content_type&&!['text','multimodal_text'].includes(m.content.content_type)))throw new Error('This ChatGPT export includes non-text messages. Import a text-only conversation or a reviewed text export; attachments are not imported automatically.');
  if(!content.trim())return [];
  return [{id:m.id||node.id,role,content,...(typeof m.create_time==='number'&&Number.isFinite(m.create_time)?{timestamp:new Date(m.create_time*1000).toISOString()}: {})}];
 });
 return {id:item.id||item.conversation_id,title:item.title,model:'ChatGPT export',originalCreatedAt:typeof item.create_time==='number'?new Date(item.create_time*1000).toISOString():undefined,messages};
}

export function parseConversationFile(text:string,name:string,existing:ConversationThread[],idMap?:Map<string,string>):ConversationThread[]{
 const now=new Date().toISOString();
 if(!name.toLowerCase().endsWith('.json')){
  if(!text.trim())throw new Error('The selected file is empty.');
  return [{id:crypto.randomUUID(),title:name,capturedAt:now,model:'Imported source',messages:[{id:'text-0',role:'user',content:text}]}];
 }
 const raw=JSON.parse(text);
 const data=Array.isArray(raw)&&raw.some(item=>item?.mapping)?raw.map(fromChatGPTExport):fromChatGPTExport(raw);
 const candidates=Array.isArray(data)&&data.every(item=>item&&Array.isArray(item.messages))?data:
  data&&Array.isArray(data.messages)?[data]:data?.data&&Array.isArray(data.data.messages)?[data.data]:
  Array.isArray(data)?[{title:name,messages:data}]:null;
 if(!candidates?.length)throw new Error('Choose a ChatGrab library backup, conversation JSON, or a nonempty messages array.');
 const ids=new Set(existing.map(t=>t.id));const remapped=new Map<string,string>();
 const imported=candidates.map((item:any)=>{
  for(const field of ['capturedAt','originalCreatedAt'])if(item[field]!==undefined&&(typeof item[field]!=='string'||!Number.isFinite(Date.parse(item[field]))))throw Error('Conversation dates must be valid ISO date strings.');
  if(!Array.isArray(item.messages)||!item.messages.length)throw new Error('Every imported conversation needs a nonempty messages array.');
  const messageIds=new Set<string>();
  const messages:ChatMessage[]=item.messages.map((m:any,i:number)=>{
   if(!m||typeof m.content!=='string'||!['user','assistant','system'].includes(m.role)||m.attachments?.length||m.fileAttachments?.length)throw new Error('Every imported message needs a supported role and text content.');
   const id=String(m.id??'message-'+i);if(!id||messageIds.has(id))throw Error('Message IDs must be nonempty and unique within each conversation. Nothing has been imported.');messageIds.add(id);
   return {...m,id,role:m.role,content:m.content};
  });
  const duplicate=existing.find(t=>t.id===item.id&&JSON.stringify(t.messages)===JSON.stringify(messages)&&t.title===item.title);
  if(duplicate){idMap?.set(item.id,duplicate.id);return null;}
  const oldId=typeof item.id==='string'?item.id:'';
  const id=oldId&&!ids.has(oldId)?oldId:crypto.randomUUID();ids.add(id);if(oldId){remapped.set(oldId,id);idMap?.set(oldId,id);}
  return {...item,id,title:typeof item.title==='string'?item.title:name,capturedAt:typeof item.capturedAt==='string'?item.capturedAt:now,model:typeof item.model==='string'?item.model:'Imported source',messages} as ConversationThread;
 }).filter((t):t is ConversationThread=>!!t);
 return imported.map(t=>({...t,messages:t.messages.map(m=>({...m,...(m.sourceThreadId?{sourceThreadId:remapped.get(m.sourceThreadId)||m.sourceThreadId}:{})})),...(t.reintegrationMeta?{reintegrationMeta:{...t.reintegrationMeta,destinationId:remapped.get(t.reintegrationMeta.destinationId||'')||t.reintegrationMeta.destinationId,sources:t.reintegrationMeta.sources.map(s=>({...s,threadId:remapped.get(s.threadId)||s.threadId}))}}:{})}));
}
