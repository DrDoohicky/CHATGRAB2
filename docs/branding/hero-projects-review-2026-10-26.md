# Review handoff — capture hero, typography, Projects v1 (2026-10-26)

**Owner:** David R. Labadie. **Status:** committed code, **not published**, **not CI/browser verified**. This branch is intended for Codex quality assurance and owner preview. Production remains unchanged.

## Owner choices
- Select concept **#4** from the four newest hero mockups for the Capture landing page. That concept has a solid capture/conversation-and-artifact visual and actionable content, not stringy loops.
- Mobile uses a *separate crop/composition*, not a squeezed screenshot. Text first; compact visual second.
- Other section hero headers should be ~half height; the Projects page can remain larger to show project information.
- Use a common bold rounded, subtly embossed typography treatment for large titles; keep buttons legible and fairly restrained.
- Projects: create projects, add saved conversations, images, notes and links and reorder cards; do not show fake capabilities.

## Actual changes on this branch
- `ProjectWorkspace.tsx` / `project-workspace.css`: functional browser-local Projects v1; create/rename project, note/link/image items, conversation references, desktop HTML drag-and-drop ordering and mobile Move Earlier/Later, per-project deletion of an item, JSON backup. Image input limited to 700 KB and stored as data URI in browser local storage. The app emits a storage-full warning when localStorage write fails. The source library remains unchanged.
- `App.tsx`, `ChatGrabDashboard.tsx`, `Header.tsx`, `WorkspaceNavigation.tsx`: real Projects route and desktop/mobile entry.
- `hero-slides.json`, `HeroIntro.tsx`: removed “It's so rad” / “It's super fab”; animation now cycles `Keep the knowledge / Capture the meaning` and other descriptive, accurate claims. Honors reduced motion.
- `metallic-theme.css`: no animated swoopy `::before` / `::after` decoration; headline typography and restrained nav emboss, mobile hero stack.

## Not done, no false claims
1. **Approved concept #4 asset has NOT been integrated**. The generated mockup is a flattened webpage screenshot, not an isolated production hero illustration; importing it wholesale would create fake controls and unusable text. The existing `/images/capture-connected-record-v2.png` remains as placeholder in the visual area until Codex isolates/reconstructs the agreed *visual-only* artwork. Do not promise screenshot functionality.
2. Cross-device Projects sync, user/team permissions, real project file uploads and access control are **not implemented**. The proof of concept uses browser-local storage; conversation cards reference the separate existing library and can become stale if those conversations are removed. Avoid implying sharing/synchronization.
3. Full-size original branding font is an image-rendered treatment; large web headings approximate it with available type/CSS, not a verified matching font file.
4. No automated CI run, browser acceptance, publishing or prod deployment was verified in this branch yet.
5. A full audit of every interior page title/half-size hero is not complete; current CSS covers common large heading selectors.

## Codex QA / next actions
- Run `npm run lint`, `npm run build`, browser QA on desktop 1440px and mobile 375px. Fix any TS/CSS regressions on this *review branch*, without publishing.
- Inspect the actual capture page hero for layering, links/input and horizontal overflow. Compare screenshot with the owner-selected concept #4. Obtain and build a production hero visual that contains no fake interactive UI.
- Test Projects: project creation and rename, note and https link, small image, reference a real Library conversation, card reorder, mobile Move controls, backup download, reload persistence, and quota error messaging.
- Check privacy/storage: local-only scope, no accidental overwrite of chat library. The project experience should remain clearly labelled beta/local-only.
- Confirm all relevant interior large titles styled consistently, and propose compact half-height section hero treatment where warranted.
- Return real screenshots, full test outputs, and commit SHA for David's approval. **No publication without owner review.**
