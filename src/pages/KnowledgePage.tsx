import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BrainCircuit, ArrowRight, Layers, Map } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { KnowledgeFilters, type KnowledgeFilterState } from '../components/knowledge/KnowledgeFilters';
import { KnowledgeResultCard } from '../components/knowledge/KnowledgeResultCard';
import { HistoricalCaseDrawer } from '../components/knowledge/HistoricalCaseDrawer';
import { StatusBadge } from '../components/ui/Badges';
import type { DrillingEvent, Well } from '../types';

interface SearchResult {
  event: DrillingEvent;
  well: Well;
  relevanceScore: number;
}

export function KnowledgePage() {
  const navigate = useNavigate();
  const { activeWell, nearbyWells } = useWellContext();

  const [, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For the input field before pressing enter

  const [filters, setFilters] = useState<KnowledgeFilterState>({
    searchQuery: '',
    eventType: 'ALL',
    formation: 'ALL',
    reservoir: 'ALL',
    severity: 'ALL',
    distance: 'ALL',
    sortBy: 'Relevance',
  });

  const [selectedCase, setSelectedCase] = useState<{event: DrillingEvent, well: Well} | null>(null);

  // Sync searchQuery from filters to input if it changes
  useEffect(() => {
    setSearchQuery(filters.searchQuery);
    setSearchInput(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearch = () => {
    setFilters({ ...filters, searchQuery: searchInput });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const quickSearch = (query: string) => {
    setSearchInput(query);
    setFilters({ ...filters, searchQuery: query });
  };

  // Compile all historical cases
  const allCases: SearchResult[] = useMemo(() => {
    return [activeWell, ...nearbyWells].flatMap(well =>
      well.historicalEvents.filter(event => event.sourceMetadata?.extractionMethod !== 'Sample Data').map(event => {
        // Historical relevance scoring logic
        let score = 50;
        
        // Depth proximity (within 100m)
        if (Math.abs(event.depth - (activeWell.currentDepth || 0)) < 100) score += 20;
        else if (Math.abs(event.depth - (activeWell.currentDepth || 0)) < 300) score += 10;
        
        // Formation match
        if (event.formation === activeWell.formation) score += 15;
        
        // Reservoir match
        if (well.reservoir === activeWell.reservoir) score += 10;
        
        // Distance
        if (well.distanceFromActiveWell < 5) score += 10;
        else if (well.distanceFromActiveWell < 15) score += 5;

        // Cap at 99
        score = Math.min(score, 99);

        return { event, well, relevanceScore: score };
      })
    );
  }, [nearbyWells, activeWell]);

  // Filter and Sort
  const filteredCases = useMemo(() => {
    let result = allCases.filter(c => {
      // Filter by Event Type
      if (filters.eventType !== 'ALL' && c.event.eventType !== filters.eventType) return false;
      
      // Filter by Formation
      if (filters.formation !== 'ALL' && c.event.formation !== filters.formation) return false;
      
      // Filter by Reservoir
      if (filters.reservoir !== 'ALL' && c.well.reservoir !== filters.reservoir) return false;
      
      // Filter by Severity
      if (filters.severity !== 'ALL' && c.event.severity !== filters.severity) return false;
      
      // Filter by Distance
      if (filters.distance !== 'ALL' && (!Number.isFinite(c.well.distanceFromActiveWell) || c.well.distanceFromActiveWell > filters.distance)) return false;

      // Filter by Search Query
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matchesType = c.event.eventType.toLowerCase().includes(query);
        const matchesDesc = c.event.description.toLowerCase().includes(query);
        const matchesWell = c.well.id.toLowerCase().includes(query);
        const matchesForm = c.event.formation.toLowerCase().includes(query);
        const matchesRes = (c.well.reservoir ?? '').toLowerCase().includes(query);
        const matchesMitigation = c.event.mitigation?.toLowerCase().includes(query) || false;
        const matchesSourceText = c.event.sourceMetadata?.extractedText.toLowerCase().includes(query) || false;
        
        if (!matchesType && !matchesDesc && !matchesWell && !matchesForm && !matchesRes && !matchesMitigation && !matchesSourceText) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'Depth': return a.event.depth - b.event.depth;
        case 'Distance': return (Number.isFinite(a.well.distanceFromActiveWell) ? a.well.distanceFromActiveWell : Infinity) - (Number.isFinite(b.well.distanceFromActiveWell) ? b.well.distanceFromActiveWell : Infinity);
        case 'Severity': {
          const severityMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
          return severityMap[b.event.severity] - severityMap[a.event.severity];
        }
        case 'Relevance':
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });

    return result;
  }, [allCases, filters]);

  // Derived Stats
  const highRiskCount = filteredCases.filter(c => c.event.severity === 'HIGH' || c.event.severity === 'CRITICAL').length;
  const avgRelevance = filteredCases.length > 0 ? Math.round(filteredCases.reduce((acc, c) => acc + c.relevanceScore, 0) / filteredCases.length) : 0;

  return (
    <div className="h-full w-full flex flex-col bg-navy-950 text-slate-300 overflow-hidden font-sans relative">
      
      {/* ── Top Context Bar ────────────────────────────── */}
      <div className="shrink-0 bg-surface-card border-b border-border-default px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {activeWell.id}
            </h1>
            <StatusBadge status={activeWell.status} size="sm" />
          </div>

          <div className="h-8 w-px bg-border-default"></div>

          <div className="flex items-center gap-6">
            <HeaderStat label="Current Depth" value={`${activeWell.currentDepth} m`} />
            <HeaderStat label="Formation" value={activeWell.formation} />
            <HeaderStat label="Reservoir" value={activeWell.reservoir ?? 'Unavailable'} />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-accent-500/10 border border-accent-500/20 px-4 py-2 rounded-lg">
          <BrainCircuit size={16} className="text-accent-400" />
          <span className="text-xs font-semibold text-accent-400">Context-aware search enabled</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Left Sidebar: Filters ─────────────────────── */}
        <div className="w-[280px] shrink-0 p-5 bg-navy-950 border-r border-border-default">
          <KnowledgeFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
            onClearFilters={() => setFilters({ searchQuery: '', eventType: 'ALL', formation: 'ALL', reservoir: 'ALL', severity: 'ALL', distance: 'ALL', sortBy: 'Relevance' })} 
          />
        </div>

        {/* ── Center: Search & Results ──────────────────── */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-navy-900">
           
           {/* Search Header */}
           <div className="shrink-0 p-8 pb-6 border-b border-border-subtle bg-navy-950 shadow-sm z-10">
             
             {/* Search Bar */}
             <div className="relative max-w-3xl mb-4">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input
                 type="text"
                 className="block w-full pl-11 pr-24 py-4 bg-navy-900 border border-border-default rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all shadow-inner"
                 placeholder="Search historical drilling knowledge..."
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 onKeyDown={handleKeyDown}
               />
               <div className="absolute inset-y-0 right-2 flex items-center">
                 <button 
                   onClick={handleSearch}
                   className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg"
                 >
                   Search
                 </button>
               </div>
             </div>

             {/* Quick Suggestions */}
             <div className="flex flex-wrap items-center gap-2 max-w-3xl">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mr-2">Suggestions:</span>
                {['Mud Loss', 'Stuck Pipe', 'Torque Spike', 'F3 Historical Cases', 'R1 Events', 'Nearby Well Cases'].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => quickSearch(suggestion)}
                    className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-border-subtle hover:border-slate-500 rounded-full text-[11px] text-slate-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
             </div>
           </div>

           {/* Results Area */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             
             {/* Summary */}
             <div className="flex items-center justify-between mb-6 max-w-5xl">
               <div>
                 <h2 className="text-lg font-bold text-white mb-1">Search Results</h2>
                 <p className="text-xs text-slate-400">
                   <span className="text-accent-400 font-semibold">{filteredCases.length}</span> historical cases match the selected context.
                 </p>
               </div>
               
               <div className="flex items-center gap-6 bg-navy-800/50 rounded-lg p-3 border border-border-subtle">
                  <SummaryStat label="Matched Formations" value={filters.formation === 'ALL' ? 'Multi' : filters.formation} />
                  <div className="w-px h-8 bg-border-default"></div>
                  <SummaryStat label="High-Risk Events" value={highRiskCount.toString()} alert={highRiskCount > 0} />
                  <div className="w-px h-8 bg-border-default"></div>
                  <SummaryStat label="Avg Relevance" value={`${avgRelevance}%`} />
               </div>
             </div>

             {/* Result Grid */}
             {filteredCases.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                 {filteredCases.map((c, i) => (
                   <KnowledgeResultCard 
                     key={i} 
                     event={c.event} 
                     well={c.well} 
                     relevanceScore={c.relevanceScore} 
                     onClick={() => setSelectedCase({ event: c.event, well: c.well })} 
                   />
                 ))}
               </div>
             ) : (
               <div className="max-w-3xl flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mb-4">
                   <Search size={24} className="text-slate-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">No historical cases found</h3>
                 <p className="text-sm text-slate-400 mb-6 max-w-md">
                   No historical cases match the selected context. Try adjusting your filters or search query.
                 </p>
                 <button 
                   onClick={() => setFilters({ searchQuery: '', eventType: 'ALL', formation: 'ALL', reservoir: 'ALL', severity: 'ALL', distance: 'ALL', sortBy: 'Relevance' })}
                   className="px-6 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg border border-border-subtle transition-colors"
                 >
                   Clear Filters
                 </button>
               </div>
             )}
           </div>

        </div>

        {/* ── Right Sidebar: Context Workflow ───────────── */}
        <div className="w-[300px] shrink-0 p-5 bg-surface-card border-l border-border-default overflow-y-auto hidden 2xl:block">
           
           <div className="bg-navy-900 border border-border-subtle rounded-xl p-5 shadow-sm mb-6">
             <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
               <BrainCircuit size={16} className="text-accent-400" /> How NWIS uses historical knowledge
             </h3>
             <div className="space-y-3 relative">
               <div className="absolute left-[11px] top-6 bottom-4 w-px bg-border-subtle"></div>
               <WorkflowStep text="Historical documents" />
               <WorkflowStep text="Event extraction" />
               <WorkflowStep text="Well / depth / formation tagging" />
               <WorkflowStep text="Context-aware retrieval" />
               <WorkflowStep text="Relevant historical cases" />
               <WorkflowStep text="Evidence-backed decision support" highlight />
             </div>
             <p className="text-[9px] text-slate-500 italic mt-5 text-center bg-navy-950 py-1.5 rounded">Historical record review</p>
           </div>

           <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 mb-6">
             <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">Relevant to {activeWell.id}</p>
             <p className="text-xs text-emerald-100/80 mb-3">
               The current active well context ({activeWell.currentDepth ?? 'Depth unavailable'}m • {activeWell.formation} • {activeWell.reservoir ?? 'Reservoir unavailable'}) is used to prioritize these search results.
             </p>
           </div>

           <div className="space-y-3">
             <button onClick={() => navigate('/correlation')} className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg border border-border-subtle transition-colors flex items-center justify-between px-4 group">
               <span className="flex items-center gap-2"><Layers size={14} className="text-accent-400" /> View Depth Correlation</span>
               <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
             </button>
             <button onClick={() => navigate('/nearby-wells')} className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg border border-border-subtle transition-colors flex items-center justify-between px-4 group">
               <span className="flex items-center gap-2"><Map size={14} className="text-emerald-400" /> View Nearby Wells</span>
               <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
             </button>
             <div className="pt-4 mt-4 border-t border-border-subtle">
                <button onClick={() => navigate('/risk')} className="w-full py-3 bg-accent-600 hover:bg-accent-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-accent-500/20 transition-colors flex items-center justify-center gap-2">
                 View Risk Intelligence <ArrowRight size={16} />
               </button>
             </div>
           </div>
        </div>

      </div>

      {/* Drawer */}
      {selectedCase && (
        <>
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40" onClick={() => setSelectedCase(null)}></div>
          <HistoricalCaseDrawer 
            event={selectedCase.event} 
            well={selectedCase.well} 
            relatedCases={filteredCases.filter(c => c.event.id !== selectedCase.event.id)}
            onClose={() => setSelectedCase(null)}
            onOpenCase={(ev, w) => setSelectedCase({ event: ev, well: w })}
          />
        </>
      )}

    </div>
  );
}

function HeaderStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function SummaryStat({ label, value, alert }: { label: string, value: string, alert?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${alert ? 'text-amber-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function WorkflowStep({ text, highlight }: { text: string, highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 relative z-10">
      <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${highlight ? 'bg-accent-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-500'}`}></div>
      <p className={`text-xs ${highlight ? 'text-accent-400 font-semibold' : 'text-slate-400'}`}>{text}</p>
    </div>
  );
}
