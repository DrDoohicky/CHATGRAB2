import type { GovernedConsoleState } from '../types';

// Source: evidence/packets/*pilot-starter-context.json, commit 25ca96661d23034d590b814a881a15efc72caec9.
// Unknown dates and source URLs remain empty. Local pilot snapshot, not live state.
export const INITIAL_STATE: GovernedConsoleState = {
  "packet_type": "WORKER_FIRST_CONSOLE_LOCAL_PILOT",
  "schema_version": "1.0.0",
  "project": "The Mothership — Worker-First Console Pilot",
  "human_final_authority": "David R. Labadie",
  "coordinator": {
    "worker_id": "atlas",
    "canonical_name": "Atlas",
    "current_version": "1.4",
    "role": "Master Completion, Coordination & Governance Coordinator"
  },
  "exported_at": "",
  "workers": [
    {
      "worker_id": "atlas",
      "canonical_name": "Atlas",
      "current_version": "1.4",
      "role": "Master Completion, Coordination & Governance Coordinator",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "lumen",
      "canonical_name": "Lumen",
      "current_version": null,
      "role": "Voice Continuity and Synthesis Assistant",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "clio",
      "canonical_name": "Clio",
      "current_version": null,
      "role": "History, Provenance, Chronology, Biography and Documentary",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "ember",
      "canonical_name": "Ember",
      "current_version": null,
      "role": "Origin History",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "beacon",
      "canonical_name": "Beacon",
      "current_version": null,
      "role": "Daily Watch / External Freshness",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "mosaic",
      "canonical_name": "Mosaic",
      "current_version": null,
      "role": "Media, Layout, Visuals and Integrity",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "sentry",
      "canonical_name": "Sentry",
      "current_version": null,
      "role": "Communications Intelligence and Action Triage",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "antigravity",
      "canonical_name": "Antigravity",
      "current_version": null,
      "role": "Google App Coordination / Visual UI Prototypes",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "forge",
      "canonical_name": "Forge",
      "current_version": null,
      "role": "R&D / Continuity Infrastructure",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "ariadne",
      "canonical_name": "Ariadne",
      "current_version": null,
      "role": "Routing, Responsibility, Provenance and Continuity Architecture",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "docket",
      "canonical_name": "Docket",
      "current_version": null,
      "role": "Legal, IP, Compliance, Prior Art and Paperwork",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "relay",
      "canonical_name": "Relay",
      "current_version": null,
      "role": "Canonical Mothership Worker Identity / Context",
      "status": "ACTIVE",
      "description": "",
      "created_at": "",
      "updated_at": ""
    },
    {
      "worker_id": "relay_via_codex",
      "canonical_name": "Relay via Codex",
      "current_version": null,
      "role": "Codex-backed Execution and Engineering Path",
      "status": "ACTIVE",
      "related_worker_id": "relay",
      "description": "",
      "created_at": "",
      "updated_at": ""
    }
  ],
  "lanes": [
    {
      "display_name": "Worker-First Console Pilot",
      "purpose": "Atlas 1.4 pilots navigation, identity stability, lane behavior, import/export, and governance boundaries.",
      "status": "ACTIVE",
      "lane_id": "lane-atlas-console-pilot",
      "worker_id": "atlas",
      "source_type": "MANUAL",
      "source_reference": "",
      "pinned": true,
      "archived": false,
      "continuity_notes": "Source: Atlas pilot starter packet, commit 25ca96661d23034d590b814a881a15efc72caec9. Local pilot record; no live synchronization.",
      "created_at": "",
      "updated_at": ""
    },
    {
      "display_name": "Mission Control",
      "purpose": "Reference lane only; no Worker-First Console to Mission Control integration is authorized yet.",
      "status": "HELD",
      "lane_id": "lane-atlas-mission-control",
      "worker_id": "atlas",
      "source_type": "MANUAL",
      "source_reference": "",
      "pinned": false,
      "archived": false,
      "continuity_notes": "Source: Atlas pilot starter packet, commit 25ca96661d23034d590b814a881a15efc72caec9. Local pilot record; no live synchronization.",
      "created_at": "",
      "updated_at": ""
    },
    {
      "display_name": "Atlas 1.5 Transition",
      "purpose": "Track successor evidence without using Atlas 1.5 Candidate as the first console pilot.",
      "status": "HELD",
      "lane_id": "lane-atlas-transition",
      "worker_id": "atlas",
      "source_type": "MANUAL",
      "source_reference": "",
      "pinned": false,
      "archived": false,
      "continuity_notes": "Source: Atlas pilot starter packet, commit 25ca96661d23034d590b814a881a15efc72caec9. Local pilot record; no live synchronization.",
      "created_at": "",
      "updated_at": ""
    }
  ],
  "artifacts": [],
  "version_history": []
};

