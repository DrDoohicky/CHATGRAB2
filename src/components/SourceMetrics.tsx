import React,{useMemo,useState} from 'react';
import type {ConversationThread} from '../types';
import {sourceMetrics} from '../lib/source-metrics';
export function SourceMetrics({threads}:{threads:ConversationThread[]}){
 const [query,setQuery]=useState('');
 const result=useMemo(()=>sourceMetrics(threads,query),[threads,query]);
 return <section aria-label="Reproducible source metrics"><h2>Source metrics · calculated locally</h2><p>These counts cover the complete selected saved conversations, independently of the prompt batch and filters below. No AI call or API key is used. Text-only recovery may be incomplete; counts describe saved records, not the whole original conversation.</p>
 <dl className="cg-source-counts"><div><dt>Messages</dt><dd>{result.total}</dd></div><div><dt>User</dt><dd>{result.roles.user}</dd></div><div><dt>Assistant</dt><dd>{result.roles.assistant}</dd></div><div><dt>System</dt><dd>{result.roles.system}</dd></div><div><dt>Unknown role</dt><dd>{result.roles.unknown}</dd></div><div><dt>Text characters</dt><dd>{result.characters}</dd></div></dl>
 <p>Roles follow imported labels; verbatim imports marked “roles unknown” remain unknown. Characters are JavaScript UTF-16 code units.</p>
 <details><summary>Activity from original message timestamps</summary><p>{result.dated} dated messages; {result.undated} without a usable message date ({result.invalidDates} invalid). Capture dates are never substituted. Dates below use UTC.</p>{result.activity.length?<ul>{result.activity.map(([day,count])=><li key={day}>{day}: {count} messages</li>)}</ul>:<p>No timestamp-based timeline is available for this selection.</p>}</details>
 <details><summary>Frequent literal keywords</summary><p>Case-insensitive Unicode letter/number runs of at least three characters, excluding a fixed English stopword list. Counts include code and quotations. These are token frequencies, not inferred themes.</p><ul>{result.keywords.map(([word,count])=><li key={word}>{word}: {count}</li>)}</ul></details>
 <label>Search source messages<input type="search" value={query} onChange={e=>setQuery(e.target.value)} /></label><p role="status">{result.matches.length} matching messages (case-insensitive literal substring).</p>
 {result.matches.slice(0,25).map(m=><details key={JSON.stringify([m.threadId,m.messageId])}><summary>{m.threadId} / {m.messageId} · {m.role}</summary><pre>{m.content}</pre></details>)}{result.matches.length>25&&<p>First 25 matches shown. Refine the search to inspect more; all matches are counted.</p>}
 <p>Decision, action, contradiction, unresolved-work and theme interpretation still require the reviewed manual AI workflow below. Those capabilities are not supplied by keyword counts.</p></section>;
}
