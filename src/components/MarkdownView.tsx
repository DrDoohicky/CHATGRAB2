import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```...```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`prose prose-slate max-w-none text-slate-800 text-[14.5px] leading-relaxed ${className}`}>
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const firstLineEnd = part.indexOf('\n');
          let lang = 'code';
          let codeBody = '';
          if (firstLineEnd !== -1) {
            lang = part.slice(3, firstLineEnd).trim() || 'code';
            codeBody = part.slice(firstLineEnd + 1, -3).trim();
          } else {
            codeBody = part.slice(3, -3).trim();
          }

          const isCopied = copiedIndex === partIdx;

          return (
            <div key={partIdx} className="my-3.5 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-300">{lang}</span>
                <button
                  onClick={() => handleCopyCode(codeBody, partIdx)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-[11px]"
                  title="Copy code"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-[13px] font-mono text-slate-200 leading-normal selection:bg-blue-600/40">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Render standard markdown elements line by line or paragraph
        const lines = part.split('\n');
        return (
          <div key={partIdx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lineIdx} className="h-2" />;
              }

              // Headings
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-base font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2">
                    {renderInline(line.replace('### ', ''))}
                  </h3>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="text-lg font-bold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-200">
                    {renderInline(line.replace('## ', ''))}
                  </h2>
                );
              }
              if (line.startsWith('# ')) {
                return (
                  <h1 key={lineIdx} className="text-xl font-extrabold text-slate-900 mt-6 mb-3">
                    {renderInline(line.replace('# ', ''))}
                  </h1>
                );
              }

              // Blockquotes
              if (line.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-4 border-blue-500 pl-3.5 py-1 my-2 bg-blue-50/50 rounded-r text-slate-700 italic text-sm">
                    {renderInline(line.replace(/^>\s*/, ''))}
                  </blockquote>
                );
              }

              // Bullet lists
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-1 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{renderInline(line.replace(/^[-*]\s*/, ''))}</span>
                  </div>
                );
              }

              // Numbered lists (e.g. "1. ")
              const numMatch = line.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 ml-1 text-slate-700">
                    <span className="font-semibold text-blue-600 text-xs mt-0.5 shrink-0 min-w-4 text-right">
                      {numMatch[1]}.
                    </span>
                    <span>{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Standard paragraph
              return (
                <p key={lineIdx} className="text-slate-700 leading-relaxed">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Render bold, inline code, links
function renderInline(text: string) {
  // Split by inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((sub, i) => {
    if (sub.startsWith('`') && sub.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 bg-slate-100 border border-slate-200/80 rounded font-mono text-[13px] text-blue-700 font-medium">
          {sub.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting **text**
    const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((b, bi) => {
      if (b.startsWith('**') && b.endsWith('**')) {
        return (
          <strong key={`${i}-${bi}`} className="font-semibold text-slate-900">
            {b.slice(2, -2)}
          </strong>
        );
      }
      return b;
    });
  });
}
