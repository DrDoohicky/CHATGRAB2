# Tutorial and explainer release

2026-10-23: Integrated the user-supplied ChatGrab Tutorial Explainer package into the existing guide destination. Direct URL: `/?page=tutorial` (also `?page=guide`). The native video appears first with controls, playsInline, metadata preload and no autoplay. All 26 original WebP cards follow in seven sections, with contain sizing, accessible navigation and full-size previews (Escape, close/backdrop, focus return).

Only the supplied video and individual cards are published; the standalone reference HTML does not replace the app. Existing capture, storage, navigation, account status and review flows are retained. Illustrations and narration are conceptual material, not certification of account access, automated analysis or runtime execution.

Validation: TypeScript check; both production frontend builds; existing 22 tests; 2 receipt prototype tests. Browser playback, audible narration, seeking and mobile visual validation remain unverified: Windows Computer Use stopped because it could not determine the current browser URL sufficiently to enforce its policy. Do not represent these as passed. Direct deployed asset and byte-range checks are recorded in the publication update.

Receipt-monitor inbox ACK and bounded research are in RECEIPT-MONITOR-PILOT.md; no new public enforcement endpoint or provider credentials were introduced.
