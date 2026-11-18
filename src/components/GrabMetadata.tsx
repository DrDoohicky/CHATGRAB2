import React from 'react';
import type {ConversationThread} from '../types';
import {grabDateRange,grabTopicSummary} from '../lib/grab-metadata';
export const GrabMetadata=React.memo(function GrabMetadata({thread}:{thread:ConversationThread}){
 const date=new Date(thread.capturedAt);
 return <span className="cg-grab-metadata"><span>{grabDateRange(thread)}</span><span>Captured: {Number.isFinite(date.getTime())?date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'Unavailable'}</span><span className="cg-grab-summary">{grabTopicSummary(thread)}</span></span>;
});
