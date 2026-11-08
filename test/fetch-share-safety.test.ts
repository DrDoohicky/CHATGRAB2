import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/fetch-share';
test('share fetch rejects off-domain redirects, reports provider blocks and bounds response size',async()=>{
 const original=globalThis.fetch;
 const run=async()=>{let status=200;let body:any;const res:any={setHeader(){},status(n:number){status=n;return this;},json(value:any){body=value;return this;}};await handler({method:'POST',body:{url:'https://chatgpt.com/share/test'}},res);return {status,body};};
 try{
  let count=0;
  globalThis.fetch=async()=>{count++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/internal'}});};
  const redirect=await run();assert.equal(redirect.status,502);assert.match(redirect.body.error,/outside/);assert.equal(count,1);
  globalThis.fetch=async()=>new Response('blocked',{status:403});
  assert.equal((await run()).status,422);
  globalThis.fetch=async()=>new Response(new Uint8Array(8*1024*1024+1));
  const oversized=await run();assert.equal(oversized.status,502);assert.match(oversized.body.error,/8 MB/);
  globalThis.fetch=async(input,options)=>{assert.equal(options?.redirect,'manual');assert.equal(new URL(String(input)).protocol,'https:');return new Response('<html>no transcript</html>');};
  const unreadable=await run();assert.equal(unreadable.status,422);assert.equal(unreadable.body.allowFallbackPaste,true);
 }finally{globalThis.fetch=original;}
});
