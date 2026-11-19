# ChatGrab branded ChatGPT app panel

User explicitly authorized implementing as much as possible of an interactive branded ChatGrab panel using their existing ChatGPT connection, without a paid model API or local Python dependency.

## Implemented

- Official MCP Apps resource `ui://chatgrab/panel-v1.html`, standard `text/html;profile=mcp-app` plus ChatGPT compatibility metadata.
- `open_chatgrab_panel` opens the UI. User explicitly chooses a supplied conversation/export or pasted text, reviews it, and consents before `ui/message` or ChatGPT's compatible `sendFollowUpMessage`.
- `present_chatgrab_review` presents selected source plus interpretation with exact source fingerprint and request ID. Server verifies source digest; panel rejects stale/different-bound requests. Presentation is not a server-side save or authenticated provider claim.
- Host-mediated file download through MCP Apps `ui/download-file`, normal browser download fallback outside supported hosts, and selectable/copyable export text when downloads are blocked.
- User-reviewed panel JSON can be imported into ChatGrab with exact source, answer and complete original JSON retained. Source/JSON records are explicitly labeled storage containers, not original chat turns. Saving to the separate browser library requires that import, not silent cross-origin access.
- Optional expanded mode requested only from a supporting host. No persistent sidebar/position guarantee: host controls layout.
- Standalone interactive preview at `/chatgpt-app/`; real ChatGPT messaging only when embedded in a connected host.

## Verification boundaries

73 unit tests, TypeScript/build, actual official MCP SDK HTTP discovery/resource/review tests, and an actual browser running the official App client against a controlled protocol host at1440/390/320. Tests cover explicit consent, exact source, source digest, wrong request rejection, host-mediated actual downloaded file, real workspace import and reload, logo load and host expansion request. Existing source-analysis/save/reload/backup acceptance passes.

This is NOT a real ChatGPT-account rendering/approval test. The currently installed connector initially exposes only the two older tools. Refresh/reconnect its tool catalog, then ask: `Use ChatGrab to open its companion panel with open_chatgrab_panel.` If a custom connection is needed, the existing server address is `https://chatgrab.app/api/mcp`. Availability is governed by the account/workspace and app policies.

No private-library OAuth connection, automatic active-chat capture, shared cloud writeback, provider API key or Python dependency is introduced. A host that lacks app UI support can still use the workspace link and manual source workflow.

## Documentation checked

Official OpenAI Apps SDK UI documentation: https://developers.openai.com/apps-sdk/build/chatgpt-ui
Official installed `@modelcontextprotocol/ext-apps` declarations: App initialize/message/tool-result/display/download-file methods. Source and destination text remain untrusted data; no downloaded scripts from source conversations are executed.
