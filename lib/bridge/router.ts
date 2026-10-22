import express from 'express';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {resolve} from 'node:path';
import {BridgeStore} from './store.js';
export function createBridgeRouter(options:{enabled:boolean;filename?:string}){
 const router=express.Router();const enabled=options.enabled&&!process.env.VERCEL;let store:BridgeStore|undefined;const session=randomBytes(32).toString('hex');const principal={kind:'operator' as const,id:'local-operator'};
 router.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
 router.get('/status',(_req,res)=>res.json({available:enabled,mode:enabled?'local-sqlite':'portable-only',workerRuntime:false,message:enabled?'Local durable inbox. Human receipts do not invoke workers.':'Use reviewed portable handoffs. Hosted server storage and worker authentication are not configured.'}));
 router.use((req,res,next)=>{
  if(!enabled)return res.status(503).json({error:'Durable bridge is disabled here. Portable handoffs remain available.'});
  const host=req.headers.host||'';const loopback=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress||'');
  if(!loopback||!/^((localhost|127\.0\.0\.1)(:\d+)?|\[::1\](:\d+)?)$/.test(host))return res.status(403).json({error:'Local bridge accepts loopback clients only.'});
  if(req.method!=='GET'&&req.headers.origin!==`http://${host}`)return res.status(403).json({error:'Same-origin browser request required.'});
  next();
 });
 router.post('/session',(_req,res)=>{res.setHeader('Set-Cookie',`cg_bridge=${session}; HttpOnly; SameSite=Strict; Path=/api/bridge; Max-Age=28800`);res.json({role:'local-operator',workerAuthentication:false});});
 router.use((req,res,next)=>{const cookie=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('cg_bridge='))?.slice(10)||'';if(!/^[a-f0-9]{64}$/.test(cookie)||!timingSafeEqual(Buffer.from(cookie),Buffer.from(session)))return res.status(401).json({error:'Local operator session required.'});try{store??=new BridgeStore(options.filename||resolve('.chatgrab-bridge','crew.sqlite'));next();}catch{res.status(503).json({error:'Durable storage unavailable. No data was accepted.'});}});
 router.get('/assignments',(_req,res)=>res.json({assignments:store!.list(principal)}));
 router.get('/events',(_req,res)=>res.json({events:store!.events(principal)}));
 router.post('/assignments',async(req,res)=>{try{res.json(await store!.deliver(req.body,principal));}catch(e:any){res.status(400).json({error:e.message});}});
 router.post('/assignments/:id/transition',(req,res)=>{try{res.json(store!.transition(req.params.id,req.body?.action,req.body?.expectedVersion,req.body?.idempotencyKey,principal));}catch(e:any){res.status(e.message==='Forbidden.'?403:409).json({error:e.message==='Forbidden.'?'Worker acknowledgement requires an authenticated worker runtime. Human operators cannot impersonate workers.':e.message});}});
 return {router,close:()=>store?.close()};
}
