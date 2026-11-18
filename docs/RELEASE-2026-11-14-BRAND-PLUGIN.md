# ChatGrab branding, plugin guide and edge launcher — live November 14, 2026

## Delivered

- Replaced the upper-left graphic with David's exact supplied 925 × 258 companion-app wordmark. Its bytes are unchanged; the browser verifies its hash and aspect ratio. The original file remains available for rollback.
- Added AIChatLab.app links in the sidebar, tools menu, footer, plugin guide and quick-access panel. The parent site returned HTTP 200.
- Published the consumer-facing [ChatGPT plugin page](https://chatgrab.app/?page=plugin), including the approved plugin icon, current read-only benefits, account-side setup, exact MCP address, starter prompt and a usable clipboard fallback.
- Added a persistent right-edge icon: desktop hover reveal, click pin/close, keyboard Escape/focus return, outside dismissal and touch. Choices open capture, library, the existing context-preparation side window and plugin setup. Pop-outs scroll within short viewports.
- Updated the milestone copy and retained working capture, review, library and backup flows. Website quick access is explicitly distinguished from a native ChatGPT conversation-side panel.

## Source and release identity

- Production: https://chatgrab.app/ ; plugin page: https://chatgrab.app/?page=plugin
- PR: https://github.com/DrDoohicky/CHATGRAB2/pull/16 — merged.
- Production source: `5ef8998eb5f28cae71584d6d6c8d31df45fb6dba`.
- Tested implementation head: `f25dc929e766a59da6c0bef50631461171b5f272`.
- Both source trees equal `0984e1fe866ab7b71011e2bd34f9e783b6da75cb`; no untested merge differences.
- Hosted candidate: `dpl_G5UbDpRf8i88XHTFVFAVoJRCUjm2`, READY.
- Production: `dpl_CscpyvSTL1dnRDPcrNjJVcuT98Zs`, READY, target production, alias `chatgrab.app`.
- Production was built from the identical merged source after hosted acceptance, then exercised again on the actual public domain.
- Rollback: `dpl_37A9YgcRELDWgBvjgff3iScpYAdH` / source `dbbde2eeab476258499960fbde826e086ba742af`. This release changes no storage schema or existing user records.

## Acceptance

- TypeScript, production builds and **61 unit tests PASS**. The two extra package-schema tests on private readiness PR #15 are not merged into this release; no test regression is implied by that count.
- New brand/plugin/launcher acceptance: **7 groups PASS locally, hosted and in production**. Exact supplied image bytes and aspect; parent links; hover reveal/leave; pin, keyboard Escape and focus; reloadable plugin route; clipboard success/manual fallback; real side-window action with unavailable AI send disabled; viewport fit; emulated touch.
- Viewports: **1440, 1024, 768, 390, 320 px**. Short phone check: **320 × 568**. No page overflow or wordmark cropping. Touch tests use Chromium emulation, not a physical phone.
- Existing regression: **16 groups PASS locally, hosted and in production**, including source import/reload/export/restore, invalid data handling, disabled payment demos, privacy/terms and storage warnings.
- Prototype/search/review acceptance: **7 groups PASS locally, hosted and in production**, including exact review history, corrections, real downloaded backup/fresh-browser restore, source links, stale-source indicators and quota rejection with no false Saved.
- New interaction run: **0 automatic POSTs**, **0 uncaught browser exceptions**. Existing regression: no observed HTTP 5xx.
- Bounded Vercel runtime-error scan over the selected 15-minute post-release window: **no runtime errors reported**.
- [Results and screenshots](evidence/2026-11-14-brand-plugin/). All fixtures are synthetic. Authentication state and temporary access URLs are excluded.

The protected preview initially required a permission gate: automatic approval review rejected a bearer access URL because anyone holding it could view the preview. David explicitly approved temporary preview access. The link was then used only for tests, kept out of evidence and revoked; temporary browser-state files were deleted. No deployment-protection policy was changed. This supersedes the earlier local-ready/approval-pending return.

## Program readiness and remaining boundary

Core reviewed capture/import, library/search, source-linked review history and portable backups passed the live checks. These remain browser-local early-access workflows; preserve complete backups.

The native ChatGPT plugin account installation and first real host tool invocation are still not verified. The existing anonymous MCP status/workspace tools have separate transport evidence; the new information page does not create an account connection. Direct AI replies, private-library connections and native conversation-side capture remain in development. The website side window preserves that distinction and leaves unavailable AI send controls disabled.

Private readiness PR #15, older draft PR #9, native milestone CG-PLUGIN-001, PR #104 and payments remain separate. No new MCP capabilities, account changes, credentials, private transcript publication or payment activation were introduced.

## Asset identity

- Wordmark: `/images/chatgrab-companion-wordmark.png`, 348,836 bytes, SHA-256 `ba0dcf9ac720cfad5fb7f929836a19d3136d63c81a0fd5b34057d8023653a951`.
- Plugin icon: `/images/chatgrab-plugin-icon-256.png`, 256 × 256 transparent PNG, 7,774 bytes, SHA-256 `8ca19b3831b3ce160dae5458cc69213b0792179532902881e23379d9df7a2cc4`.
