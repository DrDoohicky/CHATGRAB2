import express from 'express';
import path from 'node:path';
import fetchShare from './api/fetch-share.js';
import corpusQuery from './api/corpus/query.js';
const app=express();
app.use(express.json({limit:'15mb'}));
app.post('/api/fetch-share',fetchShare);
app.post('/api/corpus/query',corpusQuery);
const connection={connected:false,mode:'hosted-approval-pending',requiresApiKey:false,historyAccess:false,message:'Native ChatGPT connection is pending approval for this website. No API key is required from users. Capture, library organization, supporting files, exports and reviewed reintegration records remain available.'};
app.get('/api/chatgpt/status',(_req,res)=>{res.setHeader('Cache-Control','no-store');res.json(connection);});
const awaitingConnection=(_req:express.Request,res:express.Response)=>res.status(409).json({success:false,code:'CHATGPT_CONNECTION_PENDING',error:connection.message});
app.post('/api/continuity-analysis',(req,res)=>{
 const {threads,analyses}=req.body||{};
 const allowed=new Set(['contradictions','accomplishments','apologies','decisions','themes','neighbors','evolution','narrative','unresolved']);
 if(!Array.isArray(threads)||!threads.length||threads.length>20||!Array.isArray(analyses)||!analyses.length||analyses.some((a:unknown)=>!allowed.has(String(a))))return res.status(400).json({success:false,error:'Select 1–20 conversations and at least one supported analysis.'});
 const ids=new Set<string>();
 for(const thread of threads){
  if(typeof thread?.id!=='string'||!thread.id||ids.has(thread.id)||typeof thread.title!=='string'||!Array.isArray(thread.messages)||!thread.messages.length)return res.status(400).json({success:false,error:'Each source needs a unique ID, title and nonempty messages.'});
  ids.add(thread.id);const messageIds=new Set<string>();
  for(const message of thread.messages){if(typeof message?.id!=='string'||!message.id||messageIds.has(message.id)||typeof message.content!=='string')return res.status(400).json({success:false,error:'Source messages need unique IDs and text content.'});messageIds.add(message.id);}
 }
 return awaitingConnection(req,res);
});
for(const route of ['analyze-thread','chat','adaptive-portions','deep-analysis'])app.post('/api/'+route,(req,res)=>{
 if(!Array.isArray(req.body?.messages)||!req.body.messages.length)return res.status(400).json({success:false,error:'Provide a nonempty messages array.'});
 return awaitingConnection(req,res);
});
export default app;
async function startServer(){
 if(process.env.NODE_ENV!=='production'){
  const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true,hmr:process.env.DISABLE_HMR!=='true'},appType:'spa'});app.use(vite.middlewares);
 }else{app.use(express.static(path.resolve(process.cwd(),'dist')));app.get('*',(_req,res)=>res.sendFile(path.resolve(process.cwd(),'dist','index.html')));}
 const port=Number(process.env.PORT||3000);app.listen(port,'0.0.0.0',()=>console.log('ChatGrab listening on '+port));
}
if(!process.env.VERCEL)void startServer();
