import type { Well } from '../../types';
import type { CalculatedRisk } from '../../utils/riskScoring';
import { Activity, ShieldAlert, Layers } from 'lucide-react';
import { RiskBadge } from '../ui/Badges';

interface Props {
  activeWell: Well;
  risks: CalculatedRisk[];
}

export function RiskSummary({ activeWell, risks }: Props) {
  // Calculate overall metrics
  const totalScore = Math.max(...risks.map(r => r.score), 0);
  const overallLevel = totalScore >= 80 ? 'CRITICAL' : totalScore >= 60 ? 'HIGH' : totalScore >= 30 ? 'MEDIUM' : 'LOW';
  
  const totalSupportingCases = risks.reduce((acc, risk) => acc + risk.supportingCases.length, 0);
  const uniqueWells = new Set(risks.flatMap(r => r.supportingCases.map(c => c.sourceDocument)));
  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Overall Historical Risk Relevance</h2>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-bold text-white">{totalScore} <span className="text-lg text-slate-500 font-medium">/ 100</span></span>
            <div className="mb-1">
              <RiskBadge level={overallLevel} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Prototype risk score — not operationally calibrated.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-navy-800 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Supporting Cases</p>
              <p className="text-sm font-medium text-white">{totalSupportingCases} events</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-navy-800 rounded-lg shrink-0">
              <Activity className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Offset Wells</p>
              <p className="text-sm font-medium text-white">{uniqueWells.size} comparable</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-navy-800 rounded-lg shrink-0">
              <Layers className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Current Formation</p>
              <p className="text-sm font-medium text-white">{activeWell.formation}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-navy-800 rounded-lg shrink-0">
              <Activity className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Depth Zone</p>
              <p className="text-sm font-medium text-white">{Math.max(0, currentDepth - 100)}–{currentDepth + 100} m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
