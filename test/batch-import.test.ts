import test from 'node:test';
import assert from 'node:assert/strict';
import {BatchImporter} from '../src/lib/batch-import.ts';
const ok=()=>new Response(JSON.stringify({success:true,data:{title:'Synthetic fixture',messages:[{id:'source-1',role:'user',content:'Synthetic source'}]}}),{status:200,headers:{'Content-Type':'application/json'}});
const settle=async(queue:BatchImporter)=>{for(let i=0;i<100;i++){await new Promise(resolve=>setTimeout(resolve,5));if(!queue.snapshot().running)return;}throw Error('Queue did not settle');};
test('queue validates and deduplicates URLs, preserves successes and retries only failures',async()=>{
 const saved:string[]=[];let calls=0;let fail=true;
 const queue=new BatchImporter(thread=>{saved.push(thread.sourceUrl!);},(async function(this:unknown){assert.equal(this,globalThis);calls++;if(calls===2&&fail)return new Response(JSON.stringify({error:'Unavailable'}),{status:502});return ok();}) as typeof fetch);
 assert.throws(()=>queue.start('https://chatgpt.com/c/private'),/public/);
 queue.start('https://chatgpt.com/share/first\nhttps://chatgpt.com/share/first?utm_source=test\nhttps://chatgpt.com/share/second');await settle(queue);
 assert.deepEqual(queue.snapshot().items.map(item=>item.status),['succeeded','failed']);assert.equal(saved.length,1);
 fail=false;queue.retry();await settle(queue);assert.equal(calls,3);assert.equal(saved.length,2);assert.ok(queue.snapshot().items.every(item=>item.status==='succeeded'));
});
test('pause aborts active request; cancellation and owner change never save late responses; unfinished queue recovers paused',async()=>{
 const data=new Map<string,string>();const storage={getItem:(key:string)=>data.get(key)||null,setItem:(key:string,value:string)=>{data.set(key,value);}};
 const saved:string[]=[];let release:(value:Response)=>void=()=>{};
 const request=(()=>new Promise<Response>(resolve=>{release=resolve;})) as typeof fetch;
 const queue=new BatchImporter(thread=>{saved.push(thread.id);},request,storage);
 queue.start('https://chatgpt.com/share/one\nhttps://chatgpt.com/share/two');queue.pause();release(ok());await new Promise(resolve=>setTimeout(resolve,5));assert.equal(saved.length,0);assert.equal(queue.snapshot().running,false);
 const restored=new BatchImporter(()=>{},request,storage);assert.equal(restored.snapshot().items[0].status,'queued');assert.equal(restored.snapshot().running,false);
 queue.cancel();assert.ok(queue.snapshot().items.every(item=>item.status==='cancelled'));
 queue.start('https://chatgpt.com/share/other');queue.setScope('another-owner');release(ok());await new Promise(resolve=>setTimeout(resolve,5));assert.equal(saved.length,0);assert.equal(queue.snapshot().items.length,0);
});

