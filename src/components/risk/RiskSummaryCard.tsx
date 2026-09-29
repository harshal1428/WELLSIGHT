import { ShieldAlert, ChevronRight } from 'lucide-react';
import { RiskBadge } from '../ui/Badges';
import type { RiskAssessment } from '../../types';

interface RiskSummaryCardProps {
  risk: RiskAssessment;
  onClick?: () => void;
}

export function RiskSummaryCard({ risk, onClick }: RiskSummaryCardProps) {
  return (
    <div
      className="bg-surface-card border border-border-default rounded-lg p-4 hover:border-border-strong transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className={
            risk.riskLevel === 'CRITICAL' ? 'text-red-400' :
            risk.riskLevel === 'HIGH' ? 'text-orange-400' :
            risk.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          } />
          <span className="text-sm font-semibold text-white">{risk.riskType}</span>
          <RiskBadge level={risk.riskLevel} size="sm" />
        </div>
        <ChevronRight size={14} className="text-slate-500 group-hover:text-accent-400 transition-colors" />
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{risk.description}</p>

      {/* Evidence preview (top 2 items) */}
      <div className="bg-navy-800/50 rounded p-2.5 mb-2.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Key Evidence</p>
        {risk.evidenceItems.slice(0, 2).map((item, i) => (
          <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5 mb-1 last:mb-0">
            <span className="text-accent-400 shrink-0">•</span>
            <span className="line-clamp-1">{item}</span>
          </p>
        ))}
        {risk.evidenceItems.length > 2 && (
          <p className="text-[10px] text-slate-500 mt-1">+{risk.evidenceItems.length - 2} more</p>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Confidence: <span className="text-white font-medium">{risk.confidence}%</span></span>
        <span>{risk.matchingWells.length} matching well{risk.matchingWells.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
