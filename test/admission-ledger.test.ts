import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {generateKeyPairSync} from 'node:crypto';
import {admitReceipt,commitment,sealReceipt} from '../lib/bridge/receipt-monitor.ts';
import {SqliteAdmissionLedger} from '../lib/bridge/admission-ledger.ts';
test('independent connections cannot both admit the same nonce; audit and replay reservation survive reopening',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chatgrab-admission-'));const file=join(dir,'journal.sqlite');
 const first=new SqliteAdmissionLedger(file),second=new SqliteAdmissionLedger(file);
 try{
  assert.equal(first.has('call'),false);assert.equal(second.has('call'),false);
  first.append({nonce:'call',admitted:true,reason:'admitted'});
  assert.throws(()=>second.append({nonce:'call',admitted:true,reason:'admitted'}),/Replay/);
  first.append({nonce:'blocked',admitted:false,reason:'policy-mismatch'});
  assert.equal(second.audit().length,3);assert.equal(second.has('blocked'),false);
 }finally{first.close();second.close();}
 const restored=new SqliteAdmissionLedger(file);
 try{assert.equal(restored.has('call'),true);assert.equal(restored.audit().length,3);assert.throws(()=>restored.append({nonce:'call',admitted:true,reason:'admitted'}),/Replay/);}finally{restored.close();assert.equal(dirname(resolve(dir)),resolve(tmpdir()));rmSync(dir,{recursive:true,force:true});}
});
test('signed receipt verification uses the durable journal and rejects malformed expiration',()=>{
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');const ledger=new SqliteAdmissionLedger(':memory:');
 const receipt={version:1 as const,runtime:'test-worker',policyDigest:commitment('policy'),grant:'test-grant',nonce:'signed-call',expiresAt:200,decision:'allow' as const,inputDigest:commitment('input'),outputDigest:commitment('output')};
 const policy={publicKey,runtime:receipt.runtime,policyDigest:receipt.policyDigest,grant:receipt.grant,now:100};
 try{
  assert.equal(admitReceipt(sealReceipt({...receipt,expiresAt:NaN},privateKey),policy,ledger,'input','output').reason,'invalid-receipt');
  assert.equal(admitReceipt(sealReceipt(receipt,privateKey),policy,ledger,'input','output').admitted,true);
  assert.equal(admitReceipt(sealReceipt(receipt,privateKey),policy,ledger,'input','output').reason,'replay');
  assert.equal(ledger.audit().length,3);
 }finally{ledger.close();}
});
test('committed admission survives child-process exit without database close',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chatgrab-admission-crash-'));const file=join(dir,'journal.sqlite');
 const moduleUrl=new URL('../lib/bridge/admission-ledger.ts',import.meta.url).href;
 const child=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',`import {SqliteAdmissionLedger} from ${JSON.stringify(moduleUrl)};const journal=new SqliteAdmissionLedger(${JSON.stringify(file)});journal.append({nonce:'before-exit',admitted:true,reason:'admitted'});process.exit(0);`],{encoding:'utf8'});
 assert.equal(child.status,0,child.stderr);
 const journal=new SqliteAdmissionLedger(file);
 try{assert.equal(journal.has('before-exit'),true);assert.equal(journal.audit().length,1);assert.throws(()=>journal.append({nonce:'before-exit',admitted:true,reason:'admitted'}),/Replay/);}finally{journal.close();assert.equal(dirname(resolve(dir)),resolve(tmpdir()));rmSync(dir,{recursive:true,force:true});}
});
