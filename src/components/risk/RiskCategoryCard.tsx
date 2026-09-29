import type { CalculatedRisk } from '../../utils/riskScoring';
import { RiskBadge } from '../ui/Badges';
import { ChevronRight } from 'lucide-react';

interface Props {
  risk: CalculatedRisk;
  onClick: () => void;
}

export function RiskCategoryCard({ risk, onClick }: Props) {
  const isSelected = false; // We can handle this from parent if needed
  
  return (
    <div 
      onClick={onClick}
      className={`bg-surface-card border border-border-default rounded-xl p-5 cursor-pointer hover:border-accent-500/50 transition-colors ${isSelected ? 'border-accent-500' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white">{risk.riskType === 'Torque Spike' ? 'Torque / Drag' : risk.riskType}</h3>
            <RiskBadge level={risk.level} />
          </div>
          <p className="text-sm text-slate-400">
            {risk.supportingCases.length > 0 
              ? `${risk.supportingCases.length} supporting cases from ${risk.comparableWellsCount} offset wells`
              : 'Low historical evidence for this risk'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Prototype Score</p>
          <p className="text-xl font-bold text-white">{risk.score} / 100</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
        <p className="text-xs text-slate-400">
          {risk.factors.filter(f => f.matched).length} matching risk factors
        </p>
        <button className="flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 font-medium">
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
