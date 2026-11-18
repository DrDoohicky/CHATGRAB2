import type {ConversationThread} from '../types';
const stop=new Set('the and that this with from have your you for are was were will not but can into our its is to of in on a an it be as at or we i'.split(' '));
export function sourceMetrics(threads:ConversationThread[],query=''){
 const roles={user:0,assistant:0,system:0,unknown:0},activity:Record<string,number>={},terms=new Map<string,number>();
 const matches:{threadId:string;messageId:string;role:string;content:string}[]=[];
 let total=0,characters=0,dated=0,invalidDates=0;
 for(const t of threads)for(const m of t.messages){
  total++;characters+=m.content.length;
  const role=/roles unknown/i.test(t.model)?'unknown':m.role;
  roles[role in roles?role:'unknown']++;
  if(m.timestamp!==undefined){const time=Date.parse(m.timestamp);if(Number.isFinite(time)){const day=new Date(time).toISOString().slice(0,10);activity[day]=(activity[day]||0)+1;dated++;}else invalidDates++;}
  for(const term of m.content.toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]{3,}/gu)||[])if(!stop.has(term))terms.set(term,(terms.get(term)||0)+1);
  if(query.trim()&&m.content.toLocaleLowerCase('en-US').includes(query.trim().toLocaleLowerCase('en-US')))matches.push({threadId:t.id,messageId:m.id,role,content:m.content});
 }
 return {conversations:threads.length,total,characters,roles,dated,undated:total-dated,invalidDates,activity:Object.entries(activity).sort(([a],[b])=>a.localeCompare(b)),keywords:[...terms].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,20),matches};
}
