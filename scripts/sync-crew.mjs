// Run from ChatGrab with node --import tsx scripts/sync-crew.mjs [Crew prototype path].
// Copies reviewed source only, never browser state, credentials, databases or evidence.
import {cp,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const source=resolve(process.argv[2]||'../prototypes/worker-first-console');
const destination=fileURLToPath(new URL('../crew-console',import.meta.url));
await mkdir(destination,{recursive:true});
await cp(resolve(source,'src'),resolve(destination,'src'),{recursive:true});
await cp(resolve(source,'index.html'),resolve(destination,'index.html'));
const {INITIAL_STATE:s}=await import(pathToFileURL(resolve(source,'src/data/seedData.ts')).href);
await writeFile(new URL('../public/crew-routing.json',import.meta.url),JSON.stringify({workers:s.workers.map(w=>({worker_id:w.worker_id,canonical_name:w.canonical_name})),lanes:s.lanes.filter(l=>l.status==='ACTIVE').map(l=>({lane_id:l.lane_id,worker_id:l.worker_id,display_name:l.display_name,archived:l.archived}))},null,2)+'\n');
