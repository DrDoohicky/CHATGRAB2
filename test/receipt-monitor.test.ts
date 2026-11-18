import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { admitReceipt, commitment, sealReceipt, type AdmissionLedger, type ExecutionReceipt } from '../lib/bridge/receipt-monitor.ts';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const receipt:ExecutionReceipt={version:1,runtime:'worker-a',policyDigest:commitment('approved-policy'),grant:'grant-1',nonce:'call-1',expiresAt:200,decision:'allow',inputDigest:commitment('in'),outputDigest:commitment('out')};
const policy={publicKey,runtime:'worker-a',policyDigest:receipt.policyDigest,grant:'grant-1',now:100};
const entries:Array<{nonce:string;admitted:boolean;reason:string}>=[];
const ledger:AdmissionLedger={has:nonce=>entries.some(entry=>entry.nonce===nonce),append:entry=>entries.push(entry)};
test('receiver rejects tampering, missing monitor, expired grants, false identity, blocked calls and replay; records denials',()=>{
 const run=(changes:Partial<ExecutionReceipt>,reason:string)=>assert.equal(admitReceipt(sealReceipt({...receipt,...changes},privateKey),policy,ledger,'in','out').reason,reason);
 assert.equal(admitReceipt(null,policy,ledger,'in','out').reason,'missing-receipt');
 const tampered=sealReceipt(receipt,privateKey);tampered.receipt={...receipt,policyDigest:'tampered'};
 assert.equal(admitReceipt(tampered,policy,ledger,'in','out').reason,'invalid-signature');
 run({nonce:'policy',policyDigest:'other'},'policy-mismatch');run({nonce:'expired',expiresAt:99},'stale-grant');run({nonce:'identity',runtime:'claimed-worker'},'runtime-mismatch');run({nonce:'blocked',decision:'block'},'blocked-by-monitor');
 run({nonce:'changed-output',outputDigest:commitment('fabricated')},'commitment-mismatch');
 run({nonce:'accepted-call'},'admitted');
 // A restarted verifier using the same receiver-owned journal still rejects replay.
 const restartedLedger:AdmissionLedger={has:nonce=>JSON.parse(JSON.stringify(entries)).some((entry:{nonce:string})=>entry.nonce===nonce),append:entry=>entries.push(entry)};
 assert.equal(admitReceipt(sealReceipt({...receipt,nonce:'accepted-call'},privateKey),policy,restartedLedger,'in','out').reason,'replay');
 assert.equal(entries.length,9); assert.equal(entries.filter(entry=>entry.admitted).length,1);
});
test('receiver fails closed if its audit store cannot append',()=>{
 assert.throws(()=>admitReceipt(sealReceipt({...receipt,nonce:'store-failure'},privateKey),policy,{has:()=>false,append:()=>{throw new Error('journal unavailable');}},'in','out'),/journal unavailable/);
});

