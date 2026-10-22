import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Scissors,
  Clock,
  MessageSquare,
  Bot,
  User,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  BarChart2,
  Sliders,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { ConversationThread, AdaptivePortion, ChatMessage } from '../types';
import { MarkdownView } from './MarkdownView';

interface AdaptivePortionsViewProps {
  thread: ConversationThread;
  onOpenAssistantWithPortion?: (portion: AdaptivePortion, snippet: string) => void;
  onOpenAnalysis?: () => void;
}

export const AdaptivePortionsView: React.FC<AdaptivePortionsViewProps> = ({
  thread,
  onOpenAssistantWithPortion,
  onOpenAnalysis,
}) => {
  const [granularity, setGranularity] = useState<'macro' | 'standard' | 'detailed'>('standard');
  const [portionMode, setPortionMode] = useState<'semantic' | 'turn_budget' | 'word_budget'>('semantic');
  const [turnBudget, setTurnBudget] = useState<number>(25);
  const [portions, setPortions] = useState<AdaptivePortion[]>([]);
  const [selectedPortionId, setSelectedPortionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingPortionId, setAnalyzingPortionId] = useState<string | null>(null);
  const [portionAnalysisMap, setPortionAnalysisMap] = useState<Record<string, string>>({});

  // Color palette for the chronological ribbon
  const ribbonColors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
  ];

  // Helper to generate heuristic fallback portions when semantic API is pending or user selects turn/word budget
  const generateHeuristicPortions = (
    mode: 'turn_budget' | 'word_budget' | 'semantic',
    msgs: ChatMessage[],
    customTurnBudget: number = 25
  ): AdaptivePortion[] => {
    if (!msgs || msgs.length === 0) return [];

    const result: AdaptivePortion[] = [];

    if (mode === 'turn_budget') {
      const step = Math.max(5, customTurnBudget);
      let pIdx = 1;
      for (let i = 0; i < msgs.length; i += step) {
        const start = i;
        const end = Math.min(msgs.length - 1, i + step - 1);
        const slice = msgs.slice(start, end + 1);
        const firstUser = slice.find((m) => m.role === 'user');
        const titleSnippet = firstUser
          ? firstUser.content.slice(0, 48).replace(/\n/g, ' ')
          : `Milestone Phase ${pIdx}`;

        result.push({
          id: `portion-turn-${pIdx}`,
          title: `Portion ${pIdx}: ${titleSnippet}...`,
          summary: `Chronological block containing messages #${start + 1} through #${end + 1}. Covers user inquiries, code revisions, and assistant responses.`,
          startIndex: start,
          endIndex: end,
          messageCount: slice.length,
          keyTopics: [`Messages ${start + 1}–${end + 1}`, 'Turn Slice', `${slice.length} turns`],
          decisions: [
            `Processed ${slice.length} conversational exchanges.`,
            `User turns: ${slice.filter((m) => m.role === 'user').length}, Assistant turns: ${slice.filter((m) => m.role === 'assistant').length}`,
          ],
        });
        pIdx++;
      }
      return result;
    }

    if (mode === 'word_budget') {
      // Chunk by approximately 1,500 words
      const targetWords = 1500;
      let currentWordCount = 0;
      let startIdx = 0;
      let pIdx = 1;

      for (let i = 0; i < msgs.length; i++) {
        const wCount = (msgs[i].content || '').split(/\s+/).length;
        currentWordCount += wCount;

        if (currentWordCount >= targetWords || i === msgs.length - 1) {
          const slice = msgs.slice(startIdx, i + 1);
          const firstUser = slice.find((m) => m.role === 'user');
          const titleSnippet = firstUser
            ? firstUser.content.slice(0, 45).replace(/\n/g, ' ')
            : `Reading Portion ${pIdx}`;

          result.push({
            id: `portion-word-${pIdx}`,
            title: `Portion ${pIdx}: ${titleSnippet}`,
            summary: `Content slice with ~${currentWordCount.toLocaleString()} words spanning messages #${startIdx + 1} to #${i + 1}.`,
            startIndex: startIdx,
            endIndex: i,
            messageCount: slice.length,
            keyTopics: [`~${currentWordCount} words`, `Msgs #${startIdx + 1}–${i + 1}`],
            decisions: [`Optimized for ~${Math.ceil(currentWordCount / 200)} min reading time.`],
          });
          pIdx++;
          startIdx = i + 1;
          currentWordCount = 0;
        }
      }
      return result;
    }

    // Default semantic-style heuristic breakdown for long threads
    const total = msgs.length;
    const slicesCount = granularity === 'macro' ? 3 : granularity === 'detailed' ? 8 : 5;
    const chunkSize = Math.max(2, Math.ceil(total / slicesCount));

    for (let i = 0; i < slicesCount; i++) {
      const start = i * chunkSize;
      if (start >= total) break;
      const end = Math.min(total - 1, (i + 1) * chunkSize - 1);
      const slice = msgs.slice(start, end + 1);
      const userPrompt = slice.find((m) => m.role === 'user');
      const sampleTopic = userPrompt
        ? userPrompt.content.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '')
        : `Phase ${i + 1}`;

      result.push({
        id: `portion-semantic-fallback-${i + 1}`,
        title: `Phase ${i + 1}: ${sampleTopic || 'Milestone Development'}`,
        summary: `Strategic portion analyzing messages #${start + 1} to #${end + 1}. Focuses on specifications, implementation steps, and architecture details.`,
        startIndex: start,
        endIndex: end,
        messageCount: slice.length,
        keyTopics: ['Architecture', 'Execution', `Milestone ${i + 1}`],
        decisions: ['Established milestone objectives and code structure.'],
      });
    }

    return result;
  };

  // Fetch AI Semantic Portions via ChatGPT endpoint
  const fetchSemanticPortions = async () => {
    if (!thread || thread.messages.length === 0) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/adaptive-portions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: thread.title,
          messages: thread.messages,
          granularity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.portions) && data.portions.length > 0) {
        setPortions(data.portions);
        if (!selectedPortionId || !data.portions.some((p: AdaptivePortion) => p.id === selectedPortionId)) {
          setSelectedPortionId(data.portions[0].id);
        }
      } else {
        // Fallback to heuristic semantic portions
        const fallback = generateHeuristicPortions('semantic', thread.messages);
        setPortions(fallback);
        if (fallback.length > 0) setSelectedPortionId(fallback[0].id);
      }
    } catch (err) {
      console.warn('Semantic portions fetch failed, using heuristic layout:', err);
      const fallback = generateHeuristicPortions('semantic', thread.messages);
      setPortions(fallback);
      if (fallback.length > 0) setSelectedPortionId(fallback[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate portions on mount or mode change
  useEffect(() => {
    if (portionMode === 'semantic') {
      fetchSemanticPortions();
    } else {
      const p = generateHeuristicPortions(portionMode, thread.messages, turnBudget);
      setPortions(p);
      if (p.length > 0) setSelectedPortionId(p[0].id);
    }
  }, [thread.id, portionMode, granularity, turnBudget]);

  const activePortion = useMemo(() => {
    return portions.find((p) => p.id === selectedPortionId) || portions[0] || null;
  }, [portions, selectedPortionId]);

  const activePortionMessages = useMemo(() => {
    if (!activePortion || !thread.messages) return [];
    return thread.messages.slice(activePortion.startIndex, activePortion.endIndex + 1);
  }, [activePortion, thread.messages]);

  // Filtered messages inside active portion
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return activePortionMessages;
    const q = searchQuery.toLowerCase();
    return activePortionMessages.filter(
      (m) => m.content.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
    );
  }, [activePortionMessages, searchQuery]);

  // Deep analyze a specific portion with ChatGPT
  const handleAnalyzePortion = async (portion: AdaptivePortion) => {
    setAnalyzingPortionId(portion.id);
    try {
      const snippet = thread.messages
        .slice(portion.startIndex, portion.endIndex + 1)
        .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 400)}`)
        .join('\n\n---\n\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Provide a focused executive analysis for Portion "${portion.title}" (messages #${portion.startIndex + 1} to #${portion.endIndex + 1}):
1. Key architectural or strategic decisions reached
2. Potential gaps, risks, or unverified claims
3. Immediate actionable next steps

Transcript snippet:
${snippet.slice(0, 15000)}`,
            },
          ],
          role: 'synthesizer',
          model: 'chatgpt-account',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.reply) {
        setPortionAnalysisMap((prev) => ({
          ...prev,
          [portion.id]: data.reply,
        }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAnalyzingPortionId(null);
    }
  };

  const handleCopyPortion = (portion: AdaptivePortion) => {
    const msgs = thread.messages.slice(portion.startIndex, portion.endIndex + 1);
    const md = `# ${portion.title}\n\n**Summary**: ${portion.summary}\n**Messages Range**: #${portion.startIndex + 1} to #${portion.endIndex + 1}\n\n---\n\n` +
      msgs.map((m) => `### ${m.role.toUpperCase()} (${m.timestamp || ''})\n\n${m.content}\n`).join('\n---\n\n');

    navigator.clipboard.writeText(md);
    setCopiedId(portion.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPortion = (portion: AdaptivePortion) => {
    const msgs = thread.messages.slice(portion.startIndex, portion.endIndex + 1);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      portionMeta: portion,
      threadTitle: thread.title,
      messages: msgs,
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${portion.id}_${thread.title.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSendToAssistant = (portion: AdaptivePortion) => {
    if (!onOpenAssistantWithPortion) return;
    const msgs = thread.messages.slice(portion.startIndex, portion.endIndex + 1);
    const snippet = msgs.map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 300)}`).join('\n\n');
    onOpenAssistantWithPortion(portion, snippet);
  };

  const totalWordsInActivePortion = activePortionMessages.reduce(
    (acc, m) => acc + (m.content || '').split(/\s+/).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Adaptive Portions Tool
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {portions.length} Portions
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
                Intelligently segment conversations of any length into digestible thematic phases, analytical slices, and actionable milestones.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl font-semibold">
              <button
                type="button"
                onClick={() => setPortionMode('semantic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  portionMode === 'semantic'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="AI-detected milestone and topic shifts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Semantic</span>
              </button>

              <button
                type="button"
                onClick={() => setPortionMode('turn_budget')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  portionMode === 'turn_budget'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Fixed turn chunks with slider"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Turn Slices</span>
              </button>

              <button
                type="button"
                onClick={() => setPortionMode('word_budget')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  portionMode === 'word_budget'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Reading budget chunks (~1500 words)"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reading Budget</span>
              </button>
            </div>

            {/* Granularity or Slider Control */}
            {portionMode === 'semantic' ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Scale:</span>
                {(['macro', 'standard', 'detailed'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setGranularity(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                      granularity === lvl
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            ) : portionMode === 'turn_budget' ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium">Turns/Portion:</span>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={turnBudget}
                  onChange={(e) => setTurnBudget(parseInt(e.target.value, 10))}
                  className="w-20 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-blue-700 w-6 text-right">
                  {turnBudget}
                </span>
              </div>
            ) : null}

            {/* Refresh / Re-portion Button */}
            <button
              type="button"
              onClick={() => {
                if (portionMode === 'semantic') fetchSemanticPortions();
                else setPortions(generateHeuristicPortions(portionMode, thread.messages, turnBudget));
              }}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Recalculate adaptive portions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Chronological Ribbon Distribution */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">Chronological Thread Distribution:</span>
            <span>
              {thread.messages.length} total messages • {portions.length} adaptive slices
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/80 p-0.5 gap-0.5">
            {portions.map((portion, idx) => {
              const span = Math.max(1, portion.endIndex - portion.startIndex + 1);
              const pct = (span / Math.max(1, thread.messages.length)) * 100;
              const colorClass = ribbonColors[idx % ribbonColors.length];
              const isSelected = portion.id === selectedPortionId;

              return (
                <div
                  key={portion.id}
                  onClick={() => setSelectedPortionId(portion.id)}
                  style={{ width: `${Math.max(2, pct)}%` }}
                  className={`h-full rounded-sm transition-all cursor-pointer ${colorClass} ${
                    isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-y-110' : 'opacity-85 hover:opacity-100'
                  }`}
                  title={`${portion.title} (Msgs #${portion.startIndex + 1}–#${portion.endIndex + 1}, ${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Portions Deck, Right Column Active Portion Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Portion Cards Deck */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Portion Deck ({portions.length})
            </h3>
            <span className="text-[11px] text-slate-400">Select to inspect & continue</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Analyzing conversation shifts & generating portions...</span>
            </div>
          ) : (
            portions.map((portion, idx) => {
              const isSelected = portion.id === selectedPortionId;
              const colorClass = ribbonColors[idx % ribbonColors.length];
              const spanCount = portion.endIndex - portion.startIndex + 1;

              return (
                <div
                  key={portion.id}
                  onClick={() => setSelectedPortionId(portion.id)}
                  className={`group relative p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {portion.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 font-medium">
                      #{portion.startIndex + 1}–#{portion.endIndex + 1}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {portion.summary}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400 font-medium">
                      {spanCount} {spanCount === 1 ? 'message' : 'messages'}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPortion(portion);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Copy portion text"
                      >
                        {copiedId === portion.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToAssistant(portion);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition-colors"
                        title="Send this portion to ChatGPT Assistant"
                      >
                        <Bot className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Portion Workspace & Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {activePortion ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Info */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Portion Range: Messages #{activePortion.startIndex + 1} to #{activePortion.endIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-[11px]">
                      ~{Math.max(1, Math.ceil(totalWordsInActivePortion / 200))} min read ({totalWordsInActivePortion.toLocaleString()} words)
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
                  {activePortion.title}
                </h3>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-4">
                  {activePortion.summary}
                </p>

                {/* Quick Action Buttons for this Portion */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSendToAssistant(activePortion)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Focus ChatGPT Assistant on this portion"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Focus AI Assistant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnalyzePortion(activePortion)}
                    disabled={analyzingPortionId === activePortion.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors cursor-pointer"
                    title="Run deep analysis on this slice"
                  >
                    {analyzingPortionId === activePortion.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    ) : (
                      <BarChart2 className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{analyzingPortionId === activePortion.id ? 'Analyzing Slice...' : 'Deep Analyze Portion'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyPortion(activePortion)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors cursor-pointer"
                    title="Copy markdown transcript"
                  >
                    {copiedId === activePortion.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === activePortion.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportPortion(activePortion)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors cursor-pointer"
                    title="Download portion JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Portion AI Analysis Box (if generated) */}
              {portionAnalysisMap[activePortion.id] && (
                <div className="p-5 bg-amber-50/60 border-b border-amber-200/80 animate-in fade-in">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Portion Analysis & Action Synthesis</span>
                  </div>
                  <div className="text-xs text-slate-800 bg-white p-4 rounded-xl border border-amber-200/60 shadow-2xs leading-relaxed">
                    <MarkdownView content={portionAnalysisMap[activePortion.id]} />
                  </div>
                </div>
              )}

              {/* Topics & Decisions pills */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700">Topics:</span>
                  {(activePortion.keyTopics || []).map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Search within this portion */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in portion..."
                    className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 sm:w-48"
                  />
                </div>
              </div>

              {/* Portion Messages Reader */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[560px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No messages matched your query in this portion.
                  </div>
                ) : (
                  filteredMessages.map((m, idx) => {
                    const isUser = m.role === 'user';
                    return (
                      <div
                        key={m.id || idx}
                        className={`p-4 rounded-2xl border text-xs sm:text-[13px] leading-relaxed ${
                          isUser
                            ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isUser ? (
                              <>
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-blue-900">User (Prompt)</span>
                              </>
                            ) : (
                              <>
                                <Bot className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-900">Assistant ({m.model || 'GPT-4o'})</span>
                              </>
                            )}
                          </div>
                          <span>{m.timestamp || `Turn #${activePortion.startIndex + idx + 1}`}</span>
                        </div>

                        <MarkdownView content={m.content} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p>Select a portion from the deck to inspect its transcript and decisions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
