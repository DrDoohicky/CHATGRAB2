import React,{useEffect,useMemo,useRef,useState} from 'react';
import {X,Mic,Square,Volume2,Send} from 'lucide-react';
import type {ConversationThread,SupportAsset} from '../types';
import {listAssets,ASSET_CHANGE} from '../lib/assets';
import {buildCompanionContext} from '../lib/companion-context';
import './chatgpt-companion.css';
type Turn={role:'user'|'assistant';content:string};
type Props={isOpen:boolean;onClose:()=>void;activeThread:ConversationThread|null;threads:ConversationThread[];page:string};
export function ChatGPTCompanion({isOpen,onClose,activeThread,threads,page}:Props){
 const [selected,setSelected]=useState<string[]>([]),[assets,setAssets]=useState<SupportAsset[]>([]);
 const [draft,setDraft]=useState(''),[turns,setTurns]=useState<Turn[]>([]),[error,setError]=useState('');
 const [connected,setConnected]=useState(false),[busy,setBusy]=useState(false),[listening,setListening]=useState(false),[interim,setInterim]=useState('');
 const [recognitionAvailable,setRecognitionAvailable]=useState(false),[speechAvailable,setSpeechAvailable]=useState(false),[readReplies,setReadReplies]=useState(false);
 const recognition=useRef<any>(null),panel=useRef<HTMLElement>(null),request=useRef<AbortController|null>(null);
 const context=useMemo(()=>buildCompanionContext(threads,assets,selected,page),[threads,assets,selected,page]);
 const contextKey=JSON.stringify(context);
 useEffect(()=>{request.current?.abort();setBusy(false);setTurns([]);},[contextKey]);
 useEffect(()=>{if(activeThread)setSelected(old=>old.length?old:[activeThread.id]);},[activeThread?.id]);
 useEffect(()=>{
  if(!isOpen)return;
  const previous=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const win=window as any;setRecognitionAvailable(!!(win.SpeechRecognition||win.webkitSpeechRecognition));setSpeechAvailable('speechSynthesis' in window);
  const controller=new AbortController();
  fetch('/api/chatgpt/status',{signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then(s=>setConnected(s.connected===true)).catch(()=>{if(!controller.signal.aborted)setConnected(false);});
  let live=true;const load=()=>{listAssets().then(a=>{if(live)setAssets(a);}).catch(()=>{if(live)setError('Supporting files could not be loaded.');});};load();window.addEventListener(ASSET_CHANGE,load);
  const keyboard=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onClose();}
   if(event.key==='Tab'){
    const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),textarea,select,input,a[href],summary')||[]).filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',keyboard);
  return()=>{live=false;controller.abort();request.current?.abort();recognition.current?.abort();recognition.current=null;window.speechSynthesis?.cancel();setListening(false);setInterim('');window.removeEventListener(ASSET_CHANGE,load);document.removeEventListener('keydown',keyboard);previous?.focus();};
 },[isOpen,onClose]);
 const speak=(text:string)=>{if(!speechAvailable)return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=navigator.language;utterance.onerror=()=>setError('Spoken playback could not complete. The text remains available.');window.speechSynthesis.speak(utterance);};
 const dictate=()=>{
  if(listening){recognition.current?.stop();return;}
  const win=window as any,Recognizer=win.SpeechRecognition||win.webkitSpeechRecognition;if(!Recognizer)return;
  const next=new Recognizer();recognition.current=next;next.lang=navigator.language;next.interimResults=true;next.continuous=false;setError('');
  next.onstart=()=>setListening(true);
  next.onresult=(event:any)=>{let pending='';for(let i=event.resultIndex;i<event.results.length;i++){const text=event.results[i][0].transcript;if(event.results[i].isFinal)setDraft(old=>(old.trim()?old.trim()+' ':'')+text);else pending+=text;}setInterim(pending);};
  next.onerror=(event:any)=>{if(event.error!=='aborted')setError(event.error==='not-allowed'?'Microphone access was denied. You can still type your question.':'Voice input stopped. Review the text or type your question.');setListening(false);};
  next.onend=()=>{setListening(false);setInterim('');recognition.current=null;};
  try{next.start();}catch{setError('Voice input could not start. You can still type.');}
 };
 const send=async(event:React.FormEvent)=>{
  event.preventDefault();if(!connected||!draft.trim()||busy)return;
  recognition.current?.stop();const messages=[...turns,{role:'user' as const,content:draft.trim()}];const controller=new AbortController();request.current=controller;setBusy(true);setError('');
  try{const response=await fetch('/api/chat',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,threadContext:context})});const data=await response.json();if(!response.ok||!data.success||typeof data.reply!=='string')throw Error(data.error||'The assistant did not return a completed response.');setTurns([...messages,{role:'assistant',content:data.reply}]);setDraft('');if(readReplies)speak(data.reply);}
  catch(err:any){if(!controller.signal.aborted)setError(err.message||'The request failed. Your draft remains here.');}finally{if(request.current===controller)setBusy(false);}
 };
 if(!isOpen)return null;
 return <section ref={panel} className="cg-companion" role="dialog" aria-modal="true" aria-label="ChatGPT assistant">
  <header><div><h2>ChatGPT assistant</h2><small>{connected?'ChatGPT connected':'AI replies pending ChatGPT approval'}</small></div><button onClick={onClose} aria-label="Close assistant"><X size={22}/></button></header>
  <div className="cg-companion-body">
   {!connected&&<p className="cg-companion-status">You can prepare your question and review its context now. AI replies will become available after hosted ChatGPT sign-in is approved and integrated. No API key is needed.</p>}
   <details open><summary>Connected context · {context.conversations.length} chats · {context.files.length} files</summary><p>Current page: <strong>{page}</strong>. Choose the chats the assistant may use. Their linked text files and source references are included; other chats stay excluded.</p><div className="cg-companion-sources">{threads.length?threads.map(t=><label key={t.id}><input type="checkbox" checked={selected.includes(t.id)} onChange={()=>setSelected(old=>old.includes(t.id)?old.filter(id=>id!==t.id):[...old,t.id])}/><span>{t.title}</span></label>):<p>Capture a chat to connect its context.</p>}</div><details><summary>Preview exactly what would be sent</summary><pre>{JSON.stringify(context,null,2)}</pre></details>{context.files.map(f=><p key={f.id}>{f.name}{f.contentAvailable?' — text included':' — metadata only; file contents are not readable text'}</p>)}{context.warnings.map(w=><p key={w} className="cg-companion-note">{w}</p>)}</details>
   {turns.map((turn,index)=><article key={index}><strong>{turn.role==='user'?'You':'ChatGPT'}</strong><p>{turn.content}</p>{turn.role==='assistant'&&<button disabled={!speechAvailable} onClick={()=>speak(turn.content)}><Volume2 size={16}/>Read reply aloud</button>}</article>)}
   <div className="cg-companion-voice"><button disabled={!speechAvailable||!context.conversations.length} onClick={()=>speak(context.conversations.map(t=>t.title+'. '+t.messages.map(m=>m.content).join('\n')).join('\n').slice(0,10000))}><Volume2 size={16}/>Read selected sources</button><button disabled={!speechAvailable} onClick={()=>window.speechSynthesis.cancel()}><Square size={14}/>Stop speaking</button><label><input type="checkbox" checked={readReplies} disabled={!speechAvailable} onChange={e=>setReadReplies(e.target.checked)}/>Speak AI replies</label></div>
   {!speechAvailable&&<p className="cg-companion-note">This browser does not support spoken playback.</p>}
   {error&&<p role="alert" className="cg-companion-error">{error}</p>}
  </div>
  <form onSubmit={send}><label htmlFor="companion-question">Ask about your connected context</label><textarea id="companion-question" value={draft} onChange={e=>setDraft(e.target.value)} rows={3} placeholder="What changed across these chats?"/>{interim&&<p role="status">{interim}</p>}<div><button type="button" disabled={!recognitionAvailable||busy} onClick={dictate} aria-pressed={listening}>{listening?<Square size={16}/>:<Mic size={16}/>} {listening?'Stop dictation':'Voice input'}</button><button type="submit" disabled={!connected||busy||!draft.trim()}><Send size={16}/>{busy?'Waiting for ChatGPT…':'Ask ChatGPT'}</button></div><small>{recognitionAvailable?'Dictation uses your browser’s speech service. Review the text before sending.':'Voice input is unavailable in this browser. Type here or use your device keyboard’s dictation.'} Nothing is sent automatically when you speak.</small></form>
 </section>;
}
