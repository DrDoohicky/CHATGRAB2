import React, { useState } from 'react';
import {
  Layers,
  Pin,
  Archive,
  Plus,
  Shield,
  FileCode,
  TrendingUp,
  History,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  ArtifactRecord,
  LaneRecord,
  WorkerRecord,
  WorkerVersionHistoryRecord,
} from '../types';

interface WorkerOverviewPanelProps {
  worker: WorkerRecord;
  lanes: LaneRecord[];
  artifacts: ArtifactRecord[];
  versionHistory: WorkerVersionHistoryRecord[];
  onSelectLane: (laneId: string) => void;
  onOpenNewLaneModal: (workerId: string) => void;
  onPromoteVersion: (workerId: string) => void;
  onViewVersionHistory: (workerId: string) => void;
}

export const WorkerOverviewPanel: React.FC<WorkerOverviewPanelProps> = ({
  worker,
  lanes,
  artifacts,
  versionHistory,
  onSelectLane,
  onOpenNewLaneModal,
  onPromoteVersion,
  onViewVersionHistory,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const workerLanes = lanes.filter((l) => l.worker_id === worker.worker_id);
  const activeLanes = workerLanes.filter((l) => l.status === 'ACTIVE' && !l.archived);
  const pinnedLanes = workerLanes.filter((l) => l.pinned);
  const workerArtifacts = artifacts.filter((a) => a.worker_id === worker.worker_id);
  const workerVersions = versionHistory.filter((v) => v.worker_id === worker.worker_id);

  const displayedLanes = workerLanes.filter((l) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      l.display_name.toLowerCase().includes(q) ||
      l.purpose.toLowerCase().includes(q) ||
      l.source_reference.toLowerCase().includes(q)
    );
  });

  return (
    <div id={`worker-overview-${worker.worker_id}`} className="space-y-6 pb-12">
      {/* Metric summary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Work Lanes</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
            {workerLanes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {activeLanes.length} active, {pinnedLanes.length} pinned
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Current Release</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-300 mt-1 font-mono">
            {worker.current_version ? `v${worker.current_version}` : 'Unknown'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {workerVersions.length} version milestones
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Evidence Artifacts</span>
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
            {workerArtifacts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recorded pointers; review evidence</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Governance State</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {worker.status}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recorded local status</div>
        </div>
      </div>

      {/* Work Lanes List Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Work Lanes under {worker.canonical_name}
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {displayedLanes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter lanes..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-7 pr-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              id="btn-overview-new-lane"
              type="button"
              onClick={() => onOpenNewLaneModal(worker.worker_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lane</span>
            </button>
          </div>
        </div>

        {displayedLanes.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs space-y-2">
            <p>No work lanes currently match your search criteria.</p>
            <button
              type="button"
              onClick={() => onOpenNewLaneModal(worker.worker_id)}
              className="text-cyan-400 hover:underline inline-block font-medium"
            >
              Create the first lane for {worker.canonical_name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedLanes.map((lane) => (
              <div
                key={lane.lane_id}
                id={`overview-lane-card-${lane.lane_id}`}
                onClick={() => onSelectLane(lane.lane_id)}
                className="group p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-slate-950 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {lane.display_name}
                      </span>
                      {lane.pinned && (
                        <Pin className="w-3 h-3 text-cyan-400 shrink-0" />
                      )}
                      {lane.archived && (
                        <Archive className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                        lane.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {lane.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lane.purpose || 'No purpose specified yet.'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono truncate max-w-[200px]">
                    {lane.source_type}
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                    Open Lane →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Governance Rules Verification Checklist Card */}
      <div className="bg-slate-900/50 border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            GovernedContinuity Axioms & Invariants
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-300">Workers First, Lanes Second:</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Work lanes are children under canonical workers. A new lane never creates a new worker.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-300">Version Independence:</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Promotion (e.g. Atlas 1.4 to 1.5) updates version metadata; worker_id remains immutable.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-300">Non-Authoritative Titles:</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                ChatGPT session names or lane labels are transient labels and never establish worker identity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-300">Human Final Authority:</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                David R. Labadie retains ultimate governance authority. No autonomous wake or hidden sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
