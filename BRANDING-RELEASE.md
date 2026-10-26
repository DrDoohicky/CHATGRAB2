# Compact branding release — October 25, 2026

David explicitly approved publication in this chat after the coordinator requested review-only staging. This release publishes the staged compact header mark/tagline at source e93eddb54bf2e43b2b2c62504b8a8f7411876ac4, plus equivalent 192px/512px PNG and padded maskable app-icon exports. All PNG exports come directly from the staged SVG using the bundled sharp renderer; no new artwork was generated. Favicon, touch icon, manifest and header references use a cobalt-20261025 cache version. Installed browsers may update stored app icons on their own manifest-refresh schedule.

This is the coordinator's compact functional SVG approximation. The separate stacked/glossy ChatGrab/ChatLab reference redesign is not represented as completed or pixel-perfect. The raster reference ZIP is not required to publish this existing staged update. The compatibility tagline says for ChatGPT; no official endorsement is asserted.

Validation: TypeScript, both frontend builds and all 32 existing tests passed. PNG metadata confirms 192x192 and two 512x512 assets; manifest references verified. Standard icon visually inspected. Desktop/mobile browser attempts both failed because the webview did not attach, so Capture/Analysis/Media navigation and rendered brand QA are not claimed as passed for this change. Final live asset hashes/deployment are recorded in the issue publication update.

Rollback: previous production source 0774d7f063162f7f83f4ac44fd1d6e8c7c4fca4c, deployment dpl_AJnrYYtAFJN7iXUHgCHMabBSkKzj. No app-state, data, inference or worker-runtime changes.

## Exact packaged header — October 26, 2026
David explicitly selected REFERENCE_ChatGrab_transparent.png from the supplied ZIP for production use, resolving its former reference-only designation. public/images/chatgrab-header-approved.png is an unchanged byte-for-byte copy (SHA256 208566ff83f974d4c61d65f6db62c8fd4ebc3e88aa2f307f3ade77537df78ffc). Header uses the complete integrated graphic including tagline, replacing separate generic icon/text. Width 148px desktop, 116px phone, intrinsic aspect ratio preserved. No AIChatLab identity or DNS changes. Existing home-button behavior and navigation retained. Browser attach timed out; rendered desktop/mobile acceptance is not claimed. Previous production 5d372d5 remains rollback.
