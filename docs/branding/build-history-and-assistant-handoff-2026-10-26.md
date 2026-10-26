# ChatGrab Build History and Assistant Integration — Codex inbox handoff (2026-10-26)

**Owner authority:** David R. Labadie. **Status:** Reviewed source changes staged on review branch; no new deployment or browser/CI validation claimed. **User must forward the ZIP attachment** from this ChatGPT session to Codex; this GitHub text note does not transmit binary images.

## Primary references
- Repository: https://github.com/DrDoohicky/CHATGRAB2
- Review branch: https://github.com/DrDoohicky/CHATGRAB2/tree/atlas/chatgrab-projects-hero-review-20261026
- Prior implementation handoff: https://github.com/DrDoohicky/CHATGRAB2/blob/atlas/chatgrab-projects-hero-review-20261026/docs/branding/hero-projects-review-2026-10-26.md
- Inbox: https://github.com/DrDoohicky/CHATGRAB2/issues/1
- History page: `src/components/BuildHistory.tsx` and `src/components/build-history.css` (connected as `history` page in `src/App.tsx` / sidebar).
- Projects: `src/components/ProjectWorkspace.tsx` and `src/components/project-workspace.css`, connected on same branch.

## Visual ZIP **NOT YET RECEIVED BY CODEX**
`ChatGrab_Build_History_Codex_Package_2026-10-26.zip` is downloadable from the author's ChatGPT conversation. It contains:
- `index.html`: responsive clickable visual **mockup** of build history with milestones and an image gallery (not a production site);
- `CODEX_README.md`: implementation and evidence-gating notes;
- `manifest.json`: actual images, checksums and authority labels;
- `assets/hero_new_01_capture_meaning.webp`, `hero_new_02_compile_knowledge.webp`, `hero_new_03_project_knowledge.webp`, **`hero_new_04_APPROVED_DIRECTION.webp`** (the fourth newer image was owner-selected for Capture);
- previous hero concept images (`hero_prior_*.webp`), some intentionally repeated references;
- approved `brand_ai_chatlab_APPROVED.png` and historical `brand_chatgrab_REFERENCE.png` / `brand_chatlab_REFERENCE.png`.
ZIP includes images for reference. Do **not** install full screenshots with fake interactive controls as backgrounds or make any claim that mockup UI currently works. Render approved concept's illustration separately using actual buttons and links.

## Requested archive behavior
- Show visual evolution of the build, timeline by date, decision/approval/evidence states, exact commits/PRs/deployments/tests and their source links.
- Search/filter, open thumbnail, export status in JSON; identify what is proposed, committed, tested, deployed, and independently verified.
- Users should be able to inspect earlier/rejected concepts without mistaking them for deployed features.
- Never claim fake ownership/usage statistics. Never call mockups evidence of feature operation. The current React page is seeded with explicitly curated history, not a full automated GitHub historian.
- Keep saved ChatGrab/AIChatLab wordmark treatment consistent; mockup rendering is illustrative only.
- Preserve owner final authority before public publication.

## Embedded assistant question — IMPORTANT
The user wants AI-assistant functions to work with his existing ChatGPT subscription **without requiring a separate API key**. Do **not** solve with unsupported session/cookie scraping or shared ChatGPT credentials.

Three permissible product paths:
1. **No API / works today:** clearly label "Ask in ChatGPT". Build prompt/copy/link, let user paste into ChatGPT, paste answer back into source-linked ChatGrab results. Never advertise in-app inference.
2. **Sign in with ChatGPT** if ChatGrab qualifies as a participating application and OpenAI offers a supported integration that shares eligible ChatGPT usage after user permission. Verify exact developer access, applicable product/model and ToS **before** promising anything. This does NOT automatically grant conversation memory/history data or an API key.
3. **Optional standard API** for fully embedded inference, with separate usage billing and safe key handling / no hardcoded shared secrets. User should choose whether to activate.
Inspect buttons labelled "AI assistant", "Analyze", "ChatGPT connection", etc. Distinguish real actions, manual handoff, and unimplemented connections with accurate labels and nonmisleading UI. Do not call a button connected if provider auth has not been exercised.

## QA and deployment gate
1. Pull branch, run lint/build & exercise project/history flows on mobile/desktop; fix bugs and return proof.
2. Install received asset ZIP and generate thumbnails; preserve asset provenance and provide visual preview.
3. Check latest Capture and header artwork against approved exact brand and selected concept; redesign no other screens.
4. Return test results, relevant screenshots and commit SHA. **No deployment until owner approves.**
