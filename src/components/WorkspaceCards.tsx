import React, {useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Download,FileText,FolderOpen,Search,ShieldCheck,RefreshCw,HelpCircle,Layers,Database} from 'lucide-react';
type Action='capture'|'library'|'analyze'|'export'|'corpus';
const cards=[
{slug:'preserve',title:'Preserve',desc:'Keep the original conversation intact.',details:'Capture a source conversation, retain its messages and provenance, and verify that it appears in your saved corpus.',action:'Capture a conversation',target:'capture',icon:ShieldCheck},
{slug:'organize',title:'Organize',desc:'Group related work without changing sources.',details:'Find your saved conversations, review source titles and dates, and open each original record without silently rewriting it.',action:'Open conversation library',target:'library',icon:FolderOpen},
{slug:'analyze',title:'Analyze',desc:'Find patterns, corrections and drift.',details:'Select a saved conversation in the workspace and inspect its analysis. AI analysis requires a configured provider; source excerpts are not AI conclusions.',action:'Choose a conversation',target:'library',icon:Search},
{slug:'reintegrate',title:'Reintegrate',desc:'Carry useful context forward.',details:'Inspect source evidence before using any findings in a new conversation. Cross-thread answers must distinguish source excerpts from generated synthesis.',action:'Open connected corpus',target:'corpus',icon:RefreshCw},
{slug:'artifacts',title:'Artifacts',desc:'Keep PDFs, images and source files nearby.',details:'Use the saved conversation record as the source of truth. Export a backup before moving or changing any records; file attachment storage is not verified here.',action:'Back up saved corpus',target:'export',icon:Layers},
{slug:'export',title:'Export',desc:'Create useful reports and backups.',details:'Export a JSON backup of saved conversations. For PDF export, first open a conversation and use its export control.',action:'Download corpus backup',target:'export',icon:Download},
{slug:'conversation-library',title:'Your conversation library',desc:'Rename, compare and reopen preserved conversations.',details:'Browse the locally saved corpus, select a conversation and inspect its transcript. Do not clear browser data without exporting a backup.',action:'Open library',target:'library',icon:Database},
{slug:'files-around-conversation',title:'Files around the conversation',desc:'PDFs, screenshots, JSON, audio, video and evidence.',details:'Supporting files belong alongside source records with clear provenance. This page does not claim a working attachment uploader until one is implemented and tested.',action:'Export source backup',target:'export',icon:FileText},
{slug:'four-step-visual-guide',title:'Four-step visual guide',desc:'Find Share, Copy link and capture controls.',details:'1. Open a conversation in ChatGPT. 2. Use Share to create a share link. 3. Copy the link. 4. In ChatGrab, choose Capture and paste the link. If fetching fails, use transcript paste when supported.',action:'Start capture',target:'capture',icon:HelpCircle}
] as const;
export function WorkspaceCards({onAction}:{onAction:(a:Action)=>void}){
 const [route,setRoute]=useState(()=>decodeURIComponent(location.hash.replace(/^#\/?/,'')||''));
 const chosen=cards.find(c=>c.slug===route);
 const navigate=(slug:string)=>{location.hash='/'+slug;setRoute(slug);};
 React.useEffect(()=>{const handler=()=>setRoute(decodeURIComponent(location.hash.replace(/^#\/?/,'')));window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
 return <section aria-label="ChatGrab tools" className="mt-8 pb-10">
 {chosen?<article className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
 <button onClick={()=>navigate('')} className="inline-flex gap-2 items-center text-blue-700 font-semibold mb-8"><ArrowLeft size={18}/>All nine tools</button>
 <chosen.icon className="w-12 h-12 text-blue-600 mb-5"/>
 <h2 className="text-3xl font-extrabold mb-3">{chosen.title}</h2><p className="text-lg text-slate-600 mb-6">{chosen.desc}</p><p className="text-slate-700 leading-relaxed mb-8">{chosen.details}</p>
 <button onClick={()=>onAction(chosen.target)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold">{chosen.action}<ArrowRight size={18}/></button>
 </article>:<><h2 className="text-2xl font-extrabold mb-2">Explore ChatGrab</h2><p className="text-slate-600 mb-5">Every card opens a dedicated tool page.</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{cards.map((c,i)=><button key={c.slug} onClick={()=>navigate(c.slug)} className="text-left group rounded-3xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 overflow-hidden transition-all">
 <div className={`h-32 flex items-center justify-center bg-gradient-to-br ${['from-violet-100 to-blue-100','from-blue-100 to-indigo-100','from-emerald-100 to-cyan-100','from-orange-100 to-violet-100','from-fuchsia-100 to-indigo-100','from-sky-100 to-blue-100','from-blue-50 to-indigo-100','from-rose-100 to-purple-100','from-amber-100 to-orange-100'][i]}`}><c.icon className="w-16 h-16 text-blue-600 drop-shadow-lg" strokeWidth={1.5}/></div>
 <div className="p-5"><h3 className="text-lg font-extrabold mb-2">{c.title}</h3><p className="text-sm text-slate-600 min-h-10">{c.desc}</p><span className="inline-flex items-center gap-2 text-blue-700 font-bold text-sm mt-3">Explore {c.title}<ArrowRight size={16}/></span></div></button>)}</div></>}
 </section>;
}
