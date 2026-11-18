
type Thread = { id: string; title: string; summary?: string; keyTakeaways?: string[]; messagesSample?: string };

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Use POST to ask your corpus.' });
  try {
    const { query, threads } = req.body || {};
    if (typeof query !== 'string' || !query.trim() || !Array.isArray(threads) || threads.length === 0) {
      return res.status(400).json({ success: false, error: 'Enter a question and capture at least one conversation first.' });
    }
    const items: Thread[] = threads.slice(0, 35).filter((t: any) => t && typeof t.id === 'string' && typeof t.title === 'string');
    if (!items.length) return res.status(400).json({ success: false, error: 'No readable conversations were supplied.' });
      // Free evidence-based fallback: excerpts, not generative synthesis.
      const words = query.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((w: string) => !['what','were','with','from','across','saved','threads','conversation','conversations','synthesize','summarize','insights','core','please','show','tell','about'].includes(w)) || [];
      const ranked = items.map(t => {
        const lines = (t.messagesSample || '').split(/\n/).map(x => x.trim()).filter(Boolean);
        const candidates = [t.summary, ...(t.keyTakeaways || []), ...lines].filter((x): x is string => typeof x === 'string' && x.length > 12);
        const matches = candidates.map(line => ({ line, score: words.reduce((n, w) => n + (line.toLowerCase().includes(w) ? 1 : 0), 0) })).sort((a,b) => b.score-a.score).slice(0, 3);
        return { id:t.id, title:t.title, matches, score:matches.reduce((n,m)=>n+m.score,0) };
      }).sort((a,b)=>b.score-a.score).slice(0,8);
      const selected = ranked.filter(t=>t.matches.length && (words.length === 0 || t.score > 0));
      const relevant = selected.length ? selected : ranked.filter(t=>t.matches.length).slice(0,5);
      const answer = relevant.length
        ? 'Source-based overview (not AI synthesis):\n\n' + relevant.map(t => '[Thread: "' + t.title + '"]\n' + t.matches.map(m => '• ' + m.line.slice(0, 450)).join('\n')).join('\n\n') + '\n\nThis extracts saved excerpts and takeaways; it does not independently validate claims or synthesize the full transcripts. Native ChatGPT analysis is pending connection approval. No API key is required.'
        : 'No searchable excerpts or summaries are available in the supplied threads. Open the Library to inspect the original conversations.';
      return res.status(200).json({ success:true, answer, relevantThreadIds:relevant.map(t=>t.id), keyQuotes:[], mode:'source-excerpts' });
  } catch (error: any) {
    console.error('Corpus synthesis error', error?.message);
    return res.status(502).json({ success: false, error: 'Cross-thread synthesis could not complete. Your conversations remain saved. Please try again later.' });
  }
}
