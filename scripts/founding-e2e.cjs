const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:3003';
const origin=new URL(base).origin;
const output=process.env.EVIDENCE_DIR||'evidence/founding';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox',...(process.env.CHROMIUM_CA_SPKI?['--ignore-certificate-errors-spki-list='+process.env.CHROMIUM_CA_SPKI]:[])]});
 try {
  const auth=process.env.VERCEL_OIDC_TOKEN?{'x-vercel-trusted-oidc-idp-token':process.env.VERCEL_OIDC_TOKEN}:{};
  const ctx=await browser.newContext();
  // Scope the preview identity to this deployment; never send it to Stripe.
  await ctx.route('**/*',async route=>{const request=route.request();await route.continue({headers:{...request.headers(),...(new URL(request.url()).origin===origin?auth:{})}})});
  const page=await ctx.newPage();
  await page.goto(base+'/founding/test/');
  await page.getByText('Stripe test checkout is available.',{exact:false}).waitFor();
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:output+'/staging-'+width+'.png',fullPage:true});}
  await page.locator('#confirm').check();await page.locator('#checkout').click();
  await page.waitForURL('https://checkout.stripe.com/**',{timeout:45000});
  const field=async selector=>{for(let i=0;i<80;i++){for(const frame of page.frames()){const target=frame.locator(selector).first();if(await target.isVisible().catch(()=>false))return target;}await page.waitForTimeout(250);}throw Error('Stripe sandbox field unavailable: '+selector);};
  await (await field('input[name=email],#email')).waitFor();
  for(const frame of page.frames()){const card=frame.getByText('Card',{exact:true}).first();if(await card.isVisible().catch(()=>false)){await card.click();break;}}
  assert(await page.getByText('Sandbox',{exact:true}).count());
  await page.screenshot({path:output+'/stripe-hosted.png',fullPage:true});
  await (await field('input[name=email],#email')).fill('chatgrab-test@example.com');
  await (await field('input[name=number],#cardNumber')).fill('4242424242424242');
  await (await field('input[name=expiry],#cardExpiry')).fill('1230');
  await (await field('input[name=cvc],#cardCvc')).fill('123');
  await (await field('input[name=name],#billingName')).fill('ChatGrab Staging Test');
  await (await field('select[name=country],#billingCountry')).selectOption('US');
  await (await field('input[name=postalCode],#billingPostalCode')).fill('10001');
  for(const frame of page.frames())for(const selector of ['#enableStripePass','input[name=linkOptIn]']){const checkbox=frame.locator(selector);if(await checkbox.isVisible().catch(()=>false))await checkbox.uncheck();}
  let submitted=false;for(const frame of page.frames()){const button=frame.getByRole('button',{name:'Pay',exact:true});if(await button.isVisible().catch(()=>false)){await button.click();submitted=true;break;}}assert(submitted,'Sandbox Pay button must be visible');
  await page.waitForURL(url=>url.origin===origin&&url.pathname==='/founding/test/',{timeout:60000});
  await page.getByText('Stripe verified the $19 test payment.',{exact:false}).waitFor({timeout:30000});
  const sessionId=new URL(page.url()).searchParams.get('session_id');
  // Remove the bearer session reference from screenshot and subsequent history.
  await page.evaluate(()=>history.replaceState(null,'','/founding/test/'));
  await page.screenshot({path:output+'/completed.png',fullPage:true});
  const receipt=base+'/api/founding/receipt?session_id='+encodeURIComponent(sessionId);
  const result=await page.evaluate(async url=>(await fetch(url)).json(),receipt);
  assert.equal(result.verified,true);assert.equal(result.membershipActivated,false);
  const other=await browser.newContext();
  await other.route('**/*',async route=>{const request=route.request();await route.continue({headers:{...request.headers(),...(new URL(request.url()).origin===origin?auth:{})}})});
  const otherPage=await other.newPage();await otherPage.goto(base+'/founding/test/');
  assert.equal(await otherPage.evaluate(async url=>(await fetch(url)).status,receipt),400);
  const data={hostedStripeTestPayment:'PASS',serverVerified1900USD:'PASS',repeatVerification:'PASS',crossBrowserReceiptDenied:'PASS',desktopMobile:'PASS',realMoney:false,membershipActivated:false};
  fs.writeFileSync(output+'/results.json',JSON.stringify(data,null,2)+'\n');console.log(data);
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exit(1)});
