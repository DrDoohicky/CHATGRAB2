# ChatGrab system audit — November 12, 2026

**Historical audit snapshot.** The implemented follow-through and newer deployed acceptance results are in [FOLLOWTHROUGH-2026-11-12.md](FOLLOWTHROUGH-2026-11-12.md). Earlier missing-feature rows below are retained for provenance.

Issue: https://github.com/DrDoohicky/CHATGRAB2/issues/8. Atlas full-execution authorization on aichatlab main c5d76f73656a2ed1b368c4097ac8557c61c523b6. This is an isolated audit and reversible repair, with no production publication or live payments. Evidence is under `docs/evidence/2026-11-12/system-audit/`. User conversation contents, share token, credentials and temporary preview-access links are deliberately excluded.

## Customer-facing result

ChatGrab currently provides a browser-local conversation library: import copied text or compatible JSON, organize records, search, save backups, prepare source-linked analysis requests, and create reviewed continuity records without deleting original history. Supporting file originals are stored separately in this browser. Clearing site data can remove them; a conversation JSON backup does not contain those original files.

Reliable automatic public-share capture is **not established**. David supplied a real authorized share: the browser received all four messages, but the production capture API could not parse the current format, and the repaired Vercel preview still receives a link-preview-only response from the provider. The repair recognizes the new full-document format, distinguishes this incomplete response, and refuses to save a partial conversation. It does not claim to overcome provider delivery restrictions. A manual, browser-readable-share → compatible JSON → actual file import/reload/download test preserved all four message IDs, roles and text exactly. That is evidence for a manual fallback, not remote capture or a native account-export test.

Analysis and ChatGPT restoration remain human copy/paste workflows. There is no verified installed native ChatGPT plugin, automatic private-history access, paid entitlement, or worker execution. The Stripe sandbox succeeded on its separate existing payment branch; production checkout remains disabled. These boundaries prevent presenting this as the finished paid native companion.

## Exact deployment and PR reconciliation

| Item | Observed state |
|---|---|
| Production | https://chatgrab.app/; project `chatgrab-analysis-archiver`, `prj_HUi7tLa9yNg9xltPvytMVSp2KLPT`, team inetatlanta |
| Production source | `d8786f2525db750d5aeef9d6f80089b632e8a568`, deployment `dpl_2ULzAwkbUka2VnQ6kuAZzyjDfw4i` |
| Production immutable URL | https://chatgrab-analysis-archiver-cmu8b6ulb-inetatlanta.vercel.app |
| Audit source | `codex/nov12-system-audit`, repair commit `878ccefec8985e40b0a956e309297343483a79ab`, based on exact production SHA |
| Latest isolated preview | https://chatgrab-analysis-archiver-9xj06xjp7-inetatlanta.vercel.app; `dpl_3HEdKGWujgDDPtxW99sRkXGKzH3s`, READY, protected preview, no aliases, CLI deployment |
| Preview source evidence | Local tracked repair commit above plus build/deploy logs. Vercel CLI deployment metadata has no Git SHA; do not imply it attested Git provenance. Later documentation-only commits do not alter this build. |
| CHATGRAB2 PR #2 | Open draft; head `codex/issue-100-crew-bridge` at production SHA. Open PR status does not imply its head is absent from live. |
| PR #6 | Merged into that branch; merge commit is production SHA. No-payment consumer launch is live. |
| PR #4 / aichatlab #102 | Open draft historical manual bridge and companion, separate from newer portable bridge now in the live tree. No merge was performed. |
| PR #7 | Open draft `codex/nov8-founding-payments`, head `17438e65ddfbfed253205373e7d24eea69f4dfac`; existing real Stripe TEST code, absent from production. |
| Historical main / PR #104 | Old default main was not used as implementation baseline. PR #104 was not changed. |

## Capability matrix

PASS refers only to the stated exercised scope. FAIL means an observed failed acceptance condition. NOT TESTED means required evidence is missing. NOT AVAILABLE means the connected environment lacks the required host/device capability. Stage is the strongest demonstrated stage: EXISTS (source), WIRED (reachable path), EXERCISED (attempted), VERIFIED (passed its bounded test). Source inspection is not a live success.

