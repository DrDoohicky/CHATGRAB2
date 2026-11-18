import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Pin,
  Archive,
  Plus,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import { LaneRecord, LaneStatus, WorkerRecord } from '../types';

interface WorkerTreeProps {
  workers: WorkerRecord[];
  lanes: LaneRecord[];
  selectedWorkerId: string;
  selectedLaneId: string | null;
  onSelectWorker: (workerId: string) => void;
  onSelectLane: (laneId: string, workerId: string) => void;
  onOpenNewLaneModal: (workerId: string) => void;
  onOpenNewWorkerModal: () => void;
}

export const WorkerTree: React.FC<WorkerTreeProps> = ({
  workers,
  lanes,
  selectedWorkerId,
  selectedLaneId,
  onSelectWorker,
  onSelectLane,
  onOpenNewLaneModal,
  onOpenNewWorkerModal,
}) => {
  // Expanded state for each worker
  const [expandedWorkers, setExpandedWorkers] = useState<Record<string, boolean>>({
    atlas: true,
    lumen: true,
    relay_via_codex: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LaneStatus>('ALL');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const toggleWorkerExpand = (workerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWorkers((prev) => ({
      ...prev,
      [workerId]: !prev[workerId],
    }));
  };

  // Filter lanes based on search and filter options
  const filterLane = (lane: LaneRecord): boolean => {
    if (!showArchived && lane.archived) return false;
    if (pinnedOnly && !lane.pinned) return false;
    if (statusFilter !== 'ALL' && lane.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lane.display_name.toLowerCase().includes(q);
      const matchPurpose = lane.purpose.toLowerCase().includes(q);
      const matchSource = (lane.source_reference || '').toLowerCase().includes(q);
      if (!matchName && !matchPurpose && !matchSource) return false;
    }

    return true;
  };

  // Status badge colors
  const getStatusColor = (status: LaneStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500';
      case 'HELD':
        return 'bg-amber-500';
      case 'BLOCKED':
        return 'bg-rose-500';
      case 'CLOSED':
        return 'bg-slate-500';
      case 'SUPERSEDED':
        return 'bg-purple-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <nav
      id="worker-navigation-tree"
      aria-label="Worker-First Navigation Tree"
      className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 select-none"
    >
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="input-worker-search"
            type="text"
            placeholder="Search workers & lanes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filters bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 gap-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              id="select-lane-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
              aria-label="Filter lanes by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="HELD">Held</option>
              <option value="BLOCKED">Blocked</option>
              <option value="CLOSED">Closed</option>
              <option value="SUPERSEDED">Superseded</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="filter-toggle-pinned"
              type="button"
              onClick={() => setPinnedOnly(!pinnedOnly)}
              className={`px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                pinnedOnly
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Filter pinned lanes"
            >
              <Pin className="w-2.5 h-2.5" />
              <span>Pinned</span>
            </button>

            <button
              id="filter-toggle-archived"
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                showArchived
                  ? 'bg-slate-700 text-slate-200'
                  : 'hover:bg-slate-800 text-slate-500'
              }`}
              title="Toggle archived lanes"
            >
              <Archive className="w-2.5 h-2.5" />
              <span>Archived</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workers and Lanes Tree List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 focus:outline-none">
        <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          <span>Canonical Workers</span>
          <span>{workers.length}</span>
        </div>

        {workers.map((worker) => {
          const isSelected = selectedWorkerId === worker.worker_id;
          const isExpanded = !!expandedWorkers[worker.worker_id];
          const workerLanes = lanes.filter((l) => l.worker_id === worker.worker_id);
          const filteredLanes = workerLanes.filter(filterLane);

          // Skip rendering worker if searching and neither worker nor lanes match
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const workerMatches =
              worker.canonical_name.toLowerCase().includes(q) ||
              worker.role.toLowerCase().includes(q);
            if (!workerMatches && filteredLanes.length === 0) {
              return null;
            }
          }

          return (
            <div
              key={worker.worker_id}
              id={`worker-tree-node-${worker.worker_id}`}
              className="rounded-lg border border-transparent transition-colors"
            >
              {/* Worker Row */}
              <div
                onClick={() => onSelectWorker(worker.worker_id)}
                className={`group flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
                role="treeitem"
                aria-selected={isSelected}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => toggleWorkerExpand(worker.worker_id, e)}
                    className="p-0.5 text-slate-500 hover:text-slate-300 rounded focus:outline-none"
                    aria-label={`Toggle lanes for ${worker.canonical_name}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="font-medium text-xs truncate">
                      {worker.canonical_name}
                    </span>

                    {/* Version Badge (e.g. 1.4) */}
                    {worker.current_version && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                        v{worker.current_version}
                      </span>
                    )}

                    {/* Related worker indicator (Atlas correction C2 for Relay via Codex) */}
                    {worker.related_worker_id && (
                      <span
                        title={`Execution path linked to ${worker.related_worker_id}`}
                        className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded flex items-center gap-0.5 shrink-0"
                      >
                        <Link2 className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Right badges & actions */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 group-hover:text-slate-300"
                    title={`${workerLanes.length} total work lanes`}
                  >
                    {workerLanes.length}
                  </span>

                  <button
                    id={`btn-add-lane-${worker.worker_id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorker(worker.worker_id);
                      onOpenNewLaneModal(worker.worker_id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-opacity"
                    title={`Create new lane under ${worker.canonical_name}`}
                    aria-label={`Create new lane under ${worker.canonical_name}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sub-lanes beneath canonical worker */}
              {isExpanded && (
                <div
                  id={`worker-lanes-container-${worker.worker_id}`}
                  className="pl-6 pr-1 pt-1 pb-1 space-y-0.5 border-l border-slate-800/60 ml-3.5 my-0.5"
                  role="group"
                >
                  {filteredLanes.length === 0 ? (
                    <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                      {workerLanes.length === 0 ? 'No lanes yet.' : 'No matching lanes.'}
                    </div>
                  ) : (
                    filteredLanes.map((lane) => {
                      const isLaneActive =
                        selectedLaneId === lane.lane_id && selectedWorkerId === worker.worker_id;

                      return (
                        <div
                          key={lane.lane_id}
                          id={`lane-tree-item-${lane.lane_id}`}
                          onClick={() => onSelectLane(lane.lane_id, worker.worker_id)}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                            isLaneActive
                              ? 'bg-cyan-500/15 text-cyan-200 font-medium border border-cyan-500/30'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          } ${lane.archived ? 'opacity-60 italic' : ''}`}
                          role="treeitem"
                          aria-selected={isLaneActive}
                        >
                          <div className="flex items-center gap-2 min-w-0 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(
                                lane.status
                              )}`}
                              title={`Status: ${lane.status}`}
                            />
                            <span className="truncate">{lane.display_name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            {lane.pinned && (
                              <Pin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                            )}
                            {lane.archived && (
                              <Archive className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add lane prompt row */}
                  <button
                    id={`btn-inline-add-lane-${worker.worker_id}`}
                    type="button"
                    onClick={() => {
                      onSelectWorker(worker.worker_id);
                      onOpenNewLaneModal(worker.worker_id);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-500 hover:text-cyan-400 hover:bg-slate-900/60 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New lane</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer: Register Future Canonical Worker */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/80">
        <button
          id="btn-register-worker"
          type="button"
          onClick={onOpenNewWorkerModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Register Canonical Worker</span>
        </button>
      </div>
    </nav>
  );
};
