import React, { useState, useEffect } from 'react';
import { X, Clipboard, ArrowRight, Loader2, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConversationThread } from '../types';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreadCaptured: (thread: ConversationThread) => void;
  initialUrl?: string;
  onOpenSupport?: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  onThreadCaptured,
  initialUrl,
  onOpenSupport,
}) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [rawText, setRawText] = useState('');
  const [mode, setMode] = useState<'url' | 'raw'>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rectifiedNotice, setRectifiedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      setMode('url');
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  // Regex to extract clean ChatGPT public share URL from any message text (e.g. Zoom chat, Slack, email)
  const extractChatGPTUrl = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/(https?:\/\/(?:chatgpt\.com|chat\.openai\.com)\/share\/[a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  const handleUrlChange = (value: string) => {
    const extracted = extractChatGPTUrl(value);
    if (extracted && extracted !== value.trim()) {
      setUrl(extracted);
      setRectifiedNotice(`Rectified link from message: ${extracted}`);
      setError(null);
    } else {
      setUrl(value);
      if (extracted) {
        setRectifiedNotice(null);
        setError(null);
      }
    }
  };

  const handleRawTextChange = (value: string) => {
    setRawText(value);
    const extracted = extractChatGPTUrl(value);
    if (extracted) {
      // Automatically rectify if user pasted a Zoom/chat message containing a ChatGPT share link
      setUrl(extracted);
      setMode('url');
      setRectifiedNotice(`Detected ChatGPT share link in message: ${extracted}`);
      setError(null);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const extracted = extractChatGPTUrl(text);
        if (extracted) {
          setUrl(extracted);
          setMode('url');
          setRectifiedNotice(`Rectified ChatGPT share URL from clipboard: ${extracted}`);
          setError(null);
        } else if (text.startsWith('http://') || text.startsWith('https://')) {
          setUrl(text.trim());
          setMode('url');
          setRectifiedNotice(null);
        } else {
          setRawText(text);
          setMode('raw');
          setRectifiedNotice(null);
        }
      }
    } catch {
      // If clipboard permission is denied, focus input
      const input = document.getElementById('chatgpt-url-input');
      input?.focus();
    }
  };

  const handleCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Extract any ChatGPT URL in either field
    const extractedFromUrl = extractChatGPTUrl(url);
    const extractedFromRaw = extractChatGPTUrl(rawText);
    const targetUrl = extractedFromUrl || extractedFromRaw || (mode === 'url' ? url.trim() : null);

    if (targetUrl && !extractChatGPTUrl(targetUrl)) {
      setError('That is not a public ChatGPT share link. In ChatGPT, use the three-dot menu → Share → Copy link. The link must contain /share/.');
      return;
    }

    if (targetUrl) {
      // URL ingestion mode with rectified URL
      setUrl(targetUrl);
    } else if (mode === 'url') {
      if (!url.trim()) {
        setError('Please paste a ChatGPT share URL.');
        return;
      }
      setError('Please provide a valid public ChatGPT share link (e.g., https://chatgpt.com/share/...)');
      return;
    } else {
      if (!rawText.trim() || rawText.trim().length < 20) {
        setError('Please enter or paste conversation transcript text.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // 1. Ingest share or raw text
      const payload = targetUrl
        ? { url: targetUrl }
        : { rawText: rawText.trim() };

      const res = await fetch('/api/fetch-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('The ChatGrab capture server did not return a valid response. The API may be unavailable; please try again shortly.');
      }

      if (!res.ok || !data.success) {
        if (data.allowFallbackPaste) {
          setError('Public page could not be read directly. You can paste the conversation transcript text directly.');
          setMode('raw');
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to capture thread');
      }

      const capturedThread: ConversationThread = {
        id: `thread-${Date.now()}`,
        title: data.data.title || 'Captured Conversation',
        sourceUrl: data.data.sourceUrl || targetUrl || undefined,
        capturedAt: new Date().toISOString(),
        originalCreatedAt: data.data.originalCreatedAt || new Date().toISOString(),
        model: data.data.model || 'GPT-4o',
        messages: data.data.messages || [],
      };

      // 2. Automatically generate intelligence with ChatGPT
      try {
        const analyzeRes = await fetch('/api/analyze-thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: capturedThread.title,
            messages: capturedThread.messages,
          }),
        });

        if (analyzeRes.ok) {
          const analyzeData = await analyzeRes.json();
          if (analyzeData.success && analyzeData.insights) {
            capturedThread.insights = analyzeData.insights;
          }
        }
      } catch (analyzeErr) {
        console.warn('Initial analysis background warning:', analyzeErr);
      }

      onThreadCaptured(capturedThread);
      onClose();
      setUrl('');
      setRawText('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not fetch thread. Try pasting conversation text or testing a sample.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
          {/* Left Column: Form and Actions */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category Kicker */}
              <div className="text-[11px] font-bold tracking-widest text-[#2f558a] uppercase mb-2">
                UNIFY • ANALYZE • PRESERVE • REINTEGRATE
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091e42] tracking-tight leading-tight mb-2.5">
                Turn conversations into connected knowledge.
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Bring in a public ChatGPT share URL. ChatGrab preserves the source, analyzes the record, and connects it to your corpus.
              </p>

              {/* Mode Selector */}
              <div className="flex items-center gap-3 mb-4 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('url'); setError(null); }}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    mode === 'url' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ChatGPT Share URL
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('raw'); setError(null); }}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    mode === 'raw' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Paste Raw Conversation
                </button>
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="pb-1 font-semibold text-slate-500 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Upload File / Artifact
                </button>
              </div>

              {mode === 'url' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="chatgpt-url-input" className="text-xs font-semibold text-slate-800">
                      Paste a public ChatGPT share URL
                    </label>
                  </div>

                  {/* Paste Clipboard Button */}
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Paste Clipboard</span>
                    </button>
                  </div>

                  {/* Input and Capture Button Form */}
                  <form onSubmit={handleCapture} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="chatgpt-url-input"
                        type="text"
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://chatgpt.com/share/... (or paste Zoom chat message)"
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e274c] hover:bg-[#163666] text-white font-medium text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-95 shrink-0"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>Capture Thread</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Rectified Link Notification */}
                    {rectifiedNotice && (
                      <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{rectifiedNotice}</span>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <form onSubmit={handleCapture} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-800">
                      Paste conversation transcript or dialogue
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Paste from clipboard
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => handleRawTextChange(e.target.value)}
                    placeholder="User: How do we scale Redis caching?&#10;Assistant: You should use a multi-tiered topology..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />

                  {/* Rectified Link Notification in raw mode */}
                  {rectifiedNotice && (
                    <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{rectifiedNotice}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0e274c] hover:bg-[#163666] text-white font-medium text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Parsing & Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Ingest & Connect</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Error feedback */}
              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Helper Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Supports share links, raw transcripts, and linked support files</span>
              <span className="font-medium text-slate-500">Stored locally in your corpus</span>
            </div>
          </div>

          {/* Right Column: Visual illustration matching screenshot SS1.jpeg */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-sky-100/60 p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100 relative overflow-hidden">
            {/* Soft background radial glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-200/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />

            {/* Connected Knowledge Graphic */}
            <div className="relative w-full max-w-[320px] py-4">
              {/* Top Card: ChatGPT Chat Card */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-white/80 mb-3 ml-2 transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#10a37f] flex items-center justify-center text-white shadow-xs">
                    {/* OpenAI ChatGPT Logo Spiral */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22.28 9.87a5.98 5.98 0 0 0-.52-4.94 6.07 6.07 0 0 0-6.52-2.82 6.02 6.02 0 0 0-4.66-2.11 6.07 6.07 0 0 0-5.78 4.2 6.03 6.03 0 0 0-3.9 2.83 6.07 6.07 0 0 0 .74 7.12 5.98 5.98 0 0 0 .52 4.94 6.07 6.07 0 0 0 6.52 2.82 6.02 6.02 0 0 0 4.66 2.11 6.07 6.07 0 0 0 5.78-4.2 6.03 6.03 0 0 0 3.9-2.83 6.07 6.07 0 0 0-.74-7.12zm-8.8 11.23a4.57 4.57 0 0 1-3.04-1.18l.15-.08 5.04-2.91a.76.76 0 0 0 .38-.66v-7.1l2.14 1.23a.08.08 0 0 1 .05.06v5.82a4.59 4.59 0 0 1-4.72 4.82z" />
                    </svg>
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="w-24 h-2 bg-slate-200 rounded-full" />
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="space-y-1.5 pl-8">
                  <div className="w-full h-2 bg-slate-100 rounded-full" />
                  <div className="w-4/5 h-2 bg-slate-100 rounded-full" />
                </div>
              </div>

              {/* Bottom Card: User Profile Bubble */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-white/80 mr-4 transform rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="w-20 h-2 bg-slate-200 rounded-full" />
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="w-full h-2.5 bg-blue-50 rounded-full pl-8" />
              </div>

              {/* Connected Flow Lines / Synapses SVG */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 flex flex-col gap-2.5">
                {/* JSON Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-xl shadow-md border border-slate-100 text-xs font-semibold text-slate-800 transition-transform hover:scale-105">
                  <span className="font-mono text-blue-600 font-bold">{'{ }'}</span>
                  <span>JSON</span>
                </div>

                {/* PDF Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-xl shadow-md border border-slate-100 text-xs font-semibold text-slate-800 transition-transform hover:scale-105">
                  <div className="w-4 h-4 bg-rose-500 rounded text-white flex items-center justify-center text-[9px] font-bold">
                    PDF
                  </div>
                  <span>PDF</span>
                </div>

                {/* INSIGHTS Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-xl shadow-md border border-slate-100 text-xs font-semibold text-slate-800 transition-transform hover:scale-105">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-1 h-1.5 bg-amber-500 rounded-xs" />
                    <span className="w-1 h-2.5 bg-amber-500 rounded-xs" />
                    <span className="w-1 h-3.5 bg-amber-500 rounded-xs" />
                  </div>
                  <span className="tracking-wide">INSIGHTS</span>
                </div>
              </div>

              {/* Flowing background curve lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 300 200">
                <path d="M 120 70 C 180 70, 200 45, 260 45" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeDasharray="4 4" />
                <path d="M 140 120 C 190 120, 210 100, 260 100" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
                <path d="M 130 140 C 180 150, 200 155, 260 155" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
