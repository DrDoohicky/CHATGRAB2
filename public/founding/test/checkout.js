const status = document.getElementById('status');
const checkout = document.getElementById('checkout');
const confirm = document.getElementById('confirm');
const retry = document.getElementById('verify');
const params = new URLSearchParams(location.search);
let available = false;
const update = () => { checkout.disabled = !available || !confirm.checked; };
confirm.addEventListener('change', update);
async function read(response) { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed.'); return data; }
async function verify() {
  retry.hidden = true;
  status.textContent = 'Verifying payment with Stripe…';
  try {
    const data = await read(await fetch('/api/founding/receipt?session_id=' + encodeURIComponent(params.get('session_id')), {cache: 'no-store'}));
    status.textContent = data.verified ? 'Stripe verified the $19 test payment. No real money was charged and no membership was activated.' : 'Stripe has not confirmed a completed test payment. No membership was activated.';
    retry.hidden = data.verified;
  } catch (error) { status.textContent = error.message; retry.hidden = false; }
}
retry.addEventListener('click', verify);
checkout.addEventListener('click', async () => {
  checkout.disabled = true;
  status.textContent = 'Opening Stripe test checkout…';
  try {
    const data = await read(await fetch('/api/founding/checkout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({acceptTest: confirm.checked})}));
    const url = new URL(data.url);
    if (url.origin !== 'https://checkout.stripe.com' || data.mode !== 'test') throw new Error('Unexpected checkout destination.');
    location.assign(url.href);
  } catch (error) { status.textContent = error.message; update(); }
});
async function init() {
  try {
    const data = await read(await fetch('/api/founding/status', {cache: 'no-store'}));
    available = data.available && data.mode === 'test' && data.livePayments === false;
    status.textContent = available ? 'Stripe test checkout is available. No live payments.' : 'Stripe test checkout is not configured here. No live payments.';
    update();
    if (params.get('session_id')) { checkout.hidden = true; confirm.disabled = true; await verify(); }
    else if (params.has('canceled')) status.textContent = 'Test checkout canceled. No membership was activated. You can retry.';
  } catch { status.textContent = 'Test checkout status is unavailable. Please reload to retry.'; }
}
void init();
