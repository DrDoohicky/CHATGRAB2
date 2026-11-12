import type {ConversationThread} from '../types';
import {parseConversationFile} from './importConversations';
// Only explicit role delimiters outside fenced code are treated as speaker turns.
export function previewManualImport(text:string,name:string,existing:ConversationThread[],mode:'json'|'turns'|'verbatim',title:string):ConversationThread[]{
 if(new Blob([text]).size>15*1024*1024)throw Error('Import is limited to 15 MB. Split a larger export first; nothing has been saved.');
 if(mode==='json')return parseConversationFile(text,name.endsWith('.json')?name:'conversation.json',existing);
 if(!text.trim())throw Error('Paste the complete conversation first.');
 if(/^https?:\/\//.test(text.trim()))throw Error('This is a link. Open the conversation and copy its message text, or choose an export file.');
 let messages:{id:string;role:'user'|'assistant'|'system';content:string}[]=[];
 if(mode==='verbatim')messages=[{id:'text-0',role:'user',content:text}];
 else {
  let fence:string|null=null,role:'user'|'assistant'|'system'|null=null,body='';
  const flush=()=>{if(role){if(!body.trim())throw Error('A speaker turn has no content. Check the complete transcript.');messages.push({id:'manual-'+messages.length,role,content:body});}};
  for(const line of text.match(/[^\n]*\n|[^\n]+$/g)||[]){
   const marker=!fence?line.match(/^(User|Human|Assistant|ChatGPT|AI|System):[ \t]?/i):null;
   if(marker){flush();role=/user|human/i.test(marker[1])?'user':/system/i.test(marker[1])?'system':'assistant';body=line.slice(marker[0].length);}
   else {if(!role&&line.trim())throw Error('Start each turn with User:, Assistant: or System:. Use verbatim mode if speaker roles are unknown.');if(role)body+=line;}
   const f=(marker?line.slice(marker[0].length):line).match(/^\s*(`{3,}|~{3,})/);if(f){if(!fence)fence=f[1][0];else if(fence===f[1][0])fence=null;}
  }
  if(fence)throw Error('A code fence is unfinished. Paste the complete code block before saving.');flush();
  if(!messages.length)throw Error('No speaker turns found. Choose verbatim mode if roles are unknown.');
 }
 return parseConversationFile(JSON.stringify({title:title.trim()||'Reviewed conversation',model:mode==='verbatim'?'Verbatim text — roles unknown':'Reviewed manual transcript',captureLimitations:[mode==='verbatim'?'Original speaker roles are unknown. Text is preserved as one source message.':'Roles follow your explicit speaker labels. Completeness requires your review.'],messages}), 'conversation.json',existing);
}
