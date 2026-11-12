# Isolated $19 payment test readiness

This follow-up branches from PR #7 (`17438e65ddfbfed253205373e7d24eea69f4dfac`). It is separate from PR #9, production and PR #104. No live key, provider setup, payment request, real refund, membership, paid resource or deployment was created for this change.

An optional local-only SQLite test ledger now handles verified signed TEST events when `FOUNDING_TEST_LEDGER_PATH` is explicitly set, `FOUNDING_CHECKOUT_MODE=test`, an existing test key and test webhook secret are configured, and the process is not running on Vercel. Without that opt-in the existing webhook remains side-effect free. Production configuration rejects webhook processing. A `testOnly` response never sets `membershipActivated` to true.

The ledger verifies the exact offer, 1900 USD, paid/complete TEST checkout and opaque browser binding. It persists a simulated `active-test` state, rejects altered replays, deduplicates identical event IDs, preserves checkout identity and survives reopening. Full TEST refund evidence moves only its simulated state to `revoked-test`; partial refunds remain separately recorded. Out-of-order refunds prevent a later simulated grant. Failed payments do not grant anything. Events and ledger writes are transactional. No provider API refund call is made.

Tests use deliberately synthetic events and Stripe's official test-signature generator over actual local HTTP. They cover invalid signature, identical replay, conflicting replay, bad amount/currency/mode, reopen recovery, partial/full/out-of-order refund and production denial. This is not evidence that Stripe delivered a real webhook. The earlier real Stripe sandbox checkout/receipt evidence remains in PR #7; it was not rerun or misrepresented as new evidence here.

Commercial release still requires explicit human approval, genuine account identity and cloud entitlement storage, actual provider webhook delivery, refund/support operations, finalized commercial/privacy terms, and product acceptance. Existing consumer pages correctly remain a test preview with draft commercial terms, no real license or reservation, and no promised live sale. Do not merge or enable live checkout under this test-readiness assignment.

Run `npm test`, `npm run lint`, `npm run build`. The new ledger tests require Node's built-in SQLite (the current Node 24 runtime); no new database package or service was provisioned. Keep local database files and credentials outside the repository. This change provides a test harness for the lifecycle, not an unreviewed live fulfillment implementation.
