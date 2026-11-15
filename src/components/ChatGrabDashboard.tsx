import React from 'react';
import { ArrowRight, Database, MessageCircle, Download, FileArchive, HelpCircle, Film, Search, RefreshCw, Settings } from 'lucide-react';
import { ReferenceArtwork } from './ReferenceArtwork';
import './chatgrab-dashboard.css';

export type CGPage = 'workspace' | 'capture' | 'preserve' | 'organize' | 'analyze' | 'reintegrate' | 'artifacts' | 'export' | 'library' | 'support' | 'guide' | 'media' | 'settings' | 'bridge' | 'plugin';
type Props = { page: CGPage; count: number; onNavigate: (p: CGPage) => void; onOpenLibrary: () => void; onOpenSupport: () => void; onOpenGuide: () => void; onExport: () => void; onAnalyze: () => void; onReintegrate: () => void; onAccount: () => void };
const features = [
  { id: 'preserve', title: 'Preserve', desc: 'Save the original messages so you can revisit the answer and the discussion that led to it.', action: 'Capture & Preserve' },
  { id: 'organize', title: 'Organize', desc: 'Put related chats in library folders so the right discussion is easier to find later.', action: 'Organize' },
  { id: 'analyze', title: 'Chat Analysis', desc: 'Explore what changed, why it changed, and which questions still need answers.', action: 'Analyze' },
  { id: 'reintegrate', title: 'Reintegrate', desc: 'Reintegrate the goals, reasons and corrections behind an answer into your next AI chat.', action: 'Reintegrate' },
  { id: 'artifacts', title: 'Artifacts', desc: 'Artifacts are supporting files. Keep them with a chat so you can check the details behind a claim.', action: 'View Artifacts' },
  { id: 'export', title: 'Export', desc: 'Download readable reports to share, or a complete library backup to restore later.', action: 'Export' },
] as const;
const details = {
  preserve: ['Preserve', 'Save the original messages first so you can check any later summary or interpretation against what was actually said.'],
  organize: ['Organize', 'Group related chats in library folders and search their messages to find a decision and the discussion that led to it.'],
  analyze: ['Chat Analysis', 'Choose messages and prepare questions for your own AI account. Bring the answer back and check it against the original discussion.'],
  reintegrate: ['Reintegrate', 'Choose the messages that explain a goal, decision or correction. Prepare them for a new AI chat so it has the background for your next request.'],
  artifacts: ['Artifacts', 'Attach supporting files and media to your work.'],
  export: ['Export', 'Download a conversation report or a portable library backup.'],
  library: ['Your conversation library', 'Browse and reopen preserved conversations.'],
  support: ['Files around the conversation', 'Attach files to the conversations they support so you can check a claim without hunting for its documents.'],
  guide: ['Four-step visual guide', 'Open ChatGPT, choose Share, copy the link, then paste it into Capture.'],
  media: ['Media library', 'Follow illustrated steps and examples to learn what ChatGrab does, why it helps and how to use it.'],
  settings: ['Settings', 'Manage your account and back up your conversation library.'],
  bridge: ['Crew bridge', 'Choose messages that explain a task, review the instructions, and prepare a handoff for a Crew Console work queue.'],
} as const;

export function ChatGrabDashboard(props: Props) {
  const { page, count, onNavigate, onOpenLibrary, onOpenSupport, onOpenGuide, onExport, onAnalyze, onReintegrate, onAccount } = props;
  const actions = {
    preserve: () => onNavigate('capture'), organize: onOpenLibrary, analyze: onAnalyze,
    reintegrate: onReintegrate, artifacts: onOpenSupport, export: onExport,
    library: onOpenLibrary, support: onOpenSupport, guide: onOpenGuide, media:()=>onNavigate('media'), settings: onAccount, bridge:()=>onNavigate('bridge'),
  };
  if (page !== 'workspace' && page !== 'capture') {
    const [title, description] = details[page];
    return <section className="cg-page">
      <button className="cg-back" onClick={() => onNavigate('workspace')}>← Workspace</button>
      <div className="cg-page-heading"><div><p className="cg-eyebrow">YOUR CONVERSATION TOOLKIT</p><h1>{title}</h1><p>{description}</p></div></div>
      <div className="cg-page-panel"><h2>Continue with {title.toLowerCase()}</h2>
        <div className="cg-page-actions">
          <button onClick={actions[page]}>{page === 'settings' ? 'Account & profile' : `Open ${title}`} <ArrowRight size={18}/></button>
          {page === 'settings' && <button onClick={onExport}><Download size={18}/> Back up library</button>}
          <button onClick={() => onNavigate('capture')}><MessageCircle size={18}/> New capture</button>
        </div>
      </div>
    </section>;
  }
  return <section className="cg-dash" aria-label="Workspace tools">
    <div className="cg-dash-intro"><div><h1>Your workspace.</h1><p>Save the messages, understand the reasons behind them, and reuse what matters in your next conversation.</p></div>
      <button className="cg-count" onClick={onOpenLibrary}><Database size={21}/><strong>{count}</strong><span>saved conversations</span><ArrowRight size={17}/></button>
    </div>
    <div className="cg-feature-grid">{features.map(item => <button key={item.id} className={`cg-feature cg-feature-${item.id}`} onClick={() => onNavigate(item.id)}>
      <ReferenceArtwork name={item.id}/>
      <div className="cg-feature-body"><h2>{item.title}</h2><p>{item.desc}</p><span className="cg-feature-action">{item.action} <ArrowRight size={17}/></span></div>
    </button>)}</div>
    <div className="cg-resource-grid">
      <button className="cg-resource cg-media-card" onClick={()=>onNavigate('media')}><div><Film className="cg-resource-icon"/><h2>Media library</h2><p>Learn each step with illustrations: save messages, check the reasons behind a decision, and bring that background into a new chat.</p><span>Open Media <ArrowRight size={17}/></span></div></button>
      <button className="cg-resource cg-library-card" onClick={onOpenLibrary}><div><Database className="cg-resource-icon"/><h2>Your conversation library</h2><p>Group chats in folders, search their messages, and reopen the discussion behind a decision. Combine related conversations into a separate record.</p><span>Open Library <ArrowRight size={17}/></span></div><ReferenceArtwork name="library"/></button>
      <button className="cg-resource cg-files-card" onClick={onOpenSupport}><div><FileArchive className="cg-resource-icon"/><h2>Files around the conversation</h2><p>Keep documents, screenshots and other files beside the conversation they support, so you can check the details later.</p><span>Open Support Library <ArrowRight size={17}/></span></div><ReferenceArtwork name="support"/></button>
      <button className="cg-resource cg-guide-card" onClick={onOpenGuide}><div><HelpCircle className="cg-resource-icon"/><h2>Four-step visual guide</h2><p>Find Share, Copy link, and the ChatGrab capture controls.</p><span>Show the Guide <ArrowRight size={17}/></span></div><ReferenceArtwork name="guide"/></button>
    </div>
  </section>;
}
