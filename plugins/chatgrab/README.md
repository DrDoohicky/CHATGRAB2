# ChatGrab read-only phase one

Two real SDK MCP tools: `get_plugin_status` and `get_workspace_link`. No API key, authentication, account identity, private data, writes, AI generation, payments or conversation context. No thread panel is advertised before its host gate is verified.

Start the isolated source with `PORT=3020 npm start` after `npm run build`. The package's `mcp.json` points to loopback `/mcp` for local Inspector/SDK testing. The verified Vercel endpoint is `/api/mcp`; `/mcp` is a local Express alias and returned 404 on the prior Vercel preview. For a supported ChatGPT host, use its Secure MCP Tunnel to this local server, or a separately authorized HTTPS deployment. A protected Vercel preview requires approved host-compatible access; do not disable protection or insert a temporary access token in the manifest. A loopback URL alone cannot be reached from the hosted ChatGPT server.

Official setup: https://developers.openai.com/plugins/deploy/connect-chatgpt . Where available, ChatGPT Plugins → Add custom MCP server → endpoint/tunnel → no authentication → review discovered tools → Create as a plugin. Account/workspace policies and platform availability apply. No key is required for these anonymous read-only tools. Installing the package in the host, invoking it with @, and observing actual mobile/thread-panel behavior remain human host tests. Local SDK success is not ChatGPT installation evidence.

Package manifest and skill are provided for local marketplace installation using the official plugin packaging format: https://developers.openai.com/plugins/build/plugins . MCP status/link transport can also be connected directly without the skill. Do not publish this private test package or change production under this authorization.
