# ChatGrab working MVP follow-through — November 12, 2026

The reviewed manual workflow is now implemented and tested end to end on a protected preview: import → preserve source → search → back up original files → restore into a clean browser → create reviewed continuity and revisions → export a fresh-chat packet. Atlas's execution assignment is aichatlab main `fc9892d`. The historical audit is retained separately; its previously missing search/portability/entrypoint features have now moved forward.

- Application: [PR #9](https://github.com/DrDoohicky/CHATGRAB2/pull/9), based on exact live `d8786f2525db750d5aeef9d6f80089b632e8a568`.
- **Preview URL:** https://chatgrab-analysis-archiver-hqdefyyw0-inetatlanta.vercel.app
- **Target / status:** protected Preview / READY; deployment `dpl_DTK4t9mEhsZCrgFmrbBNoGN7dq9x`.
- **Built source:** `95fb58cf046d5c0a9070d4b5a9d6ef26a7b96241`; source is locally committed and CLI-deployed. Vercel's CLI deployment metadata has no Git SHA, so the mapping is our recorded build provenance, not a Vercel Git attestation. Subsequent test/documentation-only commits do not change this application build.
- Framework: React/Vite + Express; build approximately 34 seconds in Vercel's build timestamps.
- **Production:** unchanged at `dpl_2ULzAwkbUka2VnQ6kuAZzyjDfw4i`, source `d8786f...`, https://chatgrab.app/. No merge, production publication, alias change or live payment activation.

## What a customer can do in this preview

Choose **Review paste / file import**. Supply JSON/native export, an explicitly speaker-labeled transcript, or verbatim text with unknown roles. The app validates a preview before the human confirms saving. It preserves code whitespace, IDs and known source dates, recognizes speaker delimiters only outside code fences, rejects incomplete fences, invalid JSON, duplicate IDs and unsupported nontext content, and never fabricates omitted material. Copy instructions explain desktop and phone choices. Completeness before copying remains a human check; the app cannot detect text the user never supplied. Existing quick-import controls remain available for compatibility.

David's authorized browser-readable public conversation was imported through this new review file chooser on the actual deployed preview: four messages, exact source IDs/roles/text, explicit confirmation, save and reload. No source transcript, share token or screenshot of that private source was published. This is a verified manual fallback. Automatic remote capture still receives only social/link-preview metadata from the upstream service (422 `SHARE_PREVIEW_ONLY`); the app refuses partial saves, retains the URL and offers the reviewed import action. No provider protection/private API bypass was attempted.

The ordinary Library search now searches message bodies and names across folders, with explicit scope text. Favorites are available from selected-item details. Folder organization, rename/move, Select + Open, keyboard Enter and stable double-click layout are preserved. Page URLs, reloads, bookmarks and back/forward navigation work for supported sidebar destinations and legacy aliases. The approved artwork was not replaced.

**Complete portable backup** in Export includes conversation records, favorites, source links, folder organization and original binary supporting files with SHA-256 integrity hashes. It is one JSON file, limited to 40 MB of original files / 60 MB total. Restore validates before consent, merges without overwriting existing records, remaps collisions and file links, and stores files in one IndexedDB transaction. Replayed restores avoid duplicate conversations/folders. Failure is surfaced; quota errors preserve existing state. Conversation-only JSON remains a separate smaller option. Missing originals cause a clear error rather than a false complete-backup claim. Account/cloud restore is deliberately unavailable until its independent authorization/storage path is verified.

Corrupt libraries retain their raw stored bytes and offer **Download preserved storage**; complete restore is blocked until the damaged state is handled explicitly. Uploaded HTML and other original files download as files instead of executing under the application origin. Supporting files remain browser-local; no cloud sync or browser-eviction recovery is implied.

Continuity supports source selection, conflict review, human confirmation, save, withdrawal, restoration and reviewed revision. A revision creates a new record with `supersedesId`, preserving earlier versions and originals. The portable fresh-chat packet includes source/message references, historical and corrected decisions, human conflict notes, and concrete instructions for the user to verify the new ChatGPT reply. It is not an automatic transfer or verified provider response.

Crew Console accepts a reviewed local-browser handoff from this deployed preview, redacts the test email, requires recipient approval, persists it locally and returns a **human receipt**. Draft/prepared, delivered and human receipt remain distinct from worker acknowledgment and execution. Durable service authorization/recovery is covered by existing local tests; no cloud worker was invented.

## Read-only native entrypoint

The actual MCP SDK server provides `get_plugin_status` and `get_workspace_link` over streamable HTTP at `/mcp` and `/api/mcp`. Official SDK tests exercised discovery and both tools against the deployed protected preview. An untrusted origin is denied. Strict empty input schemas reject transcript/identity parameters and unknown capture tools. No API key is needed. It reads no private library, identity, current chat, other conversations or project history, and performs no AI generation, writes, payments or worker execution.

The portable plugin manifest, MCP connection metadata, skill and repo-local marketplace are in `plugins/chatgrab/` and `.agents/plugins/marketplace.json`. The packaged loopback endpoint is for local Inspector/SDK testing. A supported ChatGPT account needs its private custom MCP/tunnel setup; the hosted ChatGPT server cannot reach a loopback URL by itself. Deployment protection was not weakened, and credentials were not put in the package. Actual ChatGPT installation, @ invocation, context consent, thread/global UI and mobile host behavior remain NOT TESTED/NOT AVAILABLE in this environment. No faux panel is offered before Gate 1. Official packaging/setup references are linked in the package README.

## Separate payment test work

[PR #10](https://github.com/DrDoohicky/CHATGRAB2/pull/10), source `06aa25a895bc249bcdac8e0b1d6fcd3d3b5af73b`, builds only on existing payment PR #7. An explicitly enabled **local-only TEST ledger** exercises signed webhook fulfillment, identical/conflicting replay, persisted reopen, failure, partial/full/out-of-order refund and production denial. This change makes that lifecycle test-ready. It never grants a real membership or calls a real refund. It was not deployed or merged into the application branch. Commercial terms remain a test/draft preview; real identity/entitlements/provider delivery/support/refunds and release approval are still required. No new provider configuration, credential, account or paid resource was created.

## Acceptance matrix and evidence

Evidence links below are repository-relative sanitized files under [docs/evidence/2026-11-12/followthrough](docs/evidence/2026-11-12/followthrough). Source → WIRED → EXERCISED → VERIFIED applies only within the stated scope; fixtures are labeled and never counted as a genuine native export or provider inference. Browser: Chromium 156.0.8078.79 / Playwright on Debian GNU/Linux 13; Node v24.22.1. Six emulated widths 1440/1280/768/390/360/320.

| Row | Result / stage | Evidence / smallest remaining action |
|---|---|---|
| Actual authorized conversation, reviewed manual import | PASS / VERIFIED on deployed preview | `preview-authorized-import.json`; four exact source messages, real chooser, preview, confirmation, reload. |
| Automatic public-share fetch | FAIL / EXERCISED on deployed preview | `preview-real-share-gate.json`; provider sends metadata only. Use verified manual path until a permitted full-source route passes. |
| Native export parser | PASS fixtures / NOT TESTED genuine source | Existing native branch/nontext/invalid tests and UI regression pass. Final gate needs one small genuine nonsensitive native export, not a fabricated fixture. |
| Search, favorites, bookmarks/back/forward | PASS / VERIFIED on deployed preview | `preview-mvp.json`; cross-folder/body search is now ordinary Library functionality. |
| Complete file backup → clean restore/reload/replay | PASS / VERIFIED on deployed preview | `preview-mvp.json`; actual downloaded binary checked byte-for-byte; hashes, favorites and folders verified, tampered file rejected. |
| Collisions and quota rollback | PASS / VERIFIED in real local browser | `backup-recovery.json`; existing source retained, restored file linked to remapped conversation, quota failure preserves state. |
| Corrupt library and inert file safety | PASS / VERIFIED in local browser | `storage-safety.json`; raw damaged bytes download exactly, restore does not overwrite unreadable storage; HTML original downloads without script execution. |
| Multi-source analysis guard, continuity revisions/packet | PASS / VERIFIED on deployed preview | `preview-continuity.json`; actual selected synthetic sources, fabricated citation rejected, new revision preserves earlier record, packet contains old/new decisions and IDs. No generated provider response claimed. |
| Crew transfer + receipt | PASS / VERIFIED on deployed preview | `preview-crew.json`; two real application pages sharing local browser storage, recipient review and receipt. Worker ACK/execution NOT AVAILABLE. |
| Read-only MCP transport/status/link | PASS / VERIFIED on deployed preview | `preview-mcp.json`; official SDK over actual HTTPS, foreign origin denied. Host installation/context/private-chat access NOT VERIFIED. |
| Responsive/keyboard/reduced motion | PASS bounded browser flows / EXERCISED | Six-width route/dialog tests and existing accessible controls; no screen-reader certification. Physical Android/iPhone/PWA remains NOT TESTED. |
| Core regression/recovery/security | PASS / VERIFIED bounded scope | `local-regression.json`: 16 groups, actual API failures, local backup/delete, policy pages, no-payment mock UI, quota/corruption and browser isolation. Existing SSRF/redirect/limit unit tests still pass. |
| Test payment lifecycle | PASS / VERIFIED local TEST scope | PR #10: 43 tests, signed synthetic events over real local HTTP and SQLite persistence. Real provider delivery, cloud entitlement and actual commercial operation NOT TESTED. |
| Production/private data | PASS preservation check | Production deployment/source unchanged; approved visuals preserved; PR #104 untouched; no source transcript, access token or keys in evidence. |

Validation: **48 application unit tests**, TypeScript, main and Crew builds passed. Separate payment branch: **43 tests**, TypeScript and both builds passed. Application/browser evidence includes local regression, deployed MVP, deployed continuity, deployed Crew, deployed MCP and actual authorized manual import. Negative and storage recovery checks are real browser operations over disposable synthetic data. Deployment access uses same-project short-lived development OIDC scoped to the exact preview origin in clients; its file stays outside the repository. No protection rule was changed.

## Minimal human gates and release boundary

1. For the real-native-export fidelity check, provide a small genuine nonsensitive `conversations.json` or an authentic single-conversation extract; do not upload a private full history unnecessarily.
2. On the preview, export a reviewed continuity packet and paste it into a fresh authenticated ChatGPT conversation. Check the current decision, earlier conflict and source IDs. The app gives these instructions and cannot observe the authenticated reply.
3. If the ChatGPT account offers custom MCP installation/tunnel, connect the read-only package and invoke status. Report the actual host affordance and grants. No API key is required for this phase.
4. On an actual Android device, open the preview → Review paste / file import → choose a nonsensitive file → Validate and preview → confirm/save → Export complete backup. Expected: exact readable messages, reload retains them, Downloads contains the JSON. Emulation is not hardware/PWA proof.
5. Atlas must identify the real worker host/identity/transport for authenticated ACK testing. A human receipt cannot establish that.

All independent engineering above is complete for this milestone. These host/source/device gates are explicit remaining acceptance work, not simulated successes. Production release and live commerce remain outside the current assignment's authorization; PR #9/#10 remain draft and unmerged.
