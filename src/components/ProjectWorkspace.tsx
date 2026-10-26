import React, { useEffect, useState } from 'react';
import { FolderPlus, Image as ImageIcon, FileText, Link2, MessageSquare, Trash2, GripVertical, Download, Plus } from 'lucide-react';
import type { ConversationThread } from '../types';
import './project-workspace.css';

type ItemKind='note'|'image'|'link'|'conversation';
type ProjectItem={id:string;kind:ItemKind;title:string;body:string;order:number;sourceId?:string};
type Project={id:string;title:string;description:string;items:ProjectItem[];createdAt:string};
const storageKey=(scope:string)=>'chatgrab_projects_v1_'+scope;
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
const load=(scope:string):Project[]=>{try{const value=JSON.parse(localStorage.getItem(storageKey(scope))||'[]');return Array.isArray(value)?value.filter(p=>p&&typeof p.title==='string'&&Array.isArray(p.items)):[];}catch{return[];}};
function saveBackup(projects:Project[]){const url=URL.createObjectURL(new Blob([JSON.stringify({schema:'chatgrab-projects-v1',projects},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='chatgrab-projects-backup.json';a.click();URL.revokeObjectURL(url);}
export function ProjectWorkspace({threads,scope}:{threads:ConversationThread[];scope:string}){
 const [projects,setProjects]=useState<Project[]>(()=>load(scope));
 const [selected,setSelected]=useState<string|null>(null);
 const [notice,setNotice]=useState('');
 const [dragging,setDragging]=useState<string|null>(null);
 useEffect(()=>{setProjects(load(scope));setSelected(null);},[scope]);
 useEffect(()=>{try{localStorage.setItem(storageKey(scope),JSON.stringify(projects));}catch{setNotice('Storage is full. Export a backup; new changes could not be saved.');}},[scope,projects]);
 const current=projects.find(p=>p.id===selected)||null;
 const change=(f:(p:Project)=>Project)=>setProjects(prev=>prev.map(p=>p.id===selected?f(p):p));
 const create=()=>{const title=window.prompt('New project name');if(!title?.trim())return;const p:Project={id:uid(),title:title.trim(),description:'',items:[],createdAt:new Date().toISOString()};setProjects(old=>[p,...old]);setSelected(p.id);};
 const add=(kind:ItemKind)=>{if(!current)return;
  if(kind==='conversation'){if(!threads.length){setNotice('Import a conversation into your Library first.');return;}const picked=window.prompt('Choose a saved conversation number:\n'+threads.slice(0,25).map((t,i)=>(i+1)+'. '+t.title).join('\n'));const index=Number(picked)-1;const thread=threads[index];if(!thread)return;change(p=>({...p,items:[...p.items,{id:uid(),kind,title:thread.title,body:thread.messages.length+' messages — reference to existing library record',sourceId:thread.id,order:p.items.length}]}));return;}
  if(kind==='image'){document.getElementById('cg-project-file')?.click();return;}
  const title=window.prompt(kind==='note'?'Note heading':'Link label');if(!title?.trim())return;
  const body=window.prompt(kind==='note'?'Write your note':'Paste the full https:// link')||'';
  if(kind==='link'&&!/^https:\/\//i.test(body)){setNotice('Use an https:// link.');return;}
  change(p=>({...p,items:[...p.items,{id:uid(),kind,title:title.trim(),body,order:p.items.length}]}));};
 const addImage=async(file?:File)=>{if(!file||!current)return;if(!file.type.startsWith('image/')||file.size>700000){setNotice('Choose an image smaller than 700 KB for browser-local storage.');return;}
  const reader=new FileReader();reader.onload=()=>change(p=>({...p,items:[...p.items,{id:uid(),kind:'image',title:file.name,body:String(reader.result),order:p.items.length}]}));reader.readAsDataURL(file);
 };
 const move=(source:string,target:string)=>{if(source===target)return;change(p=>{const items=[...p.items].sort((a,b)=>a.order-b.order);const from=items.findIndex(i=>i.id===source),to=items.findIndex(i=>i.id===target);if(from<0||to<0)return p;const [item]=items.splice(from,1);items.splice(to,0,item);return {...p,items:items.map((i,order)=>({...i,order}))};});};
 const ordered=[...(current?.items||[])].sort((a,b)=>a.order-b.order);
 return <section className="cg-projects">
  <header className="cg-projects-heading"><div><p className="cg-project-eyebrow">YOUR WORKSPACE</p><h1>Projects</h1><p>Arrange saved conversations, notes, links and images in one place.</p></div><button type="button" className="cg-project-primary" onClick={create}><FolderPlus size={19}/> New project</button></header>
  {notice&&<p role="status" className="cg-project-notice">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice">×</button></p>}
  {!current?<><div className="cg-project-summary"><h2>Your projects</h2><button onClick={()=>saveBackup(projects)}><Download size={17}/> Export backup</button></div><div className="cg-project-list">{projects.length?projects.map(p=><button className="cg-project-folder" key={p.id} onClick={()=>setSelected(p.id)}><FolderPlus size={29}/><strong>{p.title}</strong><span>{p.items.length} items</span></button>):<div className="cg-project-empty">No projects yet. Create a project to collect your work.</div>}</div></>
  :<><div className="cg-project-toolbar"><button onClick={()=>setSelected(null)}>← All projects</button><strong>{current.title}</strong><button onClick={()=>{const title=window.prompt('Rename project',current.title);if(title?.trim())change(p=>({...p,title:title.trim()}));}}>Rename</button><button onClick={()=>saveBackup(projects)}><Download size={16}/> Backup</button></div>
   <div className="cg-project-hero"><div><p className="cg-project-eyebrow">PROJECT WORKSPACE</p><h2>{current.title}</h2><p>Drag cards to reorder on desktop, or use Move earlier/later on mobile. Saved in this browser.</p></div><div className="cg-project-count"><strong>{ordered.length}</strong><span>saved items</span></div></div>
   <div className="cg-project-actions"><button onClick={()=>add('note')}><FileText size={18}/> Add note</button><button onClick={()=>add('image')}><ImageIcon size={18}/> Add image</button><button onClick={()=>add('conversation')}><MessageSquare size={18}/> Add conversation</button><button onClick={()=>add('link')}><Link2 size={18}/> Add link</button><input id="cg-project-file" type="file" accept="image/*" hidden onChange={e=>{void addImage(e.target.files?.[0]);e.target.value='';}}/></div>
   <div className="cg-project-board" aria-label="Project items">{ordered.length?ordered.map((item,index)=><article key={item.id} className="cg-project-card" draggable onDragStart={e=>{setDragging(item.id);e.dataTransfer.setData('text/plain',item.id);e.dataTransfer.effectAllowed='move';}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const from=e.dataTransfer.getData('text/plain')||dragging;if(from)move(from,item.id);setDragging(null);}} onDragEnd={()=>setDragging(null)}>
    <div className="cg-project-card-top"><GripVertical size={18}/><small>{item.kind}</small><button aria-label={'Delete '+item.title} onClick={()=>{if(window.confirm('Remove this item from the project?'))change(p=>({...p,items:p.items.filter(i=>i.id!==item.id)}));}}><Trash2 size={17}/></button></div>
    <h3>{item.title}</h3>{item.kind==='image'?<img src={item.body} alt={item.title}/>:item.kind==='link'?<a href={item.body} target="_blank" rel="noreferrer">{item.body}</a>:<p>{item.body}</p>}
    <div className="cg-project-card-order"><button disabled={index===0} onClick={()=>move(item.id,ordered[index-1].id)}>Move earlier</button><button disabled={index===ordered.length-1} onClick={()=>move(item.id,ordered[index+1].id)}>Move later</button></div>
   </article>):<div className="cg-project-empty">Add a note, image, link or saved conversation to begin your board.</div>}</div>
  </>}
  <p className="cg-project-footnote">Projects v1: stored locally in this browser. No automatic cross-device sync, collaboration or cloud upload. Export regular backups. Conversation cards link by ID to saved Library records.</p>
 </section>;
}
