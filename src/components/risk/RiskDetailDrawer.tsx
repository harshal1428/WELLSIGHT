import type { CalculatedRisk } from '../../utils/riskScoring';
import type { Well } from '../../types';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { RiskBadge, SeverityBadge } from '../ui/Badges';

interface Props {
  risk: CalculatedRisk | null;
  activeWell: Well;
  onClose: () => void;
}

export function RiskDetailDrawer({ risk, onClose }: Props) {
  if (!risk) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-surface-secondary border-l border-border-default shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-card">
        <div>
          <h2 className="text-lg font-bold text-white">{risk.riskType === 'Torque Spike' ? 'Torque / Drag' : risk.riskType}</h2>
          <p className="text-sm text-slate-400">Prototype Score: {risk.score} / 100</p>
        </div>
        <div className="flex items-center gap-4">
          <RiskBadge level={risk.level} />
          <button onClick={onClose} className="p-2 hover:bg-navy-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Why this risk is relevant */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Why this risk is relevant</h3>
          <p className="text-sm text-slate-300 mb-4">
            This historical risk is relevant because comparable offset-well events occurred in a similar formation and depth interval. The supporting records are historical context, not an autonomous prediction.
          </p>
          <div className="space-y-3 bg-surface-card rounded-lg p-4 border border-border-subtle">
            {risk.factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3">
                {factor.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${factor.matched ? 'text-white' : 'text-slate-500'}`}>{factor.name}</p>
                  <p className="text-xs text-slate-400">{factor.description}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs font-mono ${factor.matched ? 'text-accent-400' : 'text-slate-600'}`}>
                    +{factor.scoreContribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Mitigation */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Historical Mitigation Context</h3>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
            {risk.mitigations.length > 0 ? (
              <ul className="space-y-3">
                {risk.mitigations.map((mitigation, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1 shrink-0">→</span>
                    <span>{mitigation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">Historical response details are not available in this synthetic record.</p>
            )}
          </div>
        </section>

        {/* Supporting Evidence */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Supporting Historical Cases ({risk.supportingCases.length})</h3>
          <div className="space-y-3">
            {risk.supportingCases.length > 0 ? (
              risk.supportingCases.map(ev => (
                <div key={ev.id} className="bg-navy-900 rounded-lg p-4 border border-border-subtle">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-white">{ev.eventType}</p>
                    <SeverityBadge severity={ev.severity} />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{ev.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>Depth: <span className="text-slate-300">{ev.depth}m</span></div>
                    <div>Formation: <span className="text-slate-300">{ev.formation}</span></div>
                    <div className="col-span-2">Source: <span className="text-accent-400">{ev.sourceDocument}</span></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No supporting cases found for this risk.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
