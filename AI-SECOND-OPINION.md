# ChatGPT analysis and optional Gemini second opinion

This release adds a **manual, no-key handoff workflow** under Workspace → Chat Analysis. It does not enable native ChatGPT inference, call Gemini's API, confirm a user's subscription or promise free/unlimited provider usage.

## Use

1. Select the conversations, analysis categories and exact messages to analyze. A select-all-messages control applies only to the selected conversations.
2. Review the source selection and confirm that you want to prepare a ChatGPT request. Inspect the prepared context. Copy the request, open ChatGPT, and paste it into your own chat. Nothing is automatically transmitted by ChatGrab.
3. Paste the JSON answer back into ChatGrab and choose **Import structured ChatGPT analysis**. You may instead paste an existing plain-text ChatGPT answer and proceed directly to second-opinion review; plain text is not treated as a verified structured report.
4. Explicitly approve preparing the selected original passages and the displayed analysis for Google Gemini. Copy the request, open Gemini, and paste it there yourself. A different model is not automatically unbiased.
5. Paste Gemini's requested JSON response back into ChatGrab. The checks are rendered separately from the original analysis. Both AI providers' identities are user-supplied assertions, not authenticated by ChatGrab.
6. Export the review bundle before leaving or changing selections. It contains selected source text and IDs, the original answer, a structured analysis if imported, the separate review request/response and the validation boundary. This panel does not automatically persist reports; saved source conversations are unchanged.

## Validation boundary

The context packet has a fresh ID and canonical SHA-256 digest. It includes only selected messages and their conversation titles/IDs/timestamps; excluded conversations, excluded messages and file originals are not included. Context is limited to 1–40 messages, 12,000 characters per message and 60,000 source characters total. Oversized selections fail without silently truncating source text.

Imported structured reports must match the context ID/digest and selected categories. Citation IDs must exist in the selected packet and quoted text must be an exact substring of the original message. Supported findings require evidence. A review must match the prepared analysis digest; each checked claim must be an exact quotation from that analysis. Supported, partly-supported and contradicted verdicts require source evidence. Unknown quotations, contexts, statuses and unsupported fields are rejected rather than repaired into apparent success.

These checks establish reference integrity only. They do not authenticate the model, verify completeness, establish that an interpretation is true, or make agreement between two models proof. Review uncertainty and the full source messages inline; they do not require leaving the panel and losing the current report.

## Provider / billing status

Hosted ChatGPT account-plan integration remains pending approval and implementation. No end-user API key is requested. The owner already submitted OpenAI's hosted-app interest form.

No local Gemini key was found. The Vercel environment-list API returned no visible variables; hidden production configuration and Google project billing were not verified. This release does not create, reveal, reuse or provision credentials, and does not make provider API calls. Users manually submit context in their chosen ChatGPT/Gemini account under each provider's current terms, limits and billing arrangements.

## Tests and publication

TypeScript and both production builds pass. All 22 ChatGrab tests pass, including three new review tests covering selected-context privacy, exact-citation/schema/context validation, wrong-analysis rejection and a second opinion disagreeing with an unsupported completion claim. Model-shaped responses in tests are synthetic parser fixtures, not evidence of real ChatGPT or Gemini execution.

Browser verification was attempted through the newly available Windows computer-use helper after the previous in-app browser tooling became unavailable. Chrome launched, but input/capture failed, including capture timeouts after refreshing the window binding. No browser pass or provider end-to-end pass is claimed for this release.

Rollback: restore production deployment `dpl_4q6b8Pbj4VgLtEGuBoAaceqZJTzH` (source `690d41798ef438fd536cf9fa90f0c1c1924a48a8`). This feature introduces no database migration and modifies no source conversations. Preserve exported bundles before navigating away.