| Capability | Result / stage | Evidence and limits |
|---|---|---|
| Live workspace, library, backup, deletion, policies, disabled checkout | PASS / VERIFIED | `live-baseline.json`: 16 browser groups on actual production, Chromium/Linux. Independent contexts and actual API requests; no mocked successful public-share capture. |
| Copied text → local save → reload → JSON backup → clean restore | PASS / VERIFIED | Live and repaired regression. Copied text is a single user message; it does not reconstruct assistant roles automatically. |
| Real authorized public-share capture | FAIL / EXERCISED | Live 422; actual repaired preview 422 `SHARE_PREVIEW_ONLY`. Browser got full public document while deployed server got metadata only. Historical Android 503 was not reproduced; exact historic cause remains unknown. |
| Real authorized share manual file import | PASS / VERIFIED | `authorized-manual-import-result.json`: four messages, exact IDs/roles/text, actual file input, reload and downloaded backup. Manual normalization, no server-capture or account-export claim. |
| New public document parser | PASS / VERIFIED within fixtures | `api/fetch-share.ts` supports `__WEB_MOBILE_DATA__` JSON. Unit fixtures cover current and legacy forms, exact whitespace, invalid/non-text content and provider error/retry distinctions. Deployed end-to-end remote success still fails above. |
| Private/malformed/nonexistent links, SSRF/redirect/size/time limits | PASS / VERIFIED in unit/API scope | `test/fetch-share-safety.test.ts`, live rejected private `/s/` link, nonexistent public link upstream 404. Exact host allowlist, bounded redirects, 8 MB response cap, 15 s deadline. No private-history access attempted. |
| Real native ChatGPT conversations.json export | NOT TESTED / EXISTS | Parser and selected-branch schema fixtures pass. No real nonsensitive native export was supplied; fixture success is not real export fidelity. Attachments/nontext rejected rather than silently invented. |
| Dedup/provenance/changed snapshots | PASS / VERIFIED within unit scope | `src/lib/capture-record.ts`, `test/capture-record.test.ts`: exact recapture idempotent; changed content snapshots; UUID record IDs; no fabricated model/original date. Real remote recapture blocked. |
| Folders, rename, move, reload, opening source | PASS / VERIFIED | `expanded-ui.json`; real UI. Explicit Select + Open actions used. Double-click selection appeared unstable during harness development and needs a separate manual UX check. |
| Search and favorites, 250-record corpus | PASS / VERIFIED within local scope | `library-extra-result.json`: advanced Ask/merge library searches message bodies and favorite persists. Default file-explorer search is names only: consumer discoverability gap. 250 modest fixtures is not a multi-megabyte performance certification. |
| Supporting files | PASS / VERIFIED within local scope | Actual file input, IndexedDB blob verified exact after reload. Conversation backup excludes file originals. No cross-device sync or complete asset backup certification. |
| Storage quota/corruption/browser isolation | PASS / VERIFIED within simulated failure scope | Regression injects quota errors, preserves corrupt data, warns before reload; another browser context has empty library. Browser-close/OS-eviction recovery not tested; no multitenant certification. |
| Code whitespace displayed/copied | PASS / VERIFIED | Supplemental browser test copies exact leading indentation and trailing blank lines after repair. Source/export were already preserved independently. |
| Single/multi-chat manual analysis and batching | PASS / VERIFIED within fixture scope | `test/analysis-batches.test.ts`, `test/ai-review.test.ts`, `expanded-ui.json`. 54k batching/60k bounds, exact quotation validation, two actual selected fixture sources, fabricated citation rejected. Imported analysis is expressly synthetic, not provider output. |
| Automatic provider inference | NOT AVAILABLE / WIRED to pending response | `lib/chatgpt-connection.ts`: hosted approval pending, connected false, requiresApiKey false, historyAccess false. No provider credential provisioned or inference invented. |
| Reviewed continuity, correction provenance, withdraw/restore | PASS / VERIFIED within local scope | Real UI selects both fixture sources, requires human approval, creates attributed derived record, leaves originals unchanged, withdraws/restores. `expanded-ui.json` and continuity unit tests. |
| Fresh authenticated ChatGPT manual restore | NOT TESTED / EXISTS | Portable context/export is available, but disposable host browser is unauthenticated. No claim that a fresh ChatGPT response preserved facts or contradictions. |
| Portable Crew assignment + human receipt | PASS / VERIFIED within local browser scope | `crew-ui-result.json`: reviewed/consented excerpt transfer through shared IndexedDB, source email redacted, recipient review, receipt returned. Human receipt explicitly says worker ACK unverified. |
| Durable Crew transitions/restart/recovery | PASS / VERIFIED only in local service tests | SQLite/service tests exercise real child-process persistence, races and denied/versioned transitions. Not a deployed cloud worker path. No actual PENDING_ACK→authenticated worker ACK observed. |
| Worker wake/execution | NOT AVAILABLE / EXISTS only as intended contract | No worker execution inferred from assignment, delivery, human receipt, hash or test fixture. PR #4/#102 do not prove deployment. |
| Desktop/tablet/phone layout | PASS / VERIFIED on repaired source | Six widths 1440/1280/768/390/360/320, seven routes; repaired 15px header overflow at 320. Chromium responsive viewports, not physical Android/iPhone/PWA or microphone permission testing. |
| Keyboard/accessibility | PARTIAL / EXERCISED | Existing navigation focus/Escape handling and semantic controls source-reviewed; browser actions exercise form roles. No full screen-reader, contrast or accessibility certification. |
| Plugin install/status/thread panel/global entry/mobile/context grant | NOT AVAILABLE / NOT EXERCISED | Existing phase-one specs and host gate read. No ChatGrab tool present in connected catalog; disposable ChatGPT is login-only. Official documentation support does not establish user-account installation or grants. |
| Local shared-links collector asset | EXISTS / UNWIRED | `public/share-registry/collector.js` only collects DOM-visible links/titles from user-opened dialog; no UI wiring or transcript capture. Not run against user account; not a native plugin. |
| Stripe $19 sandbox on separate PR #7 | PASS / VERIFIED in existing TEST scope | `stripe-test-local-app.json`: real Stripe-hosted test checkout from local app, server-verified 1900 USD, repeat verification, foreign-context receipt denied; no real money/membership. Local app is not a deployed checkout endpoint. |
| Production paid launch/fulfillment/refunds/webhook | FAIL readiness / NOT WIRED | Checkout remains disabled. No actual webhook delivery configured, durable entitlements/refund workflow unverified, commercial terms draft. Tests do not authorize live activation. |

