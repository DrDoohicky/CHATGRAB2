import {sourceCapsule} from '../lib/source-capsule';
import React from 'react';
import type {ConversationThread} from '../types';
import {grabDateRange,grabTopicSummary} from '../lib/grab-metadata';
export const GrabMetadata=React.memo(function GrabMetadata({thread}:{thread:ConversationThread}){
 const capsule=sourceCapsule(thread);
 const date=new Date(thread.capturedAt);
 return <span className="cg-grab-metadata"><span>{capsule?'Continuity reconstruction · original message dates not established':grabDateRange(thread)}</span><span>Captured: {Number.isFinite(date.getTime())?date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'Unavailable'}</span><span className="cg-grab-summary">{capsule?`${capsule.events.length} reconstructed events · ${capsule.fields.length} source sections`:grabTopicSummary(thread)}</span></span>;
});
