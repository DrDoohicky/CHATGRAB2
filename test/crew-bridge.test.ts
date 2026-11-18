import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import express from 'express';
import {sealHandoff,verifyHandoff,digestBridge,validateHandoff,redactBridgeText,matchReceipt,localReceipt} from '../src/lib/crew-bridge.js';
import {BridgeStore} from '../lib/bridge/store.js';
import {createBridgeRouter} from '../lib/bridge/router.js';
export async function fixture(){return sealHandoff({schema:'chatgrab-crew/1',id:'test-handoff',createdAt:'2026-10-22T12:00:00Z',source:{app:'ChatGrab',provider:'ChatGPT',captureId:'capture-one',capturedAt:'2026-10-22T11:00:00Z',title:'Public test fixture',reference:'chatgrab:conversation/capture-one',captureDigest:await digestBridge('original capture')},excerpts:[{messageId:'m1',role:'user',text:'Preserve the original source.'}],assignment:{title:'Review continuity evidence',instructions:'Review selected context; do not deploy.',workerId:'atlas',laneId:'lane-atlas-console-pilot'},consent:{scope:'selected-excerpts-only',reviewedBy:'Test operator',reviewedAt:'2026-10-22T12:00:00Z',confirmed:true},authority:'review-only'});}
const owner={kind:'operator' as const,id:'local-operator'};
test('portable contract preserves source IDs, checks integrity and requires explicit bounded consent',async()=>{
 const p=await fixture();assert.equal((await verifyHandoff(JSON.parse(JSON.stringify(p)))).excerpts[0].messageId,'m1');
 await assert.rejects(verifyHandoff({...p,assignment:{...p.assignment,title:'Changed after review'}}),/digest/);
 assert.throws(()=>validateHandoff({...p,consent:{...p.consent,confirmed:false}}),/consent/);
 assert.throws(()=>validateHandoff({...p,authority:'deploy'}),/authority/);
 assert.throws(()=>validateHandoff({...p,excerpts:[...p.excerpts,...p.excerpts]}),/Duplicate/);
 assert.throws(()=>validateHandoff({...p,source:{...p.source,reference:'https://evil.example/private'}}),/reference/);
 assert.throws(()=>validateHandoff({...p,excerpts:[{...p.excerpts[0],text:'x'.repeat(6001)}]}),/oversized/);
 assert.throws(()=>validateHandoff({...p,hiddenContext:'not selected'}),/unsupported|Unsupported/);
});
test('common sensitive patterns are removed and receipts cannot imply worker ACK or match another handoff',async()=>{
 const safe=redactBridgeText('person@example.com sk-abcdefghijklmnopqrstuvwxyz Bearer secret-value');assert.doesNotMatch(safe,/person@|sk-abc|secret-value/);
 const p=await fixture();assert.throws(()=>validateHandoff({...p,assignment:{...p.assignment,instructions:'Contact person@example.com'}}),/Redact/);
 const r=localReceipt(p,'Test operator');assert.equal(matchReceipt(r,p).kind,'human-receipt');assert.throws(()=>matchReceipt({...r,handoffDigest:'0'.repeat(64)},p),/match/);assert.throws(()=>matchReceipt({...r,kind:'worker-ack'},p),/worker ACK/);
});
test('durable store denies unauthorized actions, deduplicates delivery, uses versions and retains audit',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'crew-store-'));const store=new BridgeStore(join(dir,'state.sqlite'));
 try{const p=await fixture();await assert.rejects(store.deliver(p),/Forbidden/);const first=await store.deliver(p,owner);assert.equal(first.version,1);assert.equal((await store.deliver(p,owner)).duplicate,true);assert.equal(store.list(owner).length,1);
 assert.throws(()=>store.transition(p.id,'acknowledge',1,'ack-test-key',owner),/Forbidden/);assert.throws(()=>store.transition(p.id,'receive',1,'receive-test-key',{kind:'worker',id:'atlas'}),/Forbidden/);
 const received=store.transition(p.id,'receive',1,'receive-test-key',owner);assert.equal(received.state,'RECEIVED');assert.equal(store.transition(p.id,'receive',1,'receive-test-key',owner).duplicate,true);
 assert.throws(()=>store.transition(p.id,'withdraw',1,'withdraw-test-key',owner),/Version/);assert.throws(()=>store.transition(p.id,'withdraw',2,'receive-test-key',owner),/Idempotency/);
 assert.equal(store.transition(p.id,'withdraw',2,'withdraw-test-key',owner).state,'WITHDRAWN');assert.throws(()=>store.transition(p.id,'receive',3,'receive-again-key',owner),/not allowed/);assert.equal(store.events(owner).filter((e:any)=>e.decision==='DENIED').length,3);
 }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
test('committed checkpoint survives a process killed without closing the database',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'crew-recovery-'));const file=join(dir,'state.sqlite');
 try{const source=`import {BridgeStore} from './lib/bridge/store.ts';const s=new BridgeStore(process.argv[1]);await s.deliver(JSON.parse(process.argv[2]),{kind:'operator',id:'local-operator'});process.kill(process.pid,'SIGKILL');`;
 const child=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',source,file,JSON.stringify(await fixture())],{cwd:process.cwd(),encoding:'utf8'});assert.notEqual(child.status,0);
 const recovered=new BridgeStore(file);try{assert.equal(recovered.list(owner)[0].state,'DELIVERED');assert.equal(recovered.events(owner).length,1);}finally{recovered.close();}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('HTTP backend requires local session, rejects cross-origin and ignores claimed worker identity',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'crew-http-'));const service=createBridgeRouter({enabled:true,filename:join(dir,'state.sqlite')});const app=express();app.use(express.json());app.use('/api/bridge',service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const port=(server.address() as any).port;const origin=`http://127.0.0.1:${port}`;
 try{assert.equal((await fetch(origin+'/api/bridge/assignments')).status,401);assert.equal((await fetch(origin+'/api/bridge/session',{method:'POST',headers:{Origin:'https://evil.example'}})).status,403);
 const login=await fetch(origin+'/api/bridge/session',{method:'POST',headers:{Origin:origin}});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie')!.split(';')[0];const headers={Origin:origin,Cookie:cookie,'Content-Type':'application/json'};
 assert.equal((await fetch(origin+'/api/bridge/assignments',{method:'POST',headers,body:JSON.stringify(await fixture())})).status,200);
 const forbidden=await fetch(origin+'/api/bridge/assignments/test-handoff/transition',{method:'POST',headers,body:JSON.stringify({action:'acknowledge',expectedVersion:1,idempotencyKey:'worker-ack-key',actor:{kind:'worker',id:'atlas'}})});assert.equal(forbidden.status,403);
 const records=await (await fetch(origin+'/api/bridge/assignments',{headers:{Cookie:cookie}})).json();assert.equal(records.assignments[0].state,'DELIVERED');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));service.close();rmSync(dir,{recursive:true,force:true});}
});
test('hosted service stays disabled with no filesystem or session access',async()=>{
 const service=createBridgeRouter({enabled:false});const app=express();app.use('/api/bridge',service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const port=(server.address() as any).port;
 try{const root=`http://127.0.0.1:${port}/api/bridge`;assert.equal((await (await fetch(root+'/status')).json()).available,false);assert.equal((await fetch(root+'/session',{method:'POST'})).status,503);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));service.close();}
});
