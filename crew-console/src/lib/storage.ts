import type { GovernedConsoleState } from '../types';
import { INITIAL_STATE } from '../data/seedData';
import { validateState, parseAndValidateImportJson } from './validation';
export { parseAndValidateImportJson } from './validation';

export const STORAGE_KEY = 'mothership_worker_first_console_pilot_v2';
const LEGACY_KEY = 'mothership_worker_first_console_state_v1';
let storageNotice = '';
let blockedStorage = false;
export function getStorageNotice() { return storageNotice; }
export function freshSeed(): GovernedConsoleState { return structuredClone(INITIAL_STATE); }
export function loadConsoleState(): GovernedConsoleState {
  storageNotice = ''; blockedStorage = false;
  if (typeof window === 'undefined') return freshSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return parseAndValidateImportJson(raw); }
      catch {
        blockedStorage = true;
        storageNotice = 'Saved snapshot failed validation. It is preserved in browser storage and isolated from the pilot. Export recovery data before resetting. Current changes are memory-only.';
        return freshSeed();
      }
    }
    if (localStorage.getItem(LEGACY_KEY)) storageNotice = 'Original prototype data is preserved separately and has not been promoted into this pilot. Review any recovered export before importing.';
  } catch { storageNotice = 'Browser storage is unavailable. Changes are memory-only; export to keep them.'; }
  return freshSeed();
}
export function saveConsoleState(state: GovernedConsoleState): string {
  if (typeof window === 'undefined' || blockedStorage) return storageNotice;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(validateState(state))); }
  catch { return 'Could not save this snapshot. Changes are memory-only; export to keep them.'; }
  return storageNotice;
}
export function resetToSeedState(): GovernedConsoleState {
  blockedStorage = false; storageNotice = '';
  const fresh = freshSeed(); saveConsoleState(fresh); return fresh;
}
// Allowed free text may still contain sensitive content; review before sharing.
export function serializeState(state: GovernedConsoleState, exportedAt = new Date().toISOString()): string {
  return JSON.stringify(validateState({ ...state, exported_at: exportedAt }), null, 2);
}
export function downloadJson(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportStateToJson(state: GovernedConsoleState): void {
  downloadJson(serializeState(state), 'worker-first-console-state.json');
}
