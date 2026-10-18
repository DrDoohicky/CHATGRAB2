function parseShare(html: string) {
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
          const content = Array.isArray(msg.content?.parts) ? msg.content.parts.map((p:any) => typeof p === 'string' ? p : p?.text || '').join('\n\n') : msg.content?.text || '';
          return content.trim() ? [{id: msg.id || 'msg-'+i, role, content: content.trim()}] : [];
        });
        if (messages.length) return {title:d.title || 'Captured Conversation',model:d.model?.slug || 'ChatGPT',messages};
      }
    } catch {}
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
        const content=Array.isArray(msg.content?.parts) ? msg.content.parts.filter((p:any)=>typeof p==='string').join('\n\n') : msg.content?.text || '';
        return content.trim() ? [{id:msg.id || 'msg-'+i,role,content:content.trim()}] : [];
      });
      if(messages.length) {
        const titleIdx=arr.indexOf('pageTitle');
        const modelIdx=arr.indexOf('default_model_slug');
        return {title: typeof arr[titleIdx+1]==='string' ? arr[titleIdx+1] : 'Captured Conversation',model:typeof arr[modelIdx+1]==='string' ? arr[modelIdx+1] : 'ChatGPT',messages};
      }
    } catch {}
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
    const response=await fetch(cleanUrl,{headers:{'User-Agent':'Mozilla/5.0 ChatGrab/1.0','Accept':'text/html,application/xhtml+xml'},signal:AbortSignal.timeout(15000)});
    if(!response.ok) return res.status(422).json({success:false,error:'ChatGPT share page returned HTTP '+response.status+'. Check the link is publicly shared.',allowFallbackPaste:true});
    const html=await response.text();
    const parsed=parseShare(html);
    if(!parsed) return res.status(422).json({success:false,error:'The shared page opened, but its transcript could not be extracted. Try pasting the transcript text.',allowFallbackPaste:true});
    return res.status(200).json({success:true,data:{...parsed,sourceUrl:cleanUrl,capturedAt:new Date().toISOString()}});
  } catch(err:any) {
    return res.status(502).json({success:false,error:'Unable to fetch the ChatGPT share page: '+(err?.message||'network failure'),allowFallbackPaste:true});
  }
}
