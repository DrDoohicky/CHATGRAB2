import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAnalysisBatches} from '../src/lib/analysis-batches.ts';
import type {ConversationThread} from '../src/types';
const source=(id:string,contents:string[]):ConversationThread=>({id,title:'Source '+id,capturedAt:'2026-10-24T00:00:00Z',model:'Synthetic fixture',messages:contents.map((content,index)=>({id:id+'-message-'+index,role:'user',content}))});
test('large multi-chat sources are batched with every message ID exactly once',()=>{
 const batches=buildAnalysisBatches([source('one',Array(5).fill('a'.repeat(24000))),source('two',['second-source-marker'])]);
 assert.ok(batches.length>1);assert.ok(batches.every(batch=>batch.length<=54000));
 const all=batches.join('\n');for(let i=0;i<5;i++)assert.equal(all.split('MESSAGE ID: one-message-'+i+'\n').length-1,1);assert.match(all,/SOURCE ID: two/);assert.match(all,/second-source-marker/);
});
test('an oversized single message is split into numbered parts without text loss or broken surrogate pairs',()=>{
 const text='😀'.repeat(70000)+'final-marker';const batches=buildAnalysisBatches([source('long',[text])]);
 assert.ok(batches.length>1);assert.ok(batches.every(batch=>batch.length<=54000&&batch.includes('MESSAGE ID: long-message-0')&&batch.includes('MESSAGE PART:')));
 const recovered=batches.map(batch=>batch.slice(batch.indexOf('(continued source message)\n')+'(continued source message)\n'.length,-1)).join('');assert.equal(recovered,text);
});
test('recent filtering applies to the original last 100 messages and an empty selection stays empty',()=>{
 const messages=Array.from({length:105},(_,i)=>i===0?'old needle':i===104?'recent needle':'other');
 const filtered=buildAnalysisBatches([source('history',messages)],'needle',true).join('');assert.match(filtered,/recent needle/);assert.doesNotMatch(filtered,/old needle/);assert.deepEqual(buildAnalysisBatches([]),[]);
});
