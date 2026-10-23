# ChatGrab hosted ChatGPT integration — registration brief

Status: **submitted by the owner; approval pending**. The owner reported that OpenAI expects to respond next quarter if the application is a fit. No API key is requested from users. Do not present native sign-in or inference as connected until registration and end-to-end tests succeed.

Official application form: https://openai.com/form/sign-in-with-chatgpt-interest/

The form requires work email, first name, last name, company/organization name, website, requested capabilities and product description. The owner has submitted the form; no further submission is needed at this stage. Choose **Sign in and ChatGPT plan use for AI requests**. The product description ready for the form is:

> ChatGrab is a hosted companion for ChatGPT users that preserves explicitly shared/imported conversations, organizes source material and supporting files, and prepares source-linked analysis and reviewed continuity records. We want users to sign in with their ChatGPT account and authorize eligible ChatGPT-plan AI requests without entering API keys. We do not request automatic access to users' ChatGPT history. Source conversations remain preserved and users choose which context to send for analysis.

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

1. Owner submission is complete, as reported in this chat. Await OpenAI's response; do not resubmit or claim approval.
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

## Resumed verification

- The published native-connection panel was inspected successfully after the usage block cleared. It says approval is pending, requests no API key, and does not claim the account is connected.
- Library and conversation export links now remain in the page as normal downloadable links, with copy/view controls for restricted browsers. The actual JSON payload was inspected in the UI: four test threads, exact source text, message IDs and continuity provenance were preserved. JSON and Markdown artifacts were saved locally from that UI content for inspection, outside Git. This is payload verification, not a claim of a completed browser download.
- The print report DOM contains the selected source text. The OS print-to-PDF save step remains unverified through the available in-app browser controls.
- Markdown exports now include conversation/message IDs and derived-record provenance and review notes.
