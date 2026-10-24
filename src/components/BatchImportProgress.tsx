import React from 'react';
import type {BatchImporter,ImportState} from '../lib/batch-import';
import './batch-import.css';
export function BatchImportProgress({enabled,queue,state,onOpen}:{enabled:boolean;queue:BatchImporter;state:ImportState;onOpen:()=>void}){
 if(!state.items.length)return null;
 const done=state.items.filter(item=>item.status==='succeeded').length;
 const failed=state.items.filter(item=>item.status==='failed').length;
 const cancelled=state.items.filter(item=>item.status==='cancelled').length;
 const pending=state.items.filter(item=>item.status==='queued').length;
 return <aside className="cg-batch-progress" aria-label="Background import progress">
  <div className="cg-batch-summary"><strong>{state.running?'Importing in background':pending?'Batch paused':'Batch finished'}</strong><span role="status">{done} imported · {failed} failed · {cancelled} cancelled · {state.items.length} total</span></div>
  <progress aria-label="Batch import completion" max={state.items.length} value={done+failed+cancelled}/>
  <div className="cg-batch-actions">{state.running?<button onClick={()=>queue.pause()}>Pause imports</button>:pending>0?<button disabled={!enabled} onClick={()=>void queue.resume()}>Resume imports</button>:null}{(state.running||pending>0)&&<button onClick={()=>queue.cancel()}>Cancel remaining</button>}{!state.running&&(failed>0||cancelled>0)&&<button disabled={!enabled} onClick={()=>queue.retry()}>Retry unsuccessful</button>}<button onClick={onOpen}>Open Capture</button>{!state.running&&!pending&&<button onClick={()=>queue.dismiss()}>Dismiss progress</button>}<details><summary>Import details</summary><ol>{state.items.map(item=><li key={item.id}><span>{item.url}</span><strong>{item.status}</strong>{item.error&&<p>{item.error}</p>}</li>)}</ol><p>Imports continue while you use other pages in this tab. After closing or reloading it, unfinished work is paused until you resume. Browser throttling may slow imports.</p></details></div>
  {state.storageError&&<p role="alert">Queue recovery could not be saved. Keep this tab open; imported conversations are saved separately in Library.</p>}
 </aside>;
}
