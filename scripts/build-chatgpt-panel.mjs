import {build} from 'esbuild';import fs from 'node:fs';
fs.mkdirSync('public/chatgpt-app',{recursive:true});
await build({entryPoints:['src/chatgpt-app/panel.ts'],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:'public/chatgpt-app/panel.js'});
const result=await build({entryPoints:['lib/chatgpt-panel.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {panelHtml}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
fs.writeFileSync('public/chatgpt-app/index.html',panelHtml.replace('https://chatgrab.app/chatgpt-app/panel.js','./panel.js'));
