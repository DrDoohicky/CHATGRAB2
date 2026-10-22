import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
await build({configFile:false,root:fileURLToPath(new URL('../crew-console',import.meta.url)),base:'/crew-console/',publicDir:false,plugins:[react(),tailwindcss()],build:{outDir:fileURLToPath(new URL('../dist/crew-console',import.meta.url)),emptyOutDir:true}});
