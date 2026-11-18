import React from 'react';
import {sourceCapsule} from '../lib/source-capsule';
import type {ConversationThread} from '../types';
import {DownloadFile} from './DownloadFile';
export function SourceDocumentPanel({thread}:{thread:ConversationThread}){
 const detected=sourceCapsule(thread);
 if(!detected&&(thread.model!=='Structured JSON source — roles unknown'||thread.messages.length!==1))return null;
 const raw=thread.messages[0].content;let source:any;try{source=JSON.parse(raw.replace(/^\uFEFF/,''));}catch{return null;}
 if(!source||typeof source!=='object')return null;
 const capsule=source?.schema==='chatgrab.governed-continuity-capsule.v1';
 const events=Array.isArray(source?.conversation_history_reconstruction)?source.conversation_history_reconstruction.filter((event:unknown)=>event&&typeof event==='object'):[];
 const excerpt=typeof source?.verbatim_source_excerpt?.text==='string'?source.verbatim_source_excerpt.text:'';
 return <section className="cg-source-document cg-destination-panel" aria-label="Structured source document"><h2>{capsule?'Continuity capsule':'Structured JSON source'}</h2><p>{capsule?'A reconstruction with a supplied excerpt, not a complete conversation transcript.':'A preserved source document, not a conversation transcript.'} Claims and links inside are imported material, not independently verified evidence. The source below is stored in one record; its user label does not identify an original speaker.</p><p><strong>{Object.keys(source).length} top-level fields{capsule&&` · ${events.length} reconstructed events · ${Array.from(excerpt).length.toLocaleString()} excerpt characters`}</strong></p>{capsule&&<details><summary>Review the supplied event outline</summary><ol>{events.map((event:any,i:number)=><li key={i}><strong>{typeof event.topic==='string'?event.topic:`Event ${i+1}`}</strong><div>Source pointer: /conversation_history_reconstruction/{i}</div><pre>{JSON.stringify(event,null,2)}</pre>{typeof event.speaker==='string'?` — attributed to ${event.speaker} in the source`:''}</li>)}</ol></details>}{capsule&&<details><summary>Inspect source sections and provenance</summary><p>These are the supplied document’s own statements. They are not new AI findings. Original completeness, facts, proposals and unknowns remain separate below.</p>{Object.entries(source).map(([key,value])=><details key={key}><summary>/{key}</summary><pre>{typeof value==='string'?value:JSON.stringify(value,null,2)}</pre></details>)}</details>}<DownloadFile text={raw} filename="chatgrab-original-source.json" type="application/json">Download original JSON source</DownloadFile></section>;
}
