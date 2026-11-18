import React, { useState, useEffect, useMemo } from 'react';
import {
  loadConsoleState,
  getStorageNotice,
  saveConsoleState,
  exportStateToJson,
  resetToSeedState,
} from './lib/storage';
import {
  ArtifactRecord,
  GovernedConsoleState,
  LaneRecord,
  LaneStatus,
  SourceType,
  WorkerRecord,
  WorkerVersionHistoryRecord,
} from './types';
import { Header } from './components/Header';
import { WorkerTree } from './components/WorkerTree';
import { WorkerDetailHeader } from './components/WorkerDetailHeader';
import { LaneDetailPanel } from './components/LaneDetailPanel';
import { WorkerOverviewPanel } from './components/WorkerOverviewPanel';
import { PromoteVersionModal } from './components/modals/PromoteVersionModal';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { NewLaneModal } from './components/modals/NewLaneModal';
import { NewWorkerModal } from './components/modals/NewWorkerModal';
import { AddArtifactModal } from './components/modals/AddArtifactModal';
import { AcceptanceTestsModal } from './components/modals/AcceptanceTestsModal';
import { ImportModal } from './components/modals/ImportModal';
import { createLane, updateLane, updateWorker, registerWorker, promoteVersion } from './lib/actions';
import { validateState } from './lib/validation';
import {BridgeInbox} from './components/BridgeInbox';
import type {Handoff} from './lib/crew-bridge';
import {attachBridgeHandoff} from './lib/bridge-actions';
import { X, Layers, ArrowLeft } from 'lucide-react';

