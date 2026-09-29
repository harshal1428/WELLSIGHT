import { AlertTriangle } from 'lucide-react';
import type { CalculatedRisk } from '../../utils/riskScoring';
import { Link } from 'react-router-dom';

interface Props {
  risks: CalculatedRisk[];
}

export function AlertPreview({ risks }: Props) {
  // Find the highest risk
  const highestRisk = [...risks].sort((a, b) => b.score - a.score)[0];

  if (!highestRisk || highestRisk.score < 60) return null;

  return (
    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden mt-6">
      <div className="bg-accent-500/10 border-b border-accent-500/20 px-5 py-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-accent-400" />
        <h3 className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Potential Proactive Alerts</h3>
      </div>
      <div className="p-5">
        <h4 className="text-sm font-bold text-white mb-2">HIGH HISTORICAL RELEVANCE: {highestRisk.riskType === 'Torque Spike' ? 'Torque / Drag' : highestRisk.riskType}</h4>
        <p className="text-sm text-slate-300 mb-4">
          Comparable historical events exist near the current depth and formation. This is a preview of the upcoming proactive alert system.
        </p>
        <Link 
          to="/alerts"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-navy-900 bg-accent-500 hover:bg-accent-400 rounded-lg transition-colors"
        >
          Review Evidence in Alerts
        </Link>
      </div>
    </div>
  );
}
