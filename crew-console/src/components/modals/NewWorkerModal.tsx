import React, { useState } from 'react';
import { X, Plus, Shield, AlertCircle } from 'lucide-react';
import { WorkerRecord, WorkerStatus } from '../../types';

interface NewWorkerModalProps {
  existingWorkers: WorkerRecord[];
  isOpen: boolean;
  onClose: () => void;
  onRegisterWorker: (worker: WorkerRecord) => boolean;
}

export const NewWorkerModal: React.FC<NewWorkerModalProps> = ({
  existingWorkers,
  isOpen,
  onClose,
  onRegisterWorker,
}) => {
  const [canonicalName, setCanonicalName] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [version, setVersion] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [relatedWorkerId, setRelatedWorkerId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setCanonicalName(val);
    if (!workerId || workerId === canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '_')) {
      setWorkerId(val.toLowerCase().trim().replace(/[^a-z0-9]/g, '_'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = workerId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId) {
      setError('Worker ID identifier is required.');
      return;
    }
    if (!canonicalName.trim()) {
      setError('Canonical name is required.');
      return;
    }
    if (!role.trim()) {
      setError('Worker role is required.');
      return;
    }

    if (existingWorkers.some((w) => w.worker_id === cleanId)) {
      setError(`A canonical worker with worker_id="${cleanId}" already exists.`);
      return;
    }

    const now = new Date().toISOString();
    const newWorker: WorkerRecord = {
      worker_id: cleanId,
      canonical_name: canonicalName.trim(),
      current_version: version.trim() ? version.trim() : null,
      role: role.trim(),
      description: description.trim(),
      status: 'ACTIVE' as WorkerStatus,
      related_worker_id: relatedWorkerId.trim() ? relatedWorkerId.trim() : null,
      created_at: now,
      updated_at: now,
    };

    if (!onRegisterWorker(newWorker)) { setError('Change rejected. Check for duplicate identifiers, invalid references, or an already recorded version.'); return; }
    // Reset
    setCanonicalName('');
    setWorkerId('');
    setVersion('');
    setRole('');
    setDescription('');
    setRelatedWorkerId('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-worker-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85dvh] overflow-y-auto animate-fade-in">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="new-worker-title" className="text-sm font-semibold text-white">
                Register Canonical Worker
              </h2>
              <p className="text-xs text-slate-400">
                Establishes persistent identity under Mothership governance
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
              <strong className="text-cyan-300">Governed Identity Axiom:</strong> Worker identity is
              permanent and stable. It cannot be created arbitrarily by chats or renamed casually.
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1">
                Canonical Name *
              </label>
              <input
                id="input-modal-worker-name"
                type="text"
                value={canonicalName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Chronos"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Worker ID (Immutable Key) *
              </label>
              <input
                id="input-modal-worker-id"
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g. chronos"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Initial Version (Optional)
              </label>
              <input
                id="input-modal-worker-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.0 (or leave empty)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Related Worker (Optional)
              </label>
              <select
                id="select-modal-related-worker"
                value={relatedWorkerId}
                onChange={(e) => setRelatedWorkerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">None (Independent)</option>
                {existingWorkers.map((w) => (
                  <option key={w.worker_id} value={w.worker_id}>
                    {w.canonical_name} ({w.worker_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1">
              Role & Primary Mandate *
            </label>
            <input
              id="input-modal-worker-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Temporal Analysis, Timeline Validation"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Description
            </label>
            <textarea
              id="textarea-modal-worker-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe boundary responsibilities and continuity expectations..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
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
              id="btn-confirm-register-worker"
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Register Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
