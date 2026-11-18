import type {ConversationThread,SupportAsset} from '../types';
export function buildCompanionContext(threads:ConversationThread[],assets:SupportAsset[],selected:string[],page:string){
 const wanted=new Set(selected);let remaining=48000;const warnings:string[]=[];
 const conversations=threads.filter(t=>wanted.has(t.id)).map(t=>{
  let budget=Math.min(12000,remaining);const messages=[];
  for(const m of t.messages){if(budget<=0){warnings.push(`Some messages from ${t.title} were omitted.`);break;}const content=m.content.slice(0,budget);budget-=content.length;remaining-=content.length;if(content.length<m.content.length)warnings.push(`Message ${m.id} was shortened.`);messages.push({id:m.id,role:m.role,content,timestamp:m.timestamp,sourceThreadId:m.sourceThreadId,sourceMessageId:m.sourceMessageId});}
  return {id:t.id,title:t.title,capturedAt:t.capturedAt,messages};
 });
 const included=new Set(conversations.map(t=>t.id));
 const files=assets.filter(a=>(a.linkedThreadId&&included.has(a.linkedThreadId))||threads.some(t=>included.has(t.id)&&t.supportAssetIds?.includes(a.id))).map(a=>{
  const text=(a.textPreview||'').slice(0,Math.min(4000,remaining));remaining-=text.length;
  if(text.length<(a.textPreview||'').length)warnings.push(`Text from ${a.name} was shortened.`);
  return {id:a.id,name:a.name,type:a.type,linkedThreadId:a.linkedThreadId,notes:a.notes,text,contentAvailable:!!text};
 });
 if(!conversations.length)warnings.push('No source conversations selected. Only app navigation and tool capabilities are included.');
 return {app:{name:'ChatGrab',page,conversationCount:threads.length,fileCount:assets.length,capabilities:['capture shared ChatGPT conversations','import and export','organize folders','attach supporting files','review source-linked continuity records']},conversations,files,warnings:[...new Set(warnings)]};
}
