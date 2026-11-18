# November 14 production release

David authorized publishing the verified ChatGrab preview and updating milestone/news content. This release builds on PR #12 (a999192), including the PR #9 implementation. No payment activation or private conversation publication is included.

Verification before release: 52 unit tests; TypeScript check; production build including Crew Console; six packaged acceptance stages (reviewed import/artwork, portable backups/restore, source-linked continuity, reviewed Crew handoff, MCP HTTP checks and screenshot gallery). The first development-server run did not serve the packaged Crew page; the full suite then passed against the built production server. Separate browser checks exercise source metrics, original-date coverage, exact source reload and an actual production-kit ZIP download at 1440/390. These tests use synthetic data only.

`BASE_URL=http://127.0.0.1:3041 CHROMIUM_PATH=/usr/bin/chromium node scripts/run-independent-acceptance.mjs`

`BASE_URL=http://127.0.0.1:3041 CHROMIUM_PATH=/usr/bin/chromium node scripts/release-metrics-and-download.cjs`

The product kit contains five TXT documents and nine PNGs, with no executables or app code. SHA-256: 8ac1ef28ca53e4df1d5dd899300989df0d23f9482d62e07a9a97afeb2d3fb42b. Vercel response headers force attachment delivery.

Availability: browser-local source import, library, backup/reviewed restore, deterministic source analytics and guided manual AI review. Crew handoff is reviewed portable evidence; worker ACK is not implied. Automatic model integration/account synchronization remain in development. Public-share capture depends on the provider response and is not claimed universally working.

Rollback baseline: ChatGrab deployment dpl_2ULzAwkbUka2VnQ6kuAZzyjDfw4i. Actual deployment IDs, public-domain checks and final results are returned to Atlas's canonical inbox after publication.
