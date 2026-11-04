/* ChatGrab Share Registry Collector v0.1
 * Read-only DOM inspection. Does not call private APIs, click links or delete content.
 * Run from the browser console while ChatGPT's "Shared links" dialog is open.
 * Output is a local JSON download. URLs are captured only if exposed in the DOM.
 */
(async function chatGrabCollectSharedLinks() {
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const clean = s => (s || '').replace(/\s+/g,' ').trim();
  const sharing = $$('[role="dialog"],[aria-modal="true"]')
    .find(el => /shared links/i.test(clean(el.querySelector('h1,h2,h3,[role="heading"]')?.textContent) || clean(el.textContent).slice(0,200)));
  if (!sharing) { alert('Open ChatGPT Settings → Data controls → Shared links before running this collector.'); return; }
  const scrollables = $$('*', sharing).filter(el => {
    const st = getComputedStyle(el);
    return el.scrollHeight > el.clientHeight + 40 && /(auto|scroll)/.test(st.overflowY);
  }).sort((a,b) => b.scrollHeight-b.clientHeight - (a.scrollHeight-a.clientHeight));
  const scroller = scrollables[0] || sharing;
  const seen = new Map();
  let scanned = 0;
  function hrefFor(el) {
    const nodes = [el, ...$$('a[href], [data-href], [data-url]', el)];
    for (const node of nodes) {
      const raw = node.getAttribute?.('href') || node.getAttribute?.('data-href') || node.getAttribute?.('data-url');
      if (!raw) continue;
      try {
        const url = new URL(raw, location.origin);
        if (/^https?:$/.test(url.protocol) && /\/(share|s)\//.test(url.pathname)
          && /(^|\.)chatgpt\.com$/.test(url.hostname)) return url.href;
      } catch {}
    }
    return null;
  }
  function scan() {
    const rows = $$('tr,[role="row"]', sharing).filter(el => el.querySelector('a,button,[role="link"]'));
    const candidates = rows.length ? rows : $$('a,button,[role="link"]',sharing)
      .filter(el=>el.closest('tr,[role="row"]')===null)
      .map(el=>el.closest('li')||el.parentElement).filter(Boolean);
    for(const row of candidates) {
      const cells = $$('td,[role="cell"]',row);
      const titleEl = cells[0]?.querySelector('a,button,[role="link"]') || row.querySelector('a,button,[role="link"]');
      if(!titleEl)continue;
      const title=clean(titleEl.textContent);
      if(!title || /^(delete|close|copy link|learn more)$/i.test(title))continue;
      const type = clean(cells[1]?.textContent) || null;
      const date = clean(cells[2]?.textContent) || null;
      const url = hrefFor(titleEl) || hrefFor(row);
      const key = [title,type,date,url||'unknown'].join('|');
      if(!seen.has(key))seen.set(key,{title,type,date_shared:date,url,url_status:url?'DOM_EXTRACTED':'NOT_EXPOSED_IN_DOM',count:1});
      else seen.get(key).count += 1;
      scanned++;
    }
  }
  const original = scroller.scrollTop;
  scan();
  for(let i=0;i<120;i++){
    const prior=scroller.scrollTop;
    scroller.scrollTop=Math.min(scroller.scrollHeight, prior+Math.max(180,scroller.clientHeight*.72));
    await new Promise(resolve=>setTimeout(resolve,170));
    scan();
    if(scroller.scrollTop===prior || scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-2){
      await new Promise(resolve=>setTimeout(resolve,400));scan();
      if(scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-2)break;
    }
  }
  scroller.scrollTop=original;
  const records=[...seen.values()];
  const output={
    format:'chatgrab-share-registry-v1',
    collected_at:new Date().toISOString(),
    source:'ChatGPT Shared links dialog / live DOM',
    method:'READ_ONLY_DOM_SCROLL',
    observations:{
      unique_visible_records:records.length,
      encountered_row_observations:scanned,
      extracted_url_records:records.filter(x=>x.url).length,
      unresolved_url_records:records.filter(x=>!x.url).length,
      note:'Same title and date may represent multiple distinct shares. Counts are observational, not unique conversation identity.'
    },
    records,
    limitations:[
      'Only elements available to the rendered DOM are captured',
      'Virtual lists and network-loaded items may be incomplete',
      'Button-controlled share URLs may not be present in the DOM',
      'No authenticated API request or account export was performed',
      'Do not treat unresolved titles as recovered share URLs'
    ]
  };
  const data=JSON.stringify(output,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='chatgrab-share-registry-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  console.table(records.map(({title,type,date_shared,url_status,url,count})=>({title,type,date_shared,url_status,url,count})));
  console.info('ChatGrab registry collector complete:',output.observations,'Downloaded JSON; review locally before importing.');
  return output;
})();