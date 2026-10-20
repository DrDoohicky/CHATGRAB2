import React, { useState } from 'react';
import { Plus, Database, Sparkles, Download, Trash2, HelpCircle, Paperclip, MoreHorizontal, UserRound } from 'lucide-react';

interface HeaderProps {
  corpusCount: number;
  onOpenCapture: () => void;
  onOpenCorpus: () => void;
  onOpenChat: () => void;
  onOpenSupport: () => void;
  onOpenGuide: () => void;
  onExportCorpusBackup: () => void;
  onClearCorpus: () => void;
  onOpenAccount: () => void;
  accountLabel: string;
}

export const Header: React.FC<HeaderProps> = ({
  corpusCount,
  onOpenCapture,
  onOpenCorpus,
  onOpenChat,
  onOpenSupport,
  onOpenGuide,
  onExportCorpusBackup,
  onClearCorpus,
  onOpenAccount,
  accountLabel,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button type="button" onClick={onOpenCorpus} className="flex items-center gap-3 text-left cursor-pointer" title="Open saved conversation library">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[10px] flex items-center justify-center text-white"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z" /></svg></div>
          </div>
          <div><div className="text-xl font-extrabold tracking-tight text-slate-900">ChatGrab</div><p className="text-[11.5px] text-slate-500 hidden sm:block">Validate · Reintegrate · Transform</p></div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={onOpenGuide} className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"><HelpCircle className="w-4 h-4" />Get Started</button>
          <button type="button" onClick={onOpenSupport} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"><Paperclip className="w-4 h-4 text-blue-600" />Files</button>
          <button type="button" onClick={onOpenChat} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80"><Sparkles className="w-4 h-4" />Assistant</button>
          <button type="button" onClick={onOpenCorpus} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"><Database className="w-4 h-4 text-blue-600" /><span className="hidden sm:inline">Library</span>{corpusCount > 0 && <span className="px-1.5 rounded-full bg-blue-100 text-blue-700">{corpusCount}</span>}</button>
          <button type="button" onClick={onOpenCapture} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e274c] hover:bg-[#163666] text-white text-xs font-semibold shadow-md"><Plus className="w-4 h-4" /><span className="hidden sm:inline">New Capture</span></button>
          <button type="button" onClick={onOpenAccount} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-blue-50" title="Account and profile"><UserRound className="w-4 h-4" /><span className="hidden sm:inline">{accountLabel}</span></button>
          <div className="relative"><button type="button" onClick={() => setShowMenu(v => !v)} className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 grid place-items-center" title="More"><MoreHorizontal className="w-4 h-4" /></button>
            {showMenu && <><div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} /><div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 text-xs text-slate-700">
              <div className="px-4 py-2 border-b border-slate-100"><b className="text-slate-900">Browser-local workspace</b><p className="text-[11px] text-slate-500 mt-0.5">No account sign-in is being claimed.</p></div>
              <button onClick={() => { setShowMenu(false); onOpenGuide(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" />Get Started / Help</button>
              <button onClick={() => { setShowMenu(false); onOpenSupport(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"><Paperclip className="w-3.5 h-3.5" />Support Material</button>
              <button onClick={() => { setShowMenu(false); onExportCorpusBackup(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"><Download className="w-3.5 h-3.5" />Export Library Backup</button>
              <button onClick={() => { setShowMenu(false); if (confirm('Clear the browser-local ChatGrab library?')) onClearCorpus(); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Reset Local Library</button>
            </div></>}
          </div>
        </div>
      </div>
    </header>
  );
};
