import {createHash, randomUUID} from 'node:crypto';
import express from 'express';
import Stripe from 'stripe';
import {HttpsProxyAgent} from 'https-proxy-agent';

const OFFER = 'chatgrab-founding-v1';
const COOKIE = 'chatgrab_checkout';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function verifiedTestPayment(session: Stripe.Checkout.Session) {
  return session.livemode === false && session.mode === 'payment' &&
    session.status === 'complete' && session.payment_status === 'paid' &&
    session.currency === 'usd' && session.amount_total === 1900 &&
    session.metadata?.offer === OFFER;
}

// No live-mode fallback. This release exercises Stripe without granting a paid license.
export function createFoundingRouter() {
  const router = express.Router();
  const configuration = () => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    const origin = process.env.FOUNDING_CHECKOUT_ORIGIN || (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '');
    if (process.env.VERCEL_ENV === 'production' || process.env.FOUNDING_CHECKOUT_MODE !== 'test' || !key.startsWith('sk_test_')) return null;
    try {
      const url = new URL(origin);
      if (url.origin !== origin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === '127.0.0.1'))) return null;
    } catch { return null; }
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    return {stripe: new Stripe(key, {maxNetworkRetries: 1, timeout: 15000, ...(proxy ? {httpAgent: new HttpsProxyAgent(proxy)} : {})}), origin};
  };
  router.use((_req, res, next) => {res.setHeader('Cache-Control', 'no-store'); next();});
  router.get('/status', (_req, res) => res.json({available: !!configuration(), mode: 'test', amount: 1900, currency: 'usd', livePayments: false}));
  router.post('/checkout', async (req, res) => {
    const config = configuration();
    if (!config) return res.status(503).json({error: 'Stripe test checkout is not configured. Live payments are unavailable.'});
    if (req.headers.origin !== config.origin) return res.status(403).json({error: 'Open checkout from the staging page.'});
    if (req.body?.acceptTest !== true) return res.status(400).json({error: 'Confirm this is a test checkout.'});
    const cookieHeader = req.headers.cookie || '';
    const previous = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    const attempt = previous && /^[a-f0-9-]{36}$/.test(previous) ? previous : randomUUID();
    try {
      const session = await config.stripe.checkout.sessions.create({
        mode: 'payment', allowed_payment_method_types: ['card'],
        line_items: [{price_data: {currency: 'usd', unit_amount: 1900, product_data: {name: 'ChatGrab Founding Member — TEST ONLY', description: 'Staging verification only. No actual membership, reservation or license.'}}, quantity: 1}],
        metadata: {offer: OFFER, browser: digest(attempt)},
        success_url: config.origin + '/founding/test/?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: config.origin + '/founding/test/?canceled=1',
      }, {idempotencyKey: 'founding-test-' + attempt});
      if (session.livemode || !session.url?.startsWith('https://checkout.stripe.com/')) throw new Error('Unexpected checkout mode');
      res.cookie(COOKIE, attempt, {httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'lax', path: '/api/founding', maxAge: 86400000});
      return res.json({url: session.url, mode: 'test'});
    } catch { return res.status(502).json({error: 'Stripe test checkout could not start. Retry safely; no live charge is possible.'}); }
  });
  router.get('/receipt', async (req, res) => {
    const config = configuration();
    if (!config) return res.status(503).json({error: 'Test checkout is unavailable.'});
    const id = req.query.session_id;
    const attempt = (req.headers.cookie || '').split(';').map(c => c.trim()).find(c => c.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (typeof id !== 'string' || !/^cs_test_[A-Za-z0-9]+$/.test(id) || !attempt) return res.status(400).json({error: 'A test checkout from this browser is required.'});
    try {
      const session = await config.stripe.checkout.sessions.retrieve(id);
      if (session.metadata?.browser !== digest(attempt)) return res.status(403).json({error: 'This checkout belongs to a different browser.'});
      return res.json({verified: verifiedTestPayment(session), mode: 'test', paymentStatus: session.payment_status, membershipActivated: false});
    } catch { return res.status(502).json({error: 'Payment could not be verified. A redirect is not proof of payment. Retry verification.'}); }
  });
  return router;
}

export function foundingWebhook(req: express.Request, res: express.Response) {
  res.setHeader('Cache-Control', 'no-store');
  const signature = req.headers['stripe-signature'];
  const key = process.env.STRIPE_SECRET_KEY || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (process.env.FOUNDING_CHECKOUT_MODE !== 'test' || !key.startsWith('sk_test_') || !secret) return res.status(503).json({error: 'Test webhook is not configured.'});
  if (typeof signature !== 'string' || !Buffer.isBuffer(req.body)) return res.status(400).json({error: 'Signed raw webhook required.'});
  try {
    const event = new Stripe(key).webhooks.constructEvent(req.body, signature, secret);
    if (event.livemode) return res.status(400).json({error: 'Live events are not accepted.'});
    // Deliberately side-effect free: repeated events cannot grant duplicate entitlements.
    // Browser receipts query Stripe directly. Durable live fulfillment is not implemented.
    return res.json({received: true, mode: 'test', membershipActivated: false});
  } catch { return res.status(400).json({error: 'Webhook signature could not be verified.'}); }
}
