import type { GovernedConsoleState, LaneRecord, WorkerRecord } from '../types';
import { validateState } from './validation';

export function createLane(state: GovernedConsoleState, lane: LaneRecord) {
  return validateState({ ...state, lanes: [lane, ...state.lanes] });
}
export function updateLane(state: GovernedConsoleState, laneId: string, fields: Partial<LaneRecord>) {
  if (!state.lanes.some(l => l.lane_id === laneId)) throw new Error('Lane not found.');
  return validateState({ ...state, lanes: state.lanes.map(l => l.lane_id === laneId ? { ...l, ...fields, lane_id: l.lane_id, worker_id: l.worker_id } : l) });
}
export function updateWorker(state: GovernedConsoleState, workerId: string, fields: Partial<WorkerRecord>) {
  const workers = state.workers.map(w => w.worker_id === workerId ? { ...w, role: fields.role ?? w.role, description: fields.description ?? w.description, updated_at: fields.updated_at ?? w.updated_at } : w);
  const coordinator = workerId === state.coordinator.worker_id ? { ...state.coordinator, role: workers.find(w => w.worker_id === workerId)!.role } : state.coordinator;
  return validateState({ ...state, workers, coordinator });
}
export function registerWorker(state: GovernedConsoleState, worker: WorkerRecord) {
  return validateState({ ...state, workers: [...state.workers, worker] });
}
export function promoteVersion(state: GovernedConsoleState, workerId: string, version: string, note: string, now = new Date().toISOString()) {
  const worker = state.workers.find(w => w.worker_id === workerId);
  if (!worker || !version.trim() || !note.trim()) throw new Error('Worker, version, and release note are required.');
  if (worker.current_version === version || state.version_history.some(v => v.worker_id === workerId && v.version === version)) throw new Error('This version is already recorded.');
  const history = state.version_history.map(v => v.worker_id === workerId && v.superseded_at === null ? { ...v, superseded_at: now } : v);
  if (worker.current_version && !history.some(v => v.worker_id === workerId && v.version === worker.current_version)) history.push({ history_id: crypto.randomUUID(), worker_id: workerId, version: worker.current_version, effective_at: '', superseded_at: now, note: 'Prior recorded version; effective date unknown.' });
  history.push({ history_id: crypto.randomUUID(), worker_id: workerId, version, effective_at: now, superseded_at: null, note });
  return validateState({ ...state, workers: state.workers.map(w => w.worker_id === workerId ? { ...w, current_version: version, updated_at: now } : w), coordinator: workerId === 'atlas' ? { ...state.coordinator, current_version: version } : state.coordinator, version_history: history });
}
