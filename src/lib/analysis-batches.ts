import type {ConversationThread} from '../types';
export function buildAnalysisBatches(threads:ConversationThread[],search='',recentOnly=false,limit=54000){
 const batches:string[]=[];let chunk='';
 const flush=()=>{if(chunk){batches.push(chunk);chunk='';}};
 const add=(row:string)=>{if(chunk.length+row.length+2>limit)flush();chunk+=(chunk?'\n\n':'')+row;};
 for(const thread of threads){
  const heading='CONVERSATION: '+thread.title+'\nSOURCE ID: '+thread.id+'\nCAPTURED: '+thread.capturedAt+'\n';
  const messages=thread.messages.slice(recentOnly?-100:0).filter(message=>!search||message.content.toLowerCase().includes(search.toLowerCase()));
  for(const message of messages){
   const prefix=heading+'MESSAGE ID: '+message.id+'\nROLE: '+message.role+'\n';
   const row=prefix+message.content+'\n';
   if(row.length<=limit){add(row);continue;}
   flush();
   const capacity=limit-prefix.length-128;
   if(capacity<128){batches.push(row);continue;} // Oversized metadata remains explicit, never silently discarded.
   const parts:string[]=[];
   for(let offset=0;offset<message.content.length;){let end=Math.min(offset+capacity,message.content.length);const code=message.content.charCodeAt(end-1);if(end<message.content.length&&code>=0xd800&&code<=0xdbff)end--;parts.push(message.content.slice(offset,end));offset=end;}
   parts.forEach((part,index)=>batches.push(prefix+'MESSAGE PART: '+(index+1)+' of '+parts.length+' (continued source message)\n'+part+'\n'));
  }
 }
 flush();return batches;
}
