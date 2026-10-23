import React, { useState } from 'react';
import { X, FileCode, Shield, AlertCircle } from 'lucide-react';
import { ArtifactRecord, ArtifactType, EvidenceState } from '../../types';

interface AddArtifactModalProps {
  laneId?: string | null;
  workerId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddArtifact: (artifact: ArtifactRecord) => boolean;
}

export const AddArtifactModal: React.FC<AddArtifactModalProps> = ({
  laneId,
  workerId,
  isOpen,
  onClose,
  onAddArtifact,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ArtifactType>('HANDOFF');
  const [reference, setReference] = useState('');
  const [evidenceState, setEvidenceState] = useState<EvidenceState>('UNKNOWN');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Artifact title is required.');
      return;
    }
    if (!reference.trim()) {
      setError('Reference or locator URI is required.');
      return;
    }

    const newArtifact: ArtifactRecord = {
      artifact_id: 'art-' + crypto.randomUUID(),
      worker_id: workerId,
      lane_id: laneId || null,
      type,
      title: title.trim(),
      reference: reference.trim(),
      evidence_state: evidenceState,
      created_at: new Date().toISOString(),
    };

    if (!onAddArtifact(newArtifact)) { setError('Change rejected. Check for duplicate identifiers, invalid references, or an already recorded version.'); return; }
    setTitle('');
    setReference('');
    setType('HANDOFF');
    setEvidenceState('UNKNOWN');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-artifact-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85dvh] overflow-y-auto animate-fade-in">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 id="add-artifact-title" className="text-sm font-semibold text-white">
                Attach Artifact & Evidence Pointer
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Tied to worker: {workerId} {laneId ? `• lane: ${laneId}` : ''}
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
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1">
              Artifact Title *
            </label>
            <input
              id="input-artifact-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session Handoff Summary, Synthesis Profile, Verification Packet"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Artifact Type
              </label>
              <select
                id="select-artifact-type"
                value={type}
                onChange={(e) => setType(e.target.value as ArtifactType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="HANDOFF">HANDOFF</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="SPEC">SPEC</option>
                <option value="EVIDENCE">EVIDENCE</option>
                <option value="LINK">LINK</option>
                <option value="TRANSCRIPT">TRANSCRIPT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1">
                Evidence State *
              </label>
              <select
                id="select-evidence-state"
                value={evidenceState}
                onChange={(e) => setEvidenceState(e.target.value as EvidenceState)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="VERIFIED_FACT">VERIFIED_FACT</option>
                <option value="SUPPORTED_CONCLUSION">SUPPORTED_CONCLUSION</option>
                <option value="INFERENCE">INFERENCE</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="RECONSTRUCTION">RECONSTRUCTION</option>
                <option value="UNRESOLVED_CONTRADICTION">UNRESOLVED_CONTRADICTION</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1">
              Reference / URI Pointer *
            </label>
            <input
              id="input-artifact-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. file://..., packet://..., https://..., or capsule://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              required
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
              id="btn-confirm-add-artifact"
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Attach Artifact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
