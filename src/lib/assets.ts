import type { SupportAsset } from '../types';
export type StoredAsset = SupportAsset & { blob?: Blob };
export const ASSET_CHANGE = 'chatgrab-assets-changed';
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('chatgrab_assets',1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('assets'))request.result.createObjectStore('assets',{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
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
