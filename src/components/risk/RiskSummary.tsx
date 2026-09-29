import type { Well } from '../../types';
import type { CalculatedRisk } from '../../utils/riskScoring';
import { Activity, Layers, ShieldAlert } from 'lucide-react';

interface Props {
  activeWell: Well;
  risks: CalculatedRisk[];
}

export function RiskSummary({ activeWell, risks }: Props) {
  const historicalEvents = new Map(risks.flatMap((risk) => risk.supportingCases).map((event) => [event.id, event]));
  const supportedCategories = risks.filter((risk) => risk.supportingCases.length > 0).length;
  const offsetWellsWithMatches = new Set(risks.flatMap((risk) => risk.supportingCases.map((event) => event.sourceDocument))).size;
  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;
  const metrics = [
    { label: 'Historical events', value: `${historicalEvents.size} records`, icon: ShieldAlert },
    { label: 'Categories with matches', value: `${supportedCategories} of ${risks.length}`, icon: Activity },
    { label: 'Current formation', value: activeWell.formation, icon: Layers },
    { label: 'Depth comparison window', value: `${Math.max(0, currentDepth - 100)}–${currentDepth + 100} m`, icon: Activity },
  ];

  return (
    <section className="bg-surface-card border border-border-default rounded-xl p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="min-w-[220px]">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Historical event evidence</h2>
          <p className="text-4xl font-bold text-white mt-2">{historicalEvents.size}</p>
          <p className="text-xs text-slate-500 mt-1">matching records across the reviewed categories</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-start gap-3">
            <div className="p-2 bg-navy-800 rounded-lg shrink-0"><Icon className="w-5 h-5 text-accent-400" /></div>
            <div><p className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</p><p className="text-sm font-medium text-white mt-0.5">{value}</p></div>
          </div>)}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 border-t border-border-subtle mt-4 pt-3">
        Offset source documents represented: {offsetWellsWithMatches}. Counts describe records found; they are not probabilities or operational risk ratings.
      </p>
    </section>
  );
}