## Narrow repairs on this branch

- `api/fetch-share.ts`: parse current public JSON without executing scripts; distinguish upstream unavailable/access denied/not found/rate limited/metadata-only; bounded transient retry; retain input and actionable fallback; preserve source whitespace/dates and refuse unsupported content.
- `src/lib/capture-record.ts`, `src/App.tsx`, `src/components/CaptureModal.tsx`, `src/types.ts`: consistent provenance, UUIDs, dedup/snapshot behavior, retained errors/input, visible text-only limitations.
- `src/components/MarkdownView.tsx`: stop trimming code block indentation/blank lines before display/copy.
- `src/components/workspace-navigation.css`: keep complete header controls within 320px.
- No artwork redesign, credential changes, paid resources, payment code merge, production aliases or historical source overwrite.

## Prioritized next work

Effort estimates are engineering time after required inputs, not promises of provider availability. Atlas can prepare copy, acceptance cases, plugin package metadata and sample exports in chat; runtime integration and security verification need engineering.

| Priority | Gap / code location | Estimate and dependency | Smallest acceptance check |
|---|---|---|---|
| P0 | Dependable authorized capture, `api/fetch-share.ts` and Capture UI | 0.5–2 days investigation; upstream may not offer server-readable transcript. Prefer explicit user export/copy fallback; no auth bypass or scraping private APIs. | Same real authorized URL produces all four exact messages on deployed preview, or product clearly routes to reviewed manual import with zero partial saves. |
| P0 | Real native export + fresh authenticated ChatGPT restore, `src/lib/importConversations.ts`, continuity workspace | 2–4h after one small nonsensitive real export and a user-operated authenticated fresh chat | Exact selected branch/roles/code compare, export derived continuity, user pastes into fresh chat and verifies original/corrected decisions. |
| P0 | Native ChatGPT host gate, phase-one specs and `lib/chatgpt-connection.ts` | 0.5–1 day once install-capable ChatGPT account/session available | User installs reviewed package; status tool actually invokes; verify thread panel/context consent and mobile separately. Fail closed when unsupported. |
| P0 | Paid readiness before any launch, separate PR #7/API | 1–3 days after product/capture acceptance and explicit payment authorization | Test webhook replay + durable entitlement exactly once, refund/revoke, cancel/failure, finalized terms/support. Keep live payment disabled until approval. |
| P1 | File-explorer content search discoverability, `LibraryExplorer.tsx` vs `CorpusModal.tsx` | 2–4h | Same body-only query finds source from the default Library path; clear scope labels. |
| P1 | Query/deep-link/back navigation, `src/App.tsx` initialPage/openPage | 3–6h | Each sidebar route survives reload/bookmark and browser back without silently returning to capture. Current query parsing recognizes only a subset. |
| P1 | Complete portable supporting-file backup, `src/lib/assets.ts`, exports | 1–2 days | Export archive, clear disposable storage, restore exact linked blobs plus conversation provenance; explicit size limits. |
| P1 | Actual Crew worker ACK deployment, bridge service/console | 1–2 days after named worker transport/identity available | Real worker authenticated ACK persisted across restart; distinguish delivery/human receipt/ACK/execution and deny foreign transitions. |
| P1 | Real Android/iPhone/PWA + keyboard/assistive testing | 0.5–1 day with devices | Actual picker/download/permission/reopen, screen-reader focus and 320px menu, not just viewport simulation. |
| P2 | Double-click consistency in file explorer, `LibraryExplorer.tsx` | 1–3h | Stable double-click opens intended item with no selection/layout race; preserve accessible Select + Open alternative. |
| P2 | Large-library performance/eviction controls | 0.5–1 day | Measured realistic corpus near storage limits, explicit backup warning, browser restart and eviction recovery. |

