# ChatGrab / ChatLab — bounded branding implementation handoff
Status: DESIGN DIRECTION, **NOT APPROVED FOR PUBLICATION**. Human approval gate applies.

## Exact composition
Create two related logo assets: **ChatGrab** and **ChatLab**. Each has **Chat** stacked above **Grab** or **Lab**, in matching bold rounded glossy beveled lettering: Chat white, Grab/Lab saturated **cobalt blue** (not cyan), with black/white perimeter contrast appropriate for light/dark backgrounds. Maintain the same type treatment and speech-balloon geometry between the two. Do not change nav/site layout except replacing relevant brand graphics.

**Speech balloons must be on the RIGHT of each stacked wordmark.** Same size, curvature, position, edging, glossy finish and tail on both. The bottom-left tail must be physically attached to its balloon, extend diagonally **left/down beneath Grab/Lab**, and point to the **final “GPT” letters** of the tagline, not to “Chat”, not to “Grab/Lab”, and not to an arbitrary left edge.

Bubble contents ONLY:
- ChatGrab: three white circular dots;
- ChatLab: a small laboratory beaker with glowing blue liquid and a few bubbles (sized to fit comfortably).

Tagline below each: **for ChatGPT**. Set “for” neutral/white, “Chat” white, “GPT” cobalt blue, in compatible bold rounded type. Text and tail must remain legible at reasonable scaled size, and tails visually point toward GPT. This is an independent compatibility claim, **not an OpenAI endorsement**. Do not incorporate OpenAI official logos or suggest that ChatGPT actually approves these products.

## Implementation scope
1. Work on the actual ChatGrab release branch `codex/issue-100-crew-bridge`, verify actual branch/repo before writing.
2. Source visuals are AI-generated **black-background raster mockups**; they are reference only, not transparent/production/vector masters. David has the extracted package `ChatGrab_ChatLab_Codex_Handoff.zip` with ChatGrab and ChatLab logo crops, combined reference, and handoff JSON; request that package from him via Codex when asset bytes are needed (ChatGPT sandbox download isn't a public GitHub URL).
3. Build exportable transparent masters with distinct logo and icon variants; icons must remain recognizable at small sizes (speech balloon + dots, speech balloon + beaker), but should retain badge style.
4. Update only the compact/persistent brand location in existing site; do not replace the dashboard, invent features, duplicate header icons, or change workflow/navigation order.
5. Provide preview/screenshots (dark + light backgrounds, desktop + mobile) and proof of actual repository changes/tests. **STOP before publish/deploy** until David explicitly approves the new branding. No release claim without independent verification.

## Acceptance checklist
- [ ] Chat above Grab/Lab; two badges geometrically consistent
- [ ] Bubble remains on RIGHT on both
- [ ] Balloon tail attached to bubble, toward end of **GPT** on both
- [ ] Beaker smaller than previous oversized mockup
- [ ] Saturated cobalt rather than cyan blue
- [ ] Legible, compact icons and white/black background variants
- [ ] No statement or implication of official ChatGPT/OpenAI endorsement
- [ ] Screenshot/preview reviewed by David before deployment

## Working source
The user saw latest combined reference at the end of an Oct 24 ChatGPT branding iteration. Do not substitute a new placement or unilateral redesign.
