# CG-PLUGIN-001 — host connection ready; actual host invocation pending

November 14, 2026. This is a private readiness return, not a native-plugin completion claim.

## For David

ChatGrab is **not yet proven installed/invoked in ChatGPT**. Its existing anonymous
HTTPS MCP endpoint passes official SDK transport checks. The remaining action is
in the authorized ChatGPT account: Plugins → + → Add custom MCP server → name
ChatGrab → URL **https://chatgrab.app/api/mcp** → Authentication **None** → review
and **Create as a plugin**. In a new conversation select ChatGrab and ask:

> Use ChatGrab to check its connection status, then give me its workspace link.

The real tool calls must be `get_plugin_status` and `get_workspace_link`. A plain
assistant claim is not host evidence. Record tool discovery/results in an empty
test chat, without unrelated private conversations. No provider API key is needed
for these read-only tools; host/account/workspace policies still govern setup.

## Baseline reconciliation

- Original PR #9 remains draft/unmerged at `322a6729f7091d86cab584ff51b8ace34dc2716f`; it was not overwritten or merged.
- Current published ChatGrab release is source `dbbde2eeab476258499960fbde826e086ba742af`, deployment `dpl_37A9YgcRELDWgBvjgff3iScpYAdH`, previously verified READY on chatgrab.app.
- Private readiness code is isolated on `codex/chatgrab-plugin-host-readiness`; source commit `1e691305c34013bfd481371a0282f0e5d32ad818`.
- Root server and SDK already existed in production. This work did not publish a new endpoint, change aliases/protection/credentials or claim private data access.

## Completed engineering work

1. Verified the actual Agent Plugins schemas and current OpenAI host-connection guidance. The former `mcp.json` incorrectly put `extensions.com.openai.auth` inside a transport configuration whose schema disallows additional properties. Fixed the package and added regression validation against the unmodified canonical JSON schemas.
2. Default private package points to the already published `https://chatgrab.app/api/mcp`; separate loopback example retained. Authentication None is selected in the host form, not encoded in an unsupported manifest field.
3. Added an inert local marketplace example, host evaluation checklist/prompts and a compact reproducible private ZIP. It does not auto-install, enable a marketplace, alter account settings or create a fake registered plugin ID.
4. Expanded actual HTTP SDK acceptance: anonymous initialization, exact tool discovery and annotations, both real calls, strict rejection of identity/transcript arguments and unknown capture tool, unsupported methods, foreign-origin/preflight denial, exact ChatGPT CORS origin, body limits and invalid JSON-RPC handling.
5. Verified local `/mcp` alias and `/api/mcp`; actual remote `/mcp` POST remains **404**. Correct live endpoint `/api/mcp` works.
6. Exercised real public browser navigation to `https://chatgrab.app/?page=capture` and observed the reviewed-import control. This was an ordinary browser navigation, not an Open Workspace action inside ChatGPT.
7. Corrected stale release-candidate wording in the source workspace tool. That source-only copy correction is not deployed by this work; live reply still contains the older sentence. The workspace itself is published and was independently navigated.

## Evidence and classification

| Gate | Result | Evidence / boundary |
| --- | --- | --- |
| A: source/build | PASS | TypeScript and production builds; 63 unit tests pass, 0 fail/skip; SDK 1.32.2 |
| B: anonymous HTTPS transport | PASS for SDK; host reachability NOT VERIFIED | 8 actual HTTP groups pass locally and remotely; no auth/bypass token |
| C: genuine ChatGPT installation/invocation | BLOCKED-ON-USER-HOST | No ChatGrab tool or custom-MCP installer control in this execution session |
| D: read-only safety | PASS in exercised server paths | Strict empty inputs; no private library/history/capture/identity/model/payment tools |
| E: engineering return | Delivered separately to Atlas and Issue #8 | Delivery does not establish Atlas read/ack or host execution |
| Sidebar/conversation panel | NOT TESTED / not built | Host invocation gate comes first; no mockup passed off as a native panel |
| Host desktop/mobile | NOT TESTED | Real ChatGPT host session not available here |

Local results: [HTTP](evidence/2026-11-14-plugin/local-http-results.json).
Existing production: [HTTP](evidence/2026-11-14-plugin/production-http-results.json).
Browser workspace: [results](evidence/2026-11-14-plugin/workspace-results.json),
[screenshot](evidence/2026-11-14-plugin/workspace.png).
Full test output: [63 tests](evidence/2026-11-14-plugin/unit-tests.txt).

An initial direct Node HTTPS attempt was refused by the execution network.
`NODE_USE_ENV_PROXY=1` used the existing configured HTTPS proxy and CA trust;
the official SDK then passed remotely. The browser trusted only the existing
proxy CA's pinned public key. No global certificate bypass or deployment
protection bypass was used for this native-plugin test.

Plugin discovery returned no available ChatGrab entry for this session. The
public Plugin Creator helper exists but is not installed and is unnecessary for
manual packaging; registering the actual server in the user's account must
precede any `plugin_asdk_app...` mapping. A shared-desktop capability is declared
by the cloud environment, but no desktop/browser session-control tool is exposed
here. These facts do not prove anything about plugins installed in other chats.

## Package

[Private connection ZIP](packages/ChatGrab-Private-Plugin.zip), SHA-256 sidecar
alongside it. Source, schemas, skill, inert marketplace and instructions only;
no server executable, dependencies, API keys, cookies, bypass tokens or private
transcript. Internal manifest includes source SHA and per-file checksums.

## Rollback and next action

Production is unchanged. Discard the private branch/package to undo prepared
changes. If a private ChatGPT connection is created, remove that connection in
ChatGPT to undo installation; do not alter global workspace policy.

Next: the account-side custom connection described at the top, followed by real
host tool discovery and both invocations. Then evaluate supported native panel
entrypoints and actual desktop/mobile behavior. OAuth/private libraries, native
capture, cloud synchronization, AI execution, worker ACK and payments remain
separate later milestones. No extra upload or developer API key is required to
attempt this first anonymous connection.

Official documentation checked:
- https://developers.openai.com/plugins/deploy/connect-chatgpt
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/build/extensions
- https://developers.openai.com/plugins/build/chatgpt-ui
