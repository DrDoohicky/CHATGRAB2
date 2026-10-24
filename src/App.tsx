import {DownloadFile} from './components/DownloadFile';
import {CrewBridge} from './components/CrewBridge';
import {parseConversationFile} from './lib/importConversations';
import {downloadText} from './lib/download';
import './chatgrab-mockup.css';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { MediaLibrary } from './components/MediaLibrary';
import { ManualAnalysisPage } from './components/ManualAnalysisPage';
import './components/media-library.css';
import { HeroIntro } from './components/HeroIntro';
import { LibraryExplorer } from './components/LibraryExplorer';
import { ChatGrabDashboard } from './components/ChatGrabDashboard';
import { ContinuityWorkspace } from './components/ContinuityWorkspace';
import type { CGPage } from './components/ChatGrabDashboard';
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { cloud } from './lib/cloud';
import { ChatGPTConnectionPanel } from './components/ChatGPTConnectionPanel';
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
import { ChatGPTCompanion } from './components/ChatGPTCompanion';
import { AdaptivePortionsView } from './components/AdaptivePortionsView';
import { SupportMaterialModal } from './components/SupportMaterialModal';
import { OnboardingGuideModal } from './components/OnboardingGuideModal';
import './metallic-theme.css';
import './components/workspace-navigation.css';
const STORAGE_KEY = 'chatgrab_corpus_threads';
const initialPage=():CGPage=>{const page=new URLSearchParams(window.location.search).get('page');return ['guide','tutorial'].includes(page||'')?'guide':page==='media'?'media':page==='bridge'?'bridge':page==='analyze'?'analyze':page==='workspace'?'workspace':'capture';};
const initialNavigationPage=():CGPage=>new URLSearchParams(window.location.search).get('page')==='analyze'?'analyze':initialPage();
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
  const requestedThreadTab = useRef<'transcript' | 'insights' | 'portions'>('transcript');
  // Modals state (Capture modal opens by default as in SS1.jpeg)
  const [page, setPage] = useState<CGPage>(initialPage);
  const [navigationPage,setNavigationPage]=useState<CGPage>(initialNavigationPage);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>{try{return localStorage.getItem('chatgrab_sidebar_collapsed')==='true';}catch{return false;}});
  const [mobileNavigation,setMobileNavigation]=useState(false);
  const closeCompanion=React.useCallback(()=>setIsChatbotOpen(false),[]);
  const closeNavigation=React.useCallback(()=>setMobileNavigation(false),[]);
  const toggleSidebar=()=>setSidebarCollapsed(previous=>{const next=!previous;try{localStorage.setItem('chatgrab_sidebar_collapsed',String(next));}catch{}return next;});
  const openPage = (next: CGPage) => {
    const destination=next==='preserve'?'capture':next;
    const anchor=next==='reintegrate'?'workspace-reintegration':null;
    setNavigationPage(destination);setPage(anchor?'workspace':destination);
    if(anchor)setTimeout(()=>document.getElementById(anchor)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}),75);
    else window.scrollTo({top:0,behavior:'instant'});
  };
  useEffect(() => {
    if (page === 'capture' && activeThread) {
      document.getElementById('cg-active-thread')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page, activeThread?.id, workspaceTab]);
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
  const [accountUser, setAccountUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [libraryReady, setLibraryReady] = useState(!cloud);
  const activeOwnerRef = useRef<string | null>(null);
  const cloudQueue = useRef<Promise<void>>(Promise.resolve());
  const readGuest = (): ConversationThread[] => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
  const refreshAccount = async () => {
    if (!cloud) return;
    setLibraryReady(false);
    const { data: { user } } = await cloud.auth.getUser();
    activeOwnerRef.current = user?.id || null;
    setAccountUser(user);
    if (user) {
      const { data, error } = await cloud.from('conversation_libraries').select('content').eq('owner_id', user.id).order('updated_at', { ascending: false });
      if (error) {
        console.error('Unable to load private library', error);
        setLibraryReady(false);
        return;
      }
      setCorpus((data || []).map((record: any) => record.content as ConversationThread));
    } else {
      setCorpus(readGuest());
    }
    setActiveThread(null);
    setLibraryReady(true);
  };
  useEffect(() => {
    if (!cloud) return;
    void refreshAccount();
    const { data: { subscription } } = cloud.auth.onAuthStateChange(() => { setTimeout(() => void refreshAccount(), 0); });
    return () => subscription.unsubscribe();
  }, []);
  // Persist corpus to localStorage
  useEffect(() => {
    try {
      if (!libraryReady) return;
      if (!accountUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(corpus));
      } else if (cloud && activeOwnerRef.current === accountUser.id) {
        const ownerId = accountUser.id;
        const cloudClient = cloud;
        const snapshot = [...corpus];
        cloudQueue.current = cloudQueue.current.then(async () => {
          if (activeOwnerRef.current !== ownerId) return;
          const records = snapshot.map(t => ({owner_id: ownerId, thread_id: t.id, content: t, updated_at: new Date().toISOString()}));
          if (records.length) {
            const { error } = await cloudClient.from('conversation_libraries').upsert(records, {onConflict:'owner_id,thread_id'});
            if (error) throw error;
            const ids = records.map(r=>'"'+r.thread_id.replace(/["\\]/g,'')+'"').join(',');
            const removed = await cloudClient.from('conversation_libraries').delete().eq('owner_id', ownerId).not('thread_id','in', '('+ids+')');
            if (removed.error) throw removed.error;
          } else {
            const cleared = await cloudClient.from('conversation_libraries').delete().eq('owner_id', ownerId);
            if (cleared.error) throw cleared.error;
          }
        }).catch(err => { console.error('Cloud library sync failed:', err); showToast('Cloud library sync failed. Export a backup before leaving.'); });
      }
    } catch (e) {
      console.warn('Failed to save corpus to localStorage:', e);
    }
  }, [corpus, accountUser, libraryReady]);
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
    openPage('capture');
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
    downloadText(JSON.stringify(corpus,null,2),`chatgrab_corpus_backup_${new Date().toISOString().slice(0,10)}.json`,'application/json');
    showToast('Corpus backup downloaded');
  };
  const handleClearCorpus = () => {
    setCorpus([]);
    setActiveThread(null);
    if (!accountUser) localStorage.removeItem(STORAGE_KEY);
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
      setCaptureNotice('Paste directly into the field with Ctrl+V or Command+V.');
    }
  };
  const importConversationFile = async (file: File) => {
    try {
      if (file.type.startsWith('image/')) {
        setIsSupportOpen(true);
        setCaptureNotice('Use the artifact library to attach images as evidence.');
        return;
      }
      const imported=parseConversationFile(await file.text(),file.name,corpus);
      if(!imported.length){setCaptureNotice('These conversations are already in your library.');return;}
      setCorpus(old=>[...imported,...old]);setActiveThread(imported[0]);setWorkspaceTab('transcript');openPage('capture');
      setCaptureNotice(imported.length+' conversation(s) imported. Existing conversations were preserved.');
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
    <div className="cg-app cg-v2 min-h-screen text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      {accountOpen && <ChatGPTConnectionPanel onClose={() => setAccountOpen(false)} />}
      {cloud && !libraryReady && <div className="fixed inset-0 z-[90] bg-white/90 grid place-items-center"><p className="text-slate-700 font-semibold">Opening your private library…</p></div>}
      {/* Main Header */}
      <Header
        onOpenNavigation={()=>setMobileNavigation(true)}
        page={page}
        onNavigate={openPage}
        corpusCount={corpus.length}
        onOpenCapture={() => openPage('capture')}
        onOpenCorpus={() => openPage('library')}
        onOpenChat={() => setIsChatbotOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCorpusBackup={handleExportCorpusBackup}
        onClearCorpus={handleClearCorpus}
        onOpenAccount={() => setAccountOpen(true)}
        accountLabel={accountUser?.user_metadata?.display_name || (accountUser ? 'My Profile' : 'ChatGPT connection')}
      />
      <div className="cg-body">
      <WorkspaceNavigation page={navigationPage} onNavigate={openPage} collapsed={sidebarCollapsed} onCollapse={toggleSidebar} mobileOpen={mobileNavigation} onClose={closeNavigation}/>
      {/* Workspace Area */}
      <main className="cg-main flex-1 w-full p-4 sm:p-6 space-y-5">
        {(page === 'library' || page === 'organize') ? (
          <LibraryExplorer key={accountUser?.id || 'guest'} threads={corpus} storageScope={accountUser?.id || 'guest'} analysis={false}
            onBack={()=>openPage('workspace')} onRenameThread={handleRenameThread}
            onOpenThread={(thread,tab)=>{setActiveThread(thread);setWorkspaceTab(tab);openPage('capture');}}
            onImport={()=>setIsSupportOpen(true)} onOpenLegacy={()=>setIsCorpusOpen(true)} />
        ) : (page === 'artifacts' || page === 'support') ? (
          <SupportMaterialModal inline isOpen onClose={()=>openPage('workspace')} threads={corpus} activeThread={activeThread} onAssetLinked={handleAssetLinked}/>
        ) : page === 'analyze' ? (
          <ManualAnalysisPage onOpenAdvanced={()=>{openPage('workspace');setTimeout(()=>document.getElementById('workspace-analytics')?.scrollIntoView({block:'start'}),75);}}/>
        ) : page === 'media' ? (
          <MediaLibrary onTutorial={()=>openPage('guide')} onCapture={()=>openPage('capture')}/>
        ) : page === 'guide' ? (
          <OnboardingGuideModal inline isOpen onClose={()=>{}} onStartCapture={()=>openPage('capture')}/>
        ) : page === 'bridge' ? (
          <CrewBridge threads={corpus}/>
        ) : page === 'export' ? (
          <section className="cg-destination"><h1>Export your conversations</h1><p>Save a portable JSON backup, or choose a conversation for Markdown, JSON and print-to-PDF.</p><div className="cg-destination-panel"><h2>Library backup</h2><p>{corpus.length} saved conversations. Supporting file originals remain in this browser; download those separately from Artifacts.</p><DownloadFile text={JSON.stringify(corpus,null,2)} filename={`chatgrab-library-${new Date().toISOString().slice(0,10)}.json`} type="application/json" disabled={!corpus.length} className="inline-block border rounded-lg px-4 py-3 mt-3 text-blue-700 font-bold">Download library JSON</DownloadFile></div><div className="cg-destination-panel"><h2>Conversation exports</h2>{corpus.length?corpus.map(thread=><div className="cg-export-row" key={thread.id}><div><strong>{thread.title}</strong><small>{thread.messages.length} messages · {new Date(thread.capturedAt).toLocaleString()}</small></div><button onClick={()=>{setActiveThread(thread);setIsExportOpen(true);}}>Export {thread.title}</button></div>):<p>Capture a conversation to enable exports.</p>}</div></section>
        ) : page === 'settings' ? (
          <section className="cg-destination"><h1>Settings</h1><div className="cg-destination-panel"><h2>Account and storage</h2><p>{accountUser?'Your conversation library is linked to your account.':'Your conversation library is saved in this browser.'} Supporting file originals are stored locally in IndexedDB.</p><button onClick={()=>setAccountOpen(true)}>ChatGPT connection</button><button onClick={()=>openPage('export')}>Backup and export</button></div><div className="cg-destination-panel"><h2>Navigation</h2><p>The desktop sidebar preference is saved on this device.</p><button onClick={toggleSidebar}>{sidebarCollapsed?'Expand desktop sidebar':'Collapse desktop sidebar'}</button><button onClick={()=>openPage('guide')}>Open capture guide</button></div></section>
        ) : page === 'capture' ? (<div className="cg-capture-original">
        {/* If no conversation is active: visual landing workspace */}
        <>
          <div className="space-y-5 my-1">
            <section className="cg-hero cg-capture-hero relative overflow-hidden rounded-[2rem] shadow-sm">
              <div className="cg-hero-glow" aria-hidden="true"/>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-28 left-1/3 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
              <div className="cg-hero-content relative grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-center p-6 sm:p-9 lg:p-12">
                <HeroIntro/>
                <div className="cg-globe-visual">
                  <img src="/images/capture-globe-metal.png" alt="A connected globe with conversation panels, images, documents and audio" className="cg-globe-image" fetchPriority="high" />
                </div>
              </div>
              <form id="cg-capture" onSubmit={handleQuickCaptureSubmit} className="cg-capture relative mx-5 sm:mx-9 lg:mx-12 mb-7 sm:mb-9 p-3 sm:p-4 rounded-2xl bg-white/95 border border-blue-100 shadow-[0_12px_35px_rgba(29,78,216,.10)] grid lg:grid-cols-[1fr_auto] gap-2">
                <div className="flex items-center gap-2 px-3 h-12 rounded-xl border border-slate-200 bg-white">
                  <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <input aria-label="ChatGPT share link or conversation text" value={quickUrl} onChange={e => { setQuickUrl(e.target.value); setQuickCaptureError(null); setCaptureNotice(null); }} placeholder="Paste a public ChatGPT share URL…" className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400" />
                </div>
                <button type="submit" disabled={isQuickCapturing} className="h-12 px-5 rounded-xl bg-[#0d5ed7] hover:bg-[#084fb9] text-white text-sm font-bold flex items-center justify-center gap-2">{isQuickCapturing ? "Capturing…" : "Capture Thread"} <ArrowRight className="w-4 h-4" /></button>
                {captureNotice && <div role="status" className="lg:col-span-2 text-sm text-emerald-700 px-2">{captureNotice}</div>}
                {quickCaptureError && <div role="alert" className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{quickCaptureError}</div>}
                <div className="lg:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-blue-100">
                  <button type="button" onClick={() => void handleQuickPaste()} className="px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded-lg">Paste from clipboard</button>
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
            <section id="cg-workspace" className="cg-workspace rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 sm:p-7 shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div><div className="text-[11px] font-bold uppercase tracking-[.2em] text-blue-600">Continuity library</div><h3 className="text-2xl font-black text-[#102a56]">Your Workspace</h3><p className="text-sm text-slate-500">Captured conversations, organized and ready for review.</p></div>
                <button type="button" onClick={() => setIsCorpusOpen(true)} className="px-4 py-2 rounded-xl border border-blue-200 text-blue-700 font-semibold text-sm">Browse Library ({corpus.length})</button>
              </div>
              {corpus.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {corpus.slice(0, 6).map(thread => (
                    <button key={thread.id} type="button" onClick={() => { setActiveThread(thread); setWorkspaceTab('transcript'); }} className="text-left rounded-2xl p-4 bg-gradient-to-br from-[#10264e] to-[#184c89] text-white shadow-lg hover:shadow-xl transition">
                      <MessageSquare className="w-6 h-6 mb-4 text-sky-300" />
                      <div className="font-bold text-base line-clamp-2">{thread.title}</div>
                      <div className="text-xs text-blue-200 mt-3">{thread.messages.length} messages · {new Date(thread.capturedAt).toLocaleDateString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-7 text-center">
                  <Database className="w-9 h-9 mx-auto text-blue-600 mb-2" />
                  <p className="text-slate-700 font-semibold">Your first captured conversation will appear here, ready to explore.</p>
                </div>
              )}
            </section>
            <ChatGrabDashboard page="workspace" count={corpus.length} onNavigate={openPage}
              onOpenLibrary={()=>openPage('library')} onOpenSupport={()=>openPage('support')}
              onOpenGuide={()=>openPage('guide')} onExport={()=>{if(activeThread)setIsExportOpen(true);else handleExportCorpusBackup();}}
              onAnalyze={()=>openPage('analyze')}
              onReintegrate={()=>{if(activeThread){setWorkspaceTab('portions');openPage('capture');}else{requestedThreadTab.current='portions';setIsCorpusOpen(true);}}}
              onAccount={()=>setAccountOpen(true)} />
          </div>
          {activeThread && (
          /* Active Thread Workspace */
          <div id="cg-active-thread" className="space-y-5" style={{scrollMarginTop:160}}>
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
        </div>) : (
          <>
          <ChatGrabDashboard
            page={page}
            onAnalyze={()=>openPage('analyze')}
            onReintegrate={()=>{if(activeThread){setWorkspaceTab('portions');openPage('capture');}else{requestedThreadTab.current='portions';setIsCorpusOpen(true);}}}
            onAccount={()=>setAccountOpen(true)}
            count={corpus.length}
            onNavigate={openPage}
            onOpenLibrary={()=>openPage('library')}
            onOpenSupport={()=>openPage('support')}
            onOpenGuide={()=>openPage('guide')}
            onExport={()=>{if(activeThread)setIsExportOpen(true);else if(corpus.length)handleExportCorpusBackup();else openPage('capture');}}
          />
          {page==='workspace' && <>
            <ContinuityWorkspace threads={corpus} mode="analytics" onOpenThread={(thread)=>{setActiveThread(thread);setWorkspaceTab('transcript');openPage('capture');}} />
            <ContinuityWorkspace onSaveDerived={thread=>{setCorpus(old=>[thread,...old]);showToast("Saved a derived continuity record; original conversations are unchanged.");}} onUpdateDerived={thread=>setCorpus(old=>old.map(item=>item.id===thread.id?thread:item))} threads={corpus} mode="reintegrate" onOpenThread={(thread)=>{setActiveThread(thread);setWorkspaceTab('transcript');openPage('capture');}} />
          </>}
          </>
        )}
      </main>
      </div>
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
          openPage('capture');
          setActiveThread(t);
          setWorkspaceTab(requestedThreadTab.current);
          requestedThreadTab.current='transcript';
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
      {/* Floating Action Button for ChatGPT Chatbot */}
      {!isChatbotOpen && (
        <button
          type="button"
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all cursor-pointer active:scale-95 group"
          aria-label="Conversation assistant" title="Open ChatGPT Multi-Turn Assistant"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>ChatGPT Assistant</span>
        </button>
      )}
      {/* ChatGPT Multi-Turn Chatbot */}
      <ChatGPTCompanion
        isOpen={isChatbotOpen}
        onClose={closeCompanion}
        activeThread={activeThread}
        threads={corpus}
        page={navigationPage}
      />
    </div>
  );
}

