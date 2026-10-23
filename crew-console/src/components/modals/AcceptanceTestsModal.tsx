import type { GovernedConsoleState } from '../../types';
export function AcceptanceTestsModal({ isOpen, onClose }: { state: GovernedConsoleState; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="checks-title">
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-lg w-full space-y-4 text-sm">
      <h2 id="checks-title" className="font-semibold">Verification boundaries</h2>
      <p>The original 9/9 badge was removed because it did not exercise the application reliably.</p>
      <p>Automated tests exercise the same state transitions and import/export validation used by this console. Build-time results and dated browser observations are in the project evidence report; they do not certify every future browser or snapshot.</p>
      <p>This page uses local browser storage. Editing after load requires no remote service. Offline reload and installation are not supported. No inbox polling, ChatGPT control, or Codex execution is connected.</p>
      <button onClick={onClose} className="px-4 py-2 bg-cyan-700 rounded-lg">Close verification information</button>
    </div>
  </div>;
}
