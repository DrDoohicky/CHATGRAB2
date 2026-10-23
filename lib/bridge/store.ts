import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {verifyHandoff,type Handoff} from '../../src/lib/crew-bridge.js';
export type Principal={kind:'operator'|'worker';id:string};
type Action='receive'|'acknowledge'|'withdraw';
export class BridgeStore {
 private db:DatabaseSync;
 constructor(filename:string){mkdirSync(dirname(filename),{recursive:true,mode:0o700});this.db=new DatabaseSync(filename);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,digest TEXT NOT NULL,packet TEXT NOT NULL,state TEXT NOT NULL,version INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT,assignment_id TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,at TEXT NOT NULL,decision TEXT NOT NULL,version INTEGER NOT NULL,key TEXT UNIQUE,fingerprint TEXT);');}
 close(){this.db.close();}
 private allowed(p:Principal|undefined,action:string,packet?:Handoff){return !!p&&(action==='acknowledge'?p.kind==='worker'&&p.id===packet?.assignment.workerId:p.kind==='operator'&&p.id==='local-operator');}
 private audit(id:string,p:Principal|undefined,action:string,decision:string,version:number,key?:string,fingerprint?:string){this.db.prepare('INSERT INTO events(assignment_id,actor,action,at,decision,version,key,fingerprint) VALUES(?,?,?,?,?,?,?,?)').run(id,p?`${p.kind}:${p.id}`:'anonymous',action,new Date().toISOString(),decision,version,key??null,fingerprint??null);}
 list(p?:Principal){if(!this.allowed(p,'list'))throw Error('Forbidden.');return this.db.prepare('SELECT id,digest,state,version,packet FROM assignments ORDER BY rowid DESC').all().map((r:any)=>({...r,packet:JSON.parse(r.packet)}));}
 async deliver(value:unknown,p?:Principal){if(!this.allowed(p,'deliver')){this.audit('unknown',p,'deliver','DENIED',0);throw Error('Forbidden.');}const packet=await verifyHandoff(value);this.db.exec('BEGIN IMMEDIATE');try{const old:any=this.db.prepare('SELECT digest,state,version FROM assignments WHERE id=?').get(packet.id);if(old){if(old.digest!==packet.digest)throw Error('Conflicting handoff ID.');this.db.exec('COMMIT');return {...old,id:packet.id,duplicate:true};}this.db.prepare('INSERT INTO assignments VALUES(?,?,?,?,?)').run(packet.id,packet.digest,JSON.stringify(packet),'DELIVERED',1);this.audit(packet.id,p,'deliver','ALLOWED',1,'deliver:'+packet.id,packet.digest);this.db.exec('COMMIT');return {id:packet.id,digest:packet.digest,state:'DELIVERED',version:1,duplicate:false};}catch(e){this.db.exec('ROLLBACK');throw e;}}
 transition(id:string,action:Action,expectedVersion:number,key:string,p?:Principal){
  if(!/^[a-zA-Z0-9_-]{1,160}$/.test(id)||!['receive','acknowledge','withdraw'].includes(action)||!Number.isSafeInteger(expectedVersion)||expectedVersion<1||!/^[-a-zA-Z0-9_]{8,160}$/.test(key))throw Error('Invalid transition.');
  this.db.exec('BEGIN IMMEDIATE');try{const row:any=this.db.prepare('SELECT * FROM assignments WHERE id=?').get(id);if(!row)throw Error('Assignment not found.');const packet=JSON.parse(row.packet);if(!this.allowed(p,action,packet)){this.audit(id,p,action,'DENIED',row.version);this.db.exec('COMMIT');throw Error('Forbidden.');}
   const fingerprint=JSON.stringify({id,action,expectedVersion,actor:p});const previous:any=this.db.prepare('SELECT * FROM events WHERE key=?').get(key);if(previous){if(previous.fingerprint!==fingerprint)throw Error('Idempotency key reused for a different action.');this.db.exec('COMMIT');return {id,state:action==='receive'?'RECEIVED':action==='acknowledge'?'ACKNOWLEDGED':'WITHDRAWN',version:previous.version,duplicate:true};}
   if(row.version!==expectedVersion)throw Error('Version conflict. Reload before changing this assignment.');if(row.state==='WITHDRAWN'||(action==='receive'&&row.state!=='DELIVERED')||(action==='acknowledge'&&!['DELIVERED','RECEIVED'].includes(row.state)))throw Error('Transition is not allowed from current state.');const state=action==='receive'?'RECEIVED':action==='acknowledge'?'ACKNOWLEDGED':'WITHDRAWN';const version=row.version+1;this.db.prepare('UPDATE assignments SET state=?,version=? WHERE id=?').run(state,version,id);this.audit(id,p,action,'ALLOWED',version,key,fingerprint);this.db.exec('COMMIT');return {id,state,version,duplicate:false};
  }catch(e){try{this.db.exec('ROLLBACK');}catch{}throw e;}
 }
 events(p?:Principal){if(!this.allowed(p,'events'))throw Error('Forbidden.');return this.db.prepare('SELECT seq,assignment_id,actor,action,at,decision,version FROM events ORDER BY seq').all();}
}
