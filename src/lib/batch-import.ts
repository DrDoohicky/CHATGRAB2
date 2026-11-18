import type {ConversationThread} from '../types';
export type ImportItem={id:string;url:string;status:'queued'|'running'|'succeeded'|'failed'|'cancelled';error?:string};
export type ImportState={items:ImportItem[];running:boolean;storageError:boolean};
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'>;
export class BatchImporter {
  private state:ImportState={items:[],running:false,storageError:false};
  private listeners=new Set<()=>void>();
  private epoch=0;
  private controller:AbortController|null=null;
  private scope='guest';
  constructor(private save:(thread:ConversationThread,scope:string)=>void,private request:typeof fetch=fetch,private storage?:Storage){this.load();}
  snapshot=()=>this.state;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private key(){return 'chatgrab_batch_queue_v1:'+this.scope;}
  private load(){
    let items:ImportItem[]=[];
    try{const raw=JSON.parse(this.storage?.getItem(this.key())||'[]');if(Array.isArray(raw))items=raw.slice(0,100).filter(item=>item&&typeof item.id==='string'&&this.clean(item.url)&&['queued','running','succeeded','failed','cancelled'].includes(item.status)).map(item=>({id:item.id,url:this.clean(item.url)!,status:item.status==='running'?'queued':item.status,error:typeof item.error==='string'?item.error.slice(0,300):undefined}));}catch{/* A damaged queue must not affect the library. */}
    this.state={items,running:false,storageError:false};
  }
  private clean(value:unknown){if(typeof value!=='string'||value.length>600)return null;try{const u=new URL(value);if(u.protocol!=='https:'||!['chatgpt.com','chat.openai.com'].includes(u.hostname)||!/^\/share\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname)||u.username||u.password)return null;return 'https://chatgpt.com'+u.pathname.replace(/\/$/,'');}catch{return null;}}
  private emit(){
    try{this.storage?.setItem(this.key(),JSON.stringify(this.state.items));}catch{this.state={...this.state,storageError:true};}
    this.listeners.forEach(listener=>listener());
  }
  setScope(scope:string){if(scope===this.scope)return;this.pause();this.scope=scope;this.load();this.emit();}
  start(text:string){
    if(this.state.running||this.state.items.some(item=>item.status==='queued'))throw Error('Resume or cancel the unfinished batch first.');
    const lines=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    if(!lines.length||lines.length>100)throw Error('Enter 1–100 public share URLs, one per line.');
    const urls=lines.map(line=>this.clean(line));if(urls.some(url=>!url))throw Error('Every line must be a public ChatGPT /share/ URL.');
    this.state={...this.state,items:[...new Set(urls as string[])].map((url,index)=>({id:'item-'+index,url,status:'queued'}))};this.emit();void this.resume();
  }
  pause(){this.epoch++;this.controller?.abort();this.controller=null;this.state={...this.state,running:false,items:this.state.items.map(item=>item.status==='running'?{...item,status:'queued'}:item)};this.emit();}
  cancel(){this.pause();this.state={...this.state,items:this.state.items.map(item=>item.status==='queued'?{...item,status:'cancelled'}:item)};this.emit();}
  dismiss(){if(this.state.running||this.state.items.some(item=>item.status==='queued'))return;this.state={...this.state,items:[]};this.emit();}
  retry(){if(this.state.running)return;this.state={...this.state,items:this.state.items.map(item=>item.status==='failed'||item.status==='cancelled'?{...item,status:'queued',error:undefined}:item)};this.emit();void this.resume();}
  async resume(){
    if(this.state.running||!this.state.items.some(item=>item.status==='queued'))return;
    const version=++this.epoch;this.state={...this.state,running:true};this.emit();
    while(version===this.epoch){
      const item=this.state.items.find(row=>row.status==='queued');if(!item)break;
      this.state={...this.state,items:this.state.items.map(row=>row.id===item.id?{...row,status:'running',error:undefined}:row)};this.emit();
      const controller=new AbortController();this.controller=controller;
      const timeout=setTimeout(()=>controller.abort(),45000);
      try{
        const response=await this.request.call(globalThis,'/api/fetch-share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:item.url}),signal:controller.signal});
        const result=await response.json();if(version!==this.epoch)return;
        if(!response.ok||!result.success||!Array.isArray(result.data?.messages)||!result.data.messages.length)throw Error(typeof result.error==='string'?result.error:'Could not capture this share link.');
        const messages=result.data.messages.map((message:any,index:number)=>{if(!message||!['user','assistant','system'].includes(message.role)||typeof message.content!=='string')throw Error('Capture returned an invalid transcript.');return {...message,id:typeof message.id==='string'?message.id:'message-'+index};});
        this.save({id:'batch-'+item.url.split('/').pop(),title:result.data.title||'Captured Conversation',sourceUrl:item.url,capturedAt:new Date().toISOString(),model:result.data.model||'ChatGPT',messages},this.scope);
        this.state={...this.state,items:this.state.items.map(row=>row.id===item.id?{...row,status:'succeeded'}:row)};
      }catch(error){if(version!==this.epoch)return;this.state={...this.state,items:this.state.items.map(row=>row.id===item.id?{...row,status:'failed',error:(controller.signal.aborted?'Capture timed out; retry this link.':error instanceof Error?error.message:'Capture failed.').slice(0,300)}:row)};}
      finally{clearTimeout(timeout);if(this.controller===controller)this.controller=null;}
      this.emit();
    }
    if(version===this.epoch){this.state={...this.state,running:false};this.emit();}
  }
}


