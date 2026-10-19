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
import { CaptureModal } from './components/CaptureModal';
import { CorpusModal } from './components/CorpusModal';
import { ExportModal } from './components/ExportModal';
import { ThreadViewer } from './components/ThreadViewer';
import { InsightsView } from './components/InsightsView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AdaptivePortionsView } from './components/AdaptivePortionsView';
import { SupportMaterialModal } from './components/SupportMaterialModal';
import { OnboardingGuideModal } from './components/OnboardingGuideModal';

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
  const [workspaceTab, setWorkspaceTab] = useState<'transcript' | 'insights' | 'portions'>('transcript');

  // Modals state (Capture modal opens by default as in SS1.jpeg)
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCorpusOpen, setIsCorpusOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick inline URL input in empty state
  const [quickUrl, setQuickUrl] = useState('');
  const [quickCaptureError, setQuickCaptureError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [isQuickCapturing, setIsQuickCapturing] = useState(false);
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

  const handleRenameThread = (threadId: string, nextTitle: string) => {
    const title = nextTitle.trim();
    if (!title) return;
    const renamedAt = new Date().toISOString();
    setCorpus(prev => prev.map(t => t.id === threadId ? { ...t, title, renamedAt } : t));
    setActiveThread(prev => prev?.id === threadId ? { ...prev, title, renamedAt } : prev);
    showToast('Conversation renamed');
  };

  const handleMergeThreads = (threadIds: string[]) => {
    const selected = corpus.filter(t => threadIds.includes(t.id))
      .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    if (selected.length < 2) return;
    const base = selected[0].title || 'Merged context';
    const proposed = selected.every(t => t.title.trim().toLowerCase() === base.trim().toLowerCase())
      ? `${base} — Annotated + Furtherance`
      : `${base} — Merged Context`;
    const title = prompt('Name the merged context record', proposed)?.trim();
    if (!title) return;
    const messages = selected.flatMap((thread, sourceIndex) => thread.messages.map((m, messageIndex) => ({
      ...m,
      id: `merge-${sourceIndex + 1}:${m.id || messageIndex}`,
      sourceThreadId: thread.id,
      sourceMessageId: m.id,
    })));
    const merged: ConversationThread = {
      id: crypto.randomUUID(),
      title,
      capturedAt: new Date().toISOString(),
      model: 'Merged sources',
      messages,
      mergeMeta: {
        kind: 'derived_context_merge',
        preservesSources: true,
        sources: selected.map((t, i) => ({
          id: t.id,
          title: t.title,
          capturedAt: t.capturedAt,
          label: i === 0 ? 'Annotated / first source' : i === 1 ? 'Furtherance / later source' : `Continuation ${i + 1}`,
          messageCount: t.messages.length,
        })),
      },
    };
    setCorpus(prev => [merged, ...prev]);
    setActiveThread(merged);
    setWorkspaceTab('transcript');
    showToast('Merged context created; originals preserved');
  };

  const handleAssetLinked = (threadId: string, assetId: string) => {
    setCorpus(prev => prev.map(t => t.id === threadId
      ? { ...t, supportAssetIds: Array.from(new Set([...(t.supportAssetIds || []), assetId])) }
      : t));
    setActiveThread(prev => prev?.id === threadId
      ? { ...prev, supportAssetIds: Array.from(new Set([...(prev.supportAssetIds || []), assetId])) }
      : prev);
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

  // The landing-page capture bar is a complete capture workflow; it never opens a modal.
  const extractPublicShareUrl = (text: string): string | null =>
    text.match(/https?:\/\/(?:chatgpt\.com|chat\.openai\.com)\/share\/[a-zA-Z0-9_-]+/i)?.[0] || null;

  const handleQuickPaste = async () => {
    setQuickCaptureError(null);
    try {
      const text = (await navigator.clipboard.readText()).trim();
      const shareUrl = extractPublicShareUrl(text);
      if (shareUrl) {
        if (shareUrl !== quickUrl) { setQuickUrl(shareUrl); setCaptureNotice('Share link pasted from clipboard.'); }
      } else if (text) {
        // Keep what was copied visible for inspection, but never treat a private /s/t_ URL as a public share.
        if (text !== quickUrl) { setQuickUrl(text); setCaptureNotice('Clipboard content loaded. A public /share/ URL is required for link capture.'); }
      } else {
        // Empty clipboard: leave input untouched.
      }
    } catch {
      // Browser clipboard permissions vary; users can still paste manually.
    }
  };

  useEffect(() => {
    const onFocus = () => { if (!quickUrl && document.visibilityState === 'visible') void handleQuickPaste(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, [quickUrl]);

  const importConversationFile = async (file: File) => {
    try {
      if (file.type.startsWith('image/')) {
        setIsSupportOpen(true);
        setCaptureNotice('Use the artifact library to attach images as evidence.');
        return;
      }
      const text = await file.text();
      let title = file.name;
      let messages: ConversationThread['messages'];
      if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : (data.messages || data.data?.messages);
        if (!Array.isArray(items) || !items.length) throw new Error('JSON needs a messages array.');
        title = data.title || title;
        messages = items.map((m: any, i: number) => ({ id: String(m.id || i), role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user', content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? '') }));
      } else {
        if (!text.trim()) throw new Error('The selected file is empty.');
        messages = [{ id: 'text-0', role: 'user', content: text }];
      }
      handleThreadCaptured({ id: `import-${Date.now()}`, title, capturedAt: new Date().toISOString(), model: 'Imported source', messages });
      setCaptureNotice('File imported into the local workspace.');
    } catch (err: any) { setQuickCaptureError(err.message || 'Import failed.'); }
  };

  const importCopiedText = () => {
    if (!quickUrl.trim()) { setQuickCaptureError('Paste conversation text into the field first.'); return; }
    handleThreadCaptured({ id: `text-${Date.now()}`, title: 'Pasted conversation text', capturedAt: new Date().toISOString(), model: 'Manual import', messages: [{ id: 'text-0', role: 'user', content: quickUrl }] });
    setQuickUrl('');
  };

  const handleQuickCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuickCapturing) return;
    setQuickCaptureError(null);
    const shareUrl = extractPublicShareUrl(quickUrl);
    if (!shareUrl) {
      setQuickCaptureError('Please use a public ChatGPT share link containing /share/. The /s/t_ links are not public conversation shares.');
      return;
    }
    setQuickUrl(shareUrl);
    setIsQuickCapturing(true);
    try {
      const response = await fetch('/api/fetch-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shareUrl }),
      });
      const body = await response.text();
      let result: any;
      try {
        result = JSON.parse(body);
      } catch {
        throw new Error('The capture service did not return a valid response. Please retry in a moment.');
      }
      if (!response.ok || !result.success || !Array.isArray(result.data?.messages) || !result.data.messages.length) {
        throw new Error(result.error || 'Unable to read messages from this shared conversation.');
      }
      const thread: ConversationThread = {
        id: `thread-${Date.now()}`,
        title: result.data.title || 'Captured Conversation',
        sourceUrl: result.data.sourceUrl || shareUrl,
        capturedAt: new Date().toISOString(),
        originalCreatedAt: result.data.originalCreatedAt || new Date().toISOString(),
        model: result.data.model || 'ChatGPT',
        messages: result.data.messages,
      };
      handleThreadCaptured(thread);
      setQuickUrl('');
      // Analysis is optional; successful preservation must never depend on an AI quota.
    } catch (err: any) {
      setQuickCaptureError(err?.message || 'Capture failed. Please check the link and try again.');
    } finally {
      setIsQuickCapturing(false);
    }
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
        onOpenCapture={() => document.querySelector<HTMLInputElement>('input[placeholder="Paste a public ChatGPT share URL…"]')?.focus()}
        onOpenCorpus={() => setIsCorpusOpen(true)}
        onOpenChat={() => setIsChatbotOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCorpusBackup={handleExportCorpusBackup}
        onClearCorpus={handleClearCorpus}
      />

      {/* Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* If no conversation is active: visual landing workspace */}
        <>
          <div className="space-y-5 my-1">
            <section className="relative overflow-hidden bg-white rounded-[2rem] border border-blue-100 shadow-sm">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-28 left-1/3 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
              <div className="relative grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-center p-6 sm:p-9 lg:p-12">
                <div>
                  <div className="text-[11px] sm:text-xs font-extrabold tracking-[.24em] text-blue-700 uppercase">UNIFY · ANALYZE · PRESERVE · REINTEGRATE</div>
                  <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-.045em] leading-[.98] text-[#0a2050]">Preserve, Validate &amp; Reintegrate Past Chats into <span className="text-blue-600">an Evolving Digital Awareness.</span></h2>
                  <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">Build an evolving, evidence-grounded canonical record of conversations, decisions, corrections, and discoveries. Here, awareness means governed continuity of information—not consciousness or sentience.</p>

                </div>
                <div className="relative">
                  <img src="/chatgrab-feature-illustration.svg" alt="Illustrated ChatGrab feature graphic: Find patterns, organize by project, preserve source material, generate insights, export useful reports" className="w-full max-w-[720px] mx-auto drop-shadow-[0_26px_40px_rgba(30,90,180,.18)]" />
                </div>
              </div>

              <form onSubmit={handleQuickCaptureSubmit} className="relative mx-5 sm:mx-9 lg:mx-12 mb-7 sm:mb-9 p-3 sm:p-4 rounded-2xl bg-white/95 border border-blue-100 shadow-[0_12px_35px_rgba(29,78,216,.10)] grid lg:grid-cols-[1fr_auto] gap-2">
                <div className="flex items-center gap-2 px-3 h-12 rounded-xl border border-slate-200 bg-white">
                  <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <input value={quickUrl} onFocus={() => { if (!quickUrl) void handleQuickPaste(); }} onChange={e => { setQuickUrl(e.target.value); setQuickCaptureError(null); setCaptureNotice(null); }} placeholder="Paste a public ChatGPT share URL…" className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400" />
                </div>
                <button type="submit" disabled={isQuickCapturing} className="h-12 px-5 rounded-xl bg-[#0d5ed7] hover:bg-[#084fb9] text-white text-sm font-bold flex items-center justify-center gap-2">{isQuickCapturing ? "Capturing…" : "Capture Thread"} <ArrowRight className="w-4 h-4" /></button>
                {captureNotice && <div role="status" className="lg:col-span-2 text-sm text-emerald-700 px-2">{captureNotice}</div>}
                {quickCaptureError && <div role="alert" className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{quickCaptureError}</div>}
                <div className="lg:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-blue-100">
                  <label className="cursor-pointer px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded-lg">Import JSON <input className="hidden" type="file" accept=".json,application/json" onChange={e => { const f=e.target.files?.[0]; if(f) void importConversationFile(f); e.target.value=''; }} /></label>
                  <button type="button" onClick={importCopiedText} className="px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded-lg">Import copied text</button>
                  <label className="cursor-pointer px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded-lg">Import file <input className="hidden" type="file" accept=".json,.txt,.md,.csv,text/*" onChange={e => { const f=e.target.files?.[0]; if(f) void importConversationFile(f); e.target.value=''; }} /></label>
                  <button type="button" onClick={() => setIsSupportOpen(true)} className="px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded-lg">Import image / artifact</button>
                  <button type="button" onClick={() => setBatchMode(!batchMode)} className="ml-auto px-3 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg">{batchMode ? 'Single' : 'Batch process'}</button>
                </div>
                {batchMode && <div className="lg:col-span-2 space-y-2"><p className="text-sm text-slate-600">Batch capture processes public /share/ links one at a time, preserving each successful capture in the local library. Enter one link per line.</p><textarea value={batchInput} onChange={e => setBatchInput(e.target.value)} rows={4} className="w-full border border-slate-300 rounded-xl p-3 text-sm" placeholder="One public share URL per line" /><button type="button" disabled={isQuickCapturing} className="bg-blue-700 text-white px-4 py-2 rounded-lg" onClick={async () => { const links=Array.from(new Set(batchInput.split(/\n/).map(x=>extractPublicShareUrl(x)).filter(Boolean) as string[])); if(!links.length){setQuickCaptureError('Add at least one valid /share/ URL.');return;} setIsQuickCapturing(true); let ok=0; for(const link of links){try{const res=await fetch('/api/fetch-share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:link})});const json=await res.json();if(!res.ok||!json.success||!Array.isArray(json.data?.messages))continue;handleThreadCaptured({id:`batch-${Date.now()}-${ok}`,title:json.data.title||'Captured Conversation',sourceUrl:link,capturedAt:new Date().toISOString(),model:json.data.model||'ChatGPT',messages:json.data.messages});ok++;}catch{}}setIsQuickCapturing(false);setCaptureNotice(`Batch captured ${ok} of ${links.length} links.`); }}>Capture batch</button></div>}
                <div className="lg:col-span-2 text-xs text-slate-500 px-1">Your library stays in this browser. Export a backup to preserve it on another device.</div>
              </form>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                ['Preserve','Keep the original conversation intact','◉'],
                ['Organize','Group related work without changing sources','▣'],
                ['Analyze','Find patterns, corrections and drift','⌕'],
                ['Reintegrate','Carry useful context forward','↻'],
                ['Artifacts','Keep PDFs, images and source files nearby','◇'],
                ['Export','Create useful reports and backups','↗'],
              ].map(([title,desc,glyph]) => (
                <div key={title} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 grid place-items-center font-black text-lg">{glyph}</div>
                  <div className="mt-3 font-extrabold text-sm text-[#102a56]">{title}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{desc}</div>
                </div>
              ))}
            </section>

            <section className="grid md:grid-cols-3 gap-4">
              <button type="button" onClick={() => setIsCorpusOpen(true)} className="text-left rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition">
                <Database className="w-5 h-5 text-blue-600" /><h3 className="mt-3 font-extrabold text-[#102a56]">Your conversation library</h3><p className="mt-1 text-sm text-slate-500">Rename, compare, merge, and reopen preserved conversations.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Open Library <ChevronRight className="w-3.5 h-3.5" /></span>
              </button>
              <button type="button" onClick={() => setIsSupportOpen(true)} className="text-left rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition">
                <FileText className="w-5 h-5 text-rose-500" /><h3 className="mt-3 font-extrabold text-[#102a56]">Files around the conversation</h3><p className="mt-1 text-sm text-slate-500">Attach PDFs, screenshots, generated media, JSON, audio, video, and evidence.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Open Support Library <ChevronRight className="w-3.5 h-3.5" /></span>
              </button>
              <button type="button" onClick={() => setIsGuideOpen(true)} className="text-left rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition">
                <HelpCircle className="w-5 h-5 text-amber-500" /><h3 className="mt-3 font-extrabold text-[#102a56]">Four-step visual guide</h3><p className="mt-1 text-sm text-slate-500">See exactly where the three dots, Share, Copy link, and ChatGrab paste controls are.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Show the Guide <ChevronRight className="w-3.5 h-3.5" /></span>
              </button>
            </section>
          </div>
          {activeThread && (
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

                <button
                  type="button"
                  onClick={() => setWorkspaceTab('portions')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceTab === 'portions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Context Map</span>
                </button>
              </div>
            </div>

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

            {workspaceTab === 'portions' && (
              <AdaptivePortionsView
                thread={activeThread}
                onOpenAssistantWithPortion={(portion) => {
                  setIsChatbotOpen(true);
                  showToast(`Assistant opened for ${portion.title}`);
                }}
              />
            )}
          </div>
          )}
        </>
      </main>

      {/* Capture Modal (SS1.jpeg replica) */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => {
          setIsCaptureModalOpen(false);
          setQuickUrl('');
        }}
        initialUrl={quickUrl}
        onOpenSupport={() => { setIsCaptureModalOpen(false); setIsSupportOpen(true); }}
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
        onRenameThread={handleRenameThread}
        onMergeThreads={handleMergeThreads}
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

      <SupportMaterialModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        threads={corpus}
        activeThread={activeThread}
        onAssetLinked={handleAssetLinked}
      />

      <OnboardingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartCapture={() => setIsCaptureModalOpen(true)}
      />

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
