import { createHash, sign, verify, type KeyLike } from 'node:crypto';
// Research prototype only. The receiving verifier and its policy/key/replay store must
// run under an independently administered identity to form an enforcement boundary.
export const commitment = (value: string) => createHash('sha256').update(value).digest('hex');
export interface ExecutionReceipt {
  version: 1; runtime: string; policyDigest: string; grant: string; nonce: string;
  expiresAt: number; decision: 'allow' | 'block'; inputDigest: string; outputDigest: string;
}
export const sealReceipt = (receipt: ExecutionReceipt, key: KeyLike) => ({receipt,signature:sign(null,Buffer.from(JSON.stringify(receipt)),key).toString('base64')});
export interface AdmissionPolicy { publicKey: KeyLike; runtime: string; policyDigest: string; grant: string; now: number; }
export interface AdmissionLedger { has(nonce:string):boolean; append(entry:{nonce:string; admitted:boolean; reason:string}):void; }
export function admitReceipt(envelope: ReturnType<typeof sealReceipt>|null, policy: AdmissionPolicy, ledger: AdmissionLedger, input:string, output:string) {
  let reason='missing-receipt';
  const receipt=envelope?.receipt;
  if(receipt) {
    let valid=false;
    try { valid=verify(null,Buffer.from(JSON.stringify(receipt)),policy.publicKey,Buffer.from(envelope.signature,'base64')); } catch { /* Fail closed. */ }
    reason=!valid?'invalid-signature':receipt.version!==1?'unsupported-version':receipt.runtime!==policy.runtime?'runtime-mismatch':receipt.policyDigest!==policy.policyDigest?'policy-mismatch':receipt.grant!==policy.grant||receipt.expiresAt<=policy.now?'stale-grant':!receipt.nonce||ledger.has(receipt.nonce)?'replay':receipt.inputDigest!==commitment(input)||receipt.outputDigest!==commitment(output)?'commitment-mismatch':receipt.decision!=='allow'?'blocked-by-monitor':'admitted';
  }
  // A receiver-controlled durable append must succeed before an admission is returned.
  ledger.append({nonce:receipt?.nonce||'',admitted:reason==='admitted',reason});
  return {admitted:reason==='admitted',reason};
}
