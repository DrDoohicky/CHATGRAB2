import React, { useState } from 'react';
import type { ConversationThread } from '../types';

/** Explicit, file-based, private bridge; no network transfer or raw transcript export. */
export function CrewHandoff({ thread }: { thread: ConversationThread }) {
  const [worker, setWorker] = useState('atlas');
  const [title, setTitle] = useState('');
  const [consent, setConsent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState('');

  const exportAssignment = async () => {
    if (!consent || !reviewed || !title.trim()) return;
    const payload = {
      schema_version: 'gc.bridge.assignment.v1',
      source: {
        capture_id: thread.id,
        provider: 'ChatGrab',
        reference: thread.sourceUrl || `chatgrab:local:${thread.id}`,
        captured_at: thread.capturedAt,
      },
      assignment: {
        title: title.trim().slice(0, 200),
        target_worker_id: worker,
        scope: 'private',
      },
      authorization: { owner_reviewed: true, owner_consented: true },
      idempotency_key: await hash(`${thread.id}\u0000${worker}\u0000${title.trim()}`),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `crew-assignment-${thread.id.replace(/[^a-z0-9_-]/gi, '_').slice(0, 60)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    setMessage('Private assignment downloaded. Import this file in Crew Console.');
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
    <h2 className="font-bold text-slate-900">Send to Crew Console</h2>
    <p className="text-sm text-slate-600">Review and download a private assignment file. The transcript is not included. Nothing is transmitted automatically.</p>
    <label className="block text-sm">Assignment title
      <input aria-label="Assignment title" className="block w-full border rounded-lg p-2 mt-1" value={title} maxLength={200} onChange={e=>setTitle(e.target.value)} />
    </label>
    <label className="block text-sm">Target worker
      <select aria-label="Target worker" className="block w-full border rounded-lg p-2 mt-1" value={worker} onChange={e=>setWorker(e.target.value)}>
        {['atlas','beacon','mosaic','sentry','ariadne','harbor','forge'].map(w=><option key={w} value={w}>{w}</option>)}
      </select>
    </label>
    <label className="block text-sm"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} /> I reviewed this assignment.</label>
    <label className="block text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /> I authorize exporting this source reference to Crew Console.</label>
    <button type="button" disabled={!consent || !reviewed || !title.trim()} onClick={exportAssignment} className="rounded-lg bg-blue-700 disabled:opacity-40 text-white px-4 py-2">Download Crew assignment</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
async function hash(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}
