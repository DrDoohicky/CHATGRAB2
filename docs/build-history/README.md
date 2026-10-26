# ChatGrab — Build History, Mockup Provenance, ChatGPT Connection Options

**Date:** October 26, 2026
**Authority:** David R. Labadie
**Lane:** Codex/Relay; engineering review branch `atlas/chatgrab-projects-hero-review-20261026`.
**Status:** Historical-gallery **mockup implemented in standalone HTML** and packaged, **not integrated or deployed**.

## Handoff files (outside repository, transfer required)
`ChatGrab_Build_History_Codex_Package_2026-10-26.zip` — produced in the ChatGPT conversation, 16 indexed design records, 15 distinct existing image files and thumbnails, `index.html` + `style.css` functioning searchable/filterable gallery, `manifest.json` hashes and source roles, `history-preview-desktop.png`, `history-preview-mobile.png`, README.

**Codex does not automatically receive this binary ZIP through this issue comment.** David should download/attach it to Codex, or an authorized shared artifact upload can be used. Do not claim you saw the images until accessible. Avoid committing 26MB of binary mockups into repository without review.

## History page
Build a real accessible feature in ChatGrab named **Build History** (not a fake placeholder). Records capture: date/provenance, source image, title, status (concept/owner-approved/staged/QA-verified/deployed only when proven), latest revision, underlying action and related GitHub commit/PR/deployment proof if available. Inspect original media, filter, search; support mobile. Existing source gallery mockup can be opened locally from the ZIP. Reuse the component and style approach, not flattened screenshots as fake navigation.

## Current development and source-of-truth links
- Review branch: https://github.com/DrDoohicky/CHATGRAB2/tree/atlas/chatgrab-projects-hero-review-20261026
- Previous QA task: https://github.com/DrDoohicky/CHATGRAB2/issues/1#issuecomment-6428715975
- Existing implementation document: `docs/branding/hero-projects-review-2026-10-26.md` on that branch.
- Current hero selected: fourth recent Capture design; visual-only production art pending, current app image is still older visual.
- Real Projects v1 in branch, local-only; browser QA and CI pending.
- AIChatLab.app transparent owner-approved asset is a separate brand artifact. Logo reference variants and source are included in the graphics corpus. Production ChatGrab identity should remain correct in persistent top nav.

## ChatGPT subscription and assistant controls — mandatory truth-in-UI audit
- **ChatGPT plan != API billable account.** A subscription does not automatically enable an arbitrary website to call OpenAI models via developer API.
- OpenAI documents **Sign in with ChatGPT token/allowance sharing** for participating eligible tools; research eligibility and supported official integration separately; do not bypass or scrape ChatGPT cookies or passwords, and don't assume ChatGrab eligible.
- **Default no-key workflow:** allow user to select saved conversations -> compose and copy review request -> open ChatGPT -> paste response into ChatGrab. This is legitimately supported by the existing ChatGrab manual analysis design.
- Audit all visible buttons/text that say `AI Assistant`, `ChatGPT Assistant`, `AI analysis`, `connected`, etc. For each entry, show what actually executes. If not connected, label `Prepare for ChatGPT` / `Ask in ChatGPT`, or disabled with plain explanation. Never present a mock bot as real provider inference.
- Optional native assistant requires explicit provider configuration and separate usage/cost disclosure. Optional local model may be explored as a later research lane.
- Preserve source provenance and consent over transfer of private conversation data to third parties.

## Actual next steps for Codex
1. Reply with ACK explicitly naming files you can access.
2. Review branch, run `npm run lint`, `npm run build`, and responsive browser QA. Fix any regressions without deployment.
3. Examine and reconcile the ZIP history gallery; implement Build History from real records only.
4. Inventory and correct AI Assistant affordances (no API key claim).
5. Provide screenshots plus QA evidence and owner review. **Do not deploy until David approves.**
