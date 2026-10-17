import React, { useState } from 'react';
import { Plus, Database, Sparkles, User, Download, Trash2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  corpusCount: number;
  onOpenCapture: () => void;
  onOpenCorpus: () => void;
  onOpenChat: () => void;
  onExportCorpusBackup: () => void;
  onClearCorpus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  corpusCount,
  onOpenCapture,
  onOpenCorpus,
  onOpenChat,
  onExportCorpusBackup,
  onClearCorpus,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[10px] flex items-center justify-center text-white">
              {/* Connected Chat Bubble Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                ChatGrab
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700">
                PRO
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal leading-tight hidden sm:block">
              Continuous intelligence from saved conversations
            </p>
          </div>
        </div>

        {/* Right Navigation & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Chat Assistant Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
            title="Chat with Gemini about this thread"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Gemini Chat</span>
          </button>

          {/* Corpus Button */}
          <button
            type="button"
            onClick={onOpenCorpus}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Browse all saved conversations"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>Corpus</span>
            {corpusCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                {corpusCount}
              </span>
            )}
          </button>

          {/* New Capture Button */}
          <button
            type="button"
            onClick={onOpenCapture}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e274c] hover:bg-[#163666] text-white text-xs sm:text-sm font-medium shadow-md shadow-blue-950/10 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Capture</span>
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="User Account & Settings"
            >
              <User className="w-4 h-4" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 text-xs text-slate-700 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">Knowledge Worker</p>
                    <p className="text-[11px] text-slate-500 truncate">fivedaymayo@gmail.com</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenCorpus();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span>Saved Corpus ({corpusCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onExportCorpusBackup();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export Corpus Backup (JSON)</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (confirm('Are you sure you want to clear your local corpus? This cannot be undone.')) {
                          onClearCorpus();
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Reset Corpus</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
