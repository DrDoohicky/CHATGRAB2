# ChatGrab contextual search and review history — published November 14, 2026

Implements CG-PROTOTYPE-001 / CHATGRAB2 Issue #13 under David's explicit implementation and publication authorization. PR #14 is merged into the existing release branch. Production acceptance passed on the public domain; no private transcript was used in testing.

## Source → deployment → live observation

- Public site: https://chatgrab.app/
- Production deployment: `dpl_37A9YgcRELDWgBvjgff3iScpYAdH`, READY, target production, alias `chatgrab.app`.
- Production source: `dbbde2eeab476258499960fbde826e086ba742af`, release/nov14-preview-publication.
- Tested implementation head: `6d78d35c2b9ce2620d1bb2bf682064b022216bd4`.
- Both commits have tree `ac127a351b07b854ed62972622c78eac2535647a`; merge introduced no untested file differences.
- Hosted acceptance preview: `dpl_ADDxsFNYrvPiwL6FVF7usvTNEVNN`.
- Direct preview promotion returned HTTP 422. Used a normal production build of the identical merged source, then repeated acceptance against the actual public domain. Do not describe this as promotion of an identical build artifact.
- Previous production / rollback: `dpl_H8wvsZCxp9kvjWb1nY5jU8BjoZ18`, source `e38910037d913a8dee59cbacbe59fbad6a9e4687`. If a serious release regression occurs, roll the existing project back to that deployment. Preserve newer browser records and export a v2 backup before switching clients; an older UI does not expose the new archive.

## Implemented and exercised

- Full-transcript search by default: literal case-insensitive highlighting, result count/position, previous/next wrap and focused message jumps. Explicit matches-only and role filters remain. Thread-scoped anchors distinguish identical message IDs from different conversations. Stored message content is unchanged.
- Local source-linked review archive: exact prepared request and pasted response, ordered selection, source snapshot/digest, provider/model as unverified user labels, timestamp, literal citation-check method/result, correction parent and explicit human confirmation.
- Corrections append new records; archive, withdraw and restore append history events. Prior source snapshots and responses stay intact. The UI flags changed/missing live sources while retaining the saved evidence.
- Optional desktop source/review comparison, mobile source/review panels, source-message links and compact source identity using real stored state. Existing approved public artwork has no byte changes from the prior production source.
- Guest and signed-in account archive namespaces are separate. Archives remain local to this browser, including for signed-in users; no account synchronization is claimed.
- Complete backup v2 includes review history and a SHA-256 whole-bundle change-detection checksum. Missing/mismatched v2 checksums reject before writing. Supporting-file hashes remain individually checked. Legacy v1 stays readable with an explicit warning that it has no whole-bundle checksum and contains no review archive.
- Restore preserves existing conversations, favorites, folders, originals and continuity records. Live links remap without changing immutable saved prompts/snapshots. Conflicting review identities or bindings reject safely. Original files and review history commit in one IndexedDB transaction; localStorage rolls back when that transaction fails.

## Acceptance evidence

All files below contain synthetic fixtures only, with no authentication state or temporary access URL.

- TypeScript and both production builds: PASS.
- Unit tests: **61 pass, 0 fail, 0 skipped**, [output](evidence/2026-11-14-prototype/unit-tests.txt).
- Real Chromium storage integration: **15 checks pass**, [results](evidence/2026-11-14-prototype/storage-results.json). Includes quota rejection, stale concurrent write, corrupt/oversized archive, exact binary Blob preservation, conflict/link remapping, failed-transaction preservation, v1 compatibility and database upgrade.
- New browser acceptance: **7 groups pass** locally, on the hosted preview, and on production. [Production results](evidence/2026-11-14-prototype/production-results.json).
- Existing regression suite: **16 groups pass** locally, on the hosted preview, and on production. [Production regression](evidence/2026-11-14-prototype/regression-production-results.json).
- User path: actual reviewed import → in-context search → exact prompt/answer save → append correction → archive/restore state → reload/reopen → real JSON download → restore into a fresh browser → exact byte/ID comparison. Also exercised literal special characters, focused source links, shared message IDs across conversations, visible stale-source state and quota failure with no false Saved message.
- Responsive screenshots and interaction: **1440, 768, 390, 320 pixels**; no horizontal page overflow. [Desktop](evidence/2026-11-14-prototype/production-comparison-1440.png), [tablet](evidence/2026-11-14-prototype/production-comparison-768.png), [phone](evidence/2026-11-14-prototype/production-comparison-390.png), [small phone](evidence/2026-11-14-prototype/production-comparison-320.png).
- Pasted script markup remains inert text. No automatic AI requests or uncaught browser exceptions in the new acceptance runs; no HTTP 5xx in the existing production regression.
- Vercel runtime error scan for the project over the last 15 minutes: no runtime errors found. This is a bounded post-release observation, not a permanent monitoring guarantee.
- Temporary deployment access used for hosted testing was revoked; project protection policies were not changed. The browser trusted the existing environment proxy CA by its pinned public key for external tests; it did not disable certificate checks globally.

## Operating boundaries

The archive is bounded to 3 MB, 100 reviews and 1,000 state events. Individual answers are bounded and selected context is never silently truncated. Storage failures remain visible; export complete backups before clearing browser data. Digests detect changes and literal citation checks match quoted source text; neither authenticates a model, proves an interpretation, or creates a tamper-proof signed record.

No payment activation, paid-provider API connection, native ChatGPT host integration, cloud review synchronization, private conversation publication or unrelated site release was performed. CG-PLUGIN-001 and PR #104 remain separate. Real provider/model identity and physical-device testing are not claimed by these synthetic browser checks.
