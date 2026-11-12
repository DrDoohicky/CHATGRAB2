import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
// LOCAL TEST HARNESS ONLY. Never grants a real license or sends provider requests.
export class FoundingTestLedger{
 private db:DatabaseSync;
 constructor(path:string){this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
 CREATE TABLE IF NOT EXISTS test_events(id TEXT PRIMARY KEY,digest TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS test_sessions(id TEXT PRIMARY KEY,payment_intent TEXT UNIQUE NOT NULL,browser_hash TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN ('active-test','revoked-test')));
 CREATE TABLE IF NOT EXISTS test_refunds(payment_intent TEXT PRIMARY KEY,amount INTEGER NOT NULL);`);}
 close(){this.db.close();}
 state(id:string){return this.db.prepare('SELECT id,state FROM test_sessions WHERE id=?').get(id);}
 apply(event:any){
  if(event?.livemode!==false||typeof event.id!=='string'||!event.id.startsWith('evt_'))throw Error('Only test-mode Stripe events are accepted.');
  const hash=createHash('sha256').update(JSON.stringify(event)).digest('hex');
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT digest FROM test_events WHERE id=?').get(event.id);if(old){if(old.digest!==hash)throw Error('Event ID was replayed with different content.');this.db.exec('COMMIT');return {duplicate:true,testOnly:true};}
   const item=event.data?.object;let state='ignored-test';
   if(event.type==='checkout.session.completed'){
    if(item?.livemode!==false||item.mode!=='payment'||item.status!=='complete'||item.payment_status!=='paid'||item.currency!=='usd'||item.amount_total!==1900||item.metadata?.offer!=='chatgrab-founding-v1'||!/^cs_test_[A-Za-z0-9_]+$/.test(item.id)||typeof item.payment_intent!=='string'||!/^pi_[A-Za-z0-9_]+$/.test(item.payment_intent)||! /^[a-f0-9]{64}$/.test(item.metadata?.browser||''))throw Error('Test payment does not satisfy the offer, amount and source checks.');
    const existing=this.db.prepare('SELECT payment_intent,browser_hash FROM test_sessions WHERE id=?').get(item.id);if(existing&&(existing.payment_intent!==item.payment_intent||existing.browser_hash!==item.metadata.browser))throw Error('Checkout identity conflicts with its preserved record.');
    const refund=this.db.prepare('SELECT amount FROM test_refunds WHERE payment_intent=?').get(item.payment_intent);state=Number(refund?.amount||0)>=1900?'revoked-test':'active-test';
    this.db.prepare('INSERT INTO test_sessions(id,payment_intent,browser_hash,state) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING').run(item.id,item.payment_intent,item.metadata.browser,state);
   }else if(event.type==='charge.refunded'){
    if(item?.livemode!==false||item.currency!=='usd'||item.amount!==1900||!Number.isSafeInteger(item.amount_refunded)||item.amount_refunded<0||item.amount_refunded>1900||typeof item.payment_intent!=='string'||!/^pi_[A-Za-z0-9_]+$/.test(item.payment_intent))throw Error('Invalid test refund evidence.');
    this.db.prepare('INSERT INTO test_refunds(payment_intent,amount) VALUES(?,?) ON CONFLICT(payment_intent) DO UPDATE SET amount=MAX(amount,excluded.amount)').run(item.payment_intent,item.amount_refunded);
    if(item.amount_refunded===1900)this.db.prepare("UPDATE test_sessions SET state='revoked-test' WHERE payment_intent=?").run(item.payment_intent);state=item.amount_refunded===1900?'revoked-test':'partial-refund-test';
   }
   this.db.prepare('INSERT INTO test_events(id,digest) VALUES(?,?)').run(event.id,hash);this.db.exec('COMMIT');return {duplicate:false,testOnly:true,state};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
}
