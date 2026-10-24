# Background imports and durable receipt verification

October 24, 2026. Adds a tab-local background queue for 1–100 public ChatGPT share links. Open Capture → Batch process, add one URL per line, and start. Progress remains visible on other app pages. Pause, resume, cancel remaining, retry unsuccessful and dismiss finished progress are supported. Each successful result is added to Library without changing the current page or active conversation. Existing source URLs/IDs are not imported again.

The queue validates URLs and transcripts, deduplicates canonical share URLs, processes sequentially, applies a 45-second per-link timeout, and records individual errors. It saves URL/status metadata separately from transcripts for recovery. Closing or reloading stops requests: unfinished jobs recover paused and require Resume. This is not a server worker running after the tab closes. Guest and account queues have different storage keys; changing/loading an account pauses work and ignores late responses. Transcript durability continues to use the existing Library storage/cloud path; queue metadata is not a second transcript backup.

The app no longer calls the foreground capture handler from this queue, so completed background work cannot send the user back to Capture. The floating assistant yields space to the queue while progress is present and is restored after dismissal.

## Crew receipt increment

The local receiver prototype gains a SQLite WAL admission journal. Atomic nonce insertion and audit commit prevent a stale concurrent check from admitting a replay. Malformed expiration is rejected. Tests exercise separate connections, signed receipt admission, reopening and abrupt child-process exit without database close. This local code is not enabled as a Vercel worker service and does not establish worker execution, worker ACK, external identity isolation or a mandatory independent network gate.

## Verification

TypeScript and both frontend builds pass; 29 automated tests pass. Queue tests use explicitly synthetic fetch responses to check success/failure, retry-only-failed, deduplication, validation, browser fetch binding, pause/cancel, ignored late results, account isolation and paused recovery. No real successful ChatGPT share capture is certified by those fixtures.

Browser → API test used two deliberately invalid public URLs locally. It reached the existing capture API, reported its network failures per link, retained progress on Analysis and Media, recovered the failed batch after reload, and dismissed progress correctly. The successful-capture/pause/cancel behavior is tested in the controlled queue tests; the invalid network requests finished too quickly to certify a UI pause before completion. A browser-discovered illegal fetch binding was fixed and regression-tested. Desktop/mobile progress screenshots remain in ignored evidence/batch-import. 390px has no horizontal overflow. Browser video playback advanced to about 36 seconds, keyboard pause worked and seeking advanced beyond 41 seconds without media errors; audible sound was not independently assessed. All 26 tutorial modals opened, loaded at 900×1240 and fit without clipping. Existing analysis selection/export QA remains in ANALYSIS-LIBRARY-FIX.md.

Rollback source: e81fca2ee2b7031f364d8f7fa7587246fa799cea; deployment dpl_54MqJiXotfcoYTAXkKjvskBArEeg. No transcript migration, new hosted service, credentials or provider API integration.
