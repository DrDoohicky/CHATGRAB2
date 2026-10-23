import { isWebReference } from '../lib/validation';
import React, { useState, useEffect } from 'react';
import {
  Pin,
  Archive,
  ExternalLink,
  Plus,
  Save,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Tag,
  FileText,
  FileCode,
  Link,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import {
  ArtifactRecord,
  EvidenceState,
  LaneRecord,
  LaneStatus,
  SourceType,
  WorkerRecord,
} from '../types';

interface LaneDetailPanelProps {
  lane: LaneRecord;
  worker: WorkerRecord;
  artifacts: ArtifactRecord[];
  onUpdateLane: (updated: Partial<LaneRecord>) => boolean;
  onOpenAddArtifact: (laneId: string, workerId: string) => void;
  onDeleteArtifact: (artifactId: string) => void;
}

export const LaneDetailPanel: React.FC<LaneDetailPanelProps> = ({
  lane,
  worker,
  artifacts,
  onUpdateLane,
  onOpenAddArtifact,
  onDeleteArtifact,
}) => {
  const [displayName, setDisplayName] = useState(lane.display_name);
  const [purpose, setPurpose] = useState(lane.purpose);
  const [sourceType, setSourceType] = useState<SourceType>(lane.source_type);
  const [sourceRef, setSourceRef] = useState(lane.source_reference);
  const [notes, setNotes] = useState(lane.continuity_notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever lane changes
  useEffect(() => {
    setDisplayName(lane.display_name);
    setPurpose(lane.purpose);
    setSourceType(lane.source_type);
    setSourceRef(lane.source_reference);
    setNotes(lane.continuity_notes || '');
    setSavedSuccess(false);
  }, [lane.lane_id, lane.display_name, lane.purpose, lane.source_reference, lane.source_type, lane.continuity_notes]);

  const handleSaveAll = () => {
    const saved = onUpdateLane({
      display_name: displayName.trim(),
      purpose: purpose.trim(),
      source_type: sourceType,
      source_reference: sourceRef.trim(),
      continuity_notes: notes.trim(),
      updated_at: new Date().toISOString(),
    });
    setSavedSuccess(saved);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const getEvidenceBadge = (state: EvidenceState) => {
    switch (state) {
      case 'VERIFIED_FACT':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'SUPPORTED_CONCLUSION':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'INFERENCE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'PROPOSAL':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'RECONSTRUCTION':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'UNRESOLVED_CONTRADICTION':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const laneArtifacts = artifacts.filter(
    (a) => a.lane_id === lane.lane_id || (a.worker_id === worker.worker_id && !a.lane_id)
  );

  return (
    <div id={`lane-detail-panel-${lane.lane_id}`} className="space-y-6 pb-12">
      {/* Governance Rule Callout Banner */}
      <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-3.5 flex items-start gap-3">
        <Shield className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="text-xs text-cyan-200/90 leading-relaxed">
          <strong className="font-semibold text-cyan-300">Governance Principle:</strong> Lane
          titles and external chat names are <em>organizational labels only</em>. Renaming or creating
          lanes never establishes worker identity. This lane is strictly bound to canonical worker{' '}
          <strong className="font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
            {worker.canonical_name} ({worker.worker_id})
          </strong>
          .
        </div>
      </div>

      {/* Lane Primary Controls Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>Lane Display Name (Editable Label)</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono">id: {lane.lane_id}</span>
            </div>
            <input
              id="input-lane-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-lg font-semibold text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
              placeholder="e.g. Mission Control, Project Revenue"
            />
          </div>

          {/* Quick status and pin toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Dropdown */}
            <select
              id="select-lane-status"
              value={lane.status}
              onChange={(e) =>
                onUpdateLane({
                  status: e.target.value as LaneStatus,
                  updated_at: new Date().toISOString(),
                })
              }
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              aria-label="Lane status"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="HELD">HELD</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="SUPERSEDED">SUPERSEDED</option>
            </select>

            {/* Pin Toggle */}
            <button
              id="btn-toggle-pin-lane"
              type="button"
              onClick={() =>
                onUpdateLane({
                  pinned: !lane.pinned,
                  updated_at: new Date().toISOString(),
                })
              }
              className={`p-2 rounded-lg border transition-colors ${
                lane.pinned
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={lane.pinned ? 'Unpin lane' : 'Pin lane'}
              aria-label={lane.pinned ? 'Unpin lane' : 'Pin lane'}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Archive Toggle */}
            <button
              id="btn-toggle-archive-lane"
              type="button"
              onClick={() =>
                onUpdateLane({
                  archived: !lane.archived,
                  updated_at: new Date().toISOString(),
                })
              }
              className={`p-2 rounded-lg border transition-colors ${
                lane.archived
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={lane.archived ? 'Restore lane' : 'Archive lane'}
              aria-label={lane.archived ? 'Restore lane' : 'Archive lane'}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Purpose Description */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Lane Purpose & Scope
          </label>
          <input
            id="input-lane-purpose"
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            placeholder="Describe what work or continuity is tracked in this lane"
          />
        </div>

        {/* Source Reference & ChatGPT Link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Source Type
            </label>
            <select
              id="select-lane-source-type"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="CHATGPT_URL">ChatGPT Conversation URL</option>
              <option value="EXTERNAL_REFERENCE">External Tool / Repo Reference</option>
              <option value="CONTINUITY_CAPSULE">Continuity Capsule URI</option>
              <option value="MANUAL">Manual / Ad-hoc Lane</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>Source Reference (Link / URI / Identifier)</span>
              {isWebReference(sourceRef) && (
                <a
                  href={sourceRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] normal-case"
                >
                  <span>Open Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              id="input-lane-source-reference"
              type="text"
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder="e.g. https://chatgpt.com/c/... or ref://..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Updated {lane.updated_at ? new Date(lane.updated_at).toLocaleString() : 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <button
              id="btn-save-lane-changes"
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Lane Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continuity Notes & Handoff Capsule */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Continuity Notes & Handoff Capsule
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Persistent Worker-Governed Memory
          </span>
        </div>

        <textarea
          id="textarea-lane-continuity-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Record key decisions, cross-worker handoffs, active context, or verbal continuity tokens for this lane..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Save className="w-3 h-3 text-cyan-400" />
            <span>Update Notes</span>
          </button>
        </div>
      </div>

      {/* Artifacts and Evidence Pointers */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Artifact & Evidence Pointers
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Governed evidence classifications tied to this lane and worker
            </p>
          </div>

          <button
            id="btn-add-artifact"
            type="button"
            onClick={() => onOpenAddArtifact(lane.lane_id, worker.worker_id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Attach Artifact</span>
          </button>
        </div>

        {laneArtifacts.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
            No artifacts or evidence attached to this lane yet. Click "Attach Artifact" to register
            verified facts, specifications, or continuity handoffs.
          </div>
        ) : (
          <div className="space-y-2">
            {laneArtifacts.map((art) => (
              <div
                key={art.artifact_id}
                id={`artifact-row-${art.artifact_id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 truncate">
                      {art.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getEvidenceBadge(
                        art.evidence_state
                      )}`}
                    >
                      {art.evidence_state}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      {art.type}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    ref: <span className="text-cyan-400">{art.reference}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {art.created_at ? new Date(art.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteArtifact(art.artifact_id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Remove artifact pointer"
                    aria-label="Remove artifact pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
