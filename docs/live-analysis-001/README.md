# MOTHERSHIP-CHATGRAB-LIVE-ANALYSIS-001

David authorized live production repair via the November 18 Atlas 1.5 W1 assignment. Target is ChatGrab.app, not a permanent review URL. Base/rollback: production f6eb0d391838f4fed1fedda915b89cb44ead2819 / dpl_8rEdRDZfcSgcLBuBFndrYtYrBcWa. The source includes the prior PR18/19/20 work; no older preview replaces it. Payments, credentials, private source publication and destructive migrations are excluded.

## Repair

- A sole saved source is selected automatically; source selection and batch/filter choices persist with the local draft. A clear Review request for ChatGPT action leads to the next step.
- Capsule recognition reads its schema rather than relying only on a model label. The UI distinguishes reconstructed events, excerpt and top-level sections with JSON pointers from original chat turns. Raw original JSON stays unchanged and downloadable. Metrics remain deterministic, explicitly not semantic AI analysis.
- Review consent is adjacent to Copy request, with an accessible disabled-state explanation. Denied/unavailable clipboard access exposes the complete selectable request, a select button and phone/keyboard instructions.
- Requests identify source IDs, unknown roles for source containers, JSON pointers and batch/filter scope. Oversized messages are split without losing characters or breaking surrogate pairs. Source text and imported drafts are not silently truncated.
- Pasted/file-imported responses bind to the exact request. Changed sources/topics/batches block saving or exporting a stale interpretation. Optional second opinions have separate bindings. No direct provider request or native ChatGPT automation is claimed.
- Save analysis review creates a new integrity-checked original JSON evidence file containing the exact source/request/response snapshot. History reloads without overwriting previous files. Complete backup includes the originals, with fresh-browser recovery checked. Storage failures do not claim success. Source records remain unchanged.

## Verification

69 unit tests, TypeScript and production build pass. New end-to-end browser tests cover desktop clipboard write/read and 390px touch-emulated Chromium clipboard denial/fallback, source review, response file import, quota failure, saved review reload, stale-response blocking, exported bundle and complete backup/fresh-browser restoration. Layout checked at 1440/1024/768/390/320; approved 925px branding source remains intact. These are browser viewport tests, not physical phone hardware or externally generated ChatGPT answers.

The private supplied Atlas capsule also passed locally. Only counts and pass/fail evidence are retained; no private source text, URLs, prompts or screenshots are published. All model responses used for testing are explicitly synthetic user-pasted fixtures. Existing seven-group prototype browser regression passes.

Production release and verification evidence is returned to Atlas inbox and Mothership master-history after deployment. scripts/live-analysis-acceptance.cjs is repeatable using BASE_URL, EVIDENCE_DIR and optional PRIVATE_CAPSULE for local-only testing; never use private source files for public screenshots.
