import React,{useEffect,useState} from 'react';
export function DownloadFile({text,filename,type,children,className,disabled=false}:{text:string;filename:string;type:string;children:React.ReactNode;className?:string;disabled?:boolean}){
 const [url,setUrl]=useState('');
 const [copyState,setCopyState]=useState<'idle'|'copied'|'manual'>('idle');
 useEffect(()=>{if(disabled){setUrl('');return;}const next=URL.createObjectURL(new Blob([text],{type}));setUrl(next);return()=>URL.revokeObjectURL(next);},[text,type,disabled]);
 const copy=async()=>{try{await navigator.clipboard.writeText(text);setCopyState('copied');}catch{setCopyState('manual');}};
 return <><a href={disabled?undefined:url||undefined} download={filename} className={className} aria-disabled={disabled||!url} onClick={e=>{if(disabled||!url)e.preventDefault();}}>{children}</a><div className="mt-1 mb-3 text-xs text-slate-600"><button type="button" disabled={disabled} aria-label={'Copy '+filename} onClick={copy} className="underline text-blue-700 py-2 disabled:opacity-40">Copy file contents</button><button type="button" disabled={disabled} onClick={()=>setCopyState(copyState==='manual'?'idle':'manual')} className="underline text-blue-700 py-2 ml-4">View file contents</button>{copyState==='copied'&&<span role="status" className="ml-2">Copied. Paste into a file to save.</span>}{copyState==='manual'&&<label className="block">File contents — select and copy to save manually.<textarea readOnly aria-label={'Contents of '+filename} value={text} className="w-full border rounded p-2 mt-2" rows={8}/></label>}</div></>;
}
