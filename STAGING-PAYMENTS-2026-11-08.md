# November 8 Stripe staging implementation return

## Result and source

The $19 USD one-time test checkout is wired to the real Stripe sandbox, deployed behind Vercel authentication, and browser-verified through a completed Stripe test payment and server verification. **No live payment, paid license, reservation or membership was activated.** Production is unchanged. PR #104 is separate.

- Application source: `9d426e0567d010f82bbf61183fe4dee68ab681da`, branch `codex/nov8-founding-payments`.
- Private staging: https://chatgrab-analysis-archiver-32ty2ezn0-inetatlanta.vercel.app/founding/test/ . Vercel login required; do not publish access tokens.
- Deployment: `dpl_GqUqR1TE3wvoqcNyYUpqd4sjQscf`, READY, preview environment, exact Git SHA confirmed.
- Production preserved: https://chatgrab.app/ → `dpl_2ULzAwkbUka2VnQ6kuAZzyjDfw4i`, source `d8786f2525db750d5aeef9d6f80089b632e8a568`.
- Current Stripe resource: `stripe-gray-coin`, `ir_2tJTN73yQ0As7PbS`, **SANDBOX / unclaimed**, connected to this project. Its provider-hosted checkout also visibly states that it is an unclaimed sandbox. This does not establish whether David's separately activated live account is linked; Atlas has been asked to reconcile the identifiers through Chat.

## Behavior and trust boundaries

`/founding/test/` clearly states test-only pricing and scope. The server creates the fixed-price Checkout Session; the browser cannot supply the amount or offer. Checkout requires a configured test key, explicit test acknowledgment and the configured same-origin request. Live keys and production checkout fail closed. The default without test configuration is unavailable.

The redirect is not proof of payment. A server lookup validates Stripe's session mode, completion, paid status, exact $19 USD total and offer metadata. The lookup also checks an HttpOnly browser cookie against hashed session metadata; another browser cannot read the receipt. The page reports a verified **test payment**, never actual membership.

Checkout retries with the established browser cookie use a Stripe idempotency key. Signed webhook handling uses the unmodified body and timestamp/signature verification, rejects live events, and performs no fulfillment side effects. Replayed test events therefore cannot grant duplicate membership. **This is not durable paid fulfillment or a live entitlement service.** Webhook delivery from Stripe is not yet configured; the test receipt queries Stripe directly.

## Verification

Story: staging page → same-origin API → Stripe-hosted $19 test checkout → provider confirmation → browser-bound server receipt → verified test result.

| Boundary / check | Status | Evidence / limits |
|---|---|---|
| Root and API TypeScript; both production builds | PASS | `npm run lint`, `npx tsc --noEmit -p api/tsconfig.json`, `npm run build` |
| Node tests | PASS | 40 tests, including exact receipt validation, live-key rejection, origin denial, forged-receipt denial, signed webhook replay, tampering and stale timestamp rejection |
| Existing browser-local application regression | PASS | All 16 browser groups; genuine authorized text import/persist/search/download/restore/delete, profile separation, storage failures, mobile, existing mock flow |
| Private deployed UI | PASS | Unauthenticated request redirects with HTTP 302; authenticated browser sees test-only page |
| Hosted client → API → Stripe | PASS | Browser opened actual provider checkout displaying $19 and sandbox warning |
| Stripe → server → UI | PASS | Stripe test card completed; server-confirmed paid $19 USD shown on final hosted preview |
| Repeat receipt lookup and different-browser denial | PASS | Hosted browser assertions; no client-only success inference |
| Desktop/mobile | PASS | 1440px/390px, no document overflow, screenshots saved |
| Signed webhook handler and replay | PASS (synthetic signed events) | Two deliveries have identical side-effect-free result; invalid/stale signatures rejected |
| Actual Stripe webhook delivery | NOT TESTED / NOT CONFIGURED | No webhook signing credential or provider endpoint configured; private staging is Vercel-authenticated |
| Provider decline/cancel/retry | NOT TESTED end-to-end | Existing mock flow exercises cancel/error/retry. Hosted provider test here covers successful payment, not actual provider declines or cancellation |
| Checkout creation idempotency under lost responses | NOT TESTED end-to-end | Stripe idempotency key implemented for established browser cookie; no claim about crash-safe fulfillment |
| Live membership / entitlement delivery and refund lifecycle | NOT IMPLEMENTED | Requires approved delivery model, durable fulfillment/refund handling and live-account connection |
| Client payment-secret scan | PASS | No secret keys or secret variable references in built JS; credentials stay in ignored environment files/server runtime |
| Production preservation | PASS | Existing alias unchanged and public root still HTTP 200 |

