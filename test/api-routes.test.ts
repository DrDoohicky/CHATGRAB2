import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.VERCEL='1';
const {default:app}=await import('../server.js');

const source={id:'qa',title:'API validation fixture',messages:[{id:'m1',role:'user',content:'Preserve this source.'}]};
test('API validates requests and reports a pending native connection without modifying sources',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const address=server.address() as {port:number};
 const post=async(route:string,body:unknown)=>{const r=await fetch(`http://127.0.0.1:${address.port}/api/${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 try{
  assert.equal((await post('continuity-analysis',{threads:[],analyses:[]})).status,400);
  assert.equal((await post('continuity-analysis',{threads:[source,source],analyses:['themes']})).status,400);
  assert.equal((await post('continuity-analysis',{threads:[{...source,messages:[source.messages[0],source.messages[0]]}],analyses:['themes']})).status,400);
  const unavailable=await post('continuity-analysis',{threads:[source],analyses:['themes']});
  assert.equal(unavailable.status,409);assert.equal(unavailable.data.code,'CHATGPT_CONNECTION_PENDING');
  assert.equal((await post('fetch-share',{url:'https://chatgpt.com/s/t_private'})).status,400);
  for(const route of ['analyze-thread','chat','adaptive-portions','deep-analysis']){
   assert.equal((await post(route,{messages:[]})).status,400);
   const response=await post(route,{title:source.title,messages:source.messages});
   assert.equal(response.status,409,route);assert.match(response.data.error,/No API key/);
  }
  const corpus=await post('corpus/query',{query:'preserve source',threads:[{id:source.id,title:source.title,messagesSample:'user: Preserve this source.'}]});
  assert.equal(corpus.status,200);assert.equal(corpus.data.success,true);
  assert.equal(source.messages[0].content,'Preserve this source.');
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
