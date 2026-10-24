# Receipt monitor enforcement research pilot

ACK: 2026-10-23 Beacon inbox request, issue 100. This bounded prototype reuses the existing TypeScript bridge stack; it adds no public endpoint or orchestrator.

`lib/bridge/receipt-monitor.ts` demonstrates receiving-side, fail-closed admission using an externally pinned Ed25519 public key, runtime identity, approved policy digest, current grant, expiry, single-use nonce, input/output commitments and allow/block decision. All admission attempts append a receiving-side audit entry before success is returned. The original protocol fixture uses an in-memory ledger; the October 24 increment below adds an actual SQLite journal with reopening and abrupt child-exit tests.

## Actual trust boundary still required

Production enforcement requires a separately administered receiver/proxy and append-only durable replay journal, with signing credentials and policy outside worker filesystem and credential access. Both outbound protected calls and receiving admission must traverse that service. A worker cannot be allowed to call the protected destination directly. This repository and its ordinary worker identity cannot establish that boundary by themselves. The module is a protocol experiment, not deployed enforcement. Removing a monitor yields missing-receipt denial only when the independent receiving gate is mandatory; otherwise bypass remains possible.

A valid signature establishes integrity and possession of an authorized signing key. The pinned identity and grant establish the receiver's configured admission policy. Neither establishes that an LLM statement is true, that execution happened, nor that the monitor implementation behaved correctly. Input/output hashes are commitments, not independently observed execution evidence.

## Continuity contract and draft alignment

Existing DELIVERED / RECEIVED / ACKNOWLEDGED / WITHDRAWN records remain unchanged. A human receipt is not a worker ACK. Admission results are a separate evidence layer and cannot promote these continuity states automatically. The proposed receipt fields provide identity, policy binding, scoped grant, call decision and commitments for comparison with the SCITT / continuity / delegation research drafts referenced in the inbox. No standards conformance or review of the current draft revisions is claimed.

## Tests and remaining work

Tests cover modified signed fields, policy mismatch, missing receipt / removed-monitor symptom, stale grant, false runtime, blocked decision, changed output, replay after journal reconstruction, and failed audit writes. Deployment of a separately owned gate, credential isolation, network bypass prevention and actual monitor-removal tests remain required. The SQLite adapter now atomically reserves nonces and commits audit decisions; the in-memory fixture alone does not provide that guarantee.


## October 24 durable admission increment

`lib/bridge/admission-ledger.ts` now supplies a local SQLite WAL ledger with atomic unique-nonce reservation and audit insertion in one transaction. An independently opened connection cannot admit the same nonce after a stale precheck: insertion fails closed and records the rejected replay. Tests cover two connections, reopening, and a child process that exits after commit without closing the database. The earlier in-memory test remains a protocol fixture; the new journal addresses the local durability/replay gap described above.

This ledger is not deployed on Vercel or wired to an authenticated worker runtime. A separate gate owner, isolated signing credentials and network bypass prevention are still required; a worker with access to this database can tamper with it. Worker execution/ACK is not inferred from admission. The production bridge remains portable review-only.

