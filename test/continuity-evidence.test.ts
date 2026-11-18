import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateContinuityFindings} from '../lib/continuity-evidence';
const sources=new Map([['chat-a',new Map([['msg-1','The launch was postponed until Friday.']])],['chat-b',new Map([['msg-1','The launch went ahead on Monday.']])]]);
test('keeps exact quotations tied to the correct conversation',()=>{
 const result=validateContinuityFindings([{type:'decisions',title:'Launch timing',status:'supported',evidence:[{threadId:'chat-a',messageId:'msg-1',excerpt:'postponed until Friday'}]}],['decisions'],sources);
 assert.equal(result.findings[0].evidence[0].excerpt,'postponed until Friday');assert.equal(result.repairedQuotes,0);
});
test('replaces invented or cross-chat quotations with actual source text',()=>{
 const result=validateContinuityFindings([{type:'decisions',title:'Launch',evidence:[{threadId:'chat-a',messageId:'msg-1',excerpt:'The launch went ahead on Monday.'}]}],['decisions'],sources);
 assert.equal(result.findings[0].evidence[0].excerpt,'The launch was postponed until Friday.');assert.equal(result.repairedQuotes,1);
});
test('drops unknown citations and marks unsupported findings unresolved',()=>{
 const result=validateContinuityFindings([{type:'decisions',title:'Claim',status:'supported',evidence:[{threadId:'chat-a',messageId:'invented',excerpt:'fake'},null]}],['decisions'],sources);
 assert.deepEqual(result.findings[0].evidence,[]);assert.equal(result.findings[0].status,'unresolved');
});
test('rejects categories outside the selected analyses',()=>{
 assert.deepEqual(validateContinuityFindings([{type:'apologies',title:'Not requested',evidence:[]}],['decisions'],sources).findings,[]);
});
