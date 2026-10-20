import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronDown, Folder, FolderPlus, FileText, Image as ImageIcon, File, Search, Pencil, MoveRight, List, LayoutGrid, Grid2X2, Upload, MessageSquare, X, Sparkles } from 'lucide-react';
import type { ConversationThread } from '../types';
import { ASSET_CHANGE, listAssets, saveAsset, type StoredAsset } from '../lib/assets';
import { ReferenceArtwork } from './ReferenceArtwork';
import './library-explorer.css';

type FolderRecord={id:string;name:string;parent:string;createdAt:string;modifiedAt:string};
type Layout={version:1;folders:FolderRecord[];locations:Record<string,string>;modified:Record<string,string>};
type Entry={id:string;name:string;kind:'folder'|'thread'|'asset';created:string;modified:string;size?:number;thread?:ConversationThread;asset?:StoredAsset};
type View='details'|'small'|'medium'|'large';
type Sort='name-asc'|'name-desc'|'newest'|'oldest'|'modified';
const emptyLayout=():Layout=>({version:1,folders:[],locations:{},modified:{}});
function readLayout(key:string):Layout{try{const parsed=JSON.parse(localStorage.getItem(key)||'null');if(parsed?.version===1&&Array.isArray(parsed.folders))return {...emptyLayout(),...parsed};}catch{}return emptyLayout();}
function dateLabel(value:string){if(!value)return '—';const date=new Date(value);return Number.isNaN(date.getTime())?'—':date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
function bytes(value?:number){if(value===undefined)return '—';if(value<1024)return `${value} B`;if(value<1048576)return `${(value/1024).toFixed(1)} KB`;return `${(value/1048576).toFixed(1)} MB`;}
function Thumbnail({asset}:{asset:StoredAsset}){
  const [url,setUrl]=useState('');
  useEffect(()=>{if(!asset.blob||!asset.type.startsWith('image/')){setUrl('');return;}const next=URL.createObjectURL(asset.blob);setUrl(next);return()=>URL.revokeObjectURL(next);},[asset.blob,asset.type]);
  return url?<img className="cg-file-thumb" src={url} alt={asset.name}/>:asset.type.startsWith('image/')?<ImageIcon/>:<File/>;
}
function EntryIcon({entry}:{entry:Entry}){return entry.kind==='folder'?<Folder className="cg-folder-icon"/>:entry.kind==='thread'?<MessageSquare className="cg-thread-icon"/>:entry.asset?<Thumbnail asset={entry.asset}/>:<FileText/>;}
type Props={threads:ConversationThread[];storageScope:string;analysis:boolean;onBack:()=>void;onOpenThread:(thread:ConversationThread,tab:'transcript'|'insights')=>void;onRenameThread:(id:string,title:string)=>void;onImport:()=>void;onOpenLegacy:()=>void};
export function LibraryExplorer({threads,storageScope,analysis,onBack,onOpenThread,onRenameThread,onImport,onOpenLegacy}:Props){
  const storageKey=`chatgrab_explorer_v1_${storageScope}`;
  const [layout,setLayout]=useState(()=>readLayout(storageKey));
  const [assets,setAssets]=useState<StoredAsset[]>([]);
  const [current,setCurrent]=useState('root');const [selected,setSelected]=useState('');
  const [view,setView]=useState<View>(()=>{try{const saved=localStorage.getItem('chatgrab_explorer_view');return saved&&['details','small','medium','large'].includes(saved)?saved as View:'details';}catch{return 'details';}});
  const [sort,setSort]=useState<Sort>('name-asc');const [query,setQuery]=useState('');const [notice,setNotice]=useState('');
  const [editor,setEditor]=useState<{kind:'new'|'rename';value:string}|null>(null);const [destination,setDestination]=useState('root');const [showMove,setShowMove]=useState(false);
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(['root']));
  useEffect(()=>{let live=true;const load=()=>{void listAssets().then(next=>{if(live)setAssets(next);}).catch(()=>{if(live)setNotice('Supporting files could not be loaded from this browser.');});};load();window.addEventListener(ASSET_CHANGE,load);return()=>{live=false;window.removeEventListener(ASSET_CHANGE,load);};},[]);
  useEffect(()=>{const handler=(e:StorageEvent)=>{if(e.key===storageKey)setLayout(readLayout(storageKey));};window.addEventListener('storage',handler);return()=>window.removeEventListener('storage',handler);},[storageKey]);
  const commit=(next:Layout)=>{try{localStorage.setItem(storageKey,JSON.stringify(next));setLayout(next);return true;}catch{setNotice('Unable to save folder changes. Browser storage may be full.');return false;}};
  const entries=useMemo<Entry[]>(()=>[
    ...layout.folders.map(folder=>({id:folder.id,name:folder.name,kind:'folder' as const,created:folder.createdAt,modified:folder.modifiedAt})),
    ...threads.map(thread=>({id:`thread:${thread.id}`,name:thread.title,kind:'thread' as const,created:thread.originalCreatedAt||thread.capturedAt,modified:layout.modified[`thread:${thread.id}`]||thread.renamedAt||thread.capturedAt,size:new Blob([JSON.stringify(thread)]).size,thread})),
    ...assets.map(asset=>({id:`asset:${asset.id}`,name:asset.name,kind:'asset' as const,created:asset.uploadedAt,modified:layout.modified[`asset:${asset.id}`]||asset.originalModifiedAt||asset.uploadedAt,size:asset.size,asset})),
  ],[threads,assets,layout]);
  const byId=useMemo(()=>new Map(entries.map(entry=>[entry.id,entry])),[entries]);
  const parentOf=(entry:Entry):string=>entry.kind==='folder'?layout.folders.find(folder=>folder.id===entry.id)?.parent||'root':layout.locations[entry.id]||(entry.asset?.linkedThreadId&&threads.some(thread=>thread.id===entry.asset?.linkedThreadId)?`thread:${entry.asset.linkedThreadId}`:'root');
  const locationOf=(entry:Entry)=>{const parent=parentOf(entry);return parent==='root'||byId.has(parent)?parent:'root';};
  const currentEntry=byId.get(current);const selectedEntry=byId.get(selected);
  const displayed=entries.filter(entry=>locationOf(entry)===(currentEntry?current:'root')&&(!query||entry.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))).sort((a,b)=>{
    if(a.kind==='folder'&&b.kind!=='folder')return -1;if(b.kind==='folder'&&a.kind!=='folder')return 1;
    if(sort==='name-asc')return a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'});
    if(sort==='name-desc')return b.name.localeCompare(a.name,undefined,{numeric:true,sensitivity:'base'});
    const field=sort==='modified'?'modified':'created';const diff=(Date.parse(a[field])||0)-(Date.parse(b[field])||0);return sort==='oldest'?diff:-diff;
  });
  const ancestors=(id:string)=>{const result:string[]=[];const seen=new Set<string>();let node=byId.get(id);while(node&&!seen.has(node.id)){seen.add(node.id);result.unshift(node.id);node=byId.get(locationOf(node));}return result;};
  const crumbs=ancestors(current);const go=(id:string)=>{setCurrent(id);setSelected('');setQuery('');setNotice('');setExpanded(prev=>new Set([...prev,...ancestors(id),id]));};
  const open=(entry:Entry)=>{if(entry.kind==='folder')go(entry.id);else if(entry.thread)onOpenThread(entry.thread,analysis?'insights':'transcript');else if(entry.asset?.blob){const url=URL.createObjectURL(entry.asset.blob);window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),120000);}else setNotice('The original file is unavailable on this device.');};
  const chooseView=(next:View)=>{setView(next);try{localStorage.setItem('chatgrab_explorer_view',next);}catch{}};
  const saveName=async(e:React.FormEvent)=>{e.preventDefault();if(!editor)return;const name=editor.value.trim();if(!name||/[\\/:*?"<>|]/.test(name)){setNotice('Use a name without \\ / : * ? " < > |.');return;}
    const parent=editor.kind==='new'?current:selectedEntry?locationOf(selectedEntry):current;
    if(entries.some(entry=>entry.id!==(editor.kind==='rename'?selected:'')&&locationOf(entry)===parent&&entry.name.localeCompare(name,undefined,{sensitivity:'base'})===0)){setNotice('An item with that name already exists in this folder.');return;}
    const now=new Date().toISOString();
    if(editor.kind==='new'){const folder={id:`folder:${crypto.randomUUID()}`,name,parent,createdAt:now,modifiedAt:now};if(!commit({...layout,folders:[...layout.folders,folder]}))return;setSelected(folder.id);}
    else if(selectedEntry?.kind==='folder'){if(!commit({...layout,folders:layout.folders.map(folder=>folder.id===selected?{...folder,name,modifiedAt:now}:folder)}))return;}
    else if(selectedEntry?.thread)onRenameThread(selectedEntry.thread.id,name);
    else if(selectedEntry?.asset){try{await saveAsset({...selectedEntry.asset,name});}catch{setNotice('The file could not be renamed.');return;}}
    setEditor(null);setNotice(editor.kind==='new'?'Folder created.':'Name saved.');
  };
  const validDestination=(id:string)=>{if(!selectedEntry||selectedEntry.id===id)return false;return !ancestors(id).includes(selectedEntry.id);};
  const move=()=>{if(!selectedEntry||!validDestination(destination))return;if(entries.some(entry=>entry.id!==selected&&locationOf(entry)===destination&&entry.name.localeCompare(selectedEntry.name,undefined,{sensitivity:'base'})===0)){setNotice('An item with that name already exists in the destination folder.');return;}const now=new Date().toISOString();const next={...layout,modified:{...layout.modified,[selected]:now}};
    if(selectedEntry.kind==='folder')next.folders=layout.folders.map(folder=>folder.id===selected?{...folder,parent:destination,modifiedAt:now}:folder);else next.locations={...layout.locations,[selected]:destination};
    if(commit(next)){setShowMove(false);setSelected('');setNotice('Item moved. Original conversation and file content are preserved.');}
  };
  const tree=(parent:string,depth=0,seen=new Set<string>()):React.ReactNode=>{
    if(depth>20||seen.has(parent))return null;const visited=new Set([...seen,parent]);
    return entries.filter(entry=>(entry.kind==='folder'||entry.kind==='thread')&&locationOf(entry)===parent).sort((a,b)=>a.name.localeCompare(b.name)).map(entry=>{
      const children=entries.some(child=>locationOf(child)===entry.id);const isOpen=expanded.has(entry.id);
      return <div key={entry.id}><div className="cg-tree-row" style={{paddingLeft:12+depth*15}}>
        <button className="cg-tree-expand" disabled={!children} aria-label={`${isOpen?'Collapse':'Expand'} ${entry.name}`} aria-expanded={children?isOpen:undefined} onClick={()=>setExpanded(prev=>{const next=new Set(prev);if(next.has(entry.id))next.delete(entry.id);else next.add(entry.id);return next;})}>{children?(isOpen?<ChevronDown size={14}/>:<ChevronRight size={14}/>):null}</button>
        <button className={current===entry.id?'cg-tree-selected':''} onClick={()=>go(entry.id)} title={entry.name}>{entry.kind==='folder'?<Folder size={17}/>:<MessageSquare size={17}/>}<span>{entry.name}</span></button>
      </div>{children&&isOpen?tree(entry.id,depth+1,visited):null}</div>;
    });
  };
  return <section className="cg-explorer-page">
    <button className="cg-back" onClick={onBack}>← Workspace</button>
    <div className="cg-analysis-hero"><div><h1>{analysis?'Chat Analysis':'Your Library'}</h1><p>{analysis?'Find patterns. Review the evidence. Carry your best thinking forward.':'Your conversations and files, organized your way.'}</p></div><ReferenceArtwork name={analysis?'analyze':'organize'}/></div>
    <section className="cg-explorer" aria-label="Library file explorer">
      <div className="cg-explorer-toolbar">
        <button onClick={()=>{setNotice('');setEditor({kind:'new',value:''});}}><FolderPlus size={18}/> New folder</button>
        <button disabled={!selectedEntry} onClick={()=>{if(selectedEntry){setNotice('');setEditor({kind:'rename',value:selectedEntry.name});}}}><Pencil size={17}/> Rename</button>
        <button disabled={!selectedEntry} onClick={()=>{setNotice('');setDestination('root');setShowMove(true);}}><MoveRight size={17}/> Move to</button>
        <button onClick={onImport}><Upload size={17}/> Add files</button>
        <button onClick={onOpenLegacy}><Sparkles size={17}/> Ask / merge library</button>
        <label className="cg-explorer-search"><Search size={17}/><input aria-label="Search current folder" placeholder="Search this folder" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      </div>
      <div className="cg-explorer-location"><div className="cg-breadcrumb"><button aria-label="Up one folder" disabled={current==='root'} onClick={()=>go(currentEntry?locationOf(currentEntry):'root')}><ArrowLeft size={17}/></button><button onClick={()=>go('root')}>Library</button>{crumbs.map(id=><React.Fragment key={id}><ChevronRight size={15}/><button onClick={()=>go(id)}>{byId.get(id)?.name}</button></React.Fragment>)}</div>
        <div className="cg-explorer-options"><label>Sort <select aria-label="Sort files" value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="modified">Recently modified</option></select></label><label>View <select aria-label="File view" value={view} onChange={e=>chooseView(e.target.value as View)}><option value="details">Details</option><option value="small">Small icons</option><option value="medium">Medium icons</option><option value="large">Large icons</option></select></label></div>
      </div>
      {notice&&<p role="status" className="cg-explorer-notice">{notice}</p>}
      <div className="cg-explorer-body">
        <nav className="cg-folder-tree" aria-label="Library directory tree"><button className={'cg-tree-root '+(current==='root'?'cg-tree-selected':'')} onClick={()=>go('root')}><Folder size={19}/> Library</button>{tree('root')}</nav>
        <div className="cg-file-pane">
          {view==='details'?<div className="cg-details-scroll"><table className="cg-file-table"><thead><tr><th><button onClick={()=>setSort(sort==='name-asc'?'name-desc':'name-asc')}>Name</button></th><th>Type</th><th><button onClick={()=>setSort(sort==='newest'?'oldest':'newest')}>Date created / added</button></th><th><button onClick={()=>setSort('modified')}>Date modified</button></th><th>Size</th></tr></thead><tbody>{displayed.map(entry=><tr key={entry.id} className={selected===entry.id?'cg-file-selected':''}><td><button onClick={()=>setSelected(entry.id)} onDoubleClick={()=>open(entry)} onKeyDown={e=>{if(e.key==='Enter')open(entry);}} aria-label={`Select ${entry.name}`}><EntryIcon entry={entry}/><span>{entry.name}</span></button></td><td>{entry.kind==='thread'?'Conversation':entry.kind==='folder'?'Folder':entry.asset?.type||'File'}</td><td>{dateLabel(entry.created)}</td><td>{dateLabel(entry.modified)}</td><td>{bytes(entry.size)}</td></tr>)}</tbody></table></div>:
          <div className={`cg-file-grid cg-view-${view}`}>{displayed.map(entry=><button key={entry.id} className={'cg-file-tile '+(selected===entry.id?'cg-file-selected':'')} onClick={()=>setSelected(entry.id)} onDoubleClick={()=>open(entry)} onKeyDown={e=>{if(e.key==='Enter')open(entry);}} aria-label={`Select ${entry.name}`}><EntryIcon entry={entry}/><strong>{entry.name}</strong><span>{dateLabel(entry.created)}</span></button>)}</div>}
          {!displayed.length&&<div className="cg-folder-empty"><Folder size={40}/><h2>{query?'No matching files':'This folder is empty'}</h2><p>{query?'Try another name.':'Create a folder, capture a conversation, or add supporting files.'}</p></div>}
        </div>
        {selectedEntry&&<aside className="cg-file-inspector" aria-label="Selected item details"><EntryIcon entry={selectedEntry}/><h2>{selectedEntry.name}</h2><dl><dt>Type</dt><dd>{selectedEntry.kind==='thread'?'Conversation':selectedEntry.kind==='folder'?'Folder':selectedEntry.asset?.type}</dd><dt>Created</dt><dd>{dateLabel(selectedEntry.created)}</dd><dt>Modified</dt><dd>{dateLabel(selectedEntry.modified)}</dd><dt>Size</dt><dd>{bytes(selectedEntry.size)}</dd></dl>{selectedEntry.thread&&<p>{selectedEntry.thread.messages.length} messages · {assets.filter(asset=>asset.linkedThreadId===selectedEntry.thread?.id).length} linked files</p>}<button className="cg-explorer-primary" onClick={()=>open(selectedEntry)}>{selectedEntry.kind==='folder'?'Open folder':selectedEntry.thread?(analysis?'Analyze chat':'Open chat'):'Open file'}<ArrowRight size={17}/></button>{selectedEntry.thread&&<button onClick={()=>go(selectedEntry.id)}>Browse linked files</button>}</aside>}
      </div>
      <footer className="cg-explorer-footer"><span>{displayed.length} items{selectedEntry?' · 1 selected':''}</span><span>Folders and supporting files are saved on this device.</span></footer>
    </section>
    {editor&&<div className="cg-explorer-dialog-backdrop"><form className="cg-explorer-dialog" role="dialog" aria-modal="true" aria-label={editor.kind==='new'?'New folder':'Rename item'} onSubmit={e=>void saveName(e)}><h2>{editor.kind==='new'?'New folder':'Rename item'}</h2><label>Name<input autoFocus value={editor.value} onChange={e=>setEditor({...editor,value:e.target.value})}/></label>{notice&&<p role="status">{notice}</p>}<div><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="cg-explorer-primary" type="submit">{editor.kind==='new'?'Create folder':'Save name'}</button></div></form></div>}
    {showMove&&selectedEntry&&<div className="cg-explorer-dialog-backdrop"><form className="cg-explorer-dialog" role="dialog" aria-modal="true" aria-label="Move item" onSubmit={e=>{e.preventDefault();move();}}><h2>Move {selectedEntry.name}</h2><label>Destination<select aria-label="Destination" value={destination} onChange={e=>setDestination(e.target.value)}><option value="root">Library</option>{entries.filter(entry=>(entry.kind==='folder'||(selectedEntry.kind==='asset'&&entry.kind==='thread'))&&validDestination(entry.id)).map(entry=><option key={entry.id} value={entry.id}>{ancestors(entry.id).map(id=>byId.get(id)?.name).join(' / ')}</option>)}</select></label>{notice&&<p role="status">{notice}</p>}<div><button type="button" onClick={()=>setShowMove(false)}>Cancel</button><button className="cg-explorer-primary" type="submit" disabled={!validDestination(destination)}>Move here</button></div></form></div>}
  </section>;
}

