import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Share2,
  HelpCircle,
  ExternalLink,
  Calendar,
  MessageSquare,
  Clock,
  ArrowRight,
  Clipboard,
  Database,
  Printer,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Plus,
  Bot,
  MessageCircle
} from 'lucide-react';
import { ConversationThread, ThreadInsights } from './types';
import { Header } from './components/Header';
import { WorkspaceCards } from './components/WorkspaceCards';
import { CaptureModal } from './components/CaptureModal';
import { CorpusModal } from './components/CorpusModal';
import { ExportModal } from './components/ExportModal';
import { ThreadViewer } from './components/ThreadViewer';
import { InsightsView } from './components/InsightsView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { CrewHandoff } from './components/CrewHandoff';

const STORAGE_KEY = 'chatgrab_corpus_threads';

export default function App() {
  // Load corpus from LocalStorage (clearing any old simulated items)
  const [corpus, setCorpus] = useState<ConversationThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const simulatedIds = new Set(['thread-cache-architecture', 'thread-saas-gtm', 'thread-react-19']);
          const realThreads = parsed.filter((t: ConversationThread) => !simulatedIds.has(t.id));
          return realThreads;
        }
      }
    } catch (e) {
      console.warn('Failed to load local corpus:', e);
    }
    return [];
  });

  // Active thread: starts as null when no conversation is loaded
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);

  // Active Tab in Workspace
  const [workspaceTab, setWorkspaceTab] = useState<'transcript' | 'insights'>('transcript');

  // Modals state (Capture modal opens by default as in SS1.jpeg)
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(true);
  const [isCorpusOpen, setIsCorpusOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick inline URL input in empty state
  const [quickUrl, setQuickUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist corpus to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corpus));
    } catch (e) {
      console.warn('Failed to save corpus to localStorage:', e);
    }
  }, [corpus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleThreadCaptured = (newThread: ConversationThread) => {
    // Add to corpus (avoid duplicates by ID or update)
    setCorpus((prev) => {
      const existsIdx = prev.findIndex((t) => t.id === newThread.id);
      if (existsIdx !== -1) {
        const updated = [...prev];
        updated[existsIdx] = newThread;
        return updated;
      }
      return [newThread, ...prev];
    });

    setActiveThread(newThread);
    setWorkspaceTab('transcript');
    showToast(`Successfully captured "${newThread.title}"`);
  };

  const handleUpdateInsights = (updatedInsights: ThreadInsights) => {
    if (!activeThread) return;
    const updatedThread: ConversationThread = {
      ...activeThread,
      insights: updatedInsights,
    };
    setActiveThread(updatedThread);
    setCorpus((prev) =>
      prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
    );
  };

  const handleReanalyze = async () => {
    if (!activeThread) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeThread.title,
          messages: activeThread.messages,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.insights) {
        handleUpdateInsights(data.insights);
        showToast('Intelligence updated successfully');
      } else {
        throw new Error(data.error || 'Failed to reanalyze thread');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteThread = (threadId: string) => {
    setCorpus((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThread?.id === threadId) {
      const remaining = corpus.filter((t) => t.id !== threadId);
      setActiveThread(remaining.length > 0 ? remaining[0] : null);
    }
    showToast('Thread removed from corpus');
  };

  const handleToggleFavorite = (threadId: string) => {
    setCorpus((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    if (activeThread?.id === threadId) {
      setActiveThread((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleExportCorpusBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(corpus, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatgrab_corpus_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Corpus backup downloaded');
  };

  const handleClearCorpus = () => {
    setCorpus([]);
    setActiveThread(null);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Corpus cleared');
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const match = text.match(/(https?:\/\/(?:chatgpt\.com|chat\.openai\.com)\/share\/[a-zA-Z0-9_-]+)/i);
        if (match) {
          setQuickUrl(match[1]);
          setIsCaptureModalOpen(true);
          showToast(`Rectified shared link: ${match[1]}`);
        } else {
          setQuickUrl(text.trim());
          setIsCaptureModalOpen(true);
        }
      } else {
        setIsCaptureModalOpen(true);
      }
    } catch {
      setIsCaptureModalOpen(true);
    }
  };

  const handleQuickCaptureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) {
      setIsCaptureModalOpen(true);
      return;
    }
    setIsCaptureModalOpen(true);
  };

  const totalWords = activeThread
    ? activeThread.messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0)
    : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        corpusCount={corpus.length}
        onOpenCapture={() => setIsCaptureModalOpen(true)}
        onOpenCorpus={() => setIsCorpusOpen(true)}
        onOpenChat={() => setIsChatbotOpen(true)}
        onExportCorpusBackup={handleExportCorpusBackup}
        onClearCorpus={handleClearCorpus}
      />

      {/* Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Workspace Top Bar (matching background in SS1.jpeg) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#2f558a] uppercase">
              CHATGRAB WORKSPACE
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeThread ? activeThread.title : 'No conversation loaded'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600">
            {/* Generate PDF */}
            <button
              type="button"
              onClick={() => {
                if (activeThread) setIsExportOpen(true);
                else setIsCaptureModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-rose-500" />
              <span>Generate PDF</span>
            </button>

            {/* Share Link */}
            <button
              type="button"
              onClick={() => {
                if (activeThread) {
                  navigator.clipboard.writeText(activeThread.sourceUrl || window.location.href);
                  showToast('Link copied to clipboard!');
                } else {
                  setIsCaptureModalOpen(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Share link</span>
            </button>

            {/* About / New Capture */}
            <button
              type="button"
              onClick={() => setIsCaptureModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>About / New Capture</span>
            </button>
          </div>
        </div>

        {/* If no conversation is active: Welcome & Getting Started view */}
        {!activeThread ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-12 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div>
              <div className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
                &gt; Getting started:
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Bring in a public ChatGPT share URL
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                ChatGrab preserves the source, analyzes the full back-and-forth record, and connects it to your personal corpus.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleQuickPaste}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Clipboard className="w-4 h-4 text-slate-500" />
                <span>Paste Clipboard</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCaptureModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0e274c] hover:bg-[#163666] text-white font-semibold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Capture New Thread</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Thread Workspace */
          <div className="space-y-5">
            {/* Thread Metadata Strip */}
            <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeThread.model || 'GPT-4o'}
                </span>

                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Captured: {new Date(activeThread.capturedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>

                <span className="text-slate-500 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  {activeThread.messages.length} messages
                </span>

                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{readTimeMinutes} min read ({totalWords.toLocaleString()} words)
                </span>

                {activeThread.sourceUrl && (
                  <a
                    href={activeThread.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    <span>Source link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* View Selector Tabs (Transcript vs AI Intelligence) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('transcript')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceTab === 'transcript'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transcript</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceTab('insights')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceTab === 'insights'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Intelligence</span>
                  {activeThread.insights && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            <CrewHandoff key={activeThread.id} thread={activeThread} />

            {/* Tab 1: Transcript */}
            {workspaceTab === 'transcript' && (
              <ThreadViewer thread={activeThread} />
            )}

            {/* Tab 2: AI Intelligence */}
            {workspaceTab === 'insights' && (
              <InsightsView
                thread={activeThread}
                onUpdateInsights={handleUpdateInsights}
                onReanalyze={handleReanalyze}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        )}
        <WorkspaceCards onAction={(action) => {
          if (action === 'capture') setIsCaptureModalOpen(true);
          else if (action === 'library' || action === 'corpus') setIsCorpusOpen(true);
          else if (action === 'export') handleExportCorpusBackup();
          else if (action === 'analyze') {
            if (activeThread) { setWorkspaceTab('insights'); window.scrollTo({top:0,behavior:'smooth'}); }
            else setIsCorpusOpen(true);
          }
        }} />
      </main>

      {/* Capture Modal (SS1.jpeg replica) */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => {
          setIsCaptureModalOpen(false);
          setQuickUrl('');
        }}
        initialUrl={quickUrl}
        onThreadCaptured={(thread) => {
          handleThreadCaptured(thread);
          setQuickUrl('');
        }}
      />

      {/* Corpus Library & Cross-Search Modal */}
      <CorpusModal
        isOpen={isCorpusOpen}
        onClose={() => setIsCorpusOpen(false)}
        corpus={corpus}
        activeThreadId={activeThread?.id}
        onSelectThread={(t) => {
          setActiveThread(t);
          setWorkspaceTab('transcript');
        }}
        onDeleteThread={handleDeleteThread}
        onToggleFavorite={handleToggleFavorite}
        onOpenNewCapture={() => {
          setIsCorpusOpen(false);
          setIsCaptureModalOpen(true);
        }}
      />

      {/* Export / PDF Print Modal */}
      {activeThread && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          thread={activeThread}
        />
      )}

      {/* Floating Action Button for Gemini Chatbot */}
      {!isChatbotOpen && (
        <button
          type="button"
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all cursor-pointer active:scale-95 group"
          title="Open Gemini Multi-Turn Assistant"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>Gemini Assistant</span>
        </button>
      )}

      {/* Gemini Multi-Turn Chatbot */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeThread={activeThread}
      />
    </div>
  );
}
