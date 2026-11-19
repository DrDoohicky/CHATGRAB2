# ChatGrab companion panel · 0.2.0

Use the hosted server address **https://chatgrab.app/api/mcp**. No API key, local Python service or loopback tunnel is needed for these anonymous presentation tools.

Tools: get_plugin_status, get_workspace_link, open_chatgrab_panel and present_chatgrab_review. The last two expose the branded MCP Apps interface and present user-selected source/analysis with fingerprint validation. They do not read a private library or save server-side. Review the result and download it; import the reviewed JSON into ChatGrab to retain the source, analysis and original export.

Refresh or reconnect the existing ChatGrab connection in the host to discover the new tools. Then ask: **Use ChatGrab to open its companion panel with open_chatgrab_panel.** If your account offers custom MCP connections, use the hosted address above with no authentication and inspect its four discovered tools. Account/workspace and app approval policies govern availability; installing this package alone is not proof of ChatGPT rendering. Never insert temporary preview credentials in the manifest.

Interactive standalone preview: https://chatgrab.app/chatgpt-app/ . Outside ChatGPT it prepares requests and downloads but cannot send a live ChatGPT message. ChatGPT controls inline/expanded placement. No private history, account identity, automatic capture, cloud writeback, worker execution or payments are enabled.

Local development remains available with PORT=3020 npm start after npm run build, then http://127.0.0.1:3020/mcp. The distributed manifest deliberately targets the production HTTPS endpoint instead.

Implementation and controlled protocol-host tests are documented in docs/chatgpt-app-panel. Real ChatGPT-account rendering still requires human host acceptance. Official UI reference: https://developers.openai.com/apps-sdk/build/chatgpt-ui .
