export const ENVIRONMENT_KEY='chatgrab-environments-v1';
export function normalizeEndpoint(raw:string){
 if(!raw.trim())return '';
 const u=new URL(raw.trim());
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('Use a site origin, such as https://your-preview.vercel.app or http://192.168.1.20:3000. Do not include credentials or a page path.');
 return u.origin;
}
export function environmentName(origin:string,local:string,review:string){if(new URL(origin).hostname==='chatgrab.app')return 'LIVE';if(review&&origin===review)return 'REVIEW';if(origin===local||['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname))return 'LOCAL';if(origin===review||new URL(origin).hostname.endsWith('.vercel.app'))return 'REVIEW';return 'LOCAL';}
export function environmentDestination(origin:string,search:string){const u=new URL(origin);const page=new URLSearchParams(search).get('page');if(page&&['capture','workspace','library','analyze','reintegrate','artifacts','export','media','bridge','guide','settings','plugin'].includes(page))u.searchParams.set('page',page);return u.href;}
