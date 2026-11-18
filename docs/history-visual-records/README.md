# Visual history and useful version controls

The old history page mixed a running app, a Vercel dashboard and GitHub source links behind vague labels. Comparison attempted to open two tabs, often leaving no visible result. Its main record list stopped November 3 while later releases were live.

This replaces the history renderer only; the ChatGrab application, existing browser-local library and payment boundaries are unchanged. The current working app has a separate stable link. Each archived card distinguishes its actual app URL, locally displayed Vercel build metadata and exact GitHub code commit. Build completion is explicitly separate from app acceptance and dated access checks. Retired app links are disabled with an explanation; protected links state that Vercel sign-in is required. Missing GitHub commits and screenshots are disclosed without inert-looking pretend actions.

Five real, dated 1440x1000 deployment screenshots show the Capture screen with a clean empty local library. Images retain their full frame and open in an accessible full-resolution dialog. Protected and retired builds get explicit missing-image text, not invented visuals. Screenshot metadata records deployment, source SHA, capture time and PNG hash. Access was not weakened to capture private previews.

Comparison selects two named versions, preserves selection while filtering, and shows both screenshots and metadata on this page. Either side can be changed. Query state survives reload and browser Back. An exact two-commit GitHub diff is available when both commits are known; identical commits receive an explanation instead of a useless empty diff. No automatic multiple-popup opening or untrusted deployment iframe is used.

Verification: production bundle build and JavaScript syntax check; browser checks for correct link destinations, locally useful build details, inaccessible app labels, screenshot dialog/Escape/focus, named side-by-side selection, persisted filters and history, direct code diff, comparison changes, honest missing images, and widths 1440/1024/768/390/320. All pass with no uncaught browser errors. Production verification and Atlas return follow release.

Public screenshot/record metadata is static and dated, not a live health monitor. An archived screenshot does not independently prove a feature works. Deployment and source records that expired cannot be recovered merely by changing a link.
