import React, { useState } from 'react';
import {
  X,
  Database,
  Search,
  Sparkles,
  BookOpen,
  Calendar,
  MessageSquare,
  ArrowRight,
  Star,
  Trash2,
  Tag,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { ConversationThread, CorpusQueryResponse } from '../types';

interface CorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpus: ConversationThread[];
  activeThreadId?: string;
  onSelectThread: (thread: ConversationThread) => void;
  onDeleteThread: (threadId: string) => void;
  onToggleFavorite: (threadId: string) => void;
  onOpenNewCapture: () => void;
}

export const CorpusModal: React.FC<CorpusModalProps> = ({
  isOpen,
  onClose,
  corpus,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  onToggleFavorite,
  onOpenNewCapture,
}) => {
  const [activeTab, setActiveTab] = useState<'threads' | 'ask'>('threads');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Ask Corpus AI State
  const [askQuery, setAskQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askResult, setAskResult] = useState<CorpusQueryResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(corpus.flatMap((t) => t.insights?.tags || []))
  ).slice(0, 15);

  const filteredThreads = corpus.filter((t) => {
    if (selectedTag && !t.insights?.tags?.includes(selectedTag)) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inSummary = t.insights?.summary?.toLowerCase().includes(q);
      const inMessages = t.messages.some((m) => m.content.toLowerCase().includes(q));
      return inTitle || inSummary || inMessages;
    }
    return true;
  });

  const handleAskCorpus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!askQuery.trim() || isAsking) return;

    setIsAsking(true);
    setAskError(null);
    setAskResult(null);

    try {
      const threadData = corpus.map((t) => ({
        id: t.id,
        title: t.title,
        summary: t.insights?.summary,
        keyTakeaways: t.insights?.keyTakeaways,
        messagesSample: t.messages.map((m) => `${m.role}: ${m.content.slice(0, 300)}`).join('\n'),
      }));

      const res = await fetch('/api/corpus/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: askQuery.trim(),
          threads: threadData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to query corpus');
      }

      setAskResult({
        answer: data.answer,
        relevantThreadIds: data.relevantThreadIds || [],
        keyQuotes: data.keyQuotes || [],
      });
    } catch (err: any) {
      console.error(err);
      setAskError(err.message || 'Error querying your connected corpus.');
    } finally {
      setIsAsking(false);
    }
  };

  const totalMessagesCount = corpus.reduce((acc, t) => acc + t.messages.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Connected Corpus</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {corpus.length} threads indexed
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Your unified knowledge library across all captured conversations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNewCapture();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture New</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-100">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('threads')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'threads'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>All Threads ({corpus.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'ask'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ask Corpus (Cross-Thread AI)</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 pb-2 font-mono">
            <span>{totalMessagesCount} messages stored</span>
            <span>•</span>
            <span>{allTags.length} active topics</span>
          </div>
        </div>

        {/* Tab 1: All Threads */}
        {activeTab === 'threads' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search and Tag filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search across titles, takeaways, and messages..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {selectedTag && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <span>Filtered: #{selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-blue-900 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Tags Ribbon */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 text-[11px] shrink-0 font-medium">Topics:</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Thread Cards List */}
            {filteredThreads.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No threads found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search or capture a new conversation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredThreads.map((thread) => {
                  const isActive = thread.id === activeThreadId;

                  return (
                    <div
                      key={thread.id}
                      className={`group p-4 sm:p-5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-400'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {thread.model || 'GPT-4o'}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(thread.capturedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {thread.messages.length} msgs
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              onSelectThread(thread);
                              onClose();
                            }}
                            className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {thread.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(thread.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              thread.isFavorite
                                ? 'text-amber-500 bg-amber-50'
                                : 'text-slate-300 hover:text-slate-600'
                            }`}
                            title="Favorite"
                          >
                            <Star className={`w-4 h-4 ${thread.isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove "${thread.title}" from corpus?`)) {
                                onDeleteThread(thread.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete thread"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Summary Snippet */}
                      {thread.insights?.summary && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                          {thread.insights.summary}
                        </p>
                      )}

                      {/* Footer: Tags and Open Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(thread.insights?.tags || []).slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectThread(thread);
                            onClose();
                          }}
                          className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          <span>{isActive ? 'Currently Active' : 'Load Thread'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ask Corpus (Cross-thread AI Synthesizer) */}
        {activeTab === 'ask' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cross-Conversation Synthesizer
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Query across all {corpus.length} saved threads simultaneously. ChatGrab synthesizes insights, compares decisions, and provides verified citations.
              </p>

              {/* Query suggestions if corpus has threads */}
              {corpus.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500">Try asking:</span>
                  {[
                    'Summarize all pending action items',
                    'What were the key technical decisions?',
                    'Synthesize core insights across all saved conversations',
                  ].map((sampleQ, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAskQuery(sampleQ);
                      }}
                      className="text-xs bg-white hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      "{sampleQ}"
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mb-3 italic">
                  No conversations saved in your corpus yet. Capture a public ChatGPT share URL to start querying your knowledge base.
                </p>
              )}

              {/* Ask Input Form */}
              <form onSubmit={handleAskCorpus} className="flex gap-2">
                <input
                  type="text"
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  placeholder="Ask a question across all your saved conversations..."
                  className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={isAsking || !askQuery.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isAsking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Ask Corpus</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error */}
            {askError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {askError}
              </div>
            )}

            {/* Result */}
            {askResult && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Corpus Synthesis
                  </h4>
                </div>

                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {askResult.answer}
                </div>

                {/* Key Quotes / Citations */}
                {askResult.keyQuotes && askResult.keyQuotes.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Direct Citations & Grounding
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {askResult.keyQuotes.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                        >
                          <span className="font-semibold text-blue-700 block mb-1">
                            Source: {q.threadTitle}
                          </span>
                          <span className="italic">"{q.quote}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