Evidence: `docs/evidence/2026-11-08/stripe-staging/`; hosted proof is in `hosted/results.json` and screenshots. The failed first hosted preview exposed missing nested function routing; `api/founding/[action].ts` fixed it before final hosted verification. The Cloud SDK initially bypassed the environment proxy; configured proxy-agent support fixed the actual provider connection without weakening TLS. Browser certificate exception was pinned to the environment-provided proxy CA SPKI only.

## Repeat the provider browser check

With authorized test credentials in the server environment, configure `FOUNDING_CHECKOUT_MODE=test`. Local execution additionally needs `FOUNDING_CHECKOUT_ORIGIN=http://127.0.0.1:3003`; hosted preview uses its Vercel deployment origin. The code refuses production checkout. Never use a live key for this test.

Run `BASE_URL=<private-staging-origin> CHROMIUM_PATH=/usr/bin/chromium EVIDENCE_DIR=evidence/founding node --env-file=.env.local scripts/founding-e2e.cjs`. For Vercel-protected previews, the short-lived development OIDC token is attached only to the target deployment's origin; it is never sent to Stripe. The script uses Stripe's public 4242 test card and a nonpersonal example.com address, unchecks Link enrollment, inspects the server-confirmed result, and tests another browser. The optional `CHROMIUM_CA_SPKI` selects the trusted Cloud proxy CA; do not use a blanket certificate-ignore switch.

## Configuration and rollback

The existing project's preview-only Vercel SSO protection was enabled (`deploymentType: preview`) to isolate payment testing; production aliases were not changed. A `vercel curl` diagnostic automatically created an Automation Protection Bypass on the project. Its value is not in this report or Git; review/revoke that automation bypass in Vercel settings when no longer needed. No other credential rotation or production financial configuration occurred. Stripe integration already supplies test credentials to development/preview/production, but this implementation explicitly rejects production checkout and was not promoted there.

Rollback: do not merge/promote this branch. Remove the preview deployment or unset its `FOUNDING_CHECKOUT_MODE` to make checkout unavailable. Current production requires no rollback. Test-mode Stripe records are disposable test data; no real transaction needs refunding.

## Atlas / Chat work and remaining launch gates

David explicitly authorized eventual publication/live activation earlier in this thread. The remaining blockers are technical and commercial readiness, not a request to repeat that authorization. Atlas can handle these through Chat to save Work credits:

1. Reconcile the active live Stripe account with the unclaimed sandbox resource. Securely connect the intended live account through the provider flow; never put keys in chat or Git.
2. Recover the exact approved AIChatLab image assets and mockup; see draft AIChatLab PR #109. Visual replacement is blocked until originals arrive.
3. Review founding-member benefit/delivery scope and privacy/refund/tax copy with Docket as available; confirm the private customer support/refund mailbox. `fivedaymayo@gmail.com` is approved for AIChatLab contact, but its use as the commercial support/refund channel has not been confirmed.
4. Return a concise reconciled packet to the Codex inbox. Codex then completes durable entitlement/refund handling, signed provider webhook delivery, real provider cancellation/decline/retry tests, and final live-configuration verification before activation.

No automatic refresh/milestone feed or broad Worker First changes were introduced. Every completed Codex return goes directly to Atlas's canonical inbox; delivery does not imply Atlas has read it or been awakened.
