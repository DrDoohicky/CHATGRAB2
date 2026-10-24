import React, {useEffect,useRef} from 'react';
import {MessageCircle,LayoutGrid,Database,Search,RefreshCw,Images,Download,Film,HelpCircle,Settings,PanelLeftClose,PanelLeftOpen,X,ArrowLeftRight} from 'lucide-react';
import type {CGPage} from './ChatGrabDashboard';

const links = [
 ['capture','Capture',MessageCircle],['workspace','Workspace',LayoutGrid],['library','Library',Database],
 ['analyze','Chat Analysis',Search],['reintegrate','Reintegrate',RefreshCw],['artifacts','Artifacts',Images],
 ['export','Export',Download],['media','Media',Film],['bridge','Crew bridge',ArrowLeftRight],['guide','Visual guide',HelpCircle],['settings','Settings',Settings],
] as const;
export function WorkspaceNavigation({page,onNavigate,collapsed,onCollapse,mobileOpen,onClose}:{page:CGPage;onNavigate:(page:CGPage)=>void;collapsed:boolean;onCollapse:()=>void;mobileOpen:boolean;onClose:()=>void}){
 const drawer=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!mobileOpen)return;
  const previous=document.activeElement as HTMLElement|null;
  Array.from(drawer.current?.querySelectorAll<HTMLButtonElement>('button')||[]).find(b=>b.getClientRects().length)?.focus();
  const handler=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onClose();}
   if(event.key==='Tab'){
    const buttons=Array.from(drawer.current?.querySelectorAll<HTMLButtonElement>('button')||[]).filter(b=>b.getClientRects().length);
    const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',handler);const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.removeEventListener('keydown',handler);document.body.style.overflow=overflow;previous?.focus();};
 },[mobileOpen,onClose]);
 return <>
  {mobileOpen&&<button className="cg-drawer-shade" aria-label="Close navigation overlay" tabIndex={-1} onClick={onClose}/>}
  <aside ref={drawer} id="workspace-navigation" className={`cg-sidebar ${collapsed?'is-collapsed':''} ${mobileOpen?'is-open':''}`} role={mobileOpen?'dialog':undefined} aria-modal={mobileOpen||undefined} aria-label="Workspace navigation">
   <div className="cg-sidebar-heading"><span>YOUR WORKSPACE</span><button className="cg-sidebar-toggle" onClick={onCollapse} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={!collapsed}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}</button><button className="cg-drawer-close" onClick={onClose} aria-label="Close navigation"><X size={22}/></button></div>
   <nav aria-label="Workspace sections">{links.map(([id,label,Icon])=><button key={id} title={label} aria-label={label} aria-current={page===id?'page':undefined} onClick={()=>{onNavigate(id);onClose();}}><Icon size={21}/><span>{label}</span></button>)}</nav>
  </aside>
 </>;
}
