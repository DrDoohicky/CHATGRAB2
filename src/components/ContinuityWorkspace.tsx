import React, {useEffect,useMemo,useRef,useState} from 'react';
import type {ConversationThread} from '../types';
import {ArrowRight,BookOpen,CheckSquare,RefreshCw,Search,Download,Link2} from 'lucide-react';
import './continuity-workspace.css';
import {AIReviewWorkbench} from './AIReviewWorkbench';
const ANALYSES=[
 ['contradictions','Contradictions','Explain conflicting positions, what each was about and whether the difference is resolved.'],
 ['accomplishments','Accomplishments','What was actually completed, the evidence and what remains unverified.'],
 ['apologies','Apologies & corrections','Explain the triggering situation, what was acknowledged, what changed and what followed.'],
 ['decisions','Decisions','Record decisions, rationale, owners and subsequent developments.'],
 ['themes','Themes & tropes','Identify recurring patterns across conversations, with examples.'],
 ['neighbors','Neural neighbors','Find complementary ideas across otherwise separate chats and explain the connection.'],
 ['evolution','Evolution & drift','Trace how a concept, requirement or position evolved over time.'],
 ['narrative','Narrative synthesis','Write a coherent chronological narrative, grounded in the selected sources.'],
 ['unresolved','Unresolved work','Identify open questions, blockers and missing evidence.']
] as const;
type Finding={type:string;title:string;context:string;evidence?:Array<{threadId:string;messageId:string;excerpt:string}>;interpretation?:string;status?:string};
type Report={narrative:string;findings:Finding[];limitations:string[]};
type Props={threads:ConversationThread[];mode:'analytics'|'reintegrate';onSaveDerived?:(t:ConversationThread)=>void;onUpdateDerived?:(t:ConversationThread)=>void;onOpenThread:(t:ConversationThread)=>void};
const mapSelection=(items:string[],id:string)=>items.includes(id)?items.filter(x=>x!==id):[...items,id];
export function ContinuityWorkspace({threads,mode,onOpenThread,onSaveDerived,onUpdateDerived}:Props){
 const requestRef=useRef<AbortController|null>(null);
 const [selected,setSelected]=useState<string[]>([]);
 const [kinds,setKinds]=useState<string[]>(['contradictions','themes']);
 const [result,setResult]=useState<Report|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [target,setTarget]=useState<string>('');
 const [purpose,setPurpose]=useState('');
 const [draft,setDraft]=useState('');
 const [review,setReview]=useState<Record<number,{status:string;note:string}>>({});
 const [conflictReview,setConflictReview]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 const [filter,setFilter]=useState('');
 const [chosenMessages,setChosenMessages]=useState<string[]>([]);
 const chosen=useMemo(()=>threads.filter(t=>selected.includes(t.id)),[threads,selected]);
 const activeSelections=useMemo(()=>chosenMessages.filter(key=>chosen.some(t=>key.startsWith(t.id+'::'))),[chosenMessages,chosen]);
 useEffect(()=>{requestRef.current?.abort();setBusy(false);setResult(null);setDraft('');setError('');setConfirmed(false);setReview({});return()=>requestRef.current?.abort();},[mode,selected,kinds,chosenMessages,target,purpose,conflictReview,threads]);
 const makeDraft=()=>{
  if(chosen.length===0||!target||!purpose.trim()){setError('Choose a source conversation, a destination, and the reason for reintegration.');return;}
  const destination=threads.find(t=>t.id===target);
  const included=chosen.flatMap(t=>t.messages.map((m,i)=>({thread:t,id:String(m.id||'message-'+i),message:m})).filter(row=>chosenMessages.includes(row.thread.id+'::'+row.id)));
  if(included.length===0){setError('Select the specific source messages you want to carry forward.');return;}
  const lines=['# Reintegration proposal','', 'Status: DRAFT — not applied to original conversations','Purpose: '+purpose.trim(),'Destination: '+(destination?.title||'New continuity record'),'', '## Sources',...chosen.map(t=>'- '+t.title+' ('+t.id+')'),'', '## Conflict review',conflictReview.trim()||'Not yet reviewed', '', '## Review before applying','Verify original context, resolve contradictions, decide what should be carried forward, and preserve source references.','', '## Proposed source excerpts',...included.map(row=>'### '+row.thread.title+' — '+row.id+'\nRole: '+row.message.role+'\n'+row.message.content)];
  setDraft(lines.join('\n'));setError('');
 };
 const saveDerived=()=>{
  if(!confirmed||!draft||!conflictReview.trim()||!onSaveDerived)return;
  const destination=threads.find(t=>t.id===target);
  if(target!=='new'&&(!destination||selected.includes(target))){setError('Choose a destination outside the selected sources.');return;}
  const excerpts=chosen.flatMap(t=>t.messages.filter(m=>chosenMessages.includes(t.id+'::'+m.id)).map(m=>({...m,id:crypto.randomUUID(),sourceThreadId:t.id,sourceMessageId:m.id})));
  if(!excerpts.length)return;
  onSaveDerived({id:crypto.randomUUID(),title:'Continuity: '+(destination?.title||purpose.trim().slice(0,70)),capturedAt:new Date().toISOString(),model:'Source-linked continuity record',messages:[...(destination?.messages||[]).map(m=>({...m,id:crypto.randomUUID(),sourceThreadId:destination!.id,sourceMessageId:m.id})),...excerpts],reintegrationMeta:{purpose:purpose.trim(),conflictReview:conflictReview.trim(),destinationId:destination?.id,status:'active',sources:excerpts.map(m=>({threadId:m.sourceThreadId!,messageId:m.sourceMessageId!}))}});
  setDraft('');setConfirmed(false);
 };
 const run=async()=>{
  if(!chosen.length||!kinds.length){setError('Select at least one conversation and one analysis.');return;}
  requestRef.current?.abort();const controller=new AbortController();requestRef.current=controller;
  setBusy(true);setError('');setResult(null);
  try{
   const response=await fetch('/api/continuity-analysis',{signal:controller.signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({analyses:kinds,threads:chosen.map(t=>({id:t.id,title:t.title,capturedAt:t.capturedAt,messages:t.messages}))})});
   const data=await response.json().catch(()=>({error:'Analysis service did not return JSON.'}));
   if(!response.ok||!data.success)throw new Error(data.error||'Analysis did not complete.');
   if(!data.report||!Array.isArray(data.report.findings))throw new Error('Analysis response was not a valid report.');
   if(!controller.signal.aborted)setResult(data.report);
  }catch(e:any){if(!controller.signal.aborted)setError(e?.message||'Analysis failed. Nothing was changed.');}finally{if(requestRef.current===controller)setBusy(false);}
 };
 const download=(text:string,name:string)=>{const blob=new Blob([text],{type:name.endsWith('.json')?'application/json':'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="cg-continuity" id={mode==='analytics'?'workspace-analytics':'workspace-reintegration'} style={{scrollMarginTop:130}}>
  <div className="cg-continuity-head"><span>{mode==='analytics'?'WORKSPACE ANALYTICS':'GOVERNED REINTEGRATION'}</span><h2>{mode==='analytics'?'Analyze conversations together':'What are we reintegrating, where, and why?'}</h2><p>{mode==='analytics'?'Select source conversations, then select the kinds of context analysis you want. The report should explain what occurred and cite the underlying messages.':'Review a source-linked proposal, then save a separate continuity record. An existing destination is copied into the new record; original conversations are never overwritten.'}</p></div>
  {chosen.length>0&&<div className="cg-continuity-panel cg-message-picker"><h3>{mode==='analytics'?'Choose the exact passages to analyze':'Choose the exact passages to carry forward'}</h3><p className="cg-limits">{mode==='analytics'?'Choose context for a no-key ChatGPT analysis and optional Gemini second opinion below. Only selected source messages enter the request.':'Source excerpts stay attributed to their original conversation and message IDs. Saving creates a separate derived record after your confirmation.'}</p><div className="cg-picker-actions"><button onClick={()=>setChosenMessages(chosen.flatMap(t=>t.messages.map(m=>t.id+'::'+m.id)))}>Select all messages in chosen conversations</button><button onClick={()=>setChosenMessages([])}>Clear passages</button></div>
    {chosen.map(t=><details key={t.id}><summary>{t.title} — {t.messages.length} messages</summary><div className="cg-thread-options">{t.messages.map((m,i)=>{const id=String(m.id||'message-'+i);const key=t.id+'::'+id;return <label key={key}><input type="checkbox" checked={chosenMessages.includes(key)} onChange={()=>setChosenMessages(old=>mapSelection(old,key))}/><span><strong>{m.role} · {id}</strong><small>{m.content.slice(0,420)}{m.content.length>420?'…':''}</small></span></label>})}</div></details>)}
    <p className="cg-selection-count">{chosenMessages.filter(key=>selected.some(id=>key.startsWith(id+'::'))).length} passages selected</p></div>}
  <div className="cg-continuity-columns">
   <div className="cg-continuity-panel"><h3>1. Choose source conversations</h3>
    <label className="cg-filter"><Search size={17}/><input aria-label="Filter conversations" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search your library"/></label>
    <div className="cg-picker-actions"><button onClick={()=>setSelected(threads.map(t=>t.id))}>Select all ({threads.length})</button><button onClick={()=>setSelected([])}>Clear selection</button></div>
    <div className="cg-thread-options">{threads.filter(t=>t.title.toLowerCase().includes(filter.toLowerCase())).map(t=><label key={t.id}><input type="checkbox" checked={selected.includes(t.id)} onChange={()=>setSelected(old=>mapSelection(old,t.id))}/><span><strong>{t.title}</strong><small>{t.messages.length} messages</small></span><button type="button" onClick={e=>{e.preventDefault();onOpenThread(t);}} title="Open transcript"><ArrowRight size={16}/></button></label>)}
     {threads.length===0&&<p className="cg-empty">Capture or import a conversation first; it will appear here.</p>}
    </div><p className="cg-selection-count">{selected.length} conversation(s) selected</p>
   </div>
   <div className="cg-continuity-panel">
    {mode==='analytics'?<><h3>2. Choose analyses</h3><div className="cg-analytic-options">{ANALYSES.map(([id,name,desc])=><label key={id}><input type="checkbox" checked={kinds.includes(id)} onChange={()=>setKinds(old=>mapSelection(old,id))}/><span><strong>{name}</strong><small>{desc}</small></span></label>)}</div>
      <a className="cg-continuity-primary" href="#selected-source-review"><CheckSquare size={18}/>Prepare selected-source analysis <ArrowRight size={17}/></a><p className="cg-limits">Select source messages below and prepare a request for your own ChatGPT account. No developer login or API key is needed for this manual workflow.</p></>:
      <><h3>2. Destination and purpose</h3><label className="cg-form-label">Destination
        <select value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select destination</option><option value="new">New continuity record</option>{threads.filter(t=>!selected.includes(t.id)).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label className="cg-form-label">Why reintegrate this material?
         <textarea rows={5} value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Example: carry the corrected project decision and its evidence into a future work record."/></label>
        <label className="cg-form-label">Conflicts and review decisions<textarea rows={3} value={conflictReview} onChange={e=>setConflictReview(e.target.value)} placeholder="Describe conflicting passages and how they should be treated, or state that none were found."/></label>
        <button className="cg-continuity-primary" onClick={makeDraft} disabled={!chosen.length||!target||!purpose.trim()}><RefreshCw size={18}/>Prepare reintegration draft</button><p className="cg-limits">A draft is not a merge, a transfer, or a verified conclusion.</p></>}
   </div>
  </div>
  {mode==='analytics'&&<div id="selected-source-review" style={{scrollMarginTop:130}}><AIReviewWorkbench threads={chosen} selections={activeSelections} analyses={kinds}/></div>}
  {error&&<p role="alert" className="cg-continuity-error">{error}</p>}
  {mode==='analytics'&&result&&<article className="cg-analysis-report"><div className="cg-report-top"><h3><BookOpen size={20}/> Contextual findings</h3><button onClick={()=>download(JSON.stringify({...result,humanReview:review},null,2),'chatgrab-analysis.json')}><Download size={16}/> Export findings</button></div><p className="cg-narrative">{result.narrative}</p>{result.findings.map((f,i)=><section key={i} className="cg-finding"><h4>{f.title}</h4><small>{f.type} · {f.status||'Needs source review'}</small><p>{f.context}</p>{f.interpretation&&<p><strong>Interpretation:</strong> {f.interpretation}</p>}<div className="cg-evidence">{(f.evidence||[]).map((ev,j)=>{const original=threads.find(t=>t.id===ev.threadId);const message=original?.messages.find(m=>m.id===ev.messageId);return <div key={j}><Link2 size={14}/><span><strong>{original?.title||ev.threadId}</strong> · {ev.messageId} — {ev.excerpt||message?.content.slice(0,400)||'Message not available; verify citation'}{message&&<details><summary>Read full source message</summary><p>{message.content}</p></details>}</span>{original&&<button onClick={()=>onOpenThread(original)} aria-label={'Open source '+original.title}>Open source</button>}</div>})}</div><label className="cg-form-label">Human review: {f.title}<select value={review[i]?.status||'unreviewed'} onChange={e=>setReview(old=>({...old,[i]:{note:old[i]?.note||'',status:e.target.value}}))}><option value="unreviewed">Not reviewed</option><option value="verified">Checked against source</option><option value="questioned">Questionable / needs follow-up</option><option value="rejected">Rejected interpretation</option></select><textarea aria-label={'Review note for '+f.title} value={review[i]?.note||''} onChange={e=>setReview(old=>({...old,[i]:{status:old[i]?.status||'unreviewed',note:e.target.value}}))} placeholder="Explain your review decision"/></label></section>)}{result.limitations?.length>0&&<aside><strong>Limitations</strong><p>{result.limitations.join(' ')}</p></aside>}</article>}
  {mode==='reintegrate'&&draft&&<article className="cg-analysis-report"><div className="cg-report-top"><h3>Draft for human review</h3><button onClick={()=>download(draft,'chatgrab-reintegration-draft.md')}><Download size={17}/> Export draft</button></div><pre className="cg-draft">{draft}</pre>{onSaveDerived&&<><p className="cg-limits">Save creates a new record containing the destination snapshot (if selected) followed by your selected additions. Sources remain unchanged. Withdraw or restore the derived record below.</p><label className="cg-form-label"><span><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I checked the source excerpts and conflict notes and approve this new record.</span></label><button className="cg-continuity-primary" disabled={!confirmed||!conflictReview.trim()} onClick={saveDerived}>Save reviewed continuity record</button>{!conflictReview.trim()&&<p className="cg-limits">Complete the conflict review before saving.</p>}</>}</article>}
  {mode==='reintegrate'&&threads.some(t=>t.reintegrationMeta)&&<article className="cg-analysis-report"><h3>Continuity record history</h3>{threads.filter(t=>t.reintegrationMeta).map(t=><div className="cg-export-row" key={t.id}><div><strong>{t.title}</strong><small>{t.reintegrationMeta!.status} · {new Date(t.capturedAt).toLocaleString()}</small></div><button onClick={()=>onOpenThread(t)}>Open record</button>{onUpdateDerived&&<button onClick={()=>onUpdateDerived({...t,reintegrationMeta:{...t.reintegrationMeta!,status:t.reintegrationMeta!.status==='active'?'withdrawn':'active'}})}>{t.reintegrationMeta!.status==='active'?'Withdraw record':'Restore record'}</button>}</div>)}</article>}
 </section>;
}
