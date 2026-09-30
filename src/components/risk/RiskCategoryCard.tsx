import type { CalculatedRisk } from '../../utils/riskScoring';
import { getHighestRecordedSeverity } from '../../utils/riskScoring';
import { SeverityBadge } from '../ui/Badges';
import { ChevronRight } from 'lucide-react';

interface Props {
  risk: CalculatedRisk;
  onClick: () => void;
}

export function RiskCategoryCard({ risk, onClick }: Props) {
  const matchedFactors = risk.factors.filter((factor) => factor.matched).length;
  const highestSeverity = getHighestRecordedSeverity(risk.supportingCases);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface-card border border-border-default rounded-xl p-5 hover:border-accent-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white mb-1">{risk.riskType === 'Torque Spike' ? 'Torque / Drag' : risk.riskType}</h3>
          <p className="text-sm text-slate-400">
            {risk.supportingCases.length > 0
              ? `${risk.supportingCases.length} recorded events across ${risk.comparableWellsCount} offset wells`
              : 'No matching historical events found'}
          </p>
        </div>
        {highestSeverity && <div className="text-right shrink-0"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Highest recorded severity</p><SeverityBadge severity={highestSeverity} /></div>}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
        <p className="text-xs text-slate-400">{matchedFactors} of {risk.factors.length} context checks matched</p>
        <span className="flex items-center gap-1 text-xs text-accent-400 font-medium">View evidence<ChevronRight className="w-4 h-4" /></span>
      </div>
    </button>
  );
}
