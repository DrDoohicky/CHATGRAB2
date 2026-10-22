import React from 'react';
import { X, MoreVertical, Share2, Link, Clipboard, ArrowRight } from 'lucide-react';

interface Props { inline?: boolean; isOpen: boolean; onClose: () => void; onStartCapture: () => void; }

const Step = ({ n, title, children, visual }: { n: number; title: string; children: React.ReactNode; visual: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 grid sm:grid-cols-[1fr_220px] gap-4 items-center">
    <div><div className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center font-bold text-sm mb-2">{n}</div><h3 className="font-bold text-slate-900">{title}</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed">{children}</p></div>{visual}
  </div>
);

export const OnboardingGuideModal: React.FC<Props> = ({ inline=false, isOpen, onClose, onStartCapture }) => {
  if (!isOpen) return null;
  return <div className={inline ? "cg-destination" : "fixed inset-0 z-[80] bg-slate-950/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"}><div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-5 sm:p-7 relative shadow-2xl">
    {!inline && <button aria-label="Close" onClick={onClose} className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-slate-200 grid place-items-center"><X className="w-4 h-4" /></button>}
    <div className="text-[11px] font-bold tracking-widest text-blue-700 uppercase">GET STARTED</div><h2 className="text-3xl font-extrabold text-slate-900 mt-1">Bring a ChatGPT conversation into ChatGrab.</h2><p className="text-slate-600 mt-2 mb-5">You already made it to the conversation. These four visual reminders show exactly where the share link comes from.</p>
    <div className="space-y-3">
      <Step n={1} title="Open the conversation" visual={<div className="rounded-2xl border-4 border-slate-800 bg-white p-3"><div className="flex items-center justify-between text-xs font-semibold">ChatGPT conversation <MoreVertical className="w-6 h-6" /></div><div className="mt-4 p-3 rounded-xl bg-slate-100 text-xs">Your conversation is already open.</div></div>}>Stay on the ChatGPT conversation you want to preserve. Tap the three-dot menu in the upper-right.</Step>
      <Step n={2} title="Choose Share" visual={<div className="rounded-2xl bg-slate-800 text-white p-3 text-sm"><div className="p-2 rounded-lg bg-slate-700 flex gap-2 items-center"><Share2 className="w-4 h-4" /> <b>Share</b></div><div className="p-2 text-slate-300">Find in chat</div><div className="p-2 text-slate-300">Archive</div></div>}>In the menu, choose <b>Share</b>. You do not need to export, archive, or send the chat anywhere else.</Step>
      <Step n={3} title="Copy the share link" visual={<div className="rounded-2xl bg-slate-800 text-white p-3 text-center"><div className="rounded-xl bg-white text-slate-900 p-4 text-xs mb-3">Share conversation</div><div className="flex items-center justify-center gap-2"><Link className="w-4 h-4" /><b className="text-sm">Copy link</b></div></div>}>On the share screen, tap <b>Copy link</b>. That puts the public ChatGPT share URL on your clipboard.</Step>
      <Step n={4} title="Paste it into ChatGrab" visual={<div className="rounded-2xl border border-blue-200 bg-blue-50 p-3"><div className="border border-slate-300 bg-white rounded-lg p-2 text-xs text-slate-400">https://chatgpt.com/share/…</div><div className="mt-2 bg-blue-600 text-white rounded-lg p-2 text-xs font-bold text-center flex items-center justify-center gap-1"><Clipboard className="w-3 h-3" /> Paste & Capture <ArrowRight className="w-3 h-3" /></div></div>}>Return here, paste the link, and capture. ChatGrab preserves the transcript and can connect supporting files around it.</Step>
    </div>
    <div className="mt-5 flex justify-end"><button onClick={() => { onClose(); onStartCapture(); }} className="px-5 py-2.5 rounded-xl bg-[#0e274c] text-white font-semibold text-sm">Start a Capture →</button></div>
  </div></div>;
};
