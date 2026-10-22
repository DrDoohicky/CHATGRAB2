import {DownloadFile} from './DownloadFile';
import React, { useState } from 'react';
import {createPortal} from 'react-dom';
import './print-report.css';
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
  const markdown = (() => {
    let md = `# ${thread.title}\n\n`;
    md += `*Captured by ChatGrab on ${new Date(thread.capturedAt).toLocaleString()}*\n`;
    if (thread.sourceUrl) {
      md += `*Original URL: ${thread.sourceUrl}*\n`;
    }
    md += `*Model: ${thread.model}*\n\n`;
    md += `*Conversation ID: ${thread.id}*\n\n`;
    if(thread.reintegrationMeta){
      md += `## Reviewed continuity record\nStatus: ${thread.reintegrationMeta.status}\nPurpose: ${thread.reintegrationMeta.purpose}\nConflict review: ${thread.reintegrationMeta.conflictReview}\n\n`;
    }
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
      md += `### ${msg.role} · ${msg.id}${msg.timestamp?' ('+msg.timestamp+')':''}\n\n`;
      if(msg.sourceThreadId)md += `Source conversation: ${msg.sourceThreadId} · source message: ${msg.sourceMessageId || 'unavailable'}\n\n`;
      md += `${msg.content}\n\n---\n\n`;
    });
    return md;
  })();
  const handleCopyLink = async () => {
    const shareUrl = thread.sourceUrl;
    if(!shareUrl)return;
    try{await navigator.clipboard.writeText(shareUrl);}catch{setCopiedType('failed');return;}
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 2000);
  };
  return (
    <>
    {createPortal(<article id="chatgrab-print-report"><h1>{thread.title}</h1><p>Captured {new Date(thread.capturedAt).toLocaleString()} · {thread.model}</p>{thread.sourceUrl&&<p>Source: {thread.sourceUrl}</p>}{thread.insights&&<section><h2>Summary</h2><p>{thread.insights.summary}</p></section>}<h2>Original transcript</h2>{thread.messages.map(m=><section key={m.id}><h3>{m.role} · {m.id}</h3>{m.sourceThreadId&&<p>Source: {m.sourceThreadId} / {m.sourceMessageId}</p>}<p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{m.content}</p></section>)}</article>,document.body)}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close export"
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
        {copiedType==='failed'&&<p role="alert">Clipboard access was denied. Copy the source URL from the transcript instead.</p>}
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
          <DownloadFile text={markdown} filename={`chatgrab-${thread.id}.md`} type="text/markdown;charset=utf-8"
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
          </DownloadFile>
          {/* 3. Export JSON */}
          <DownloadFile text={JSON.stringify(thread,null,2)} filename={`chatgrab-${thread.id}.json`} type="application/json"
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
          </DownloadFile>
          {/* 4. Copy Share Link */}
          <button
            onClick={handleCopyLink}
            disabled={!thread.sourceUrl}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Copy Original Share Link
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  {thread.sourceUrl || 'This imported conversation has no public share link'}
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
    </>
  );
};
