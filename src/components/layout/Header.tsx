import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Radio, Search, X } from 'lucide-react';
import type { Alert, DrillingParameters, RiskAssessment, Well } from '../../types';
import { useWellContext } from '../../hooks/useWellContext';
import { StatusBadge } from '../ui/Badges';
import { parameterTimeSeries } from '../../data/mockData';
import { monitoringSections } from '../../data/monitoringChannels';
import { intelligenceFeatures } from '../../data/intelligenceFeatures';

interface SearchResult { id: string; title: string; detail: string; route: string; wellId?: string }

const searchablePages: SearchResult[] = [
  { id: 'overview', title: 'Overview dashboard', detail: 'Summary and project metrics', route: '/' },
  { id: 'monitor', title: 'Well Monitoring', detail: 'Readings, channels, graphs, saved readings', route: '/live-well' },
  { id: 'nearby', title: 'Nearby Wells', detail: 'Map and nearby well records', route: '/nearby-wells' },
  { id: 'correlation', title: 'Well Correlation', detail: 'Compare wells and formations', route: '/correlation' },
  { id: 'knowledge', title: 'Historical Knowledge', detail: 'Historical drilling events and cases', route: '/knowledge' },
  { id: 'risk', title: 'Risk Intelligence', detail: 'Historical event evidence and risk categories', route: '/risk' },
  { id: 'alerts', title: 'Alerts', detail: 'Current alerts and priorities', route: '/alerts' },
  { id: 'reports', title: 'Reports', detail: 'Well reports and summaries', route: '/reports' },
  { id: 'import', title: 'Data Import', detail: 'Import well and drilling data', route: '/import' },
  { id: 'chat', title: 'AI Chat', detail: 'Ask questions about the selected well and available records', route: '/chat' },
  { id: 'intelligence', title: 'Evidence-Centered Well Intelligence', detail: 'Historical timeline, evidence chain, data quality, graph, and feedback', route: '/intelligence' },
];

function buildSearchIndex(wellRecords: Well[], alerts: Alert[], risks: RiskAssessment[], currentParameters: DrillingParameters | null): SearchResult[] {
  const wells = wellRecords.map((well): SearchResult => ({ id: `well-${well.id}`, title: `${well.id} — ${well.name}`, detail: well.isUnresolved ? 'Well location and formation unavailable' : `${well.status} · ${well.formation} · ${well.reservoir ?? 'Reservoir unavailable'} · ${well.currentDepth ?? well.totalDepth} m`, route: '/nearby-wells', wellId: well.id }));
  const events = wellRecords.flatMap((well) => well.historicalEvents.map((event): SearchResult => ({ id: `event-${event.id}`, title: `${event.eventType} · ${well.id} · ${event.depth} m`, detail: `${event.severity} · ${event.description} ${event.mitigation} ${event.sourceDocument}`, route: `/intelligence/evidence?wellId=${encodeURIComponent(well.id)}&eventId=${encodeURIComponent(event.id)}`, wellId: well.id })));
  const channels = monitoringSections.flatMap((section) => section.channels.map((channel): SearchResult => ({ id: `channel-${channel.id}`, title: channel.label, detail: `${section.title} · ${channel.unit}`, route: '/live-well' })));
  const alertResults = alerts.map((alert): SearchResult => ({ id: `alert-${alert.id}`, title: `${alert.priority} alert · ${alert.title}`, detail: `${alert.message} ${alert.evidenceItems?.join(' ')} ${alert.mitigationActions?.join(' ')}`, route: '/alerts', wellId: alert.wellId }));
  const riskResults = risks.map((risk): SearchResult => ({ id: `risk-${risk.id}`, title: `${risk.riskLevel} risk · ${risk.riskType} · ${risk.matchingWells.join(', ')}`, detail: `${risk.description} ${risk.evidenceItems.join(' ')} ${risk.mitigationActions.join(' ')}`, route: '/risk', wellId: risk.matchingWells[0] }));
  const readings = (currentParameters ? [...parameterTimeSeries, currentParameters] : []).map((reading, index): SearchResult => ({ id: `reading-${index}`, title: `Drilling reading · ${reading.depth} m`, detail: Object.entries(reading).map(([key, value]) => `${key}: ${value}`).join(' · '), route: '/live-well' }));
  const intelligencePages = intelligenceFeatures.map((feature): SearchResult => ({ id: `intelligence-${feature.id}`, title: feature.title, detail: feature.summary, route: feature.route }));
  return [...searchablePages, ...intelligencePages, ...wells, ...events, ...channels, ...alertResults, ...riskResults, ...readings];
}

