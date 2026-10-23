import React, { useState } from 'react';
import { X, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { WorkerRecord } from '../../types';

interface PromoteVersionModalProps {
  worker: WorkerRecord;
  isOpen: boolean;
  onClose: () => void;
  onPromote: (workerId: string, newVersion: string, releaseNote: string) => boolean;
}

export const PromoteVersionModal: React.FC<PromoteVersionModalProps> = ({
  worker,
  isOpen,
  onClose,
  onPromote,
}) => {
  const [newVersion, setNewVersion] = useState('');
  const [releaseNote, setReleaseNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion.trim()) {
      setError('Version identifier is required.');
      return;
    }
    if (!releaseNote.trim()) {
      setError('A governance release note is required for version promotion.');
      return;
    }

    if (!onPromote(worker.worker_id, newVersion.trim(), releaseNote.trim())) { setError('Change rejected. Check for duplicate identifiers, invalid references, or an already recorded version.'); return; }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promote-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85dvh] overflow-y-auto animate-fade-in">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 id="promote-modal-title" className="text-sm font-semibold text-white">
                Promote Worker Version — {worker.canonical_name}
              </h2>
              <p className="text-xs text-slate-400">
                Local version record only; does not authorize succession. worker_id="{worker.worker_id}"
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
              <strong className="text-cyan-300">Atlas Correction C1 Axiom:</strong> Version promotion
              updates the worker's version attribute while preserving its stable identifier and all
              associated work lanes. It <em>never</em> creates a duplicate or orphaned worker record.
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
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Current Version
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
                {worker.current_version ? `v${worker.current_version}` : 'unversioned'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1">
                New Target Version *
              </label>
              <input
                id="input-new-version"
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Governance & Release Note *
            </label>
            <textarea
              id="textarea-release-note"
              value={releaseNote}
              onChange={(e) => setReleaseNote(e.target.value)}
              placeholder="Detail reasons for promotion, verified continuity milestones, and architectural changes..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-promote-version"
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Record Version Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
