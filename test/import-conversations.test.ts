import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseConversationFile} from '../src/lib/importConversations';
const source={id:'source',title:'Preserved original',capturedAt:'2026-10-22',model:'Test',messages:[{id:'m1',role:'user' as const,content:'Original evidence'}]};
test('a library backup restores separate conversations and source metadata',()=>{
 const result=parseConversationFile(JSON.stringify([source,{...source,id:'derived',messages:[{...source.messages[0],sourceThreadId:'source',sourceMessageId:'m1'}]}]),'backup.json',[]);
 assert.equal(result.length,2);assert.equal(result[0].messages[0].content,'Original evidence');assert.equal(result[1].messages[0].sourceThreadId,result[0].id);
});
test('restore skips exact duplicates and preserves existing records on ID collision',()=>{
 assert.equal(parseConversationFile(JSON.stringify(source),'chat.json',[source]).length,0);
 const changed={...source,messages:[{...source.messages[0],content:'Different evidence'}]};
 const result=parseConversationFile(JSON.stringify(changed),'chat.json',[source]);
 assert.notEqual(result[0].id,source.id);assert.equal(source.messages[0].content,'Original evidence');
});
test('malformed messages fail rather than becoming blank or fabricated conversation text',()=>{
 assert.throws(()=>parseConversationFile(JSON.stringify([{title:'invalid',messages:[{}]}]),'bad.json',[]),/supported role/);
});
