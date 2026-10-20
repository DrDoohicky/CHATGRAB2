import { useEffect, useState } from 'react';
import { Pause, Play, Download } from 'lucide-react';
import slides from '../hero-slides.json';
import { BrandWord } from './BrandMark';
import './hero-intro.css';
export function HeroIntro(){
  const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const [reduced,setReduced]=useState(false);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(media.matches);if(media.matches){setIndex(3);setPaused(true);}};update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const slide=slides[index];
  return <div className="cg-hero-copy">
    <p className="cg-platform-note">BUILT FOR CHATGPT</p>
    <h1 className="sr-only">All your conversations. One connected contextual catalog.</h1>
    <div className="cg-hero-stage" aria-hidden="true">
      <div key={slide.id} className={`cg-hero-slide cg-slide-${slide.id}`} data-paused={paused||reduced} style={{animationDuration:`${slide.duration}ms`}} onAnimationEnd={()=>{if(!paused&&!reduced)setIndex(previous=>(previous+1)%slides.length);}}>
        {slide.id==='brand'?<span>It's <BrandWord/>.</span>:slide.lines.map((line,i)=><span key={line} className={i>0?'cg-hero-line-accent':''}>{line}</span>)}
      </div>
    </div>
    <div className="cg-hero-motion-controls">
      <button type="button" onClick={()=>setPaused(previous=>!previous)} aria-label={paused?'Play headline animation':'Pause headline animation'}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
      <div className="cg-slide-choices" aria-label="Headline panels">{slides.map((item,i)=><button type="button" key={item.id} aria-label={`Show panel ${i+1}: ${item.lines.join(' ')}`} aria-pressed={i===index} onClick={()=>{setIndex(i);setPaused(true);}}/>)}</div>
      <a href="/images/chatgrab-intro.gif" download="ChatGrab-intro.gif"><Download size={13}/> GIF</a>
    </div>
    <p className="cg-hero-motto">Validate. Reintegrate. Transform.</p>
    <p className="cg-hero-description">Capture your ChatGPT conversations, keep the originals, and bring their most useful context forward. Start with a share link, a transcript, or a file.</p>
  </div>;
}
