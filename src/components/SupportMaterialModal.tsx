import React, { useEffect, useMemo, useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon, File, Link2, Pencil, ExternalLink } from 'lucide-react';
import { ConversationThread, SupportAsset } from '../types';

import { listAssets, saveAsset } from '../lib/assets';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
  if (type.includes('pdf') || type.startsWith('text/')) return <FileText className="w-5 h-5 text-rose-600" />;
  return <File className="w-5 h-5 text-slate-500" />;
}

interface Props { inline?: boolean;
  isOpen: boolean;
  onClose: () => void;
  threads: ConversationThread[];
  activeThread?: ConversationThread | null;
  onAssetLinked?: (threadId: string, assetId: string) => void;
}

export const SupportMaterialModal: React.FC<Props> = ({ inline=false, isOpen, onClose, threads, activeThread, onAssetLinked }) => {
  const [assets, setAssets] = useState<(SupportAsset & { blob?: Blob })[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<SupportAsset['kind']>('supplementary');
  const [threadId, setThreadId] = useState(activeThread?.id || '');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [renaming,setRenaming]=useState<{asset:SupportAsset & {blob?:Blob};name:string}|null>(null);

  const linkedTitle = useMemo(() => threads.find(t => t.id === threadId)?.title, [threads, threadId]);

  useEffect(() => {
    if (!isOpen) return;
    setThreadId(activeThread?.id || '');
    listAssets().then(setAssets).catch(() => setAssets([]));
  }, [isOpen, activeThread?.id]);

  if (!isOpen) return null;

  const ingest = async () => {
    if (!files.length) return;
    setStatus('Saving original files locally…');
    try {
    for (const f of files) {
      let textPreview: string | undefined;
      if ((f.type.startsWith('text/') || /\.(json|md|txt|csv|html|xml)$/i.test(f.name)) && f.size <= 1_500_000) {
        try { textPreview = (await f.text()).slice(0, 120000); } catch { }
      }
      const asset: SupportAsset & { blob: Blob } = {
        id: crypto.randomUUID(),
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        uploadedAt: new Date().toISOString(),
        originalModifiedAt: new Date(f.lastModified).toISOString(),
        kind,
        notes: notes.trim() || undefined,
        linkedThreadId: threadId || undefined,
        linkedThreadTitle: linkedTitle,
        textPreview,
        blob: f,
      };
      await saveAsset(asset);
      if (threadId) onAssetLinked?.(threadId, asset.id);
    }
    setFiles([]); setNotes(''); setStatus('Saved to the browser-local Support Library.');
    setAssets(await listAssets());
    }catch{setStatus('Files could not be saved. Browser storage may be unavailable or full. Your original files were not changed.');}
  };

  const openAsset = async (asset: SupportAsset & { blob?: Blob }) => {
    if (!asset.blob) return;
    const url = URL.createObjectURL(asset.blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  };

  const rename = (asset:SupportAsset & {blob?:Blob}) => setRenaming({asset,name:asset.name});
  const saveRename=async(e:React.FormEvent)=>{
   e.preventDefault();if(!renaming?.name.trim())return;
   try{await saveAsset({...renaming.asset,name:renaming.name.trim()});setAssets(await listAssets());setRenaming(null);setStatus('File renamed.');}
   catch{setStatus('The rename could not be saved.');}
  };

  return (
    <div className={inline ? "cg-destination" : "fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-sm"}>
      <div className={inline ? "bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 relative" : "w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-7 relative"}>
        {!inline && <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center"><X className="w-4 h-4" /></button>}
        <div className="text-[11px] font-bold tracking-widest text-blue-700 uppercase">SUPPORT MATERIAL</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Add the files that belong around the conversation.</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">PDFs, screenshots, generated images, JSON, documents, audio/video, exports, and external evidence can be preserved without pretending they were part of the transcript.</p>

        <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setFiles(Array.from(e.dataTransfer.files));}} className="mt-5 min-h-36 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 p-5 text-center cursor-pointer hover:bg-blue-50">
          <Upload className="w-7 h-7 text-blue-600" />
          <b className="text-sm text-slate-900">Drop files here or choose from this device</b>
          <span className="text-xs text-slate-500">Multiple files are supported.</span>
          <input type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
        </label>

        {files.length > 0 && <div className="mt-3 space-y-2">{files.map(f => <div key={`${f.name}-${f.size}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">{iconFor(f.type)}<div><b className="text-sm">{f.name}</b><div className="text-xs text-slate-500">{f.type || 'unknown type'} · {formatBytes(f.size)}</div></div></div>)}</div>}

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <label className="text-xs font-semibold text-slate-700">Material type
            <select value={kind} onChange={e => setKind(e.target.value as SupportAsset['kind'])} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
              <option value="supplementary">Supplementary reference</option><option value="chat_artifact">Artifact from the chat</option><option value="generated_media">Generated image / media</option><option value="evidence">Evidence / source material</option><option value="other">Other support material</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">Link to conversation
            <select value={threadId} onChange={e => setThreadId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
              <option value="">Unlinked Support Library</option>{threads.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </label>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional context: what is this file, where did it come from, and why does it matter?" className="mt-3 w-full min-h-20 px-3 py-2 border border-slate-300 rounded-xl text-sm" />
        <div className="mt-3 flex items-center gap-3"><button onClick={ingest} disabled={!files.length} className="px-5 py-2.5 rounded-xl bg-[#0e274c] text-white text-sm font-semibold disabled:opacity-40">Save Support Material</button><span className="text-xs text-slate-500">Stored locally in this browser; no cloud-sync claim.</span></div>
        {status && <div className="mt-2 text-xs text-emerald-700 font-semibold">{status}</div>}

        {renaming&&<form onSubmit={saveRename} className="mt-4 p-4 border rounded-xl"><label className="block font-semibold">File name<input autoFocus aria-label="File name" value={renaming.name} onChange={e=>setRenaming({...renaming,name:e.target.value})} className="block mt-2 border rounded-lg p-2 w-full"/></label><button type="submit" className="px-3 py-2 mt-2 text-blue-700 font-bold">Save file name</button><button type="button" onClick={()=>setRenaming(null)} className="px-3 py-2">Cancel rename</button></form>}
        <div className="mt-7 pt-5 border-t border-slate-200"><div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-blue-600" /><h3 className="font-bold">Support Library</h3></div>
          <div className="mt-3 space-y-2">{assets.length ? assets.map(a => <div key={a.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3 border border-slate-200 rounded-xl">{iconFor(a.type)}<div className="min-w-0"><b className="text-sm block truncate">{a.name}</b><span className="text-xs text-slate-500 block truncate">{formatBytes(a.size)} · {a.linkedThreadTitle ? `Linked to ${a.linkedThreadTitle}` : 'Unlinked'}{a.notes ? ` · ${a.notes}` : ''}</span></div><div className="flex gap-1"><button onClick={() => openAsset(a)} className="p-2 rounded-lg hover:bg-slate-100" title="Open"><ExternalLink className="w-4 h-4" /></button><button onClick={() => rename(a)} className="p-2 rounded-lg hover:bg-slate-100" title="Rename"><Pencil className="w-4 h-4" /></button></div></div>) : <div className="text-sm text-slate-400 py-6 text-center">No support material saved yet.</div>}</div>
        </div>
      </div>
    </div>
  );
};
