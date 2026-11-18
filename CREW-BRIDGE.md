# ChatGrab ↔ Crew Console bridge — issue 100

This release preserves both applications and adds a reviewed continuity handoff. It introduces no paid service, AI provider, credential requirement, framework, or automatic worker invocation.

## Published flow

1. Open **Crew bridge** in ChatGrab. Select a captured conversation and explicitly check 1–10 messages. Unchecked messages and file originals are not included.
2. Write the task and choose an existing worker lane. Default routing is the source-backed Crew Console pilot snapshot. Import an exported current Crew snapshot when using different lanes.
3. Inspect the displayed context, enter the reviewer name and confirm consent. Preparing a handoff saves it in the browser outbox; it does not deliver it.
4. **Send to Crew Console on this browser** puts that reviewed package in a versioned shared local review queue. Open **Crew Console**, expand **ChatGrab inbox**, review the waiting assignment and explicitly accept it. Other origins/devices use JSON export/import instead.
5. Record a **human receipt** and optionally link its evidence pointer to the existing worker lane. Return to ChatGrab and choose **Check local receipts**. Exported receipts can also be pasted into another browser.

Browser records survive a reload but are not cloud backups. Export both inbox/outbox backups and the existing console snapshot for recovery. Existing browser state at another website address is not migrated or overwritten. A worker lane never creates or renames a canonical worker.

## Contract and privacy

`src/lib/crew-bridge.ts` is the versioned contract, mirrored byte-for-byte into the published Crew source snapshot. Packets include capture/message IDs, provider and capture time, immutable capture fingerprint, selected excerpts, reviewed task, target worker/lane, reviewer/time, explicit selected-context consent, review-only authority and a canonical SHA-256 digest. The digest detects changed content; it is **not a signature, sender authentication, or proof that a claim is true**.

Context is limited to 10 messages, 6,000 characters per message and 24,000 total. Oversized messages are rejected rather than silently truncated. Email addresses and common credential patterns are redacted, but this is not comprehensive PII detection; human review remains required. Public share links are excluded unless explicitly checked because the recipient could read the full shared chat. No private transcripts belong in public issues, commits, screenshots or logs.

Human receipts are explicit operator assertions tied to a packet digest and destination. They never imply a worker ACK, wake, tool call, execution or completion. Browser-local state is not a security boundary between scripts running on the same origin.

## Local durable backend pilot

Requires Node 24 (tested 24.19.0), existing installed dependencies, and a persistent local filesystem. Run from the ChatGrab directory in PowerShell:

```powershell
node node_modules/vite/bin/vite.js build
node scripts/build-crew.mjs
$env:NODE_ENV='production'
$env:BRIDGE_ENABLED='true'
$env:PORT='3003'
node --import tsx server.ts
```

Open `http://localhost:3003/`. With the service enabled, ChatGrab offers **Deliver to local durable inbox**. Crew Console offers **Load local durable inbox**, local-operator receipt, and withdrawal. SQLite data is stored in `.chatgrab-bridge/crew.sqlite` with WAL and transactions; the directory is gitignored. Back it up using SQLite-consistent backup procedures or stop the service before copying the database and associated files. Do not place it on ephemeral serverless storage.

The service binds to loopback only, checks Host, peer address and Origin, and requires an HttpOnly SameSite=Strict local operator session. The trust boundary is this computer's local operator, not a multi-user login or hardened hostile-local-process boundary. Client-supplied roles never grant authority. The worker-acknowledgement HTTP operation is forbidden because no authenticated worker runtime is wired. Mutations use optimistic versions and idempotency keys. Audit events identify actor, action, decision, time and version without repeating source text.

Vercel always reports `portable-only`; it does not create sessions or open this database. Cross-device hosted synchronization needs a reviewed durable cloud store and account authentication. OpenAI's pending hosted-app approval is separate and is not bypassed by this bridge.

## Validation and rollback

ChatGrab: TypeScript, production builds for both apps, 19 automated tests (existing source/import/API tests plus contract, redaction, integrity, shared recovery, backend policy, duplicate delivery, version conflicts, forced process interruption and hosted-disable checks). Crew Console: TypeScript and 36 tests preserving worker identities, state validation and idempotent handoff evidence attachment.

Browser-observed locally: capture → select context → review → export/import → human receipt → lane evidence → matching receipt return; direct same-browser delivery; reload recovery; local SQLite inbox `RECEIVED`, version 2 after stopping and restarting the server. Desktop and mobile checks are recorded in the issue evidence return. No worker execution or actual worker ACK has been demonstrated.

Rollback: restore production deployment `dpl_GSR8BfGTM4mKMeRsmeM9KqLLRsXk` (source `aac9aafb956b7d7fdb24779ed6168442823d923b`). Disable the local service by unsetting `BRIDGE_ENABLED` and restarting. Preserve its database and browser backups; rollback does not require deleting or migrating original conversations. The bridge uses separate versioned storage keys and adds evidence pointers without replacing existing console records.

## Source maintenance

The separately served `/crew-console/` build is a reviewed source snapshot of the original console, not a replacement for its repository. Update the source in `aichatlab/prototypes/worker-first-console`, then from ChatGrab run `node --import tsx scripts/sync-crew.mjs` and rebuild. The sync copies only `src` and `index.html`; it does not copy databases, credentials, user browser state, dependencies or evidence. `crew-console/SOURCE.md` records the source commit for this release.
