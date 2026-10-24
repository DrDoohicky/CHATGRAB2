import {DatabaseSync} from 'node:sqlite';
import type {AdmissionLedger} from './receipt-monitor';
// Local pilot. The database and receiving process must be independently owned
// before this can enforce a boundary against a worker with filesystem access.
export class SqliteAdmissionLedger implements AdmissionLedger {
 private db:DatabaseSync;
 constructor(path:string){
  this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS admitted_nonces(nonce TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS admission_audit(id INTEGER PRIMARY KEY, nonce TEXT NOT NULL, admitted INTEGER NOT NULL, reason TEXT NOT NULL, recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);');
 }
 has(nonce:string){return !!this.db.prepare('SELECT nonce FROM admitted_nonces WHERE nonce=?').get(nonce);}
 append(entry:{nonce:string;admitted:boolean;reason:string}){
  this.db.exec('BEGIN IMMEDIATE');
  let replay=false;
  try{
   if(entry.admitted){const result=this.db.prepare('INSERT OR IGNORE INTO admitted_nonces(nonce) VALUES(?)').run(entry.nonce);if(Number(result.changes)!==1){replay=true;throw Error('Replay rejected by atomic nonce reservation.');}}
   this.db.prepare('INSERT INTO admission_audit(nonce,admitted,reason) VALUES(?,?,?)').run(entry.nonce,Number(entry.admitted),entry.reason);
   this.db.exec('COMMIT');
  }catch(error){this.db.exec('ROLLBACK');if(replay)this.db.prepare('INSERT INTO admission_audit(nonce,admitted,reason) VALUES(?,0,?)').run(entry.nonce,'concurrent-replay');throw error;}
 }
 audit(){return this.db.prepare('SELECT id,nonce,admitted,reason,recorded_at FROM admission_audit ORDER BY id').all();}
 close(){this.db.close();}
}
