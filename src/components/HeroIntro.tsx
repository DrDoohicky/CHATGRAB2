import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import slides from '../hero-slides.json';
import './hero-intro.css';
export function HeroIntro(){
  const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const [reduced,setReduced]=useState(false);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(media.matches);if(media.matches){setIndex(0);setPaused(true);}};update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const slide=slides[index];
  return <div className="cg-hero-copy">
    <p className="cg-platform-note">BUILT FOR CHATGPT</p>
    <h1 className="sr-only">All your conversations. One connected contextual catalog.</h1>
    <div className="cg-hero-stage" aria-hidden="true">
      <div key={slide.id} className={`cg-hero-slide cg-slide-${slide.id} cg-transition-${index%3}`} data-paused={paused||reduced} style={{animationDuration:`${slide.duration}ms`}} onAnimationEnd={()=>{if(!paused&&!reduced)setIndex(previous=>(previous+1)%slides.length);}}>
        {slide.lines.map((line,i)=><span key={line} className={i>0?'cg-hero-line-accent':''}>{line}</span>)}
      </div>
    </div>
    <div className="cg-hero-motion-controls">
      <button type="button" onClick={()=>setPaused(previous=>!previous)} aria-label={paused?'Play headline animation':'Pause headline animation'}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
      <div className="cg-slide-choices" aria-label="Headline panels">{slides.map((item,i)=><button type="button" key={item.id} aria-label={`Show panel ${i+1}: ${item.lines.join(' ')}`} aria-pressed={i===index} onClick={()=>{setIndex(i);setPaused(true);}}/>)}</div>
    </div>
    <p className="cg-hero-motto">Capture · Organize · Analyze · Export</p>
    <p className="cg-hero-description">Keep source conversations intact. Organize their messages and supporting files, inspect them, and export what you choose.</p>
  </div>;
}
