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
test('native ChatGPT export preserves selected branch, roles and original text without including alternative replies',()=>{
 const exportData={id:'native',title:'My conversation',current_node:'selected',create_time:1700000000,mapping:{
 root:{id:'root',parent:null,message:null},
 user:{id:'user',parent:'root',message:{id:'u1',author:{role:'user'},content:{content_type:'text',parts:['Keep this source.']}}},
 alternative:{id:'alternative',parent:'user',message:{id:'a0',author:{role:'assistant'},content:{content_type:'text',parts:['An unselected reply.']}}},
 selected:{id:'selected',parent:'user',message:{id:'a1',author:{role:'assistant'},content:{content_type:'text',parts:['Selected reply.','Second paragraph.']}}}
 }};
 const result=parseConversationFile(JSON.stringify([exportData]),'conversations.json',[]);
 assert.equal(result.length,1);assert.deepEqual(result[0].messages.map(m=>m.content),['Keep this source.','Selected reply.\n\nSecond paragraph.']);
 assert.deepEqual(result[0].messages.map(m=>m.role),['user','assistant']);assert.equal(result[0].originalCreatedAt,'2023-11-14T22:13:20.000Z');
 assert.equal(parseConversationFile(JSON.stringify([exportData]),'conversations.json',result).length,0);
 assert.throws(()=>parseConversationFile(JSON.stringify({...exportData,current_node:'missing'}),'bad.json',[]),/selected conversation branch/);
 assert.throws(()=>parseConversationFile(JSON.stringify({...exportData,mapping:{...exportData.mapping,user:{...exportData.mapping.user,parent:'selected'}}}),'bad.json',[]),/circular/);
});
test('native export refuses unsupported multimodal content instead of silently losing source data',()=>{
 const data={current_node:'m',mapping:{m:{parent:null,message:{author:{role:'user'},content:{content_type:'multimodal_text',parts:['Attached source',{content_type:'image_asset_pointer'}]}}}}};
 assert.throws(()=>parseConversationFile(JSON.stringify(data),'conversations.json',[]),/non-text messages/);
});
