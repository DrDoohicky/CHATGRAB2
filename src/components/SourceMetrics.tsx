import {sourceCapsule} from '../lib/source-capsule';
import React,{useMemo,useState} from 'react';
import type {ConversationThread} from '../types';
import {sourceMetrics} from '../lib/source-metrics';
export function SourceMetrics({threads}:{threads:ConversationThread[]}){
 const [query,setQuery]=useState('');
 const capsules=threads.filter(t=>sourceCapsule(t)).length;
 const result=useMemo(()=>sourceMetrics(threads,query),[threads,query]);
 return <section aria-label="Reproducible source metrics"><h2>Source metrics · calculated locally</h2><p>These counts describe all the messages saved in the selected conversations, even when your AI request uses a smaller batch. They help you see how much material you have. Counts run in this browser without an AI call. If you imported only part of a conversation, only that saved part is counted.</p>
 <dl className="cg-source-counts"><div><dt>Saved source records</dt><dd>{result.total}</dd></div><div><dt>User</dt><dd>{result.roles.user}</dd></div><div><dt>Assistant</dt><dd>{result.roles.assistant}</dd></div><div><dt>System</dt><dd>{result.roles.system}</dd></div><div><dt>Unknown role</dt><dd>{result.roles.unknown}</dd></div><div><dt>Text characters</dt><dd>{result.characters}</dd></div></dl>
 {capsules>0&&<p><strong>{capsules} continuity capsule(s)</strong> are source documents, not complete chat transcripts. Each is retained in one storage record; its reconstructed events are shown separately above and are not counted as original chat turns.</p>}<p>Speaker counts use the labels in the imported file. When the speaker is unknown, it stays unknown. Character totals use the browser’s text units (UTF-16), so some symbols count as more than one.</p>
 <details><summary>Activity from original message timestamps</summary><p>{result.dated} dated messages; {result.undated} without a usable message date ({result.invalidDates} invalid). Capture dates are never substituted. Dates below use UTC.</p>{result.activity.length?<ul>{result.activity.map(([day,count])=><li key={day}>{day}: {count} messages</li>)}</ul>:<p>No timestamp-based timeline is available for this selection.</p>}</details>
 <details><summary>Frequent literal keywords</summary><p>See which words appear most often. This counts groups of letters or numbers with at least three characters, ignores capitalization and a fixed list of common English words, and includes code and quoted text. Frequent words can help you decide where to look; they are not an AI explanation of the conversation’s themes.</p><ul>{result.keywords.map(([word,count])=><li key={word}>{word}: {count}</li>)}</ul></details>
 <label>Search source messages<input type="search" value={query} onChange={e=>setQuery(e.target.value)} /></label><p role="status">{result.matches.length} matching messages (case-insensitive literal substring).</p>
 {result.matches.slice(0,25).map(m=><details key={JSON.stringify([m.threadId,m.messageId])}><summary>{m.threadId} / {m.messageId} · {m.role}</summary><pre>{m.content}</pre></details>)}{result.matches.length>25&&<p>First 25 matches shown. Refine the search to inspect more; all matches are counted.</p>}
 <p>To explore why a decision changed or what a passage means, use the AI review steps below. Word counts show repetition; interpreting its meaning requires reading and review.</p></section>;
}
