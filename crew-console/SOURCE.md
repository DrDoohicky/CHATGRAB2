# Crew Console source snapshot

Source: https://github.com/DrDoohicky/aichatlab/tree/7f76c743c0fd052dd24ca656f09275c01e7f479a/prototypes/worker-first-console

Snapshot commit: `7f76c743c0fd052dd24ca656f09275c01e7f479a` (`codex/issue-100-crew-bridge`).

Only the reviewed frontend `src/` tree and `index.html` are mirrored. This directory contains no user browser state, credentials, databases, dependency installations or QA evidence. It is built as an independent app under `/crew-console/`. The original repository remains the source of truth for Crew Console development.

Refresh with `node --import tsx scripts/sync-crew.mjs` from the ChatGrab checkout, then verify the mirrored contract test, both app type checks and production builds. Update this source commit when promoting a new snapshot.
