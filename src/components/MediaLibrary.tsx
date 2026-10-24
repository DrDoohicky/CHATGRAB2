import React from 'react';
import {Film,Images,ExternalLink,BookOpen,ArrowRight,Download} from 'lucide-react';

const sections=[
  ['Capture','tutorial',4],['Provenance','provenance',3],['Contextual analytics','analytics',4],['Knowledge evolution','evolution',3],['Evidence standards','evidence',3],['Reintegration','reintegration',3],['Practical utility','utility',6]
] as const;
export function MediaLibrary({onTutorial,onCapture}:{onTutorial:()=>void;onCapture:()=>void}){
  return <section className="cg-media-page" aria-label="ChatGrab media library">
    <div className="cg-media-intro"><span className="cg-media-eyebrow">CHATGRAB MEDIA LIBRARY</span><h1>Watch. Explore. Understand.</h1><p>Videos, illustrated guides, and visual explainers about ChatGrab. Media explains workflows and concepts; it is not evidence that a feature has been tested.</p></div>
    <div className="cg-media-feature">
      <div className="cg-media-copy"><Film size={30}/><span>FEATURED VIDEO · 9 MIN 50 SEC</span><h2>ChatGrab: Power Companion</h2><p>From fragmented AI conversations to evidence-aware continuity. Watch the explainer, then explore the guided walkthrough.</p><button onClick={onTutorial}>Open complete tutorial <ArrowRight size={17}/></button></div>
      <video src="/video/ChatGrab_Power_Companion.mp4" controls playsInline preload="metadata" aria-label="ChatGrab Power Companion video explainer">Your browser does not support video playback.</video>
    </div>
    <div className="cg-media-tiles">
      <article className="cg-media-tile cg-media-deck"><a href="/media/ChatGrab_Continuity_Framework.pdf" target="_blank" rel="noopener noreferrer" aria-label="Open ChatGrab and the Path to Continuity PDF, 10 pages"><img src="/media/framework-slide-01.jpg" alt="Cover of ChatGrab and the Path to Continuity" width="1583" height="884"/></a><div><span>10-PAGE ILLUSTRATED PDF</span><h2>ChatGrab and the Path to Continuity</h2><p>The full path from Capture and Provenance through Analytics, Evolution, Evidence, Reintegration and Utility.</p><p className="cg-media-note">Editorial explainer with illustrative examples, including placeholder text on page 5. It does not certify working software features.</p><div className="cg-media-actions"><a href="/media/ChatGrab_Continuity_Framework.pdf" target="_blank" rel="noopener noreferrer">Open PDF <ExternalLink size={17}/></a><a href="/media/ChatGrab_Continuity_Framework.pdf" download>Download PDF <Download size={17}/></a></div></div></article>
      <article className="cg-media-tile"><div className="cg-media-tile-icon"><Images size={36}/></div><div><span>26 ILLUSTRATED CARDS</span><h2>Illustrated Workflow Guide</h2><p>Seven groups of images covering capture, provenance, contextual analysis, evolution, evidence, reintegration and practical applications.</p><button onClick={onTutorial}>Browse the cards <ExternalLink size={17}/></button></div></article>
    </div>
    <section className="cg-media-map" aria-labelledby="continuity-map-title"><h2 id="continuity-map-title">The seven-stage map</h2><a href="/media/ChatGrab_Continuity_Framework.pdf#page=2" target="_blank" rel="noopener noreferrer"><img src="/media/framework-slide-02.jpg" alt="Seven stages: Capture, Provenance, Analytics, Evolution, Evidence, Reintegration and Utility" loading="lazy"/><span>Explore the map in the full PDF <ExternalLink size={17}/></span></a></section>
    <div className="cg-media-chapters"><div><BookOpen size={24}/><h2>Explore by topic</h2></div><div className="cg-media-chapter-grid">{sections.map(([label,id,count])=><button key={id} onClick={()=>{onTutorial();setTimeout(()=>document.getElementById('guide-'+id)?.scrollIntoView({block:'start',behavior:'smooth'}),120);}}><span>{label}</span><small>{count} illustrated cards</small><ArrowRight size={16}/></button>)}</div></div>
    <div className="cg-media-footer"><span>Ready to preserve your own source?</span><button onClick={onCapture}>Capture a conversation <ArrowRight size={16}/></button></div>
  </section>;
}
