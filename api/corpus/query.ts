import { GoogleGenAI } from '@google/genai';

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, error: 'Cross-thread AI synthesis is not configured on this deployment. Your saved conversations are intact; browse or search them in the Library.' });
    }
    const index = items.map((t, i) => `[Thread ${i+1}: "${t.title}" (ID: ${t.id})]\nSummary: ${t.summary || 'Unavailable'}\nTakeaways: ${(t.keyTakeaways || []).join('; ')}\nMessages: ${(t.messagesSample || '').slice(0, 9000)}`).join('\n\n---\n\n').slice(0, 160000);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `You are ChatGrab Corpus Intelligence. Answer the user's question using ONLY the supplied conversation excerpts. Clearly mark uncertainty and limits. Do not claim you inspected messages not included in the excerpts. Cite the thread title for every substantial claim. Return ONLY valid JSON with fields: answer (string), relevantThreadIds (string array), keyQuotes (array of objects with threadTitle and quote). Do not fabricate verbatim quotes.\n\nQUESTION: ${query.slice(0, 2000)}\n\nCORPUS:\n${index}`,
      config: { responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(response.text || '{}');
    if (typeof parsed.answer !== 'string') throw new Error('The synthesis service returned an incomplete result.');
    const ids = new Set(items.map(t => t.id));
    return res.status(200).json({ success: true, answer: parsed.answer, relevantThreadIds: Array.isArray(parsed.relevantThreadIds) ? parsed.relevantThreadIds.filter((id: unknown) => typeof id === 'string' && ids.has(id)) : [], keyQuotes: Array.isArray(parsed.keyQuotes) ? parsed.keyQuotes : [] });
  } catch (error: any) {
    console.error('Corpus synthesis error', error?.message);
    return res.status(502).json({ success: false, error: 'Cross-thread synthesis could not complete. Your conversations remain saved. Please try again later.' });
  }
}
