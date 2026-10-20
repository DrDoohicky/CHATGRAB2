import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { cloud } from '../lib/cloud';
type Props = { user: User | null; onClose: () => void; onChange: () => Promise<void> };
export function AccountPanel({ user, onClose, onChange }: Props) {
 const auth = cloud?.auth;
 const [mode,setMode] = useState<'signin'|'signup'|'reset'>('signin');
 const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
 const [displayName,setDisplayName] = useState(user?.user_metadata?.display_name || '');
 const [companionName,setCompanionName] = useState(user?.user_metadata?.companion_name || 'My Companion');
 const [notice,setNotice] = useState(''); const [busy,setBusy] = useState(false);
 const run = async (action: () => Promise<{error?: {message:string}|null; data?: unknown}>) => {setBusy(true);setNotice('');try {const r=await action();if(r.error) throw Error(r.error.message);await onChange();setNotice(mode==='signup'?'Check your email to confirm your account.':mode==='reset'?'Password reset email sent.':'Saved.');}catch(e:any){setNotice(e.message||'Unable to complete request.')}finally{setBusy(false)}};
 return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Account"><div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
 <div className="flex justify-between items-center mb-5"><h2 className="text-2xl font-black">{user?'Your profile':mode==='signup'?'Create your account':mode==='reset'?'Reset password':'Sign in'}</h2><button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-slate-100">✕</button></div>
 {!auth ? <p className="text-sm text-amber-800 bg-amber-50 p-4 rounded-xl">Cloud accounts are not activated yet. Your current conversations remain in this browser. The site owner must configure Supabase before registration is available.</p> :
 user ? <form className="space-y-4" onSubmit={e=>{e.preventDefault();void run(()=>auth.updateUser({data:{display_name:displayName.trim(),companion_name:companionName.trim()}}))}}>
 <p className="text-sm text-slate-500">{user.email}</p><label className="block text-sm font-semibold">Display name<input maxLength={80} value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label><label className="block text-sm font-semibold">Companion name<input maxLength={80} value={companionName} onChange={e=>setCompanionName(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label><button disabled={busy} className="w-full bg-blue-700 text-white rounded-xl p-3 font-bold">Save profile</button><button type="button" className="w-full border rounded-xl p-3" onClick={()=>void run(()=>auth.signOut())}>Sign out</button></form> :
 <form className="space-y-4" onSubmit={e=>{e.preventDefault();if(mode==='reset'){void run(()=>auth.resetPasswordForEmail(email,{redirectTo:window.location.origin}));return;}if(mode==='signup'){void run(()=>auth.signUp({email,password,options:{data:{display_name:displayName.trim(),companion_name:'My Companion'}}}));return;}void run(()=>auth.signInWithPassword({email,password}));}}>
 {mode==='signup'&&<label className="block text-sm font-semibold">Display name<input value={displayName} maxLength={80} onChange={e=>setDisplayName(e.target.value)} required className="mt-1 w-full rounded-xl border p-3"/></label>}
 <label className="block text-sm font-semibold">Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border p-3"/></label>
 {mode!=='reset'&&<label className="block text-sm font-semibold">Password<input type="password" autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required className="mt-1 w-full rounded-xl border p-3"/></label>}
 <button disabled={busy} className="w-full bg-blue-700 text-white rounded-xl p-3 font-bold">{busy?'Processing…':mode==='signin'?'Sign in':mode==='signup'?'Create account':'Send reset link'}</button>
 <div className="flex flex-wrap gap-3 text-sm text-blue-700"><button type="button" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setNotice('')}}>{mode==='signup'?'Already registered? Sign in':'Create account'}</button><button type="button" onClick={()=>{setMode(mode==='reset'?'signin':'reset');setNotice('')}}>{mode==='reset'?'Back to sign in':'Forgot password?'}</button></div></form>}
 {notice&&<p role="status" className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">{notice}</p>}
 <p className="mt-5 text-xs text-slate-500">Your library is private to your signed-in account. Browser-only guest conversations are not uploaded automatically.</p>
 </div></div>;
}
