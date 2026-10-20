import { useId } from 'react';
export function BrandMark(){
  const id=useId();
  return <svg className="cg-brand-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs><linearGradient id={id} x1="7" y1="7" x2="57" y2="57" gradientUnits="userSpaceOnUse"><stop stopColor="#9569ff"/><stop offset=".5" stopColor="#4978ff"/><stop offset="1" stopColor="#22cfff"/></linearGradient></defs>
    <path d="M12 8h32c6.6 0 12 5.4 12 12v15c0 6.6-5.4 12-12 12H27L13 57l2-12C9.8 43.5 6 38.7 6 33V20c0-6.6 2.8-12 6-12Z" fill={`url(#${id})`}/>
    <path d="M17 21h22M17 29h14" stroke="white" strokeWidth="3.8" strokeLinecap="round" opacity=".9"/>
    <g transform="translate(43 42)"><path d="m-4-13 8 0 1 4 4 2 4-1 4 7-3 3v4l3 3-4 7-4-1-4 2-1 4h-8l-1-4-4-2-4 1-4-7 3-3v-4l-3-3 4-7 4 1 4-2Z" fill="#10306b" stroke="#b2ecff" strokeWidth="1.8"/><circle r="5" fill="#67d5ff"/><circle r="2" fill="#effcff"/></g>
  </svg>;
}
export function BrandWord({dark=false}:{dark?:boolean}){return <span className={`cg-brand-word ${dark?'cg-brand-word-on-dark':''}`}><span>Chat</span><span>Grab</span></span>;}
