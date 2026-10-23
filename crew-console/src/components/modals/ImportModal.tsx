import { useState } from 'react';
import type { GovernedConsoleState } from '../../types';
import { MAX_IMPORT_BYTES, parseAndValidateImportJson } from '../../lib/validation';

export function ImportModal({ isOpen, onClose, onImportState }: { isOpen: boolean; onClose: () => void; onImportState: (state: GovernedConsoleState) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [staged, setStaged] = useState<GovernedConsoleState | null>(null);
  const [approved, setApproved] = useState(false);
  if (!isOpen) return null;
  const change = (value: string) => { setText(value); setError(''); setStaged(null); setApproved(false); };
  const close = () => { change(''); onClose(); };
  const validate = () => {
    setStaged(null); setApproved(false);
    try { setStaged(parseAndValidateImportJson(text)); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Invalid snapshot.'); }
  };
  return <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="import-title">
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto text-sm">
      <h2 id="import-title" className="font-semibold">Review a snapshot import</h2>
      <p>Validation checks structure, not truth or authority. Applying replaces the entire local snapshot, including workers and versions. Export a backup first.</p>
      <label className="block">Choose JSON (maximum 2 MB)
        <input id="file-upload-input" className="block w-full mt-2" type="file" accept=".json,application/json" onChange={async e => {
          const file = e.target.files?.[0]; if (!file) return;
          change('');
          if (file.size > MAX_IMPORT_BYTES) { setError('Snapshot exceeds the 2 MB import limit.'); return; }
          try { change(await file.text()); } catch { setError('Could not read the selected file.'); }
        }} />
      </label>
      <label className="block">Or paste snapshot JSON
        <textarea id="textarea-import-json" className="block w-full bg-slate-950 border border-slate-600 rounded p-2 mt-2 font-mono text-xs" rows={7} value={text} onChange={e => change(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-rose-300 break-words">Rejected; current snapshot unchanged. {error}</p>}
      {staged && <div className="border border-amber-700 rounded p-3 space-y-2 break-words">
        <p>Staged only: {staged.workers.length} workers, {staged.lanes.length} lanes, {staged.artifacts.length} artifacts, {staged.version_history.length} history records.</p>
        <p>Incoming coordinator: {staged.coordinator.canonical_name} {staged.coordinator.current_version}.</p>
        <p>Workers: {staged.workers.map(w => `${w.canonical_name} (${w.worker_id})`).join(', ')}.</p>
        <label className="flex gap-2 items-start"><input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} />I reviewed the source and approve replacing my local snapshot. This does not canonize its claims or authorize worker succession.</label>
      </div>}
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={close} className="px-3 py-2 border border-slate-600 rounded">Cancel</button>
        <button onClick={validate} className="px-3 py-2 bg-slate-700 rounded">Validate for review</button>
        <button id="btn-confirm-import-json" disabled={!staged || !approved} onClick={() => {
          if (!staged || !approved) return;
          onImportState(staged); close();
        }} className="px-3 py-2 bg-cyan-700 disabled:opacity-40 rounded">Replace local snapshot</button>
      </div>
    </div>
  </div>;
}
