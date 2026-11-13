# ChatGrab Development History

A running, evidence-linked record. **A code commit is not a deployed feature.** Dates below describe recorded development milestones, not necessarily public release dates.

## 2026-11-13 — Subscription-first preservation correction (draft)
**Status: COMMITTED TO DRAFT PR; NOT MERGED OR DEPLOYED**

- Raw pasted text is now preserved verbatim rather than sent through Gemini for parsing.
- Removed the 30,000-character truncation from that raw import path.
- Capture no longer automatically calls Gemini analysis.
- Embedded share links in pasted transcripts no longer override the selected raw-text mode.
- **Important limitation:** the raw import is stored as one unparsed message, not a verified role-by-role reconstruction. The existing Gemini chatbot and analysis endpoints remain. No build/browser tests have passed for this branch.

Evidence: [Draft PR #11](https://github.com/DrDoohicky/CHATGRAB2/pull/11).

## 2026-11-12 — Extended preview functionality reported by Codex
**Status: CODEX-REPORTED PREVIEW VALIDATION; NOT PRODUCTION**

Codex's project return records manual transcript/JSON import, backup and restore with hash checks, folder and search navigation, continuity revisions, a reviewed Crew Console handoff, and emulated mobile-width checks. It reports 48 unit tests and successful lint/build. These claims belong to a **separate preview branch** and must be reconciled with PR #11 before merging.

Limitations recorded in the same report: automatic public-share capture failed on the real preview due to social-preview-only responses; authentic native export fidelity, fresh authenticated ChatGPT host installation, physical Android behavior, and worker acknowledgment were not verified.

Evidence: [Codex follow-through PR #9](https://github.com/DrDoohicky/CHATGRAB2/pull/9) and [coordination return](https://github.com/DrDoohicky/aichatlab/blob/main/coordination/shared-artifacts/inbox/atlas/2026-11-12-chatgrab-followthrough-return.json).

## 2026-11-12 — Public share-page parsing investigation
**Status: INVESTIGATION / ISOLATED PREVIEW**

Codex reported that a browser could read an authorized nonsensitive four-message public share, while a normal server request received only social-preview HTML. The isolated preview addressed newer document format parsing and transient failure classification; actual server-side public share capture remained blocked. No source transcript or share token is published in this history.

Evidence: [Audit progress packet](https://github.com/DrDoohicky/aichatlab/blob/main/coordination/shared-artifacts/inbox/atlas/2026-11-12-chatgrab-audit-capture-progress.json).

## Current product boundary

ChatGrab's core preservation workflow must work without a Gemini key, OpenAI API key, or other paid model API. ChatGPT subscription access does not grant third-party API access. ChatGPT-native analysis requires a separately verified supported handoff or app integration. Existing Gemini-powered interfaces are **not** compliant with this target yet.

## Release policy

Do not describe a draft PR, isolated preview, simulated mobile check, or local test as a live consumer feature. Preserve this history; add dated entries rather than replacing previous records.
