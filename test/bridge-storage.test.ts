import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sealHandoff,digestBridge,readBridgeRecords,saveBridgeRecords,localReceipt,SHARED_BRIDGE_KEY} from '../src/lib/crew-bridge';
test('versioned shared queue and receipts recover after a fresh read; corrupt state is never overwritten on load',async()=>{
 const values=new Map<string,string>();const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}});
 try{const packet=await sealHandoff({schema:'chatgrab-crew/1',id:'storage-test',createdAt:'2026-10-22T12:00:00Z',source:{app:'ChatGrab',provider:'ChatGPT',captureId:'capture-test',capturedAt:'2026-10-22T11:00:00Z',title:'Source',reference:'chatgrab:conversation/capture-test',captureDigest:await digestBridge('fixture')},excerpts:[{messageId:'m1',role:'user',text:'Selected evidence.'}],assignment:{title:'Review',instructions:'Review only.',workerId:'atlas',laneId:'lane-atlas-console-pilot'},consent:{scope:'selected-excerpts-only',reviewedBy:'QA',reviewedAt:'2026-10-22T12:00:00Z',confirmed:true},authority:'review-only'});
 saveBridgeRecords(SHARED_BRIDGE_KEY,[{packet}]);const fresh=await readBridgeRecords(SHARED_BRIDGE_KEY);assert.equal(fresh[0].packet.digest,packet.digest);saveBridgeRecords(SHARED_BRIDGE_KEY,[{packet,receipt:localReceipt(packet,'QA')}]);assert.equal((await readBridgeRecords(SHARED_BRIDGE_KEY))[0].receipt?.kind,'human-receipt');
 values.set(SHARED_BRIDGE_KEY,'corrupt');await assert.rejects(readBridgeRecords(SHARED_BRIDGE_KEY),/JSON/);assert.equal(values.get(SHARED_BRIDGE_KEY),'corrupt');
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');}
});
test('published Crew Console and ChatGrab use the identical portable contract',()=>{
 assert.equal(readFileSync(new URL('../src/lib/crew-bridge.ts',import.meta.url),'utf8'),readFileSync(new URL('../crew-console/src/lib/crew-bridge.ts',import.meta.url),'utf8'));
});
