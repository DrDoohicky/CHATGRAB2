import {spawnSync} from 'node:child_process';import path from 'node:path';
const root=path.resolve(process.env.EVIDENCE_DIR||'evidence/independent-acceptance');
for(const [script,folder] of [['replay-acceptance.cjs','review'],['portable-mvp-e2e.cjs','portable'],['system-audit-e2e.cjs','continuity'],['crew-ui-audit.cjs','crew'],['mcp-http-e2e.mjs','mcp']]){
 console.log('Running',script);const result=spawnSync(process.execPath,['scripts/'+script],{stdio:'inherit',env:{...process.env,EVIDENCE_DIR:path.join(root,folder)}});if(result.status!==0)process.exit(result.status||1);
}
const gallery=spawnSync(process.env.PYTHON||'python',['scripts/build-review-gallery.py',path.join(root,'review')],{stdio:'inherit'});process.exit(gallery.status===0?0:gallery.status||1);
