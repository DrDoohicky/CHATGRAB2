/**
 * GovernedContinuity Worker-First Console Data Model & Governance Types
 * Reference: ATLAS_1_4_TO_GOOGLE_AI_STUDIO_WORKER_FIRST_CONSOLE_BUILD
 */

export type WorkerStatus = 'ACTIVE' | 'HELD' | 'BLOCKED' | 'CLOSED' | 'SUPERSEDED';

export type LaneStatus = 'ACTIVE' | 'HELD' | 'BLOCKED' | 'CLOSED' | 'SUPERSEDED';

export type EvidenceState =
  | 'VERIFIED_FACT'
  | 'SUPPORTED_CONCLUSION'
  | 'INFERENCE'
  | 'PROPOSAL'
  | 'RECONSTRUCTION'
  | 'UNRESOLVED_CONTRADICTION'
  | 'UNKNOWN';

export type ArtifactType = 'CAPSULE' | 'HANDOFF' | 'LINK' | 'SPEC' | 'EVIDENCE' | 'TRANSCRIPT' | 'PROPOSAL';

export type SourceType = 'CHATGPT_URL' | 'EXTERNAL_REFERENCE' | 'CONTINUITY_CAPSULE' | 'MANUAL';

export interface WorkerRecord {
  worker_id: string; // Primary key, immutable
  canonical_name: string;
  current_version: string | null;
  role: string;
  description: string;
  status: WorkerStatus;
  related_worker_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaneRecord {
  lane_id: string; // Primary key
  worker_id: string; // Bound to canonical worker. Renaming lane NEVER changes worker_id.
  display_name: string; // Editable organizational label only
  purpose: string;
  status: LaneStatus;
  source_type: SourceType;
  source_reference: string;
  pinned: boolean;
  archived: boolean;
  continuity_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ArtifactRecord {
  artifact_id: string;
  worker_id: string;
  lane_id?: string | null;
  type: ArtifactType;
  title: string;
  reference: string;
  evidence_state: EvidenceState;
  created_at: string;
}

export interface WorkerVersionHistoryRecord {
  history_id: string;
  worker_id: string;
  version: string;
  effective_at: string;
  superseded_at: string | null;
  note: string;
}

export interface GovernedConsoleState {
  packet_type: string;
  schema_version: string;
  project: string;
  human_final_authority: string;
  coordinator: {
    worker_id: string;
    canonical_name: string;
    current_version: string;
    role: string;
  };
  exported_at: string;
  workers: WorkerRecord[];
  lanes: LaneRecord[];
  artifacts: ArtifactRecord[];
  version_history: WorkerVersionHistoryRecord[];
}

export interface AcceptanceTestResult {
  id: string;
  title: string;
  passed: boolean;
  details: string;
  timestamp: string;
}
