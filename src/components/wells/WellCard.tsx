import { MapPin, ArrowRight, Calendar } from 'lucide-react';
import { StatusBadge, RiskBadge } from '../ui/Badges';
import type { Well } from '../../types';

interface WellCardProps {
  well: Well;
  compact?: boolean;
  onClick?: () => void;
}

export function WellCard({ well, compact = false, onClick }: WellCardProps) {
  const eventCount = well.historicalEvents.length;
  const highestSeverity = well.historicalEvents.reduce<string | null>((max, e) => {
    const order = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    if (!max) return e.severity;
    return order[e.severity as keyof typeof order] > order[max as keyof typeof order] ? e.severity : max;
  }, null);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-surface-card border border-border-default rounded-lg p-3 hover:bg-surface-elevated hover:border-border-strong transition-all group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-white">{well.id}</span>
            <StatusBadge status={well.status} size="sm" />
          </div>
          <ArrowRight size={14} className="text-slate-500 group-hover:text-accent-400 transition-colors" />
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {well.distanceFromActiveWell} km
          </span>
          <span>{well.totalDepth.toLocaleString()}m TD</span>
          {eventCount > 0 && (
            <span className="text-amber-400">{eventCount} event{eventCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className="bg-surface-card border border-border-default rounded-lg p-4 hover:border-border-strong transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{well.id}</h3>
            <StatusBadge status={well.status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{well.name}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Relevance</span>
          <p className="text-lg font-bold text-accent-400">{well.relevanceScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
        <div>
          <span className="text-slate-500">Distance</span>
          <p className="text-white font-medium mt-0.5">{well.distanceFromActiveWell} km</p>
        </div>
        <div>
          <span className="text-slate-500">Total Depth</span>
          <p className="text-white font-medium mt-0.5">{well.totalDepth.toLocaleString()}m</p>
        </div>
        <div>
          <span className="text-slate-500">Formation</span>
          <p className="text-white font-medium mt-0.5">{well.formation}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={11} />
          {new Date(well.drillingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
        </div>
        <div className="flex items-center gap-2">
          {eventCount > 0 && (
            <span className="text-xs text-slate-400">{eventCount} event{eventCount > 1 ? 's' : ''}</span>
          )}
          {highestSeverity && (
            <RiskBadge level={highestSeverity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