export default function App() {
  const [consoleState, setConsoleState] = useState<GovernedConsoleState>(() =>
    loadConsoleState()
  );

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('atlas');
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(
    'lane-atlas-console-pilot'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notice, setNotice] = useState(getStorageNotice);
  const applyChange = (change: (state: GovernedConsoleState) => GovernedConsoleState) => {
    try { setConsoleState(change(consoleState)); return true; }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Change rejected.'); return false; }
  };

  // Modal visibility states
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isNewLaneModalOpen, setIsNewLaneModalOpen] = useState(false);
  const [targetWorkerForLane, setTargetWorkerForLane] = useState<string>('atlas');
  const [isNewWorkerModalOpen, setIsNewWorkerModalOpen] = useState(false);
  const [isAddArtifactModalOpen, setIsAddArtifactModalOpen] = useState(false);
  const [artifactTargetLaneId, setArtifactTargetLaneId] = useState<string | null>(null);
  const [artifactTargetWorkerId, setArtifactTargetWorkerId] = useState<string>('atlas');
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Synchronize changes to storage whenever consoleState updates
  useEffect(() => {
    setNotice(saveConsoleState(consoleState));
  }, [consoleState]);

  // Currently selected worker record
  const currentWorker = useMemo(() => {
    return (
      consoleState.workers.find((w) => w.worker_id === selectedWorkerId) ||
      consoleState.workers[0]
    );
  }, [consoleState.workers, selectedWorkerId]);

  // Related worker record if any (e.g. for Relay via Codex -> Relay)
  const relatedWorker = useMemo(() => {
    if (!currentWorker?.related_worker_id) return null;
    return (
      consoleState.workers.find(
        (w) => w.worker_id === currentWorker.related_worker_id
      ) || null
    );
  }, [consoleState.workers, currentWorker]);

  // Currently selected lane record (if any)
  const currentLane = useMemo(() => {
    if (!selectedLaneId) return null;
    return consoleState.lanes.find((l) => l.lane_id === selectedLaneId) || null;
  }, [consoleState.lanes, selectedLaneId]);

  // Handler: Select a worker
  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    // If current lane doesn't belong to newly selected worker, reset lane to null or first lane
    const workerLanes = consoleState.lanes.filter((l) => l.worker_id === workerId);
    if (workerLanes.length > 0) {
      setSelectedLaneId(workerLanes[0].lane_id);
    } else {
      setSelectedLaneId(null);
    }
    setIsMobileMenuOpen(false);
  };

  // Handler: Select a lane
  const handleSelectLane = (laneId: string, workerId: string) => {
    setSelectedWorkerId(workerId);
    setSelectedLaneId(laneId);
    setIsMobileMenuOpen(false);
  };

  // Handler: Update worker attributes (role, description)
  const handleUpdateWorker = (updatedFields: Partial<WorkerRecord>) => {
    return applyChange(state => updateWorker(state, currentWorker.worker_id, updatedFields));
  };

  // Handler: Promote worker version (Atlas Correction C1)
  const handlePromoteVersion = (
    workerId: string,
    newVersion: string,
    releaseNote: string
  ) => {
    return applyChange(state => promoteVersion(state, workerId, newVersion, releaseNote));
  };

  // Handler: Create a new lane under a worker (Rule: New lane never creates new worker!)
  const handleCreateLane = (
    workerId: string,
    displayName: string,
    purpose: string,
    status: LaneStatus,
    sourceType: SourceType,
    sourceReference: string,
    pinned: boolean
  ) => {
    const now = new Date().toISOString();
    const newLaneId = `lane-${workerId}-${crypto.randomUUID()}`;

    const newLane: LaneRecord = {
      lane_id: newLaneId,
      worker_id: workerId, // Bound to canonical worker
      display_name: displayName,
      purpose,
      status,
      source_type: sourceType,
      source_reference: sourceReference,
      pinned,
      archived: false,
      continuity_notes: '',
      created_at: now,
      updated_at: now,
    };

    if (!applyChange(state => createLane(state, newLane))) return false;

    setSelectedWorkerId(workerId);
    setSelectedLaneId(newLaneId);
    return true;
  };

  // Handler: Update an existing lane
  const handleUpdateLane = (updatedFields: Partial<LaneRecord>) => {
    if (!selectedLaneId) return false;
    return applyChange(state => updateLane(state, selectedLaneId, updatedFields));
  };

  // Handler: Register a new canonical worker
  const handleRegisterWorker = (newWorker: WorkerRecord) => {
    if (!applyChange(state => registerWorker(state, newWorker))) return false;
    setSelectedWorkerId(newWorker.worker_id);
    setSelectedLaneId(null);
    return true;
  };

  // Handler: Attach an artifact
  const handleAddArtifact = (newArtifact: ArtifactRecord) => {
    return applyChange(state => validateState({ ...state, artifacts: [newArtifact, ...state.artifacts] }));
  };

  // Handler: Delete an artifact
  const handleDeleteArtifact = (artifactId: string) => {
    setConsoleState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.filter((a) => a.artifact_id !== artifactId),
    }));
  };

  // Handler: Reset to seed state
  const handleResetSeed = () => {
    if (
      window.confirm(
        'Reset this local pilot to the source-backed Atlas 1.4 starter snapshot? Any unexported changes will be overwritten.'
      )
    ) {
      const fresh = resetToSeedState();
      setConsoleState(fresh);
      setSelectedWorkerId('atlas');
      setSelectedLaneId('lane-atlas-console-pilot');
    }
  };

  // Handler: Import new state JSON
  const handleImportState = (newState: GovernedConsoleState) => {
    setConsoleState(validateState(newState));
    if (newState.workers.length > 0) {
      setSelectedWorkerId(newState.workers[0].worker_id);
      const firstLane = newState.lanes.find(
        (l) => l.worker_id === newState.workers[0].worker_id
      );
      setSelectedLaneId(firstLane ? firstLane.lane_id : null);
    }
  };

  return (
    <div className="h-dvh min-h-0 bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Observatory Header */}
      <Header
        state={consoleState}
        onExport={() => exportStateToJson(consoleState)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetSeed={handleResetSeed}
        onOpenTests={() => setIsTestsModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="px-4 py-2 text-xs bg-amber-950/40 text-amber-200 border-b border-amber-800/40">
        Local pilot · Portable ChatGrab inbox · No automatic worker invocation or chat synchronization
      </div>
      {notice && <div role="alert" className="px-4 py-3 text-sm bg-rose-950 text-rose-100 break-words">{notice}</div>}
      <BridgeInbox state={consoleState} onAttach={(packet:Handoff)=>applyChange(state=>attachBridgeHandoff(state,packet))}/>
      {/* Main Container */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Desktop Left Navigation Tree */}
        <div className="hidden md:block w-72 lg:w-80 shrink-0 h-full">
          <WorkerTree
            workers={consoleState.workers}
            lanes={consoleState.lanes}
            selectedWorkerId={selectedWorkerId}
            selectedLaneId={selectedLaneId}
            onSelectWorker={handleSelectWorker}
            onSelectLane={handleSelectLane}
            onOpenNewLaneModal={(wId) => {
              setTargetWorkerForLane(wId);
              setIsNewLaneModalOpen(true);
            }}
            onOpenNewWorkerModal={() => setIsNewWorkerModalOpen(true)}
          />
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-xs flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-4/5 max-w-xs h-full bg-slate-950 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-white font-mono">
                  Mothership Worker Tree
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <WorkerTree
                  workers={consoleState.workers}
                  lanes={consoleState.lanes}
                  selectedWorkerId={selectedWorkerId}
                  selectedLaneId={selectedLaneId}
                  onSelectWorker={handleSelectWorker}
                  onSelectLane={handleSelectLane}
                  onOpenNewLaneModal={(wId) => {
                    setTargetWorkerForLane(wId);
                    setIsNewLaneModalOpen(true);
                  }}
                  onOpenNewWorkerModal={() => setIsNewWorkerModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Main Panel */}
        <main
          id="console-main-panel"
          className="flex-1 min-w-0 overflow-y-auto h-full flex flex-col bg-slate-950/60"
        >
          {/* Worker Identity Header */}
          <WorkerDetailHeader
            key={currentWorker.worker_id}
            worker={currentWorker}
            relatedWorker={relatedWorker}
            onPromoteVersion={() => setIsPromoteModalOpen(true)}
            onViewVersionHistory={() => setIsHistoryModalOpen(true)}
            onUpdateWorker={handleUpdateWorker}
            onSelectRelatedWorker={(relId) => handleSelectWorker(relId)}
            onNewLane={(wId) => {
              setTargetWorkerForLane(wId);
              setIsNewLaneModalOpen(true);
            }}
          />

          {/* Sub-Header Breadcrumb / View Mode Switcher */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400 truncate">
              <span className="font-mono text-cyan-400 font-medium truncate">
                {currentWorker.canonical_name}
              </span>
              <span>/</span>
              {currentLane ? (
                <span className="text-white font-semibold truncate flex items-center gap-1.5">
                  <span>{currentLane.display_name}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                    (lane label)
                  </span>
                </span>
              ) : (
                <span className="text-slate-300 italic">Worker Overview & Lanes</span>
              )}
            </div>

            {currentLane && (
              <button
                type="button"
                onClick={() => setSelectedLaneId(null)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 px-2 py-1 rounded transition-colors shrink-0"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>All Worker Lanes</span>
              </button>
            )}
          </div>

          {/* Body Content Area */}
          <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
            {currentLane ? (
              <LaneDetailPanel
                lane={currentLane}
                worker={currentWorker}
                artifacts={consoleState.artifacts}
                onUpdateLane={handleUpdateLane}
                onOpenAddArtifact={(laneId, workerId) => {
                  setArtifactTargetLaneId(laneId);
                  setArtifactTargetWorkerId(workerId);
                  setIsAddArtifactModalOpen(true);
                }}
                onDeleteArtifact={handleDeleteArtifact}
              />
            ) : (
              <WorkerOverviewPanel
                worker={currentWorker}
                lanes={consoleState.lanes}
                artifacts={consoleState.artifacts}
                versionHistory={consoleState.version_history}
                onSelectLane={(laneId) => setSelectedLaneId(laneId)}
                onOpenNewLaneModal={(wId) => {
                  setTargetWorkerForLane(wId);
                  setIsNewLaneModalOpen(true);
                }}
                onPromoteVersion={() => setIsPromoteModalOpen(true)}
                onViewVersionHistory={() => setIsHistoryModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Governed Action Modals */}
      <PromoteVersionModal
        key={currentWorker.worker_id}
        worker={currentWorker}
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        onPromote={handlePromoteVersion}
      />

      <VersionHistoryModal
        worker={currentWorker}
        history={consoleState.version_history}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <NewLaneModal
        worker={
          consoleState.workers.find((w) => w.worker_id === targetWorkerForLane) ||
          currentWorker
        }
        isOpen={isNewLaneModalOpen}
        onClose={() => setIsNewLaneModalOpen(false)}
        onCreateLane={handleCreateLane}
      />

      <NewWorkerModal
        existingWorkers={consoleState.workers}
        isOpen={isNewWorkerModalOpen}
        onClose={() => setIsNewWorkerModalOpen(false)}
        onRegisterWorker={handleRegisterWorker}
      />

      <AddArtifactModal
        laneId={artifactTargetLaneId}
        workerId={artifactTargetWorkerId}
        isOpen={isAddArtifactModalOpen}
        onClose={() => setIsAddArtifactModalOpen(false)}
        onAddArtifact={handleAddArtifact}
      />

      <AcceptanceTestsModal
        state={consoleState}
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportState={handleImportState}
      />
    </div>
  );
}