## Competitive MVP and limits

The smallest useful product is authorized import → source-preserved local library → discoverable content search → portable reviewed continuity → verified fresh-chat restore. The middle local steps work in bounded tests; dependable remote import and authenticated fresh-chat restore remain open. A local archiver alone does not establish the intended paid plugin value. Prioritize reliable manual import, complete backup and clear provenance before native panel or commerce promises. Native context grants, automatic analysis, cross-device persistence, worker execution and subscription fulfillment must each pass their own gate.

## Validation and environment

Chromium via Playwright on Linux; Node 24 runtime. 44 unit tests passed; TypeScript lint and both production builds passed. Existing 16-group regression passed on live and repaired local source; expanded folder/analysis/continuity/six-width browser suite passed. Supplemental source search/favorites/files/code-copy and portable Crew tests passed. Exact commands: `npm test`, `npm run lint`, `npm run build`, `CHROMIUM_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3018 node scripts/launch-e2e.cjs`, `node scripts/system-audit-e2e.cjs`. Supplemental scripts/evidence use only synthetic fixtures; private authorized-source fixture is not committed.

Official host references for the next gate: https://developers.openai.com/plugins/build/extensions and https://developers.openai.com/plugins/deploy/connect-chatgpt. Those are documentation references, not proof of a live ChatGrab plugin installation. Real native export, authenticated ChatGPT restore, actual mobile hardware and cloud worker ACK need additional user/host evidence. No production publication occurred during this audit.
