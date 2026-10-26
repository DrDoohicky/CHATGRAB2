# Build History / Complete Image Handoff — Oct 26, 2026

**Human authority:** David R. Labadie. **Status:** committed review-only code and packaged artifacts. No publication authorization.

## Accessible repository work

Review branch: https://github.com/DrDoohicky/CHATGRAB2/tree/atlas/chatgrab-projects-hero-review-20261026

Actual committed components:
- `src/components/BuildHistory.tsx`, `src/components/build-history.css` — searchable evidence-aware Build History; sidebar route, with source link/claim boundary on each milestone.
- `src/components/ProjectWorkspace.tsx`, `src/components/project-workspace.css` — functional local-first Projects v1, with drag-to-order desktop / reorder buttons on mobile, notes, links, small images and Library conversation references, JSON backup.
- `src/hero-slides.json`, `src/components/HeroIntro.tsx`, CSS — revise headline animation and remove decorative swoop; independent mobile stacking. Major headings become bold, restrained embossed treatment.

## Binary media package

The user has received a **14.7 MB verified ZIP** named `ChatGrab_History_And_Mockups_Codex_2026-10-26.zip`, containing **14 binary assets** plus `README.md` and a file-by-file `manifest.json` with SHA-256 hashes. It contains the new Build History desktop/mobile screenshots, four newest and three earlier capture/Projects mockups, the approved AIChatLab.app logo and reference ChatGrab/ChatLab logo images.

**Important transport boundary:** this ZIP was generated in the ChatGPT session and is NOT presently attached to this GitHub issue or committed to this repository. Codex should ask David to attach the ZIP in his Codex session or otherwise transfer it via an authorized shared file upload. It must not pretend to have opened the binary media based solely on the filename or issue text.

Owner selected **new concept #4** (`mockups/2026-10-26/concept_4_hero_owner_selected.png`) for desktop Capture hero direction; the image is a flattened mockup, not a component to paste into the live site. Build a separate hero art asset; preserve functioning links, buttons, and capture form.

## AI assistant: authentication/billing clarification

ChatGPT subscriptions and OpenAI API usage are separate. Do not label a nonfunctional ChatGrab UI control “AI assistant” that silently requires an undisclosed paid key. Existing no-key manual workflow can prepare source-bound prompts, copy them, open ChatGPT in user's logged-in browser and import the answer by paste. A genuinely embedded server-side model needs separately authorized API and usage billing (or an explicitly documented alternative provider). Don't store secret API keys in client code.

## UX and status

History page should preserve when, why, author/approver, previous image, new image, source evidence and version; distinguish representation vs stored artifact vs verified behavior. Seed timeline is hand-curated, not automated provenance capture; add durable storage and ingestion only with actual implementation/testing.

## To Codex

1. Pull review branch; run `npm run lint` and `npm run build`, then desktop/mobile browser QA.
2. Confirm history route works and timeline/source links render; Projects actions persist and backup downloads.
3. Inspect image package after David attaches it. Create mobile-optimized Hero #4 visual *without* fake button imagery or the background swoosh.
4. Audit buttons/labels implying embedded ChatGPT inference; make no-key manual handoff real and prominently explain interaction.
5. Return actual QA evidence/preview before requesting deployment approval. No autonomous publication.
