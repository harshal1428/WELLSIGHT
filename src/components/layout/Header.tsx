import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, Radio } from 'lucide-react';
import { useWellContext } from '../../hooks/useWellContext';
import { StatusBadge } from '../ui/Badges';
import { allWells } from '../../data/mockData';

export function Header() {
  const { activeWell, setActiveWell, unacknowledgedAlertCount } = useWellContext();
  const [showSelector, setShowSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSelector(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-surface-secondary border-b border-border-default flex items-center justify-between px-5 shrink-0">
      {/* ── Left: Active Well Selector ───────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={selectorRef}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border-default bg-surface-card hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Radio size={14} className="text-emerald-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{activeWell.id}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">—</span>
              <span className="text-xs text-slate-400 hidden sm:inline">{activeWell.name.split('—')[1]?.trim()}</span>
            </div>
            <StatusBadge status={activeWell.status} size="sm" />
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>

          {showSelector && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-surface-card border border-border-default rounded-lg shadow-xl z-50 py-1 max-h-72 overflow-y-auto">
              <div className="px-3 py-2 border-b border-border-subtle">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Select Active Well</p>
              </div>
              {allWells.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setActiveWell(w);
                    setShowSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-surface-elevated transition-colors cursor-pointer ${
                    w.id === activeWell.id ? 'bg-accent-500/5' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{w.id}</span>
                      <StatusBadge status={w.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{w.name}</p>
                  </div>
                  {w.id === activeWell.id && (
                    <span className="text-[10px] text-accent-500 font-semibold">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Current Context Pills ──────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-navy-700 text-slate-300 font-medium">
            Depth: {activeWell.currentDepth?.toLocaleString() ?? '—'}m
          </span>
          <span className="px-2 py-1 rounded bg-navy-700 text-slate-300 font-medium">
            Fm: {activeWell.formation}
          </span>
          <span className="px-2 py-1 rounded bg-navy-700 text-slate-300 font-medium">
            Res: {activeWell.reservoir}
          </span>
        </div>
      </div>

      {/* ── Right: Alerts + User ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg bg-surface-card border border-border-default flex items-center justify-center hover:bg-surface-elevated transition-colors cursor-pointer">
          <Bell size={16} className="text-slate-400" />
          {unacknowledgedAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unacknowledgedAlertCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-border-default">
          <div className="w-8 h-8 rounded-full bg-accent-500/15 flex items-center justify-center">
            <User size={14} className="text-accent-400" />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-white leading-tight">Drilling Engineer</p>
            <p className="text-[10px] text-slate-500">Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
}
