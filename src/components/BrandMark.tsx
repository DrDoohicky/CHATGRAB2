export function BrandMark(){return <img className="cg-brand-mark" src="/images/chatgrab-app-icon.svg?v=cobalt-20261025" alt="" aria-hidden="true"/>;}
export function BrandWord({dark=false}:{dark?:boolean}){return <span className={`cg-brand-word ${dark?'cg-brand-word-on-dark':''}`}><span>Chat</span><span>Grab</span></span>;}
