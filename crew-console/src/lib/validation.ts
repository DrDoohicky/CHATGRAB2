import type { GovernedConsoleState } from '../types';

export const MAX_IMPORT_BYTES = 2_000_000;
const statuses = ['ACTIVE', 'HELD', 'BLOCKED', 'CLOSED', 'SUPERSEDED'];
const evidence = ['VERIFIED_FACT', 'SUPPORTED_CONCLUSION', 'INFERENCE', 'PROPOSAL', 'RECONSTRUCTION', 'UNRESOLVED_CONTRADICTION', 'UNKNOWN'];
type RecordValue = Record<string, any>;
function object(value: unknown, keys: string[], label: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`${label} has unsupported fields.`);
  return value as RecordValue;
}
function text(value: unknown, label: string, empty = false): asserts value is string {
  if (typeof value !== 'string' || (!empty && !value.trim()) || value.length > 50000) throw new Error(`${label} must be ${empty ? 'a' : 'a non-empty'} bounded string.`);
}
function id(value: unknown, label: string) {
  text(value, label);
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(value)) throw new Error(`${label} has an invalid identifier.`);
}
function date(value: unknown, label: string, empty = true) {
  text(value, label, empty);
  if (value !== '' && (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value)))) throw new Error(`${label} must be an ISO date or empty when unknown.`);
}
function choice(value: unknown, choices: string[], label: string) {
  if (!choices.includes(value as string)) throw new Error(`${label} is not supported.`);
}
function list(value: unknown, label: string): any[] {
  if (!Array.isArray(value) || value.length > 5000) throw new Error(`${label} must be an array of at most 5000 records.`);
  return value;
}
function unique(records: RecordValue[], key: string) {
  const seen = new Set<string>();
  for (const r of records) { id(r[key], key); if (seen.has(r[key])) throw new Error(`Duplicate ${key}.`); seen.add(r[key]); }
  return seen;
}
export function isWebReference(value: string): boolean {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
function reference(value: unknown) {
  text(value, 'Reference', true);
  if (/^\s*(javascript|data|vbscript):/i.test(value)) throw new Error('Executable reference schemes are not allowed.');
  if (/^https?:/i.test(value) && !isWebReference(value)) throw new Error('Invalid web reference or embedded credentials.');
}

// Strict structural validation is not evidence of truth or permission to replace local state.
export function validateState(value: unknown): GovernedConsoleState {
  const s = object(value, ['packet_type','schema_version','project','human_final_authority','coordinator','exported_at','workers','lanes','artifacts','version_history'], 'Snapshot');
  for (const k of ['packet_type','project','human_final_authority']) text(s[k], k);
  if (s.schema_version !== '1.0.0') throw new Error('Unsupported schema_version; expected 1.0.0.');
  date(s.exported_at, 'exported_at');
  const workers = list(s.workers, 'workers').map(w => object(w, ['worker_id','canonical_name','current_version','role','description','status','related_worker_id','created_at','updated_at'], 'Worker'));
  if (!workers.length) throw new Error('At least one worker is required.');
  const workerIds = unique(workers, 'worker_id');
  const names = new Set<string>();
  const protectedNames: Record<string,string> = { atlas: 'Atlas', relay: 'Relay', relay_via_codex: 'Relay via Codex' };
  for (const w of workers) {
    for (const k of ['canonical_name','role']) text(w[k], `Worker ${k}`);
    text(w.description, 'Worker description', true);
    const normalized = w.canonical_name.trim().toLowerCase();
    if (names.has(normalized)) throw new Error('Duplicate canonical worker name.');
    names.add(normalized);
    for (const [key, name] of Object.entries(protectedNames)) {
      if ((w.worker_id === key && w.canonical_name !== name) || (normalized === name.toLowerCase() && w.worker_id !== key)) throw new Error('Protected worker identity mismatch.');
    }
    if (w.current_version !== null) text(w.current_version, 'Worker current_version');
    choice(w.status, statuses, 'Worker status');
    date(w.created_at, 'Worker created_at'); date(w.updated_at, 'Worker updated_at');
    if (w.related_worker_id != null && (!workerIds.has(w.related_worker_id) || w.related_worker_id === w.worker_id)) throw new Error('Unknown or self-related worker.');
    if (w.worker_id === 'relay_via_codex' && w.related_worker_id !== 'relay') throw new Error('Relay via Codex must link to the distinct Relay worker.');
  }
  const c = object(s.coordinator, ['worker_id','canonical_name','current_version','role'], 'Coordinator');
  const coordinator = workers.find(w => w.worker_id === c.worker_id);
  if (!coordinator || c.worker_id !== 'atlas' || c.canonical_name !== coordinator.canonical_name || c.current_version !== coordinator.current_version || c.role !== coordinator.role) throw new Error('Coordinator metadata must match the Atlas worker.');
  const lanes = list(s.lanes, 'lanes').map(l => object(l, ['lane_id','worker_id','display_name','purpose','status','source_type','source_reference','pinned','archived','continuity_notes','created_at','updated_at'], 'Lane'));
  const laneIds = unique(lanes, 'lane_id');
  for (const l of lanes) {
    if (!workerIds.has(l.worker_id)) throw new Error('Lane references an unknown worker.');
    text(l.display_name, 'Lane display_name'); text(l.purpose, 'Lane purpose', true);
    if (l.continuity_notes !== undefined) text(l.continuity_notes, 'Lane notes', true);
    choice(l.status, statuses, 'Lane status');
    choice(l.source_type, ['CHATGPT_URL','EXTERNAL_REFERENCE','CONTINUITY_CAPSULE','MANUAL'], 'Lane source_type');
    reference(l.source_reference);
    if (typeof l.pinned !== 'boolean' || typeof l.archived !== 'boolean') throw new Error('Lane pinned/archived must be booleans.');
    date(l.created_at, 'Lane created_at'); date(l.updated_at, 'Lane updated_at');
  }
  const artifacts = list(s.artifacts, 'artifacts').map(a => object(a, ['artifact_id','worker_id','lane_id','type','title','reference','evidence_state','created_at'], 'Artifact'));
  unique(artifacts, 'artifact_id');
  for (const a of artifacts) {
    if (!workerIds.has(a.worker_id)) throw new Error('Artifact references an unknown worker.');
    if (a.lane_id != null && (!laneIds.has(a.lane_id) || lanes.find(l => l.lane_id === a.lane_id)?.worker_id !== a.worker_id)) throw new Error('Artifact lane and worker must agree.');
    choice(a.type, ['CAPSULE','HANDOFF','LINK','SPEC','EVIDENCE','TRANSCRIPT','PROPOSAL'], 'Artifact type');
    choice(a.evidence_state, evidence, 'Artifact evidence_state');
    text(a.title, 'Artifact title'); reference(a.reference); date(a.created_at, 'Artifact created_at');
  }
  const history = list(s.version_history, 'version_history').map(v => object(v, ['history_id','worker_id','version','effective_at','superseded_at','note'], 'Version history'));
  unique(history, 'history_id');
  const versions = new Set<string>(); const active = new Set<string>();
  for (const v of history) {
    if (!workerIds.has(v.worker_id)) throw new Error('Version history references an unknown worker.');
    text(v.version, 'History version'); text(v.note, 'History note', true);
    date(v.effective_at, 'History effective_at');
    if (v.superseded_at !== null) date(v.superseded_at, 'History superseded_at', false);
    if (v.superseded_at && v.effective_at && Date.parse(v.superseded_at) < Date.parse(v.effective_at)) throw new Error('Version history dates are reversed.');
    const key = JSON.stringify([v.worker_id, v.version]);
    if (versions.has(key)) throw new Error('Duplicate worker version milestone.'); versions.add(key);
    if (v.superseded_at === null) {
      if (active.has(v.worker_id) || workers.find(w => w.worker_id === v.worker_id)?.current_version !== v.version) throw new Error('Current version history is inconsistent.');
      active.add(v.worker_id);
    }
  }
  return structuredClone(s) as GovernedConsoleState;
}

export function parseAndValidateImportJson(json: string): GovernedConsoleState {
  if (new TextEncoder().encode(json).byteLength > MAX_IMPORT_BYTES) throw new Error('Snapshot exceeds the 2 MB import limit.');
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('Invalid JSON syntax.'); }
  return validateState(value);
}
