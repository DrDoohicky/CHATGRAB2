import React from 'react';
import { Archive, FolderKanban, Search, RefreshCw, Images, FileArchive, Database, BookOpen, HelpCircle, ArrowRight, Layers, ShieldCheck, FileText, MessageCircle, Download, Upload, BarChart3, Sparkles } from 'lucide-react';
import './chatgrab-dashboard.css';

export type CGPage='workspace'|'capture'|'preserve'|'organize'|'analyze'|'reintegrate'|'artifacts'|'export'|'library'|'support'|'guide'|'stillboards'|'settings';
type Props={page:CGPage;count:number;onNavigate:(p:CGPage)=>void;onOpenLibrary:()=>void;onOpenSupport:()=>void;onOpenGuide:()=>void;onExport:()=>void};
const features=[
 {id:'preserve',title:'Preserve',desc:'Keep the original conversation intact.',sub:'Capture & Preserve',icon:Archive,tone:'lavender'},
 {id:'organize',title:'Organize',desc:'Group related work without changing sources.',sub:'Organize',icon:FolderKanban,tone:'blue'},
 {id:'analyze',title:'Analyze',desc:'Find patterns, corrections and drift.',sub:'Analyze',icon:Search,tone:'mint'},
 {id:'reintegrate',title:'Reintegrate',desc:'Carry useful context forward.',sub:'Reintegrate',icon:RefreshCw,tone:'peach'},
 {id:'artifacts',title:'Artifacts',desc:'Keep PDFs, images and source files nearby.',sub:'View Artifacts',icon:Images,tone:'lilac'},
 {id:'export',title:'Export',desc:'Create useful reports and backups.',sub:'Export',icon:Download,tone:'sky'}
] as const;
const sections:Record<string,{name:string,desc:string,icon:any,bullets:string[]}> = {
 preserve:{name:'Preserve',desc:'Capture and preserve the original source before any interpretation.',icon:ShieldCheck,bullets:['Import a publicly shared ChatGPT conversation','Retain the original message sequence','Keep corrections separate from source evidence']},
 organize:{name:'Organize',desc:'Review and organize saved conversations without overwriting originals.',icon:FolderKanban,bullets:['Open your preserved conversation library','Select a conversation to inspect','Keep source and interpretation separate']},
 analyze:{name:'Analyze',desc:'Inspect conversation history and available insights with evidence awareness.',icon:BarChart3,bullets:['Select a captured conversation','Open its analysis view','Check observations against original messages']},
 reintegrate:{name:'Reintegrate',desc:'Carry selected, reviewed content into a usable continuity record.',icon:RefreshCw,bullets:['Review material before reintegrating','Keep provenance attached','Export a portable copy when ready']},
 artifacts:{name:'Artifacts',desc:'Review supporting files and media associated with your work.',icon:Images,bullets:['Attach supporting files','Inspect available artifacts','Avoid treating attachments as verified claims']},
 export:{name:'Export',desc:'Take a portable copy of your captured conversations.',icon:Download,bullets:['Download a JSON backup of saved conversations','Export an open conversation when available','Retain your original sources']},
 library:{name:'Your conversation library',desc:'Browse and reopen preserved conversations.',icon:Database,bullets:['View all stored conversations','Open transcript and analysis','Search the library']},
 support:{name:'Files around the conversation',desc:'Keep PDFs, screenshots, JSON, audio and video close to their source.',icon:FileArchive,bullets:['Open the support material library','Attach source-related artifacts','Keep evidentiary status explicit']},
 guide:{name:'Four-step visual guide',desc:'Find the Share and Copy link controls in ChatGPT, then capture the conversation here.',icon:BookOpen,bullets:['Open the conversation menu','Choose Share','Copy the public share link','Paste it into ChatGrab Capture']},
 stillboards:{name:'Stillboards',desc:'Visual boards for assembling conversation-related reference materials.',icon:Layers,bullets:['Explore boards as they become available','Use Artifacts for currently supported media','No fabricated boards or sample records']},
 settings:{name:'Settings',desc:'Manage available account and application controls.',icon:Sparkles,bullets:['Access account controls in the header','Review available local backup options','Keep device-specific data limitations in mind']}
};
export function ChatGrabDashboard({page,count,onNavigate,onOpenLibrary,onOpenSupport,onOpenGuide,onExport}:Props){
 const act=(p:CGPage)=>{if(p==='library')onOpenLibrary();else if(p==='support'||p==='artifacts')onOpenSupport();else if(p==='guide')onOpenGuide();else if(p==='export')onExport();else onNavigate(p)};
 if(page!=='workspace'){
  const section=sections[page];if(!section)return null;
  const Icon=section.icon;
  return <div className="cg-page">
   <button className="cg-back" onClick={()=>onNavigate('workspace')}>← Workspace</button>
   <div className="cg-page-heading"><div className="cg-page-icon"><Icon size={32}/></div><div><h1>{section.name}</h1><p>{section.desc}</p></div></div>
   <div className="cg-page-panel"><h2>Explore {section.name}</h2><div className="cg-page-steps">{section.bullets.map((v,i)=><div key={v}><span>{i+1}</span><p>{v}</p></div>)}</div>
    <div className="cg-page-actions">
     <button onClick={()=>onNavigate('capture')}><MessageCircle size={18}/> Go to Capture <ArrowRight size={16}/></button>
     <button onClick={onOpenLibrary}><Database size={18}/> Open Library</button>
     <button onClick={onOpenSupport}><FileArchive size={18}/> Support Files</button>
     {page==='guide'&&<button onClick={onOpenGuide}><HelpCircle size={18}/> Open Visual Guide</button>}
    </div>
   </div>
  </div>;
 }
 return <div className="cg-dash">
  <div className="cg-dash-intro"><div><span className="cg-greeting">✨ Your ChatGrab workspace</span><h1>Welcome back! <span aria-hidden="true">👋</span></h1><p>Preserve, organize, and make more from your conversations.</p></div><button className="cg-count" onClick={onOpenLibrary}><Database size={22}/><strong>{count}</strong><span>saved conversations</span><ArrowRight size={18}/></button></div>
  <div className="cg-feature-grid">{features.map(item=>{const Icon=item.icon;return <button key={item.id} className={'cg-feature cg-tone-'+item.tone} onClick={()=>act(item.id as CGPage)}><div className="cg-art"><span className="cg-art-orb"/><Icon strokeWidth={1.7} className="cg-feature-icon" size={78}/><span className="cg-art-spark">✦</span></div><div className="cg-feature-body"><h2>{item.title}</h2><p>{item.desc}</p><span className="cg-feature-action">{item.sub} <ArrowRight size={17}/></span></div></button>})}</div>
  <div className="cg-large-grid">
   <button className="cg-large-card" onClick={onOpenLibrary}><div className="cg-large-copy"><Database size={27}/><h2>Your conversation library</h2><p>Rename, compare, and reopen preserved conversations.</p><span>Open Library <ArrowRight size={17}/></span></div><div className="cg-mini-illustration">▤<span>☰</span><span>☰</span></div></button>
   <button className="cg-large-card cg-support-card" onClick={onOpenSupport}><div className="cg-large-copy"><FileText size={27}/><h2>Files around the conversation</h2><p>Attach PDFs, screenshots, generated media, JSON, audio, video and evidence.</p><span>Open Support Library <ArrowRight size={17}/></span></div><div className="cg-mini-illustration">▧<span>PDF</span><span>▶</span></div></button>
  </div>
  <button className="cg-guide-card" onClick={onOpenGuide}><div><HelpCircle size={28}/><h2>Four-step visual guide</h2><p>See where the three dots, Share, Copy link, and ChatGrab paste controls are.</p><span>Show the Guide <ArrowRight size={17}/></span></div><div className="cg-guide-steps">{['Menu','Share','Copy link','ChatGrab'].map((v,i)=><span key={v}><b>{i+1}</b>{v}</span>)}</div></button>
 </div>;
}
