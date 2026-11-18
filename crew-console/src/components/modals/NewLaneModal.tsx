import React, { useState } from 'react';
import { X, Layers, Shield, AlertCircle } from 'lucide-react';
import { LaneStatus, SourceType, WorkerRecord } from '../../types';

interface NewLaneModalProps {
  worker: WorkerRecord;
  isOpen: boolean;
  onClose: () => void;
  onCreateLane: (
    workerId: string,
    displayName: string,
    purpose: string,
    status: LaneStatus,
    sourceType: SourceType,
    sourceReference: string,
    pinned: boolean
  ) => boolean;
}

export const NewLaneModal: React.FC<NewLaneModalProps> = ({
  worker,
  isOpen,
  onClose,
  onCreateLane,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState<LaneStatus>('ACTIVE');
  const [sourceType, setSourceType] = useState<SourceType>('CHATGPT_URL');
  const [sourceReference, setSourceReference] = useState('');
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Lane display name is required.');
      return;
    }

    const saved = onCreateLane(
      worker.worker_id,
      displayName.trim(),
      purpose.trim(),
      status,
      sourceType,
      sourceReference.trim(),
      pinned
    );

    if (!saved) { setError('Lane rejected. Check the source reference and field lengths.'); return; }
    // Reset form
    setDisplayName('');
    setPurpose('');
    setStatus('ACTIVE');
    setSourceType('CHATGPT_URL');
    setSourceReference('');
    setPinned(false);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-lane-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85dvh] overflow-y-auto animate-fade-in">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 id="new-lane-title" className="text-sm font-semibold text-white">
                Create Work Lane under {worker.canonical_name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Assigned worker_id: {worker.worker_id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300">Governance Invariant:</strong> Creating a new lane
              never creates a new worker. This lane is strictly an operational branch beneath{' '}
              <span className="font-mono font-semibold text-white">{worker.canonical_name}</span>.
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1">
              Lane Display Name *
            </label>
            <input
              id="input-modal-lane-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Architecture RFC, Alexa Loop Experiments"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Organizational label only; never establishes canonical worker identity.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Purpose & Governance Scope
            </label>
            <input
              id="input-modal-lane-purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What task, continuity stream, or review is tracked here?"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Initial Status
              </label>
              <select
                id="select-modal-lane-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LaneStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="HELD">HELD</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Source Type
              </label>
              <select
                id="select-modal-source-type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="CHATGPT_URL">ChatGPT Link</option>
                <option value="EXTERNAL_REFERENCE">External Repo / Ref</option>
                <option value="CONTINUITY_CAPSULE">Continuity Capsule</option>
                <option value="MANUAL">Manual Lane</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Source Reference Link / URI
            </label>
            <input
              id="input-modal-source-ref"
              type="text"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder="e.g. https://chatgpt.com/c/... or repo://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="checkbox-modal-pinned"
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="checkbox-modal-pinned" className="text-xs text-slate-300">
              Pin to top of worker lane list
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-create-lane"
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Create Work Lane
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
