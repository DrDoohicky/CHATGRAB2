import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, Printer, Share2, Code } from 'lucide-react';
import { ConversationThread } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: ConversationThread;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  thread,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(thread, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatgrab-${thread.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${thread.title}\n\n`;
    md += `*Captured by ChatGrab on ${new Date(thread.capturedAt).toLocaleString()}*\n`;
    if (thread.sourceUrl) {
      md += `*Original URL: ${thread.sourceUrl}*\n`;
    }
    md += `*Model: ${thread.model}*\n\n`;

    if (thread.insights) {
      md += `## Executive Summary\n${thread.insights.summary}\n\n`;
      md += `## Key Takeaways\n`;
      thread.insights.keyTakeaways.forEach((t) => {
        md += `- ${t}\n`;
      });
      md += `\n## Action Items\n`;
      thread.insights.actionItems.forEach((a) => {
        md += `- [${a.done ? 'x' : ' '}] ${a.task}${a.context ? ` (${a.context})` : ''}\n`;
      });
      md += `\n`;
    }

    md += `## Conversation Transcript\n\n`;
    thread.messages.forEach((msg) => {
      md += `### ${msg.role === 'user' ? 'User' : 'Assistant'} (${msg.timestamp || ''})\n\n`;
      md += `${msg.content}\n\n---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatgrab-${thread.id}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLink = () => {
    const shareUrl = thread.sourceUrl || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Export & Preserve</h3>
          <p className="text-xs text-slate-500 mt-1">
            Preserve and export "{thread.title}" into standard knowledge formats.
          </p>
        </div>

        <div className="space-y-3">
          {/* 1. Generate PDF */}
          <button
            onClick={handlePrintPDF}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Generate PDF / Print
                </p>
                <p className="text-xs text-slate-500">
                  Formatted document report with summary, takeaways & transcript
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Print
            </span>
          </button>

          {/* 2. Export Markdown */}
          <button
            onClick={handleDownloadMarkdown}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Export Markdown (.md)
                </p>
                <p className="text-xs text-slate-500">
                  Ready for Obsidian, Notion, Logseq, and developer wikis
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              .md
            </span>
          </button>

          {/* 3. Export JSON */}
          <button
            onClick={handleDownloadJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Export JSON (.json)
                </p>
                <p className="text-xs text-slate-500">
                  Full schema archive with messages, insights, and metadata
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              .json
            </span>
          </button>

          {/* 4. Copy Share Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Copy Share / Thread Link
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  {thread.sourceUrl || 'Applet thread reference'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1">
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
