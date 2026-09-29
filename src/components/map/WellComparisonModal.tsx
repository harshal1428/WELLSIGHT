import { X, GitCompareArrows, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Well } from '../../types';
import { StatusBadge } from '../ui/Badges';

interface WellComparisonModalProps {
  activeWell: Well;
  offsetWell: Well;
  onClose: () => void;
}

export function WellComparisonModal({ activeWell, offsetWell, onClose }: WellComparisonModalProps) {
  const navigate = useNavigate();

  const handleOpenCorrelation = () => {
    onClose();
    navigate('/correlation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-default rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
              <GitCompareArrows size={20} className="text-accent-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Compare Wells</h2>
              <p className="text-xs text-slate-400">Contextual evaluation of {offsetWell.id} vs active operations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-navy-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Summary Row */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center bg-navy-800/40 rounded-lg px-6 py-3 border border-border-subtle">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Distance</p>
              <p className="text-lg font-bold text-white">{offsetWell.distanceFromActiveWell} km</p>
            </div>
            <div className="text-center bg-navy-800/40 rounded-lg px-6 py-3 border border-border-subtle">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Relevance</p>
              <p className="text-lg font-bold text-accent-400">{offsetWell.relevanceScore}%</p>
            </div>
            <div className="text-center bg-navy-800/40 rounded-lg px-6 py-3 border border-border-subtle">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Shared Formation</p>
              <p className="text-lg font-bold text-white">{activeWell.formation === offsetWell.formation ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative">
            {/* Divider Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-default -translate-x-1/2" />

            {/* Active Well Column */}
            <div className="space-y-6">
              <div className="text-center border-b border-border-subtle pb-4">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Active Well</p>
                <h3 className="text-xl font-bold text-white">{activeWell.id}</h3>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status={activeWell.status} />
                </div>
              </div>

              <div className="space-y-4">
                <CompareRow label="Depth" value={`${activeWell.currentDepth} m (Current)`} />
                <CompareRow label="Total Depth" value={`${activeWell.totalDepth} m (Target)`} />
                <CompareRow label="Formation" value={activeWell.formation} />
                <CompareRow label="Reservoir" value={activeWell.reservoir} />
                
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Historical Events</p>
                  <p className="text-sm text-slate-300 bg-navy-900 rounded-lg p-3 text-center border border-border-subtle">
                    Currently drilling. No historical events.
                  </p>
                </div>
              </div>
            </div>

            {/* Offset Well Column */}
            <div className="space-y-6">
              <div className="text-center border-b border-border-subtle pb-4">
                <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-2">Offset Well</p>
                <h3 className="text-xl font-bold text-white">{offsetWell.id}</h3>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status={offsetWell.status} />
                </div>
              </div>

              <div className="space-y-4">
                <CompareRow 
                  label="Depth" 
                  value={`${offsetWell.totalDepth} m (Total)`} 
                  highlight={Math.abs((activeWell.currentDepth || 0) - offsetWell.totalDepth) < 200} 
                />
                <CompareRow label="Total Depth" value={`${offsetWell.totalDepth} m`} />
                <CompareRow 
                  label="Formation" 
                  value={offsetWell.formation} 
                  highlight={activeWell.formation === offsetWell.formation}
                />
                <CompareRow 
                  label="Reservoir" 
                  value={offsetWell.reservoir} 
                  highlight={activeWell.reservoir === offsetWell.reservoir}
                />
                
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Historical Events</span>
                    <span className="text-amber-400">{offsetWell.historicalEvents.length} recorded</span>
                  </p>
                  {offsetWell.historicalEvents.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-navy-900 rounded-lg p-3 text-center border border-border-subtle italic">
                      None
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {offsetWell.historicalEvents.map(ev => (
                        <div key={ev.id} className="bg-navy-900 rounded-lg p-2 border border-border-subtle flex justify-between items-center text-xs">
                           <span className="font-semibold text-white">{ev.eventType}</span>
                           <span className="text-slate-400">{ev.depth}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-default bg-navy-900/50 flex justify-between items-center">
           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
             Close
           </button>
           <button 
             onClick={handleOpenCorrelation}
             className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
           >
             Open Full Correlation
             <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-lg p-3 border ${highlight ? 'border-accent-500/30 bg-accent-500/5' : 'border-border-subtle bg-navy-900'}`}>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-accent-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}
