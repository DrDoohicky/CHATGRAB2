import React from 'react';
import { X, History, Clock, CheckCircle2 } from 'lucide-react';
import { WorkerRecord, WorkerVersionHistoryRecord } from '../../types';

interface VersionHistoryModalProps {
  worker: WorkerRecord;
  history: WorkerVersionHistoryRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  worker,
  history,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const workerHistory = history
    .filter((h) => h.worker_id === worker.worker_id)
    .sort(
      (a, b) => new Date(b.effective_at).getTime() - new Date(a.effective_at).getTime()
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-sm font-semibold text-white">
                Version History — {worker.canonical_name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Stable worker_id: {worker.worker_id}
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

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {workerHistory.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
              No version history records logged for this worker. Current version:{' '}
              {worker.current_version ? `v${worker.current_version}` : 'unversioned'}.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-3 pl-4 space-y-5">
              {workerHistory.map((item, idx) => {
                const isCurrent = !item.superseded_at;
                return (
                  <div key={item.history_id} className="relative group">
                    {/* Timeline node */}
                    <div
                      className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                        isCurrent
                          ? 'bg-cyan-500 border-slate-900 ring-2 ring-cyan-500/30'
                          : 'bg-slate-700 border-slate-900'
                      }`}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-white">
                          v{item.version}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Current Active Release
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Superseded
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>
                          Effective: {item.effective_at ? new Date(item.effective_at).toLocaleDateString() : 'Unknown'}
                        </span>
                        {item.superseded_at && (
                          <span>
                            • Superseded:{' '}
                            {new Date(item.superseded_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-mono mt-1">
                        {item.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
