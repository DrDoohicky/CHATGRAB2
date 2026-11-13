# Independently review or repeat the ChatGrab browser checks

The replay uses fresh disposable browser contexts and explicitly synthetic conversations. It does not open the operator's existing browser profile or test private ChatGPT conversations. It runs no payments and installs no provider accounts. Source, live deployment observations and reviewer approval remain separate statuses.

## Review without DNS, a paid browser wallet or preview credentials

Download the published `review-pack.zip`, unzip locally and open `review.html`. It includes desktop/phone screenshots, the specific selected header/metallic assets and their delivered SHA-256 comparison, synthetic backup contents, results and a scrubbed Playwright trace. No network is needed for the image gallery. The older pastel composite is labeled historical; it is not presented as a pixel-perfect current layout.

With the repository's pinned Playwright installed, run `npx playwright show-trace trace-sanitized.zip`. This opens the standard local trace viewer. Inspect action steps, DOM snapshots and network results; the gallery has full-size screenshots. Redundant screencast filmstrip frames are omitted from the shared trace to keep its size practical, without changing the action/DOM/network records. This is a review of a recorded Codex run, not an independent re-execution or evidence of native ChatGPT/Android host acceptance. Do not upload private traces or credentials to an external viewer.

## Re-execute with your own authorized access

Requirements: Node 24, Python 3 (`PYTHON=python3` if its command is not `python`), and the pinned Playwright package/browser.

1. Check out the recorded PR #9 source, run `npm ci`, and provide Chromium (`CHROMIUM_PATH`) or install the pinned Playwright browser from official sources. Record browser/OS and source SHA.
2. Public production needs no preview credentials. For the private preview, use the existing same-project Vercel login. Verify `.vercel/project.json` identifies `chatgrab-analysis-archiver`, project `prj_HUi7tLa9yNg9xltPvytMVSp2KLPT`, team `inetatlanta`.
3. Refresh the **development** OIDC into a private, ignored location with `vercel env pull /tmp/chatgrab-review.env --environment development --yes --scope inetatlanta`. Do not put its contents in chat, Git, a public report or an uploaded browser profile. No long-lived secret or protection rule change is needed.
4. Set `BASE_URL` to the exact preview origin, `CHROMIUM_PATH` to the local executable, and `EVIDENCE_DIR` to an ignored output folder. Load the private file through Node: `node --env-file=/tmp/chatgrab-review.env scripts/run-independent-acceptance.mjs`. On this cloud environment, `CHROMIUM_CA_SPKI` pins the supplied proxy CA for Chromium; a normal trusted local browser does not need it. Node HTTPS retains its normal CA trust; `NODE_USE_ENV_PROXY=1` can be needed here for the official MCP SDK HTTP client.
5. Inspect each result. The aggregate runner covers reviewed import/search/download/screenshots, complete original-file backup/restore and corruption checks, continuity/citation/revision flows, reviewed Crew handoff and human receipt, and actual MCP SDK status/link calls. Stop on any failure and retain its status honestly. For local testing use `npm run build`, `PORT=3020 npm start`, `BASE_URL=http://127.0.0.1:3020 npm run test:acceptance`; omit preview credentials.

Each test injects the OIDC header only for the exact preview origin, not external providers. Raw replay traces stay under `PRIVATE_EVIDENCE_DIR` (default `/tmp/chatgrab-private-replay`). Only `trace-sanitized.zip` is shareable. The sanitizer removes auth/cookie headers, cookie containers, the actual development token, JWT patterns and access-code URL parameters; its regression test checks these forms. It then checks the resulting archive and writes a redaction report. Do not share real-user materials even with this scrubber: it redacts credentials, not arbitrary private conversation text. The harness deliberately uses synthetic-only sources.

The package can also be generated with `npm run test:replay` and `python scripts/build-review-gallery.py <output-directory>`. It is designed to let Atlas or David inspect the evidence without funding TinyFish. Atlas still needs an actual available browser for an independent rerun; no claim is made that this solves his runtime's DNS or host restrictions.

## Explicitly separate external gates

The recorded browser is emulated Chromium. A physical Android/PWA, genuine native account export, authenticated fresh ChatGPT restore, custom MCP install/context grant, real worker ACK and production release approval remain separate. `/api/mcp` is the verified Vercel endpoint; the local Express `/mcp` alias was 404 on the earlier Vercel deployment. No native thread panel or private-chat access is inferred from an MCP status response.

Payment checks are optional and separate on PR #10/#7. They require an existing Stripe TEST configuration and use only the official test card. The ordinary acceptance command performs no checkout or charges.
