# Shared-conversation recovery and actual analytics acceptance

Atlas assignment: aichatlab `coordination/shared-artifacts/inbox/codex/2026-11-13-shared-chat-recovery-6af775f7.md` at e0be162, including analytics addendum. Implementation baseline: CHATGRAB2 PR #9 source commit 322a6729f7091d86cab584ff51b8ace34dc2716f. Storage: isolated guest browser localStorage and original-file IndexedDB, local application http://127.0.0.1:3033, no cloud account credentials or model provider calls. Production unchanged.

## Recovery and confidentiality

A normal Chromium navigation to the genuine assigned share URL returned HTTP 200 with a title and a logged-out shell, zero rendered message elements. This does not establish that the conversation is empty, private or missing. Publicly delivered HTML contains serialized source records. Only public-facing user/assistant text records were selected; records explicitly marked visually hidden, internal/tool records and non-text record types were excluded. No scripts were evaluated for extraction, login bypass or provider-control workaround was used.

The reviewed partial text artifact contains 295 retained text messages (131 user, 164 assistant) in source order with source IDs, exposed message dates and exact individual text parts. It is **not the complete original conversation**: attachment-only records, unsupported content and original media are unrecovered. Full raw HTML, partial normalized JSON, private source manifest, screenshots, backups and source-linked analytical packet remain outside Git under restricted workspace storage. No conversation excerpts, screenshots containing source, binary originals, private URLs or private analytical findings are published here.

Initial local-server capture returns HTTP 502 / SHARE_NETWORK_FAILURE because native Node fetch does not automatically use this environment’s configured proxy. A second local server using Node’s supported NODE_USE_ENV_PROXY=1 reaches the upstream and observes HTTP 503 / SHARE_UPSTREAM_UNAVAILABLE. These are recorded separately; neither establishes source privacy or absence. The URL is preserved with manual fallback. Independently applying the existing parser to the browser-delivered document rejects unsupported non-text content with HTTP 422 / SHARE_UNSUPPORTED_CONTENT. Neither is a successful automatic capture. Partial text recovery is not full attachment recovery.

## Product improvement

The actual Analysis page now calculates deterministic metrics on selected saved conversations: exact saved-message speaker counts, text length, activity from original message timestamps only, top literal keyword frequencies, and case-insensitive substring search with exact source conversation/message IDs and full excerpts. No capture date substitution, model calls, invented themes or inferred decisions are used. Verbatim imports explicitly marked “roles unknown” count as unknown. The metric descriptions explain computation and boundaries. Search displays at most 25 full results while counting every match.

Model-based decisions, actions, themes, contradictions and unresolved-item interpretation remain unavailable as automatic in-app features: the actual backend responds HTTP 409 CHATGPT_CONNECTION_PENDING. The existing reviewed copy/paste ChatGPT/Gemini workflow remains the route for those interpretations. A manually authored source analysis is not represented as working product analytics.

## Acceptance matrix

| Stage | Result | Evidence scope |
| --- | --- | --- |
| CAPTURE | FAIL / partial alternative | Genuine link attempted; rendered transcript unavailable; app capture 502 without configured proxy; upstream 503 with proxy; only delivered visible text subset recovered |
| IMPORT | PASS for partial artifact | Actual file chooser, preview, explicit consent; 295 retained messages |
| SAVE | PASS for partial artifact | Persisted messages compared deeply with reviewed artifact, including roles/order/dates/text and source metadata |
| RELOAD | PASS | Actual Library content search, open and page reload; same saved source |
| ANALYZE deterministic | PASS | Actual Analysis UI; independently compared counts and literal matches |
| ANALYZE model-based | BLOCKED | Actual continuity-analysis backend returns connection pending; no provider access assumed |
| EXPORT | PASS | Actual complete-backup download matches saved partial source exactly |
| REIMPORT | PASS | Fresh browser context restores exported backup, same message data |
| Duplicate import | PASS | Actual reviewed import rejects exact duplicate; existing record preserved |
| Complete original-source fidelity | BLOCKED | Requires user-reviewed complete transcript and attachment originals |

Desktop 1440 and phone-sized 390 tested against the running app. Automated unit coverage includes empty inputs, malformed import records, unknown verbatim attribution, missing/invalid dates, source preservation and duplicate handling. No native phone or authenticated ChatGPT-host acceptance is claimed.

## Reproduce

`npm test`, `npm run lint`, `npm run build`.

Start `PORT=3033 DISABLE_HMR=true npm run dev`, then provide authorized private input paths explicitly:

`SOURCE_FILE=<reviewed private partial JSON> PRIVATE_EVIDENCE_DIR=<private output> BASE_URL=http://127.0.0.1:3033 node scripts/shared-recovery-acceptance.cjs`

Do not commit the private outputs or use them as CI artifacts. The genuine-source test intentionally records the current blocked automatic capture; sample fixtures cannot meet the genuine-source recovery gate. Synthetic unit tests are separate evidence.

## Classification and continuity delta

VERIFIED FACT: the bounded local UI/storage/backup checks and saved-record counts above. SUPPORTED CONCLUSION: the source retains user requests and assistant assertions with exact citations, which are distinguishable from execution evidence. INFERENCE: literal correction/completion cues identify review candidates, not established contradictions. PROPOSAL: rerun on an official reviewed export with original attachments. UNRESOLVED CONTRADICTION: apparent status-versus-request differences require per-message human review. UNKNOWN: full original conversation completeness, unsupported media and external deployment/worker states.

The private analytical packet has chronology, categorized source-linked candidates and relevance to ChatGrab, Governed Continuity and Crew Console. The continuity delta adds reproducible deterministic analytics and verified portability of the retained text subset, while preserving UNKNOWN for full source and host authentication. Next smallest human action: open the shared conversation in a browser that renders it, supply a reviewed complete export/transcript and original attachments. No API key is requested. No global completion, worker autonomy or account restoration is claimed.
