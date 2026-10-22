import React, { useState } from 'react';
import {
  Shield,
  History,
  TrendingUp,
  Link2,
  Edit3,
  Check,
  X,
  Sparkles,
  Plus,
  Cpu,
} from 'lucide-react';
import { WorkerRecord } from '../types';

interface WorkerDetailHeaderProps {
  worker: WorkerRecord;
  relatedWorker?: WorkerRecord | null;
  onPromoteVersion: (workerId: string) => void;
  onViewVersionHistory: (workerId: string) => void;
  onUpdateWorker: (updated: Partial<WorkerRecord>) => boolean;
  onSelectRelatedWorker?: (relatedWorkerId: string) => void;
  onNewLane: (workerId: string) => void;
}

export const WorkerDetailHeader: React.FC<WorkerDetailHeaderProps> = ({
  worker,
  relatedWorker,
  onPromoteVersion,
  onViewVersionHistory,
  onUpdateWorker,
  onSelectRelatedWorker,
  onNewLane,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [roleText, setRoleText] = useState(worker.role);
  const [descText, setDescText] = useState(worker.description);

  const handleSave = () => {
    const saved = onUpdateWorker({
      role: roleText.trim(),
      description: descText.trim(),
      updated_at: new Date().toISOString(),
    });
    if (saved) setIsEditing(false);
  };

  const handleCancel = () => {
    setRoleText(worker.role);
    setDescText(worker.description);
    setIsEditing(false);
  };

  return (
    <div
      id={`worker-header-${worker.worker_id}`}
      className="bg-slate-900/60 border-b border-slate-800 p-4 sm:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Worker Canonical Identity and metadata */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                {worker.canonical_name}
              </span>

              {/* Version Badge */}
              {worker.current_version ? (
                <div
                  id={`worker-version-pill-${worker.worker_id}`}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium"
                >
                  <span>v{worker.current_version}</span>
                </div>
              ) : (
                <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
                  unversioned
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
                  worker.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {worker.status}
              </span>
            </div>

            {/* Stable Identity Governance indicator */}
            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="text-slate-500">worker_id:</span>
              <span className="text-cyan-400 font-semibold">{worker.worker_id}</span>
              <span className="text-emerald-400 text-[10px]">[IMMUTABLE]</span>
            </div>
          </div>

          {/* Related Worker Execution Path (Atlas Correction C2) */}
          {worker.related_worker_id && (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/30 border border-purple-800/40 px-3 py-1.5 rounded-lg w-fit">
              <Link2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>
                Execution Path Related to:{' '}
                <button
                  type="button"
                  onClick={() => onSelectRelatedWorker && onSelectRelatedWorker(worker.related_worker_id!)}
                  className="font-mono font-semibold underline hover:text-purple-200 transition-colors"
                >
                  {relatedWorker?.canonical_name || worker.related_worker_id}
                </button>
              </span>
              <span className="text-[10px] text-purple-400/80 italic ml-1">
                (Retains independent identity & evidence)
              </span>
            </div>
          )}

          {/* Role and Description (with Inline Edit) */}
          {isEditing ? (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Worker Role
                </label>
                <input
                  type="text"
                  value={roleText}
                  onChange={(e) => setRoleText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Description & Governance Mandate
                </label>
                <textarea
                  value={descText}
                  onChange={(e) => setDescText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <p className="text-sm font-medium text-slate-200">{worker.role}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {worker.description}
              </p>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Version Promotion Action */}
            <button
              id="btn-promote-version"
              type="button"
              onClick={() => onPromoteVersion(worker.worker_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
              title="Promote worker version (e.g. Atlas 1.4 to 1.5) without changing worker_id"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Promote Version</span>
            </button>

            {/* Version History Action */}
            <button
              id="btn-view-version-history"
              type="button"
              onClick={() => onViewVersionHistory(worker.worker_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="View version promotion history"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>History</span>
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Edit role and description"
                aria-label="Edit role and description"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-create-lane-header"
            type="button"
            onClick={() => onNewLane(worker.worker_id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors mt-0 sm:mt-1"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Create Lane</span>
          </button>
        </div>
      </div>
    </div>
  );
};
