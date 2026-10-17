import React, { useState } from 'react';
import { Search, User, Bot, Copy, Check, MessageSquare, Clock, Filter } from 'lucide-react';
import { ConversationThread } from '../types';
import { MarkdownView } from './MarkdownView';

interface ThreadViewerProps {
  thread: ConversationThread;
}

export const ThreadViewer: React.FC<ThreadViewerProps> = ({ thread }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const filteredMessages = thread.messages.filter((msg) => {
    if (roleFilter !== 'all' && msg.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalWords = thread.messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);
  const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Speaker Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        {/* Search inside transcript */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript messages..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter by role & Metadata stats */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              All ({thread.messages.length})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'user' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              User
            </button>
            <button
              onClick={() => setRoleFilter('assistant')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'assistant' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Assistant
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 px-2">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {totalWords.toLocaleString()} words
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{readTimeMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No matching messages found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or speaker filter.</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedMsgId === msg.id;

            return (
              <div
                key={msg.id || index}
                className={`group relative rounded-2xl p-5 sm:p-6 transition-all ${
                  isUser
                    ? 'bg-slate-50 border border-slate-200/90'
                    : 'bg-white border border-slate-200 shadow-xs'
                }`}
              >
                {/* Header: Author & Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {isUser ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center text-white shadow-xs">
                        {/* OpenAI logo */}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M22.28 9.87a5.98 5.98 0 0 0-.52-4.94 6.07 6.07 0 0 0-6.52-2.82 6.02 6.02 0 0 0-4.66-2.11 6.07 6.07 0 0 0-5.78 4.2 6.03 6.03 0 0 0-3.9 2.83 6.07 6.07 0 0 0 .74 7.12 5.98 5.98 0 0 0 .52 4.94 6.07 6.07 0 0 0 6.52 2.82 6.02 6.02 0 0 0 4.66 2.11 6.07 6.07 0 0 0 5.78-4.2 6.03 6.03 0 0 0 3.9-2.83 6.07 6.07 0 0 0-.74-7.12zm-8.8 11.23a4.57 4.57 0 0 1-3.04-1.18l.15-.08 5.04-2.91a.76.76 0 0 0 .38-.66v-7.1l2.14 1.23a.08.08 0 0 1 .05.06v5.82a4.59 4.59 0 0 1-4.72 4.82z" />
                        </svg>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {isUser ? 'Prompt / User' : 'ChatGPT'}
                      </span>
                      {msg.model && (
                        <span className="ml-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {msg.model}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.timestamp && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    )}

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                      title="Copy full message"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Body with Markdown */}
                <div className="text-slate-800">
                  <MarkdownView content={msg.content} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
