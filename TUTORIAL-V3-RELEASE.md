# Standalone tutorial cards v3

Installed the 26 user-supplied assets from ChatGrab_Codex_Inbox_Package_3.zip, nested ChatGrab_26_Standalone_Redesigned_Cards_v3.zip. This supersedes the rejected edge-clean crop set. No further crop or illustration generation was performed. The supplied assets reuse illustration material inside freshly composed typography, padding, matching black outlines and uniform black footer bands. All canvases are 900 x 1240. Video, routes, app state and page implementation are unchanged.

## Validation

- TypeScript and both frontend production builds passed; 24 existing tests passed.
- All 26 inline images loaded at their expected intrinsic dimensions and use contain sizing.
- All 26 modal images opened and fit the viewport without stretching at 1440 x 1000 and 390 x 844; Escape/close were exercised. No horizontal page overflow at either width.
- An 844 x 390 landscape modal also fit, including its close control.
- The supplied contact sheet, desktop full gallery, desktop modal and mobile modal screenshots were visually inspected. Matching outer frames/footer treatments and complete heading areas were observed. This is not a claim that every small illustrated UI label is semantically accurate; imagery remains conceptual.
- Desktop/mobile gallery screenshots, modal screenshots and per-card browser geometry results are retained locally in ignored evidence/intake/package3, not published as user telemetry.
- Expected SHA-256 hashes for every replacement asset: docs/tutorial-cards-v3.sha256.json. Publication checks compare served bytes against these exact local files.

Rollback: previous source 63e80c85375b570742f0966db1c9c1a24e2ffb63, deployment dpl_GVJmjoEpFw8EfuLBcRk54CgnsaLh. It contains the rejected crop set and is retained for operational rollback only. No data migration or user storage changes.

The browser became available again for this release; earlier reports of unverified tutorial modal behavior remain historically correct. Video playback/audio and general app-wide interactive regression were outside this image replacement pass.
