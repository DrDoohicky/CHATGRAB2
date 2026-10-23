# Receipt monitor enforcement research pilot

ACK: 2026-10-23 Beacon inbox request, issue 100. This bounded prototype reuses the existing TypeScript bridge stack; it adds no public endpoint or orchestrator.

`lib/bridge/receipt-monitor.ts` demonstrates receiving-side, fail-closed admission using an externally pinned Ed25519 public key, runtime identity, approved policy digest, current grant, expiry, single-use nonce, input/output commitments and allow/block decision. All admission attempts append a receiving-side audit entry before success is returned. The test ledger is in-memory; the restart test reconstructs it from a copied journal and is not a process-crash/durable-storage certification.

## Actual trust boundary still required

Production enforcement requires a separately administered receiver/proxy and append-only durable replay journal, with signing credentials and policy outside worker filesystem and credential access. Both outbound protected calls and receiving admission must traverse that service. A worker cannot be allowed to call the protected destination directly. This repository and its ordinary worker identity cannot establish that boundary by themselves. The module is a protocol experiment, not deployed enforcement. Removing a monitor yields missing-receipt denial only when the independent receiving gate is mandatory; otherwise bypass remains possible.

A valid signature establishes integrity and possession of an authorized signing key. The pinned identity and grant establish the receiver's configured admission policy. Neither establishes that an LLM statement is true, that execution happened, nor that the monitor implementation behaved correctly. Input/output hashes are commitments, not independently observed execution evidence.

## Continuity contract and draft alignment

Existing DELIVERED / RECEIVED / ACKNOWLEDGED / WITHDRAWN records remain unchanged. A human receipt is not a worker ACK. Admission results are a separate evidence layer and cannot promote these continuity states automatically. The proposed receipt fields provide identity, policy binding, scoped grant, call decision and commitments for comparison with the SCITT / continuity / delegation research drafts referenced in the inbox. No standards conformance or review of the current draft revisions is claimed.

## Tests and remaining work

Tests cover modified signed fields, policy mismatch, missing receipt / removed-monitor symptom, stale grant, false runtime, blocked decision, changed output, replay after journal reconstruction, and failed audit writes. Deployment of a separately owned gate, credential isolation, network bypass prevention, durable atomic nonce reservation, actual monitor-removal and restart/crash tests are still required. Concurrent replay races are not solved by this prototype's `has`/`append` interface; production must atomically reserve a nonce and commit its audit decision.
