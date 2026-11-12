class CaptureFailure extends Error {
  constructor(message:string,public code:string,public status=502){super(message);}
}
function sourceText(message:any):string {
  const content=message?.content;
  if((Array.isArray(content?.parts)&&content.parts.some((p:any)=>typeof p!=='string'))||(content?.content_type&&!['text','multimodal_text'].includes(content.content_type)))throw new CaptureFailure('This shared conversation includes attachments or non-text content that cannot be preserved completely. Use a reviewed text export instead.','SHARE_UNSUPPORTED_CONTENT',422);
  return Array.isArray(content?.parts)?content.parts.join('\n\n'):typeof content?.text==='string'?content.text:'';
}
function sourceDate(value:unknown){if(typeof value!=='number'||!Number.isFinite(value))return undefined;const date=new Date(value*1000);return Number.isFinite(date.getTime())?date.toISOString():undefined;}
export function upstreamFailure(status:number){
  if(status===429)return {status:429,code:'SHARE_RATE_LIMITED',retryable:true,error:'ChatGPT is temporarily limiting share requests. Wait a little, then retry. Your link has been kept; you can also import copied text.'};
  if(status>=500)return {status:status===503?503:502,code:'SHARE_UPSTREAM_UNAVAILABLE',retryable:true,error:'ChatGPT’s share service is temporarily unavailable (HTTP '+status+'). This does not establish whether the link is public or private. Retry shortly, or import copied text.'};
  if(status===401||status===403)return {status:422,code:'SHARE_ACCESS_BLOCKED',retryable:false,error:'ChatGPT did not allow this server to read the share page (HTTP '+status+'). The link may still open in your browser. Check it there, or import copied text.'};
  if(status===404||status===410)return {status:422,code:'SHARE_NOT_FOUND',retryable:false,error:'The share page was not found or is no longer available (HTTP '+status+'). Check the copied Share link, or import copied text.'};
  return {status:422,code:'SHARE_UPSTREAM_RESPONSE',retryable:false,error:'The share page returned HTTP '+status+'. Open it in your browser to check it, or import copied text.'};
}
async function waitToRetry(signal:AbortSignal){await new Promise<void>((resolve,reject)=>{if(signal.aborted){reject(signal.reason);return}const aborted=()=>{clearTimeout(timer);reject(signal.reason)};const timer=setTimeout(()=>{signal.removeEventListener('abort',aborted);resolve()},350);signal.addEventListener('abort',aborted,{once:true})});}
function parseShare(html: string) {
  // Current public-share pages expose JSON data; never execute page scripts.
  const current=html.match(/<script\b(?=[^>]*\bid=["']__WEB_MOBILE_DATA__["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i);
  if(current){try{
    const payload=JSON.parse(current[1]);const c=payload?.conversation;
    if(c?.sharedSource&&c?.sharedContent&&Array.isArray(c.messages)&&c.messages.length){
      const ids=new Set<string>();
      const messages=c.messages.map((m:any)=>{
        if(!m||!['user','assistant','system'].includes(m.role)||typeof m.content!=='string'||typeof m.id!=='string'||!m.id||ids.has(m.id)||m.attachments?.length||m.fileAttachments?.length)throw new CaptureFailure('This shared page contains content that cannot be preserved completely as text. Use a reviewed text export.','SHARE_UNSUPPORTED_CONTENT',422);
        ids.add(m.id);return {id:m.id,role:m.role,content:m.content};
      });
      const rawDate=c.sharedContent.originalCreatedAt;
      const date=typeof rawDate==='number'?sourceDate(rawDate>100000000000?rawDate/1000:rawDate):undefined;
      return {title:typeof c.title==='string'?c.title:typeof c.sharedContent.title==='string'?c.sharedContent.title:'Captured Conversation',model:'ChatGPT',messages,...(date?{originalCreatedAt:date}:{}),limitations:['Text and source links are preserved. Linked files and attachments are not downloaded by share capture.']};
    }
  }catch(error){if(error instanceof CaptureFailure)throw error;}}

  const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextMatch) {
    try {
      const obj = JSON.parse(nextMatch[1]);
      const d = obj?.props?.pageProps?.serverResponse?.data;
      if (d) {
        const messages = (d.linear_conversation || []).flatMap((entry: any, i: number) => {
          const msg = entry.message;
          const role = msg?.author?.role;
          if (!['user','assistant'].includes(role)) return [];
          const content = sourceText(msg);
          return content.trim() ? [{id: msg.id || 'msg-'+i, role, content,...(sourceDate(msg.create_time)?{timestamp:sourceDate(msg.create_time)}:{})}] : [];
        });
        if (messages.length) return {title:d.title || 'Captured Conversation',model:d.model?.slug || 'ChatGPT',...(sourceDate(d.create_time)?{originalCreatedAt:sourceDate(d.create_time)}:{}),messages};
      }
    } catch(error) {if(error instanceof CaptureFailure)throw error;}
  }
  const stream = html.match(/streamController\.enqueue\(([\s\S]*?)\);\s*<\/script>/);
  if (stream) {
    try {
      const arr = JSON.parse(JSON.parse(stream[1]));
      if (!Array.isArray(arr)) return null;
      const resolve = (v:any, depth=0, seen=new Set<number>()):any => {
        if(depth>10) return null;
        if(typeof v==='number' && v>=0 && v<arr.length) {
          if(seen.has(v)) return null;
          const next=new Set(seen);next.add(v);return resolve(arr[v],depth+1,next);
        }
        if(Array.isArray(v)) return v.map(x=>resolve(x,depth+1,new Set(seen)));
        if(v && typeof v==='object') {
          const out:any={};
          for(const [k,value] of Object.entries(v)) {
            const key=k.startsWith('_') ? arr[Number(k.slice(1))] || k : k;
            out[key]=resolve(value,depth+1,new Set(seen));
          }
          return out;
        }
        return v;
      };
      const lc=arr.indexOf('linear_conversation');
      if(lc<0) return null;
      let items:any[]|null=null;
      for(const v of arr) {
        if(v && typeof v==='object' && !Array.isArray(v) && typeof v['_'+lc]==='number') {
          const idx=v['_'+lc];
          if(Array.isArray(arr[idx])) {items=arr[idx];break;}
        }
      }
      if(!items) return null;
      const messages=items.flatMap((entry:any,i:number)=>{
        const node=resolve(entry);
        const msg=node?.message;
        const role=msg?.author?.role;
        if(!['user','assistant'].includes(role)) return [];
        const content=sourceText(msg);
        return content.trim() ? [{id:msg.id || 'msg-'+i,role,content,...(sourceDate(msg.create_time)?{timestamp:sourceDate(msg.create_time)}:{})}] : [];
      });
      if(messages.length) {
        const titleIdx=arr.indexOf('pageTitle');
        const modelIdx=arr.indexOf('default_model_slug');
        return {title: typeof arr[titleIdx+1]==='string' ? arr[titleIdx+1] : 'Captured Conversation',model:typeof arr[modelIdx+1]==='string' ? arr[modelIdx+1] : 'ChatGPT',messages};
      }
    } catch(error) {if(error instanceof CaptureFailure)throw error;}
  }
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({success:false,error:'Use POST to capture a conversation.'});
  const {url,rawText}=req.body || {};
  const text=typeof url==='string' ? url : typeof rawText==='string' ? rawText : '';
  const found=text.match(/https?:\/\/(?:chatgpt\.com|chat\.openai\.com)\/share\/[a-zA-Z0-9_-]+/i);
  if(!found) {
    if(typeof rawText==='string' && rawText.trim().length>20 && !/^https?:\/\//.test(rawText.trim())) {
      const lines=rawText.trim().split(/\n(?=(?:User|Assistant|ChatGPT|Human|AI):\s*)/i);
      const messages=lines.flatMap((line:string,i:number)=>{
        const match=line.match(/^(User|Assistant|ChatGPT|Human|AI):\s*([\s\S]+)/i);
        if(!match) return [];
        return [{id:'raw-'+i,role:/user|human/i.test(match[1])?'user':'assistant',content:match[2].trim()}];
      });
      if(messages.length) return res.status(200).json({success:true,data:{title:'Pasted Conversation',model:'Unknown',messages,capturedAt:new Date().toISOString()}});
      return res.status(422).json({success:false,error:'Could not identify speaker turns in pasted text. Start each turn with User: or Assistant:.'});
    }
    return res.status(400).json({success:false,error:'This is not a public ChatGPT share link. In ChatGPT choose Share → Copy link. The URL must contain /share/ (not /s/t_).'});
  }
  const cleanUrl=found[0];
  try {
    // Canonical HTTPS target, no redirects to unrelated hosts or private services.
    let target=new URL(cleanUrl);target.protocol='https:';
    let response:Response|undefined;
    const signal=AbortSignal.timeout(15000);
    for(let redirects=0;redirects<=3;redirects++){
      for(let attempt=0;attempt<2;attempt++){
        response=await fetch(target,{headers:{'User-Agent':'Mozilla/5.0 ChatGrab/1.0','Accept':'text/html,application/xhtml+xml'},signal,redirect:'manual'});
        const retryAfter=response.headers.get('retry-after');
        if(attempt===0&&[502,503,504].includes(response.status)&&(!retryAfter||/^0(?:\.\d+)?$/.test(retryAfter))){await response.body?.cancel();await waitToRetry(signal);continue;}
        break;
      }
      if(![301,302,303,307,308].includes(response.status))break;
      const location=response.headers.get('location');await response.body?.cancel();
      if(!location||redirects===3)throw new Error('Share link redirected too many times.');
      target=new URL(location,target);
      if(target.protocol!=='https:'||!['chatgpt.com','chat.openai.com'].includes(target.hostname)||target.port||target.username||target.password||!/^\/share\/[a-zA-Z0-9_-]+\/?$/.test(target.pathname))throw new Error('Share link redirected outside the supported public share path.');
    }
    if(!response)throw new Error('No response from share page.');
    if(!response.ok){const failure=upstreamFailure(response.status);const retry=response.headers.get('retry-after');if(retry&&/^\d+$/.test(retry))res.setHeader('Retry-After',String(Math.min(Number(retry),3600)));return res.status(failure.status).json({success:false,...failure,upstreamStatus:response.status,allowFallbackPaste:true});}
    const reader=response.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
    if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8*1024*1024){await reader.cancel();throw new Error('Share page exceeds the 8 MB capture limit. Use a text export instead.');}chunks.push(value);}}
    const html=Buffer.concat(chunks).toString('utf8');
    const parsed=parseShare(html);
    if(!parsed) return res.status(422).json({success:false,code:'SHARE_PARSE_UNSUPPORTED',error:'The shared page opened, but its transcript could not be extracted. Try pasting the transcript text.',allowFallbackPaste:true});
    return res.status(200).json({success:true,data:{...parsed,sourceUrl:cleanUrl,capturedAt:new Date().toISOString()}});
  } catch(err:any) {
    if(err instanceof CaptureFailure)return res.status(err.status).json({success:false,code:err.code,error:err.message,allowFallbackPaste:true});
    const timeout=err?.name==='TimeoutError'||err?.name==='AbortError';
    const boundary=typeof err?.message==='string'&&(/outside the supported|redirected too many|8 MB/.test(err.message));
    return res.status(timeout?504:502).json({success:false,code:timeout?'SHARE_TIMEOUT':boundary?'SHARE_FETCH_LIMIT':'SHARE_NETWORK_FAILURE',error:boundary?err.message:timeout?'The share request timed out. Your link has been kept. Retry shortly, or import copied text.':'ChatGrab could not reach the share service. Your link has been kept. Retry shortly, or import copied text.',retryable:!boundary,allowFallbackPaste:true});
  }
}
