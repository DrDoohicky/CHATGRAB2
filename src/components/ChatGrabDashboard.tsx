import React from 'react';
import { ArrowRight, Database, MessageCircle, Download, FileArchive, Film, HelpCircle, Search, RefreshCw, Settings } from 'lucide-react';
import { ReferenceArtwork } from './ReferenceArtwork';
import './chatgrab-dashboard.css';

export type CGPage = 'workspace' | 'capture' | 'preserve' | 'organize' | 'analyze' | 'reintegrate' | 'artifacts' | 'export' | 'library' | 'support' | 'guide' | 'settings' | 'bridge' | 'media';
type Props = { page: CGPage; count: number; onNavigate: (p: CGPage) => void; onOpenLibrary: () => void; onOpenSupport: () => void; onOpenGuide: () => void; onExport: () => void; onAnalyze: () => void; onReintegrate: () => void; onAccount: () => void };
const features = [
  { id: 'preserve', title: 'Preserve', desc: 'Keep the original conversation intact.', action: 'Capture & Preserve' },
  { id: 'organize', title: 'Organize', desc: 'Group related work without changing sources.', action: 'Organize' },
  { id: 'analyze', title: 'Chat Analysis', desc: 'Find patterns, corrections and drift.', action: 'Analyze' },
  { id: 'reintegrate', title: 'Reintegrate', desc: 'Carry useful context forward.', action: 'Reintegrate' },
  { id: 'artifacts', title: 'Artifacts', desc: 'Keep PDFs, images and source files nearby.', action: 'View Artifacts' },
  { id: 'export', title: 'Export', desc: 'Create useful reports and backups.', action: 'Export' },
] as const;
const details = {
  preserve: ['Preserve', 'Capture an original conversation before interpreting it.'],
  organize: ['Organize', 'Search, rename and group your saved conversations in the library.'],
  analyze: ['Chat Analysis', 'Inspect insights and check them against the original conversation.'],
  reintegrate: ['Reintegrate', 'Select context from a saved conversation to carry forward.'],
  artifacts: ['Artifacts', 'Attach supporting files and media to your work.'],
  export: ['Export', 'Download a conversation report or a portable library backup.'],
  library: ['Your conversation library', 'Browse and reopen preserved conversations.'],
  support: ['Files around the conversation', 'Keep supporting files close to their sources.'],
  guide: ['Four-step visual guide', 'Open ChatGPT, choose Share, copy the link, then paste it into Capture.'],
  settings: ['Settings', 'Manage your account and back up your conversation library.'],
  media: ['Media', 'Video, PDF and illustrated tutorial materials.'],
  bridge: ['Crew bridge', 'Review selected context before transferring it to a worker lane.'],
} as const;

export function ChatGrabDashboard(props: Props) {
  const { page, count, onNavigate, onOpenLibrary, onOpenSupport, onOpenGuide, onExport, onAnalyze, onReintegrate, onAccount } = props;
  const actions = {
    preserve: () => onNavigate('capture'), organize: onOpenLibrary, analyze: onAnalyze,
    reintegrate: onReintegrate, artifacts: onOpenSupport, export: onExport,
    library: onOpenLibrary, support: onOpenSupport, guide: onOpenGuide, media: () => onNavigate('media'), settings: onAccount, bridge:()=>onNavigate('bridge'),
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
    <div className="cg-dash-intro"><div><h1>Your workspace.</h1><p>Preserve, organize, and make more from your conversations.</p></div>
      <button className="cg-count" onClick={onOpenLibrary}><Database size={21}/><strong>{count}</strong><span>saved conversations</span><ArrowRight size={17}/></button>
    </div>
    <div className="cg-feature-grid">{features.map(item => <button key={item.id} className={`cg-feature cg-feature-${item.id}`} onClick={() => onNavigate(item.id)}>
      <ReferenceArtwork name={item.id}/>
      <div className="cg-feature-body"><h2>{item.title}</h2><p>{item.desc}</p><span className="cg-feature-action">{item.action} <ArrowRight size={17}/></span></div>
    </button>)}</div>
    <div className="cg-resource-grid">
      <button className="cg-resource cg-media-card" onClick={()=>onNavigate('media')}><div><Film className="cg-resource-icon"/><h2>Media library</h2><p>Watch our explainer, explore the Continuity Framework and browse illustrated tutorials.</p><span>Open Media <ArrowRight size={17}/></span></div></button>
      <button className="cg-resource cg-library-card" onClick={onOpenLibrary}><div><Database className="cg-resource-icon"/><h2>Your conversation library</h2><p>Rename, compare, merge, and reopen preserved conversations.</p><span>Open Library <ArrowRight size={17}/></span></div><ReferenceArtwork name="library"/></button>
      <button className="cg-resource cg-files-card" onClick={onOpenSupport}><div><FileArchive className="cg-resource-icon"/><h2>Files around the conversation</h2><p>Attach PDFs, screenshots, generated media, JSON, audio, video and evidence.</p><span>Open Support Library <ArrowRight size={17}/></span></div><ReferenceArtwork name="support"/></button>
      <button className="cg-resource cg-guide-card" onClick={onOpenGuide}><div><HelpCircle className="cg-resource-icon"/><h2>Four-step visual guide</h2><p>Find Share, Copy link, and the ChatGrab capture controls.</p><span>Show the Guide <ArrowRight size={17}/></span></div><ReferenceArtwork name="guide"/></button>
    </div>
  </section>;
}
