import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
interface Props { inline?: boolean; isOpen: boolean; onClose: () => void; onStartCapture: () => void; }
const sections = [
  { id:'tutorial', title:'Capture a conversation', description:'Open your ChatGPT conversation, choose Share, copy its public link, then paste it into Capture. Review what the share link makes public.', cards:['open-chat','choose-share','copy-link','paste-into-chatgrab'] },
  { id:'provenance', title:'Preserve source and provenance', description:'Keep original messages distinct from derived insights and review decisions.', cards:['source-record','derived-insights','review-decisions'] },
  { id:'analytics', title:'Choose contextual analyses', description:'Select sources and prepare a review request for ChatGPT. Import its response and check the cited passages. Direct account integration remains pending.', cards:['select-sources','choose-analyses','explain-contradictions','discover-connections'] },
  { id:'evolution', title:'Understand what changed', description:'Compare earlier and later statements in their original context.', cards:['earlier-statement','later-statement','knowledge-evolution'] },
  { id:'evidence', title:'Separate claims from reality', description:'A representation, an artifact, and observed behavior are different kinds of evidence.', cards:['representation','artifact','behavior'] },
  { id:'reintegration', title:'Propose reintegration', description:'Identify the source, destination, and purpose. Review a separate continuity record before accepting it; originals remain intact.', cards:['source','destination','purpose'] },
  { id:'utility', title:'Put continuity to work', description:'Explore possible applications. These illustrations explain concepts; they do not certify operational capabilities.', cards:['engineering','research','operations','knowledge-management','governance','documentation'] },
];
const label = (value:string) => value.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
export const OnboardingGuideModal: React.FC<Props> = ({ inline=false, isOpen, onClose, onStartCapture }) => {
  const [preview,setPreview]=useState<{src:string;title:string}|null>(null);
  const dialog=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!preview) return;
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden'; dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setPreview(null);} if(event.key==='Tab'){event.preventDefault();dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();}};
    document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=overflow;previous?.focus();};
  },[preview]);
  if (!isOpen) return null;
  return <div className={inline?'cg-destination':'fixed inset-0 z-[80] bg-slate-950/65 p-3 sm:p-6 overflow-y-auto'}><div className="max-w-6xl mx-auto bg-slate-50 rounded-3xl p-5 sm:p-7 relative">
    {!inline&&<button aria-label="Close tutorial" onClick={onClose} className="float-right p-3"><X/></button>}
    <p className="text-sm font-bold tracking-widest text-blue-700 uppercase">Tutorial & explainer</p>
    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">From isolated chats to usable continuity.</h2>
    <section aria-label="Explainer video" className="mt-6"><h3 className="text-xl font-bold mb-3">ChatGrab Power Companion</h3><video className="w-full rounded-xl bg-slate-950" controls playsInline preload="metadata" aria-label="ChatGrab Power Companion explainer"><source src="/video/ChatGrab_Power_Companion.mp4" type="video/mp4"/>Your browser cannot play this video. <a href="/video/ChatGrab_Power_Companion.mp4">Open the explainer video</a>.</video><p className="text-sm text-slate-600 mt-3">The video and illustrations explain the vision. Available functions and connection status are shown in the app; artwork is not proof of execution or account access.</p></section>
    <nav aria-label="Tutorial sections" className="flex flex-wrap gap-2 my-6">{sections.map(section=><a key={section.id} href={'#guide-'+section.id} className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-blue-800 text-sm">{section.title}</a>)}</nav>
    {sections.map(section=><section key={section.id} id={'guide-'+section.id} className="scroll-mt-24 mt-8"><h3 className="text-2xl font-bold text-slate-900">{section.title}</h3><p className="text-slate-600 my-3">{section.description}</p><div className={'grid gap-3 grid-cols-2 '+(section.cards.length===3?'lg:grid-cols-3':'lg:grid-cols-4')}>{section.cards.map(card=>{const src='/images/tutorial-cards/'+section.id+'--'+card+'.webp';const title=label(card);return <button key={card} onClick={()=>setPreview({src,title})} aria-label={'Enlarge '+title+' illustration'} className="rounded-xl overflow-hidden border border-slate-300 bg-white p-2 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-blue-700"><img src={src} alt={title+' — '+section.description} loading="lazy" decoding="async" className="w-full h-auto object-contain"/><span className="sr-only">Open full-size illustration</span></button>;})}</div></section>)}
    <p className="mt-8 font-semibold text-slate-800">Preserve the original. Reconstruct the context. Validate the evidence. Reintegrate what matters.</p>
    <button onClick={()=>{onClose();onStartCapture();}} className="mt-5 px-5 py-3 rounded-xl bg-[#0e274c] text-white font-semibold">Start a Capture →</button>
    {preview&&<div className="fixed inset-0 z-[100] bg-slate-950/85 flex items-center justify-center p-4" onClick={()=>setPreview(null)}><div ref={dialog} role="dialog" aria-modal="true" aria-label={preview.title+' illustration'} className="max-w-full max-h-full" onClick={event=>event.stopPropagation()}><button onClick={()=>setPreview(null)} className="block ml-auto mb-2 bg-white rounded-lg px-4 py-2">Close illustration</button><img src={preview.src} alt={preview.title} className="max-w-full max-h-[82dvh] w-auto h-auto object-contain rounded-lg"/></div></div>}
  </div></div>;
};
