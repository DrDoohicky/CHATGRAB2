import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Lightbulb,
  FileCheck2,
  Tag,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ThreadInsights, ConversationThread } from '../types';

interface InsightsViewProps {
  thread: ConversationThread;
  onUpdateInsights: (insights: ThreadInsights) => void;
  onReanalyze: () => Promise<void>;
  isAnalyzing: boolean;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  thread,
  onUpdateInsights,
  onReanalyze,
  isAnalyzing,
}) => {
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const insights = thread.insights;

  if (!insights) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Intelligence Generated Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Native ChatGPT analysis is pending connection approval for this website. Capture and organize your source conversations without an API key.
        </p>
        <button
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Conversation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Intelligence</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const toggleActionItem = (index: number) => {
    const updatedActionItems = [...insights.actionItems];
    updatedActionItems[index] = {
      ...updatedActionItems[index],
      done: !updatedActionItems[index].done,
    };
    onUpdateInsights({
      ...insights,
      actionItems: updatedActionItems,
    });
  };

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Refresh Action */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white rounded-2xl border border-blue-100 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Continuous Intelligence & Synthesis
            </h3>
            <p className="text-xs text-slate-600">
              Extracted insights, action items, and cross-model continuity prompts
            </p>
          </div>
        </div>

        <button
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
          title="Re-run deep analysis with ChatGPT"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}</span>
        </button>
      </div>

      {/* 1. Executive Summary */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Executive Summary
          </h4>
        </div>
        <p className="text-slate-800 text-sm sm:text-[15px] leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100 font-normal">
          {insights.summary}
        </p>

        {/* Tags */}
        {insights.tags && insights.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags:
            </span>
            {insights.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Grid: Key Takeaways & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Takeaways */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Key Takeaways
              </h4>
            </div>
            <ul className="space-y-3">
              {insights.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Action Items & Follow-ups
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {insights.actionItems.filter((a) => a.done).length}/{insights.actionItems.length} completed
              </span>
            </div>

            <div className="space-y-2.5">
              {insights.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleActionItem(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    item.done
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-400 line-through'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <button type="button" className="shrink-0 mt-0.5">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                  <div className="flex-1 text-xs sm:text-sm">
                    <p className={`font-medium ${item.done ? 'line-through' : ''}`}>
                      {item.task}
                    </p>
                    {item.context && (
                      <span className="inline-block mt-1 text-[11px] text-slate-400 font-mono no-underline">
                        [{item.context}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reintegration Prompts (Reintegration Engine) */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide text-white uppercase">
                Reintegration Engine (One-Click Hand-offs)
              </h4>
              <p className="text-xs text-blue-200/80">
                Plug this captured context directly back into Claude, Cursor, ChatGPT, or team docs to keep working.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.reintegrationPrompts.map((rp, idx) => {
            const isCopied = copiedPromptIdx === idx;

            return (
              <div
                key={idx}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-4 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-blue-200">{rp.label}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                      {rp.targetTool}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 italic mb-3">
                    "{rp.prompt}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(rp.prompt, idx)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Prompt!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Concepts & Entity Map */}
      {insights.concepts && insights.concepts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Key Concepts & Entities
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.concepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-xs text-slate-900">{concept.name}</h5>
                  {concept.category && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-700">
                      {concept.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {concept.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Q&A Index */}
      {insights.qaIndex && insights.qaIndex.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Q&A Digest
            </h4>
          </div>
          <div className="space-y-3">
            {insights.qaIndex.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-purple-600 font-mono">Q:</span>
                  <span>{item.question}</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 pl-4 border-l-2 border-purple-200">
                  <span className="text-emerald-600 font-mono font-bold">A:</span>
                  <span>{item.answer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
