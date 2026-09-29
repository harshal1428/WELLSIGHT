import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, AlertTriangle, BookOpen, Settings2 } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { StatusBadge, SeverityBadge } from '../components/ui/Badges';
import { formations } from '../data/mockData';
import type { DrillingEvent } from '../types';

export function CorrelationPage() {
  const navigate = useNavigate();
  const { activeWell, nearbyWells } = useWellContext();
  
  // State
  const [currentDepth, setCurrentDepth] = useState(activeWell.currentDepth || 3180);
  const [selectedOffsetIds, setSelectedOffsetIds] = useState<string[]>(['OIL-X11', 'OIL-X19', 'OIL-X21']);
  const [depthRange, setDepthRange] = useState<number>(200); // +/- from current depth
  const [selectedEvent, setSelectedEvent] = useState<DrillingEvent | null>(null);

  // Derived Data
  const selectedWells = useMemo(() => {
    return nearbyWells.filter(w => selectedOffsetIds.includes(w.id));
  }, [nearbyWells, selectedOffsetIds]);

  const visibleTopDepth = currentDepth - depthRange;
  const visibleBottomDepth = currentDepth + depthRange;

  // Formation bands in visible range
  const visibleFormations = useMemo(() => {
    return formations.filter(f => f.topDepth <= visibleBottomDepth && f.bottomDepth >= visibleTopDepth);
  }, [visibleTopDepth, visibleBottomDepth]);

  // Current Formation
  const currentFormationInfo = useMemo(() => {
    return formations.find(f => currentDepth >= f.topDepth && currentDepth < f.bottomDepth);
  }, [currentDepth]);

  // Events in visible range for selected wells
  const visibleEvents = useMemo(() => {
    return selectedWells.flatMap(well => 
      well.historicalEvents.filter(e => e.depth >= visibleTopDepth && e.depth <= visibleBottomDepth)
        .map(e => ({ ...e, wellId: well.id }))
    );
  }, [selectedWells, visibleTopDepth, visibleBottomDepth]);

  // Simulate Progress
  const simulateProgress = () => {
    setCurrentDepth(prev => prev + 10);
  };

  return (
    <div className="h-full w-full flex flex-col bg-navy-950 text-slate-300 overflow-hidden font-sans">
      
      {/* ── Top Context Bar ────────────────────────────── */}
      <div className="shrink-0 bg-surface-card border-b border-border-default px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/nearby-wells')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-4">
            <ArrowLeft size={16} /> Back to Nearby Wells
          </button>
          
          <div className="h-8 w-px bg-border-default"></div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {activeWell.id}
            </h1>
            <StatusBadge status={activeWell.status} size="sm" />
          </div>

          <div className="flex items-center gap-6 ml-6">
            <HeaderStat label="Current Depth" value={`${currentDepth} m`} highlight />
            <HeaderStat label="Formation" value={currentFormationInfo?.id || activeWell.formation} />
            <HeaderStat label="Reservoir" value={activeWell.reservoir} />
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => setCurrentDepth(prev => prev - 10)} className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-xs font-medium rounded border border-border-subtle transition-colors">
             −10 m
           </button>
           <button onClick={() => setCurrentDepth(prev => prev + 10)} className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-xs font-medium rounded border border-border-subtle transition-colors">
             +10 m
           </button>
           <button onClick={simulateProgress} className="px-4 py-1.5 bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 text-xs font-bold rounded border border-accent-500/30 transition-colors flex items-center gap-2">
             <Play size={12} fill="currentColor" /> Simulate Progress
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Left Sidebar: Controls ─────────────────────── */}
        <div className="w-[280px] shrink-0 bg-surface-card border-r border-border-default flex flex-col p-5 overflow-y-auto">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Settings2 size={16} className="text-accent-400" />
            Correlation Controls
          </h2>

          <div className="space-y-6">
            {/* Depth Range */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Depth Window</label>
              <div className="flex flex-wrap gap-2">
                {[100, 200, 500].map(val => (
                  <button 
                    key={val}
                    onClick={() => setDepthRange(val)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                      depthRange === val 
                        ? 'bg-accent-500/15 text-accent-400 border-accent-500/30' 
                        : 'bg-navy-900 border-border-subtle text-slate-400 hover:text-white'
                    }`}
                  >
                    ±{val} m
                  </button>
                ))}
              </div>
            </div>

            {/* Offset Wells */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                Offset Wells
                <span className="bg-navy-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">{selectedOffsetIds.length}</span>
              </label>
              <div className="space-y-2">
                {nearbyWells.filter(w => w.relevanceScore >= 50).map(well => (
                  <label key={well.id} className="flex items-center gap-3 p-2 rounded-lg bg-navy-900 border border-border-subtle cursor-pointer hover:border-accent-500/30 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedOffsetIds.includes(well.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOffsetIds([...selectedOffsetIds, well.id]);
                        else setSelectedOffsetIds(selectedOffsetIds.filter(id => id !== well.id));
                      }}
                      className="accent-accent-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{well.id}</p>
                      <p className="text-[10px] text-slate-400">Rel: {well.relevanceScore}%</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Center: Correlation Visualization ──────────── */}
        <div className="flex-1 relative bg-navy-900 flex overflow-hidden">
           
           {/* Depth Axis (Left) */}
           <div className="w-16 shrink-0 bg-navy-950 border-r border-border-subtle flex flex-col relative z-20">
             {/* Depth markers */}
             {Array.from({ length: Math.ceil((visibleBottomDepth - visibleTopDepth) / 50) + 1 }).map((_, i) => {
               const depth = Math.floor(visibleTopDepth / 50) * 50 + (i * 50);
               const topPercent = ((depth - visibleTopDepth) / (visibleBottomDepth - visibleTopDepth)) * 100;
               if (topPercent < 0 || topPercent > 100) return null;
               
               return (
                 <div key={depth} className="absolute w-full text-right pr-2 text-[10px] text-slate-500 font-mono translate-y-[-50%]" style={{ top: `${topPercent}%` }}>
                   {depth}m
                 </div>
               );
             })}
           </div>

           {/* Visualization Area */}
           <div className="flex-1 relative flex overflow-hidden">
             
             {/* Formation Background Bands */}
             <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col">
               {visibleFormations.map(form => {
                 const start = Math.max(form.topDepth, visibleTopDepth);
                 const end = Math.min(form.bottomDepth, visibleBottomDepth);
                 const heightPercent = ((end - start) / (visibleBottomDepth - visibleTopDepth)) * 100;
                 const topPercent = ((start - visibleTopDepth) / (visibleBottomDepth - visibleTopDepth)) * 100;
                 
                 return (
                   <div 
                     key={form.id} 
                     className="absolute w-full border-b border-white/10 flex items-end p-2"
                     style={{ top: `${topPercent}%`, height: `${heightPercent}%`, backgroundColor: form.color }}
                   >
                     <span className="text-xl font-black text-white/50 tracking-widest">{form.id} — {form.name}</span>
                   </div>
                 );
               })}
             </div>

             {/* Tracks */}
             <div className="flex-1 flex px-4 relative z-10 gap-4 overflow-x-auto">
               
               {/* Selected Offset Wells Tracks */}
               {selectedWells.map(well => (
                 <div key={well.id} className="flex-1 min-w-[150px] max-w-[250px] relative border-l border-r border-white/5 bg-navy-950/40">
                   {/* Track Header */}
                   <div className="absolute top-0 left-0 w-full p-2 text-center bg-navy-900 border-b border-border-subtle z-30">
                     <p className="text-[11px] font-bold text-accent-400">{well.id}</p>
                     <p className="text-[9px] text-slate-400">Relevance: {well.relevanceScore}%</p>
                   </div>

                   {/* Events */}
                   {well.historicalEvents.filter(e => e.depth >= visibleTopDepth && e.depth <= visibleBottomDepth).map(ev => {
                     const topPercent = ((ev.depth - visibleTopDepth) / (visibleBottomDepth - visibleTopDepth)) * 100;
                     const heightPercent = Math.max(3, ((ev.durationHours || 5) * 2 / (visibleBottomDepth - visibleTopDepth)) * 100);
                     
                     return (
                       <div 
                         key={ev.id}
                         onClick={() => setSelectedEvent({ ...ev, wellId: well.id } as any)}
                         className="absolute w-10/12 left-1/12 bg-navy-800 border border-amber-500/50 rounded-sm cursor-pointer hover:border-amber-400 hover:bg-navy-700 transition-colors shadow-lg shadow-amber-500/10 group flex items-center justify-center overflow-hidden"
                         style={{ top: `${topPercent}%`, height: `${heightPercent}%`, minHeight: '30px' }}
                       >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                          <p className="text-[9px] font-bold text-white px-2 truncate">{ev.eventType}</p>
                          
                          {/* Tooltip */}
                          <div className="hidden group-hover:block absolute left-full ml-2 w-48 bg-navy-900 border border-border-subtle rounded p-2 z-50">
                            <p className="text-xs font-bold text-white mb-1">{ev.eventType}</p>
                            <p className="text-[10px] text-slate-400">Depth: {ev.depth}m | Fm: {ev.formation}</p>
                            <SeverityBadge severity={ev.severity} className="mt-1" />
                          </div>
                       </div>
                     );
                   })}
                 </div>
               ))}

               {/* Active Well Track */}
               <div className="flex-1 min-w-[150px] max-w-[250px] relative border-l border-r border-accent-500/30 bg-accent-500/5 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                  <div className="absolute top-0 left-0 w-full p-2 text-center bg-navy-900 border-b border-accent-500/30 z-30">
                     <p className="text-[11px] font-bold text-emerald-400">{activeWell.id}</p>
                     <p className="text-[9px] text-slate-400">{activeWell.status}</p>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-center p-4 z-20 pointer-events-none mt-10">
                    <p className="text-[10px] text-emerald-400 font-mono">No historical events for active well</p>
                  </div>

                  {activeWell.currentDepth !== undefined && activeWell.currentDepth >= visibleTopDepth && activeWell.currentDepth <= visibleBottomDepth && (
                    <div 
                      className="absolute w-10/12 left-1/12 bg-emerald-500/20 border border-emerald-500 rounded flex flex-col items-center justify-center z-20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      style={{
                        top: `calc(${((activeWell.currentDepth - visibleTopDepth) / (visibleBottomDepth - visibleTopDepth)) * 100}% - 15px)`,
                        height: '30px'
                      }}
                    >
                      <p className="text-[10px] font-bold text-emerald-400">CURRENT POSITION</p>
                      <p className="text-[9px] text-emerald-200/70">{activeWell.currentDepth}m</p>
                    </div>
                  )}
               </div>

             </div>

             {/* Current Depth Indicator Line (Crosses all tracks) */}
             <div 
               className="absolute w-full flex items-center z-40 pointer-events-none transition-all duration-300"
               style={{ top: '50%' }} // Since currentDepth is always exactly centered in the visible range
             >
               <div className="w-16 flex justify-end pr-2 shrink-0">
                 <div className="bg-emerald-500 text-navy-950 font-bold px-1.5 py-0.5 rounded text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                   {currentDepth}m
                 </div>
               </div>
               <div className="flex-1 h-px bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)] relative">
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 text-lg drop-shadow-[0_0_5px_rgba(16,185,129,1)]">
                   ★
                 </div>
               </div>
             </div>

           </div>
        </div>

        {/* ── Right Sidebar: Insight Panel ───────────────── */}
        <div className="w-[320px] shrink-0 bg-surface-card border-l border-border-default flex flex-col p-5 overflow-y-auto">
          
          <div className="bg-navy-900 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/5 relative overflow-hidden mb-6">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
              <AlertTriangle size={14} /> Historical Correlation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Active well <strong className="text-white">{activeWell.id}</strong> is currently at <strong className="text-white">{currentDepth}m</strong> in Formation <strong className="text-white">{currentFormationInfo?.id || activeWell.formation}</strong>.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              <strong className="text-accent-400">{selectedWells.length}</strong> selected offset wells contain historical events within comparable depth/formation intervals.
            </p>
            
            <div className="bg-navy-950 rounded p-3 border border-border-subtle">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Historical events in zone</p>
              {visibleEvents.length > 0 ? (
                <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                  {Array.from(new Set(visibleEvents.map(e => e.eventType))).map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">None found in current window.</p>
              )}
            </div>

            <p className="text-[9px] text-slate-500 italic mt-4 text-center">
              This is historical context, not an autonomous prediction. Prototype correlation logic applied.
            </p>
          </div>

          <div className="space-y-3">
             <button onClick={() => navigate('/knowledge')} className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg border border-border-subtle transition-colors flex items-center justify-center gap-2">
               <BookOpen size={14} /> View Historical Cases
             </button>
             <button onClick={() => navigate('/risk-intelligence')} className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-accent-500/20 transition-colors flex items-center justify-center gap-2">
               View Risk Intelligence <ArrowLeft size={14} className="rotate-180" />
             </button>
          </div>

        </div>

      </div>

      {/* ── Event Detail Modal/Drawer ───────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-surface-card w-full max-w-lg rounded-xl border border-border-default shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border-default flex justify-between items-center bg-navy-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedEvent.eventType}</h3>
                  <p className="text-[10px] text-slate-400">{(selectedEvent as any).wellId} • {selectedEvent.depth}m</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 text-slate-400 hover:text-white bg-navy-800 rounded transition-colors">
                <ArrowLeft size={14} className="rotate-180 hidden" /> ✕
              </button>
            </div>
            
            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Depth Range</p>
                   <p className="font-semibold text-white">{selectedEvent.depth}m - {selectedEvent.depth + 15}m</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Formation</p>
                   <p className="font-semibold text-white">{selectedEvent.formation}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Severity</p>
                   <SeverityBadge severity={selectedEvent.severity} />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                   <p className="font-semibold text-white">{selectedEvent.durationHours || 5} hours</p>
                 </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-slate-300 leading-relaxed bg-navy-900 p-3 rounded border border-border-subtle">{selectedEvent.description}</p>
              </div>

              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1 font-semibold">Historical Mitigation</p>
                <p className="text-emerald-100/70 leading-relaxed bg-emerald-950/30 p-3 rounded border border-emerald-900/50">{selectedEvent.mitigation}</p>
              </div>

              <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
                 <p className="text-[10px] text-slate-500">
                   Source: <span className="text-slate-400 cursor-not-allowed border-b border-dashed border-slate-600 pb-[1px]" title="Source record unavailable in prototype">{selectedEvent.sourceDocument}</span>
                 </p>
                 <p className="text-[9px] text-slate-600 italic">Synthetic demo document</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function HeaderStat({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-accent-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}
