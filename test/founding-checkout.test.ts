import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import Stripe from 'stripe';
import {createFoundingRouter, foundingWebhook, verifiedTestPayment} from '../lib/founding-checkout.js';

test('receipt requires server-confirmed paid test session with exact offer and amount', () => {
  const session = {livemode: false, mode: 'payment', status: 'complete', payment_status: 'paid', currency: 'usd', amount_total: 1900, metadata: {offer: 'chatgrab-founding-v1'}} as unknown as Stripe.Checkout.Session;
  assert.equal(verifiedTestPayment(session), true);
  for (const patch of [{livemode:true}, {status:'open'}, {payment_status:'unpaid'}, {currency:'eur'}, {amount_total:1}, {metadata:{offer:'other'}}]) {
    assert.equal(verifiedTestPayment({...session,...patch} as Stripe.Checkout.Session), false);
  }
});

test('live keys fail closed; signed test webhook replays have no entitlement side effects', async () => {
  const prior = {...process.env};
  const app = express();
  app.post('/api/founding/webhook', express.raw({type:'application/json'}), foundingWebhook);
  app.use(express.json());
  app.use('/api/founding', createFoundingRouter());
  const server = app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve => server.once('listening',resolve));
  const origin = 'http://127.0.0.1:' + (server.address() as {port:number}).port;
  try {
    process.env.FOUNDING_CHECKOUT_MODE='test';
    process.env.STRIPE_SECRET_KEY='sk_live_synthetic_noncredential';
    process.env.FOUNDING_CHECKOUT_ORIGIN=origin;
    const status = await (await fetch(origin+'/api/founding/status')).json();
    assert.equal(status.available,false);
    assert.equal((await fetch(origin+'/api/founding/checkout',{method:'POST'})).status,503);
    process.env.STRIPE_SECRET_KEY='sk_test_synthetic_noncredential';
    assert.equal((await fetch(origin+'/api/founding/checkout',{method:'POST',headers:{Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{"acceptTest":true}'})).status,403);
    assert.equal((await fetch(origin+'/api/founding/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'})).status,400);
    assert.equal((await fetch(origin+'/api/founding/receipt?session_id=cs_test_forged')).status,400);
    process.env.STRIPE_WEBHOOK_SECRET='whsec_synthetic_noncredential';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const payload=JSON.stringify({id:'evt_synthetic',type:'checkout.session.completed',livemode:false,data:{object:{}}});
    const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
    for(let i=0;i<2;i++) {
      const response=await fetch(origin+'/api/founding/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':signature},body:payload});
      assert.equal(response.status,200);
      assert.equal((await response.json()).membershipActivated,false);
    }
    const invalid=await fetch(origin+'/api/founding/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':signature},body:payload+' '});
    assert.equal(invalid.status,400);
    const expired=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET,timestamp:1});
    assert.equal((await fetch(origin+'/api/founding/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':expired},body:payload})).status,400);
  } finally {
    for(const key of ['FOUNDING_CHECKOUT_MODE','STRIPE_SECRET_KEY','FOUNDING_CHECKOUT_ORIGIN','STRIPE_WEBHOOK_SECRET']) {
      if(prior[key]===undefined) delete process.env[key]; else process.env[key]=prior[key];
    }
    await new Promise<void>(resolve => server.close(()=>resolve()));
  }
});
