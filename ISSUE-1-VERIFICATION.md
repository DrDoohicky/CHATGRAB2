# Issue #1 audit — October 22, 2026

This is a partial acceptance record, not a claim that every original acceptance test passed.

## Delivered

- Persistent full-width header, desktop sidebar with saved collapse preference, and mobile hamburger drawer. Keyboard focus enters the drawer, Escape closes it and returns focus, and Tab stays within it.
- Direct working destinations for Artifacts/support uploads, visual guide, exports, and Settings. Preserve opens inline Capture; Organize opens the library explorer. Analysis and reintegration remain anchored in Workspace.
- Reviewed reintegration can create a separate continuity record with selected source message IDs, destination snapshot, purpose, conflict notes and explicit approval. Original threads remain untouched. Withdraw/restore preserves the derived record and its history.
- Human review status and notes for analysis findings, included in findings exports. Source IDs, quotations and full source text are available alongside findings.
- Transcript-only print report, separate from the dashboard and export controls.
- Fixed the deployed catch-all API's ESM imports (`.js` references). The previous production analysis endpoint returned FUNCTION_INVOCATION_FAILED; the repaired endpoint returns structured validation/configuration responses.
- Reject duplicate source/message IDs and malformed inputs. Disclose analysis truncation and provider transmission. Retain quotation validation and stale-result cancellation.

## Verified

- Installed dependencies reused; no redundant reinstall. TypeScript lint (`tsc --noEmit`) and production Vite build pass.
- Five Node tests pass: source quotation validation (four tests), and actual local HTTP route validation/missing-provider handling (one test with multiple assertions).
- Local browser: copied-text import, original source contents, reviewed continuity save, withdraw, restore, reload persistence, and saved sidebar preference.
- Public browser: exact production URL, new header/sidebar/drawer and desktop screenshot. At 820px tablet and 390px phone widths, document width does not exceed viewport width. Phone drawer focus and Escape restoration verified.
- Actual preview and production HTTP requests: empty analysis selection returns 400; private `/s/t_` link returns 400; valid analysis selection returns 503 with an honest unconfigured-service error. No successful AI findings were simulated.
- PDF report DOM contains the chosen conversation title, capture metadata and actual transcript. The operating-system PDF save dialog was not exercised.

## Still required

1. Configure the existing Gemini service securely in Vercel (`GEMINI_API_KEY`, production and preview as needed), redeploy, and run substantive positive multi-chat acceptance tests for contradictions, apologies, accomplishments, narrative and neural neighbors. Both tested deployments currently return 503 because the service is unconfigured. Do not paste the key into GitHub or chat.
2. Finish end-to-end downloaded-file inspection. The in-app browser's download event timed out for JSON exports; the app's export controls and print-report contents were inspected, but this is not a verified downloaded JSON/PDF artifact.
3. Successful public-share/batch regression needs a usable public share containing meaningful records. Private-link rejection passed. Cloud account regression was not run and existing account settings were not changed.

## Reconciled older requirements

- Stillboards must remain removed per David's later explicit correction.
- The supplied screenshot's pastel artwork was superseded by David's later glowing metallic treatment. Nine cards use independently rendered cells of `public/images/workspace-metal-atlas.png`; they are real bitmap art, with separate live headings and controls. No claim is made that the earlier ZIP's exact nine named PNG files were recovered.
- Publication access works using the existing authorized project connection. Runtime log access still returns Vercel 403; no security or credential settings were changed to work around it. No locally installed Vercel CLI was available for that log fallback.

## Release evidence

- Branch: `chatgrab-completed-baseline-20261017`.
- Implementation commit: `2164bff9e74365fb96717cf8f41dbe7e13751dca` (subsequent source-view/privacy refinement recorded in Git history).
- Verified preview: https://chatgrab-analysis-archiver-k9ml066ih-inetatlanta.vercel.app/
- First repaired production deployment: `dpl_7u6VsMGbQz96m8DoWxW9Usb3HCSk`, READY.
- Production: https://chatgrab-analysis-archiver.vercel.app/
- Local screenshots are ignored in Git: `evidence/issue-1-desktop.png`, `evidence/issue-1-mobile.png`.
- Rollback reference: `d1208ef8a8b0ec1ad8760c4297143cd584c163a0`, deployment `dpl_94AvqXgcCTWr7b3vxeovpXUBXWkb`. It retains the earlier API import defect; prefer a forward fix for analysis availability.

Issue #1 remains open for the explicitly listed acceptance gaps.
