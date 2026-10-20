import React, { useState } from 'react';
import { MessageCircle, LayoutGrid, Database, Images, Download, HelpCircle, Settings, UserRound, MoreHorizontal, Sparkles, Trash2 } from 'lucide-react';
import type { CGPage } from './ChatGrabDashboard';
import { BrandMark, BrandWord } from './BrandMark';
interface HeaderProps {
  page: CGPage; onNavigate: (page: CGPage) => void;
  corpusCount: number; onOpenCapture: () => void; onOpenCorpus: () => void;
  onOpenChat: () => void; onOpenSupport: () => void; onOpenGuide: () => void;
  onExportCorpusBackup: () => void; onClearCorpus: () => void; onOpenAccount: () => void; accountLabel: string;
}
export function Header({ page, onNavigate, corpusCount, onOpenCapture, onOpenCorpus, onOpenChat, onOpenSupport, onOpenGuide, onExportCorpusBackup, onClearCorpus, onOpenAccount, accountLabel }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const links = [
    { id: 'capture', label: 'Capture', icon: MessageCircle, action: onOpenCapture },
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid, action: () => onNavigate('workspace') },
    { id: 'library', label: 'Library', icon: Database, action: onOpenCorpus },
    { id: 'artifacts', label: 'Artifacts', icon: Images, action: onOpenSupport },
    { id: 'export', label: 'Export', icon: Download, action: onExportCorpusBackup },
  ];
  return <header className="cg-topbar">
    <button type="button" className="cg-brand" onClick={() => onNavigate('capture')} aria-label="ChatGrab home"><BrandMark/><BrandWord/></button>
    <nav className="cg-topnav" aria-label="Main navigation">{links.map(({ id, label, icon: Icon, action }) => <button key={id} type="button" onClick={action} aria-current={page === id ? 'page' : undefined}><Icon size={21}/><span>{label}</span>{id === 'library' && corpusCount > 0 && <small>{corpusCount}</small>}</button>)}</nav>
    <div className="cg-header-tools">
      <button type="button" onClick={onOpenGuide} aria-label="Help"><HelpCircle size={20}/><span>Help</span></button>
      <button type="button" onClick={() => onNavigate('settings')} aria-label="Settings" aria-current={page === 'settings' ? 'page' : undefined}><Settings size={20}/><span>Settings</span></button>
      <button type="button" className="cg-account" onClick={onOpenAccount} title={accountLabel} aria-label={accountLabel}><UserRound size={20}/><span>{accountLabel}</span></button>
      <div className="cg-menu-wrap"><button type="button" onClick={() => setShowMenu(v => !v)} aria-label="More tools" aria-expanded={showMenu}><MoreHorizontal size={21}/></button>
        {showMenu && <><button className="cg-menu-dismiss" aria-label="Close tools menu" onClick={() => setShowMenu(false)}/><div className="cg-tools-menu">
          <button onClick={() => { setShowMenu(false); onOpenChat(); }}><Sparkles size={17}/> Conversation assistant</button>
          <button onClick={() => { setShowMenu(false); onExportCorpusBackup(); }}><Download size={17}/> Export library backup</button>
          <button onClick={() => { setShowMenu(false); if (confirm('Clear the browser-local ChatGrab library? Export a backup first to keep a copy.')) onClearCorpus(); }}><Trash2 size={17}/> Reset local library</button>
        </div></>}
      </div>
    </div>
  </header>;
}
