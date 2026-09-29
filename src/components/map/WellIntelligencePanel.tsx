import { X, ExternalLink, Calendar, MapPin, Layers, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Well, DrillingEvent } from '../../types';
import { StatusBadge, SeverityBadge } from '../ui/Badges';

interface WellIntelligencePanelProps {
  well: Well;
  activeWell: Well;
  onClose: () => void;
  onCompare: () => void;
}

export function WellIntelligencePanel({ well, activeWell, onClose, onCompare }: WellIntelligencePanelProps) {
  return (
    <div className="w-full h-full bg-surface-card border-l border-border-default flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-default flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">{well.id}</h2>
            <StatusBadge status={well.status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{well.name}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-navy-700 rounded-md text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <InfoItem icon={MapPin} label="Distance" value={`${well.distanceFromActiveWell} km`} />
          <InfoItem icon={Target} label="Total Depth" value={`${well.totalDepth.toLocaleString()}m`} />
          <InfoItem icon={Layers} label="Formation" value={well.formation} />
          <InfoItem icon={DatabaseIcon} label="Reservoir" value={well.reservoir} />
        </div>

        {/* Relevance Section */}
        <div className="bg-navy-800/40 border border-border-default rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Relevance Score</h3>
            <span className="text-sm font-bold text-accent-400">{well.relevanceScore}%</span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 mb-1">Why this well is relevant:</p>
            <RelevanceReason met={true} text={`${well.distanceFromActiveWell} km from active well`} />
            <RelevanceReason met={well.formation === activeWell.formation} text={well.formation === activeWell.formation ? `Same formation: ${well.formation}` : `Different formation (${well.formation})`} />
            <RelevanceReason met={well.reservoir === activeWell.reservoir} text={well.reservoir === activeWell.reservoir ? `Same reservoir: ${well.reservoir}` : `Different reservoir (${well.reservoir})`} />
            <RelevanceReason met={well.historicalEvents.length > 0} text={`${well.historicalEvents.length} recorded historical events`} />
          </div>
        </div>

        {/* Historical Events */}
        <div>
          <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            Historical Events
            <span className="bg-navy-700 text-slate-300 px-1.5 py-0.5 rounded text-[9px]">{well.historicalEvents.length}</span>
          </h3>
          
          {well.historicalEvents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No significant historical events recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {well.historicalEvents.map(event => (
                <HistoricalEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-border-default shrink-0">
        <button
          onClick={onCompare}
          className="w-full py-2 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 text-accent-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <GitCompareIcon size={14} />
          Compare with Active Well
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function DatabaseIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
      <path d="M3 12A9 3 0 0 0 21 12"></path>
    </svg>
  );
}

function GitCompareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="18" cy="18" r="3"></circle>
      <circle cx="6" cy="6" r="3"></circle>
      <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
      <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
    </svg>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
        <Icon size={10} /> {label}
      </p>
      <p className="font-medium text-white pl-3">{value}</p>
    </div>
  );
}

function RelevanceReason({ met, text }: { met: boolean, text: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[11px]">
      {met ? (
        <span className="text-emerald-400 font-bold">✓</span>
      ) : (
        <span className="text-slate-500 font-bold">✗</span>
      )}
      <span className={met ? 'text-slate-300' : 'text-slate-500'}>{text}</span>
    </div>
  );
}

function HistoricalEventCard({ event }: { event: DrillingEvent }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-navy-900 border border-border-default rounded-lg overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-start gap-3 hover:bg-navy-800 transition-colors"
      >
        <div className="mt-0.5 shrink-0">
           <SeverityBadge severity={event.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-bold text-white">{event.eventType}</span>
            <span className="text-[10px] text-slate-400 font-mono">{event.depth}m</span>
          </div>
          {!expanded && <p className="text-[10px] text-slate-400 truncate">{event.description}</p>}
        </div>
        <div className="shrink-0 mt-0.5 text-slate-500">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 pt-0 text-xs border-t border-border-subtle mt-1 space-y-3 bg-navy-900">
          <p className="text-slate-300 mt-2 leading-relaxed">{event.description}</p>
          
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded p-2 text-slate-400">
            <p className="text-[10px] font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Mitigation</p>
            <p className="text-[11px]">{event.mitigation}</p>
          </div>

          <div className="flex items-center justify-between text-[10px]">
             <span className="text-slate-500 flex items-center gap-1">
               <Calendar size={10} /> {new Date(event.timestamp).toLocaleDateString()}
             </span>
             <span className="flex items-center gap-1 text-slate-400 cursor-not-allowed border-b border-dashed border-slate-600 pb-[1px]" title="Source record unavailable in prototype">
               {event.sourceDocument} <ExternalLink size={10} />
             </span>
          </div>
          <p className="text-[9px] text-slate-600 italic text-right mt-1">Synthetic demo document</p>
        </div>
      )}
    </div>
  );
}
