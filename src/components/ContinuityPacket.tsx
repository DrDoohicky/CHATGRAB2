import {buildContinuityPacket} from '../lib/continuity-packet';
import React from 'react';
import type {ConversationThread} from '../types';
import {DownloadFile} from './DownloadFile';
export function ContinuityPacket({record}:{record:ConversationThread}){
 const meta=record.reintegrationMeta!;
 const text=buildContinuityPacket(record);
 return <details className="mt-3 border rounded-xl p-3"><summary className="font-bold cursor-pointer">Restore in a fresh ChatGPT conversation</summary><p>1. Review the complete packet below. Download a backup before leaving.</p><p>2. Open a new conversation in your own ChatGPT account. Paste the packet, or attach its Markdown file. This is a manual action; ChatGrab does not send it for you.</p><p>3. Compare the reply to each source. Check the current decision, earlier conflict, unresolved work and exact source IDs. Correct any mistake in ChatGPT before continuing. A reply is not proof of implementation.</p>{meta.status==='withdrawn'&&<p role="alert">This record is withdrawn. Keep it for history; choose an active reviewed revision for new work.</p>}<textarea aria-label={'Fresh-chat packet for '+record.title} readOnly value={text} rows={8} className="w-full border rounded p-3"/><DownloadFile text={text} filename={'chatgrab-continuity-'+record.id+'.md'} type="text/markdown">Download fresh-chat packet</DownloadFile><DownloadFile text={JSON.stringify(record,null,2)} filename={'chatgrab-continuity-'+record.id+'.json'} type="application/json">Download continuity record JSON</DownloadFile><p>Verification remains yours: this application cannot observe your authenticated ChatGPT reply. If needed, import the reply as a separate source for review.</p></details>;
}
