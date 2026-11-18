import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCompanionContext} from '../src/lib/companion-context';
const thread=(id:string,content:string)=>({id,title:id,capturedAt:'2026-10-22',model:'Test',messages:[{id:'m1',role:'user' as const,content}]});
test('assistant includes only selected sources and their connected files',()=>{
 const result=buildCompanionContext([thread('one','selected evidence'),thread('two','private unselected')],[{id:'a',name:'linked.txt',type:'text/plain',size:10,kind:'evidence',uploadedAt:'2026-10-22',linkedThreadId:'one',textPreview:'linked evidence'},{id:'b',name:'private.txt',type:'text/plain',size:10,kind:'evidence',uploadedAt:'2026-10-22',linkedThreadId:'two',textPreview:'private file'}],['one'],'library');
 assert.equal(result.conversations.length,1);assert.equal(result.files.length,1);assert.equal(result.files[0].text,'linked evidence');assert.ok(!JSON.stringify(result).includes('private unselected'));assert.ok(!JSON.stringify(result).includes('private file'));
});
test('context limits disclose shortened sources and preserve message IDs',()=>{
 const result=buildCompanionContext([thread('one','x'.repeat(20000))],[],['one'],'workspace');
 assert.equal(result.conversations[0].messages[0].content.length,12000);assert.equal(result.conversations[0].messages[0].id,'m1');assert.ok(result.warnings.length);
});
test('empty selection does not silently include the entire library',()=>{
 const result=buildCompanionContext([thread('one','source')],[],[],'capture');assert.equal(result.conversations.length,0);assert.equal(result.app.page,'capture');assert.ok(result.warnings.length);
});
