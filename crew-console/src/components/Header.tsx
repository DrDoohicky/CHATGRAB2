import React from 'react';
import {
  Shield,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Menu,
  Sparkles,
  Server,
} from 'lucide-react';
import { GovernedConsoleState } from '../types';

interface HeaderProps {
  state: GovernedConsoleState;
  onExport: () => void;
  onOpenImport: () => void;
  onResetSeed: () => void;
  onOpenTests: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onExport,
  onOpenImport,
  onResetSeed,
  onOpenTests,
  onToggleMobileMenu,
}) => {
  return (
    <header
      id="console-header"
      className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-3 sm:px-6 py-2.5"
    >
      <div className="flex items-center justify-between gap-2 max-w-full">
        {/* Left branding and governance coordinator */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-mobile-menu"
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Drawer"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 truncate">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white truncate">
                  The Mothership
                </span>
                <span className="hidden sm:inline-block text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  GovernedContinuity
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                <span className="text-cyan-400 font-mono font-medium">
                  {state.coordinator.canonical_name}{' '}
                  {state.coordinator.current_version ? `v${state.coordinator.current_version}` : ''}
                </span>
                <span className="text-slate-600">•</span>
                <span className="truncate hidden md:inline">{state.coordinator.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Human Final Authority & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* David R. Labadie Authority Badge */}
          <div
            id="authority-badge"
            title="All governance, version promotions, and lane reassignments adhere to Human Final Authority"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Authority: <strong className="font-semibold text-amber-200">{state.human_final_authority}</strong></span>
          </div>

          {/* Acceptance Tests Button */}
          <button
            id="btn-run-tests"
            type="button"
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Verification information"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Checks</span>

          </button>

          {/* Export State Button */}
          <button
            id="btn-export-state"
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Download worker-first-console-state.json (Review free text before sharing)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export JSON</span>
          </button>

          {/* Import State Button */}
          <button
            id="btn-import-state"
            type="button"
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Import governed JSON state file"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Reset Seed Button */}
          <button
            id="btn-reset-seed"
            type="button"
            onClick={onResetSeed}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            title="Reset to local Atlas 1.4 starter snapshot"
            aria-label="Reset to local Atlas 1.4 starter snapshot"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
