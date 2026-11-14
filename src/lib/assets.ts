import type { SupportAsset } from '../types';
export type StoredAsset = SupportAsset & { blob?: Blob };
export const ASSET_CHANGE = 'chatgrab-assets-changed';
export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('chatgrab_assets',2);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('reviews'))request.result.createObjectStore('reviews');if(!request.result.objectStoreNames.contains('assets'))request.result.createObjectStore('assets',{keyPath:'id'});};
    request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    request.onblocked=()=>reject(Error('Close other ChatGrab tabs to upgrade local review storage, then retry.'));request.onerror=()=>reject(request.error);
  });
}
export async function listAssets(): Promise<StoredAsset[]> {
  const db=await openDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction('assets');const request=tx.objectStore('assets').getAll();
    tx.oncomplete=()=>{db.close();resolve((request.result||[]).sort((a,b)=>b.uploadedAt.localeCompare(a.uploadedAt)));};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
export async function saveAsset(asset:StoredAsset):Promise<void>{
  const db=await openDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(asset);
    tx.oncomplete=()=>{db.close();window.dispatchEvent(new Event(ASSET_CHANGE));resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
// A single IndexedDB transaction prevents partially restored file sets.
export async function saveAssetBatch(assets:StoredAsset[],archiveWrite?:{value:unknown;expectedRevision:number;scope?:string}):Promise<void>{
 const db=await openDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(archiveWrite?['assets','reviews']:['assets'],'readwrite');let failure:unknown;
  const abort=(e:unknown)=>{failure=e;try{tx.abort();}catch{}};
  tx.oncomplete=()=>{db.close();window.dispatchEvent(new Event(ASSET_CHANGE));if(archiveWrite)window.dispatchEvent(new Event('chatgrab-reviews-changed'));resolve();};
  tx.onabort=tx.onerror=()=>{db.close();reject(failure||tx.error||Error('Local storage transaction aborted; nothing was saved.'));};
  try{
   if(archiveWrite){const store=tx.objectStore('reviews'),r=store.get(archiveWrite.scope||'local');r.onsuccess=()=>{try{if((r.result?.revision||0)!==archiveWrite.expectedRevision)throw Error('Review history changed in another tab. Reload and retry; nothing was replaced.');store.put(archiveWrite.value,archiveWrite.scope||'local');}catch(e){abort(e)}};}
   for(const a of assets)tx.objectStore('assets').put(a);
  }catch(e){abort(e)}
 });
}
// Download originals rather than executing uploaded HTML/SVG/scripts under the app origin.
export function downloadOriginal(asset:StoredAsset){
 if(!asset.blob)throw Error('The original file is unavailable on this device.');
 const url=URL.createObjectURL(asset.blob),a=document.createElement('a');a.href=url;a.download=asset.name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
