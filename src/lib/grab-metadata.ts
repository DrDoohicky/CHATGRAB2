import type {ConversationThread} from '../types';
function valid(value?:string){return typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):undefined;}
function short(value:string,max=190){const clean=value.replace(/\s+/g,' ').trim();return clean.length>max?clean.slice(0,max-1).replace(/\s+\S*$/,'')+'…':clean;}
export function grabDateRange(thread:ConversationThread){
 const stamps=thread.messages.map(m=>valid(m.timestamp)).filter((x):x is number=>x!==undefined);
 const original=valid(thread.originalCreatedAt);
 const start=original??(stamps.length?Math.min(...stamps):undefined);
 const end=stamps.length?Math.max(...stamps):undefined;
 const fmt=(n:number)=>new Date(n).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
 if(start===undefined&&end===undefined)return 'Chat dates unavailable';
 if(end===undefined)return `Chat began ${fmt(start!)} · end unavailable`;
 return `Chat: ${fmt(start!)} – ${fmt(end)}`;
}
export function grabTopicSummary(thread:ConversationThread){
 if(thread.insights?.summary?.trim())return short(thread.insights.summary);
 const userText=thread.messages.filter(m=>m.role==='user').map(m=>m.content).join('\n');
 const source=userText||thread.messages.map(m=>m.content).join('\n');
 if(!source.trim())return 'No conversation text available for a topic preview.';
 const topics:[RegExp,string][]=[[/\b(logo|brand|hero|graphic|design|navigation)\b/i,'branding and interface design'],[/\b(analys(?:is|e|es)|analyz\w*|contradiction|insight)\b/i,'conversation analysis'],[/\b(import|capture|captur\w*|share link|archiv\w*)\b/i,'capturing and importing chats'],[/\b(folder|library|sort|rename|organiz\w*)\b/i,'library organization'],[/\b(deploy\w*|publish\w*|vercel|github)\b/i,'publishing and deployment'],[/\b(bridge|crew|worker)\b/i,'Crew Console integration'],[/\b(api|oauth|sign.in|subscription)\b/i,'AI access and account integration'],[/\b(tutorial|video|media)\b/i,'tutorials and media']];
 if(/\bchat\s*grab\b/i.test(thread.title+' '+source)){
 const found=topics.filter(([pattern])=>pattern.test(source)).map(([,label])=>label).slice(0,3);
 return found.length?`ChatGrab: ${found.join('; ')}.`:'ChatGrab project discussion.';
 }
 // An extractive preview preserves the user's wording rather than inventing an AI summary.
 const snippets=thread.messages.filter(m=>m.role==='user'&&m.content.trim()).slice(0,2).map(m=>m.content.replace(/https?:\/\/\S+/g,'').trim()).filter(Boolean);
 return 'Topics: '+short(snippets.join(' · ')||source,180);
}