export function Header() {
  const navigate = useNavigate();
  const { activeWell, setActiveWell, unacknowledgedAlertCount, nearbyWells, alerts, risks, currentParameters } = useWellContext();
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const allVisibleWells = useMemo(() => [activeWell, ...nearbyWells], [activeWell, nearbyWells]);
  const selectableWells = useMemo(() => allVisibleWells.filter((well) => Number.isFinite(well.latitude) && Number.isFinite(well.longitude)), [allVisibleWells]);
  const searchIndex = useMemo(() => buildSearchIndex(allVisibleWells, alerts, risks, currentParameters), [allVisibleWells, alerts, risks, currentParameters]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return query ? searchIndex.filter((item) => `${item.title} ${item.detail}`.toLocaleLowerCase().includes(query)).slice(0, 10) : [];
  }, [searchIndex, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSelector(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchResults(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSearchResult = (result: SearchResult) => {
    if (result.wellId) {
      const well = selectableWells.find((candidate) => candidate.id === result.wellId);
      if (well && Number.isFinite(well.latitude) && Number.isFinite(well.longitude)) setActiveWell(well);
    }
    navigate(result.route);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="app-header h-14 bg-surface-secondary border-b border-border-default flex items-center justify-between px-5 shrink-0">
      {/* ── Left: Active Well Selector ───────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={selectorRef}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border-default bg-surface-card hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Radio size={14} className="text-amber-400" aria-label="Sensor link offline" />
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
              {selectableWells.map((w) => (
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
      <div className="relative mx-3 flex-1 max-w-md" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-card px-3 focus-within:border-accent-500">
          <Search size={15} className="shrink-0 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchResults(true)}
            onChange={(event) => { setSearchQuery(event.target.value); setShowSearchResults(true); }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setShowSearchResults(false);
              if (event.key === 'Enter' && searchResults[0]) openSearchResult(searchResults[0]);
            }}
            placeholder="Search project…"
            aria-label="Search the entire project"
            aria-expanded={showSearchResults && Boolean(searchQuery.trim())}
            className="h-9 min-w-0 flex-1 bg-transparent text-sm !text-[#0f172a] placeholder:!text-[#64748b] outline-none"
          />
          {searchQuery && <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setShowSearchResults(true); }} className="!text-[#475569] hover:!text-[#0f172a]"><X size={14} /></button>}
        </div>
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-border-default bg-surface-card py-1 shadow-xl">
            {searchResults.length ? searchResults.map((result) => (
              <button key={result.id} onClick={() => openSearchResult(result)} className="block w-full px-3 py-2 text-left hover:bg-surface-elevated">
                <span className="block truncate text-sm font-medium !text-[#0f172a]">{result.title}</span>
                <span className="mt-0.5 block text-xs !text-[#334155]">{result.detail}</span>
              </button>
            )) : <p className="px-3 py-3 text-sm !text-[#475569]">No project results found.</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/alerts" aria-label={`Open alerts${unacknowledgedAlertCount > 0 ? `, ${unacknowledgedAlertCount} unacknowledged` : ''}`} className="relative w-9 h-9 rounded-lg bg-surface-card border border-border-default flex items-center justify-center hover:bg-surface-elevated transition-colors cursor-pointer">
          <Bell size={16} className="text-slate-400" />
          {unacknowledgedAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unacknowledgedAlertCount}
            </span>
          )}
        </Link>

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
