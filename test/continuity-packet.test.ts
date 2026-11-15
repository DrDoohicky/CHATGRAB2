import test from 'node:test';
import assert from 'node:assert/strict';
import {buildContinuityPacket} from '../src/lib/continuity-packet';
import {parseConversationFile} from '../src/lib/importConversations';
import type {ConversationThread} from '../src/types';
const record:ConversationThread={id:'packet',title:'Reviewed packet',capturedAt:'2026-11-15T12:00:00Z',model:'source collection',messages:[{id:'copy',role:'system',content:'Original\n\n  code',sourceThreadId:'source',sourceMessageId:'m1',packetAnnotation:{category:'constraint',rationale:'Preserve the low-noise requirement.'}}],reintegrationMeta:{purpose:'Plan next session',conflictReview:'No disagreement found',status:'active',sources:[{threadId:'source',messageId:'m1'}]}};
test('packet keeps quote, source identity and distinct user rationale through export and reimport',()=>{
 const before=structuredClone(record);const imported=parseConversationFile(JSON.stringify(record),'packet.json',[])[0];
 assert.deepEqual(imported.messages,record.messages);const packet=buildContinuityPacket(imported);
 assert.match(packet,/SOURCE source \/ m1 \(system\)/);assert.match(packet,/User category: constraint/);assert.match(packet,/User reason for including this: Preserve the low-noise requirement\./);assert.ok(packet.includes('BEGIN QUOTED SOURCE\nOriginal\n\n  code\nEND QUOTED SOURCE'));assert.deepEqual(record,before);
});
test('legacy continuity records with no category continue to export',()=>{
 const legacy=structuredClone(record);delete legacy.messages[0].packetAnnotation;assert.ok(buildContinuityPacket(legacy).includes('Original\n\n  code'));
});
test('import rejects unsupported or oversized annotations before accepting a record',()=>{
 for(const value of [null,{category:'verified',rationale:'x'},{category:'decision',rationale:4},{category:'decision',rationale:'x'.repeat(2001)}]){
  const invalid=structuredClone(record) as any;invalid.messages[0].packetAnnotation=value;assert.throws(()=>parseConversationFile(JSON.stringify(invalid),'packet.json',[]),/packet note/);
 }
});
test('collision import remaps source references while retaining category and reason',()=>{
 const source:ConversationThread={id:'source',title:'Source',capturedAt:record.capturedAt,model:'test',messages:[{id:'m1',role:'user',content:'New original'}]};
 const existing={...source,messages:[{id:'old',role:'user' as const,content:'Different saved original'}]};
 const restored=parseConversationFile(JSON.stringify([source,record]),'backup.json',[existing]);
 assert.notEqual(restored[0].id,'source');assert.equal(restored[1].messages[0].sourceThreadId,restored[0].id);assert.deepEqual(restored[1].messages[0].packetAnnotation,record.messages[0].packetAnnotation);
});
