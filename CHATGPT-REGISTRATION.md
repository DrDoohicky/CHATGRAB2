# ChatGrab hosted ChatGPT integration — registration brief

Status: prepared for review; **not submitted or approved**. No API key is requested from users. Do not present native sign-in or inference as connected until registration and end-to-end tests succeed.

## Application details

- Application: ChatGrab, a companion for ChatGPT conversation preservation and continuity.
- Website: https://chatgrab-analysis-archiver.vercel.app/
- Repository: https://github.com/DrDoohicky/CHATGRAB2
- Proposed production callback: https://chatgrab-analysis-archiver.vercel.app/auth/openai/callback (reserved design; not an active callback yet).
- Requested capabilities: Sign in with ChatGPT and approved ChatGPT plan usage for eligible user-authorized requests.
- Product use: capture chats the user explicitly shares/imports; organize originals, supporting files and evidence; analyze selected sources; prepare reviewed continuity records with provenance.
- User experience: Continue with ChatGPT, user consent, account-specific available models, and clear usage/eligibility errors. No user-entered API key or secondary AI provider account.

## Proposed privacy and authorization model

- Identity sign-in and plan-usage authorization are separate permissions. Do not treat successful identity sign-in as permission to run inference.
- Sign-in does not grant conversation-history access. Capture remains based on explicit shared links/imports.
- Preserve existing browser libraries. Do not upload the entire library on sign-in. Send only explicitly selected source context for authorized requests.
- Validate state, nonce, PKCE, signature, issuer, audience and granted scopes with maintained libraries. Store credentials server-side in a durable protected session store, never browser localStorage, Git or URLs.
- Refresh/revoke sessions and provide disconnect and account switching before launch. Resolve identity separately from the existing optional legacy cloud library; do not overwrite or automatically merge account data.
- Discover the signed-in account's supported models. Use the documented Responses API contract and wait for completed events before reporting success.

## Approval and implementation gates

1. The project owner reviews this brief and submits the official interest form or contacts their OpenAI representative. This requires the owner's contact, organization and applicable legal details; none have been invented or submitted.
2. Receive approved hosted-app client registration, exact callback URLs, token authentication method, identity scopes, and explicit plan-usage approval/contract. Client identity alone is not plan-usage approval.
3. Configure durable transaction/session storage and server-side registration values. No end-user API key is involved.
4. Implement OAuth callback/session exchange and authorized inference against the actual registration. Test granted/denied scope, cancellation, replay rejection, expiry, refresh, disconnect, account changes, eligibility and limits.
5. Test substantive cross-chat analysis against real evidence; then enable the currently pending controls and publish.

The open-source local-client loopback registration must not be repurposed for this public hosted website.

## Official references checked October 22, 2026

- https://developers.openai.com/siwc/quickstart
- https://developers.openai.com/siwc/request-client-id
- https://developers.openai.com/siwc/website
- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference

## Page audit carried forward

- Passed locally: folders, rename/move, view choice, sorting, reload persistence, supporting-file upload/link, inline file rename persistence, and two-conversation JSON-backup import. Eight automated tests and TypeScript/build checks pass.
- Public capture endpoint successfully fetched 1,011 messages from the public share already present in the repository, without AI provider credentials. Only status/count were logged.
- Still not certified: downloaded JSON/PDF artifact inspection (browser download events timed out), hosted native authentication/inference (approval required), and cloud-account workflows.
- This brief supersedes earlier instructions to configure a Gemini key in issue #1 and historical verification notes. Gemini has been removed from active application code and dependencies.
