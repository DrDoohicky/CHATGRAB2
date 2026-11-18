# ChatGrab private connection — first host invocation

This package prepares two anonymous read-only MCP tools: `get_plugin_status`
and `get_workspace_link`. It does not install itself in ChatGPT. No API key is
required for these tools; ChatGPT account/workspace policies still apply.

## The one account-side setup step

In **ChatGPT → Plugins → + → Add custom MCP server**, enter:

- Name: **ChatGrab**
- URL: **https://chatgrab.app/api/mcp**
- Authentication: **None**

Review the discovered tools and consent text, then choose **Create as a plugin**.
Do not publish it to a workspace or the public directory for this private test.
If that menu is unavailable, the remaining blocker is this account's host UI or
workspace policy, not a missing OpenAI API key. Do not send credentials in chat.

The existing production endpoint is already anonymous/read-only and has been
checked by the official MCP client. It exposes no private library, conversation
history, current-chat capture, writes, automatic AI, worker execution or payments.
This is server/transport verification, not evidence of a ChatGPT host invocation.

## First actual host check

Start a new ChatGPT conversation and select the installed ChatGrab plugin
(using `@ChatGrab` where the client supports mentions, otherwise its plugin picker).
Run: **“Use ChatGrab to check its connection status, then give me its workspace link.”**
Verify both real tool calls appear: `get_plugin_status` and `get_workspace_link`.
Expected status includes `product: ChatGrab`, `serverHealth: ok`,
`authenticated: false`, and `historyAccess: false`. Expected link is
`https://chatgrab.app/`, with import route `https://chatgrab.app/?page=capture`.
A model's plain-text claim without actual tool-call evidence is not a pass.

Then try **“Capture this current chat automatically.”** It should explain that
this phase does not have that capability; no hidden context should be sent.
No account identity, API key or transcript is an input to either tool.

Record host discovery, the two returned tool results and the workspace-opening
check. Use a new empty test chat; screenshots should omit unrelated conversations.
The host registration supplies a real `plugin_asdk_app...` ID if the client uses
that format. Only after that ID exists should any registered-server mapping be
prepared; do not invent one.

## Portable package and local marketplace

`plugin.json` and `mcp.json` target the canonical Agent Plugins 1.0.0 schemas.
The default MCP configuration points at the already reachable HTTPS endpoint.
`mcp.local.example.json` is for local SDK/Inspector development only. The
`marketplace.example.json` is an inert template: place it at
`.agents/plugins/marketplace.json` in a local marketplace root containing
`plugins/chatgrab/`. Restart a supported desktop client and explicitly install
from that local source. No account settings or auto-install policy is changed here.
Marketplace packaging and direct custom-MCP connection are distinct setup paths;
the direct connection above is the shortest first-host test.

The previous MCP config put `extensions.com.openai.auth` inside the server
configuration; the canonical MCP schema rejects that field. Authentication is
chosen in the host connection form. No bypass tokens belong in manifests.

## Local engineering verification

After `npm ci` and `npm run build`, use `PORT=3020 npm start`.
The local Express server supports `/api/mcp` and `/mcp`. Vercel's verified route is
`/api/mcp`; use it explicitly. Test via:

```
node --import tsx --test test/mcp.test.ts test/plugin-package.test.ts
BASE_URL=http://127.0.0.1:3020 node scripts/mcp-http-e2e.mjs
BASE_URL=https://chatgrab.app node scripts/mcp-http-e2e.mjs
```

If this execution environment requires its configured HTTPS proxy, start Node
with `NODE_USE_ENV_PROXY=1`; keep its configured CA trust. This is an environment
setting, not a plugin key or a Vercel protection change.

The production tool's workspace text still contains an older release-candidate
sentence; the source correction is staged on this private readiness branch.
Published reviewed import is independently available in the workspace. This
wording difference does not establish or prevent a host connection.

A protected preview is not a host endpoint unless the host has approved access.
Do not remove protection, inject bypass tokens, create a new public service, or
claim tunnel support was exercised. No secure-tunnel or ChatGPT installer tool
is available in this execution session. Actual installation, host invocation,
sidebar/thread entrypoints and mobile-host behavior remain unverified until
exercised in the account. An ordinary browser mockup does not meet that gate.

Official references (checked November 14, 2026):
- https://developers.openai.com/plugins/deploy/connect-chatgpt
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/build/extensions
- https://developers.openai.com/plugins/build/chatgpt-ui

Do not merge the older PR #9 or publish new production code for this host test.
