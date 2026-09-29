import { ChevronRight, Database, MapPin, Target } from 'lucide-react';
import type { DrillingEvent, Well } from '../../types';
import { SeverityBadge } from '../ui/Badges';

interface KnowledgeResultCardProps {
  event: DrillingEvent;
  well: Well;
  relevanceScore: number;
  onClick: () => void;
}

export function KnowledgeResultCard({ event, well, relevanceScore, onClick }: KnowledgeResultCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-navy-900 border border-border-default hover:border-accent-500/50 rounded-xl p-5 cursor-pointer transition-all hover:bg-navy-800/80 group flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-navy-950 p-2 rounded-lg border border-border-subtle">
            <SeverityBadge severity={event.severity} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-accent-400 transition-colors">{event.eventType}</h4>
            <p className="text-xs text-slate-400">{well.id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Prototype Relevance</p>
          <p className="text-lg font-bold text-accent-400">{relevanceScore}%</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 py-3 border-y border-border-subtle">
        <Metric icon={Target} label="Depth" value={`${event.depth} - ${event.depth + (event.durationHours ? event.durationHours * 2 : 20)}m`} />
        <Metric icon={Database} label="Formation" value={event.formation} />
        <Metric icon={Database} label="Reservoir" value={well.reservoir} />
        <Metric icon={MapPin} label="Distance" value={`${well.distanceFromActiveWell} km`} />
      </div>

      {/* Summary */}
      <div className="text-xs text-slate-300 leading-relaxed">
        <p className="font-semibold text-slate-400 mb-1">Short Summary</p>
        <p className="line-clamp-2">{event.description}</p>
      </div>

      {/* Mitigation / Learning Preview */}
      <div className="text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
        <p className="font-semibold text-emerald-400 mb-1">Key Learning</p>
        <p className="text-emerald-100/70 line-clamp-1">Historical case indicates elevated operational attention in the comparable interval.</p>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-2">
           {event.sourceMetadata ? (
             <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">Imported Demo</span>
           ) : (
             <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-1.5 py-0.5 rounded font-bold">Seeded Demo</span>
           )}
           <span>Source: {event.sourceMetadata ? event.sourceMetadata.filename : 'Synthetic demo document'}</span>
        </span>
        <span className="flex items-center gap-1 text-accent-400 group-hover:underline">View Case Details <ChevronRight size={12} /></span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-[9px] text-slate-500 uppercase tracking-wider mb-1">
        <Icon size={10} /> {label}
      </span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}
