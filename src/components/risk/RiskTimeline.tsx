import type { CalculatedRisk } from '../../utils/riskScoring';
import type { Well } from '../../types';

interface Props {
  activeWell: Well;
  risks: CalculatedRisk[];
}

export function RiskTimeline({ activeWell, risks }: Props) {
  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;
  
  // Extract all historical cases across all risks
  const allCases = risks.flatMap(r => r.supportingCases).sort((a, b) => a.depth - b.depth);
  
  if (allCases.length === 0) {
    return (
      <div className="bg-surface-card border border-border-default rounded-xl p-5 mt-6">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Depth-Aligned Risk View</h3>
        <p className="text-sm text-slate-500">No historical events found to display on timeline.</p>
      </div>
    );
  }

  const minDepth = Math.min(...allCases.map(c => c.depth), currentDepth) - 50;
  const maxDepth = Math.max(...allCases.map(c => c.depth), currentDepth) + 50;
  const depthRange = maxDepth - minDepth;

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-5 mt-6">
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-6">Depth-Aligned Risk View</h3>
      
      <div className="relative h-20 w-full mb-8 mt-2">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-navy-800 rounded-full -translate-y-1/2"></div>
        
        {/* Historical Events */}
        {allCases.map((ev, i) => {
          const leftPercent = ((ev.depth - minDepth) / depthRange) * 100;
          return (
            <div 
              key={`${ev.id}-${i}`}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-500 border border-navy-900 group cursor-help z-10"
              style={{ left: `${leftPercent}%` }}
            >
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-navy-900 border border-border-subtle rounded text-xs text-slate-300 z-30 shadow-xl">
                <p className="font-semibold text-white mb-1">{ev.eventType}</p>
                <p>Depth: {ev.depth}m</p>
                <p>Formation: {ev.formation}</p>
              </div>
            </div>
          );
        })}

        {/* Current Depth Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-1 h-12 bg-white z-20 group cursor-help"
          style={{ left: `${((currentDepth - minDepth) / depthRange) * 100}%` }}
        >
           <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 text-center text-xs font-bold text-white">
            Current: {currentDepth}m
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-500 font-mono border-t border-border-subtle pt-2">
        <span>{Math.round(minDepth)}m</span>
        <span>{Math.round(maxDepth)}m</span>
      </div>
    </div>
  );
}
