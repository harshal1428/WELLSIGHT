import type { CalculatedRisk } from '../../utils/riskScoring';

interface Props {
  risks: CalculatedRisk[];
}

export function RiskMatrix({ risks }: Props) {
  const contexts = ['Formation match', 'Depth proximity', 'Recorded severity'];
  const totals = contexts.map((name) => ({
    name,
    count: risks.reduce((sum, risk) => sum + (risk.factors.find((factor) => factor.name === name)?.matchedEventCount || 0), 0),
  }));
  const maxCount = Math.max(1, ...totals.map((item) => item.count));

  return (
    <section className="bg-surface-card border border-border-default rounded-xl p-5 mt-6">
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Context matches</h3>
      <p className="text-[10px] text-slate-500 mb-5">Recorded events matching the active well context</p>
      <div className="space-y-5">
        {totals.map(({ name, count }) => <div key={name}>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-slate-300">{name}</span><span className="font-semibold text-white tabular-nums">{count} events</span></div>
          <div className="h-2 bg-navy-800 rounded-full overflow-hidden"><div className="h-full bg-accent-500 rounded-full" style={{ width: `${count ? count / maxCount * 100 : 0}%` }} /></div>
        </div>)}
      </div>
      <p className="text-[10px] text-slate-500 mt-5 pt-3 border-t border-border-subtle">An event can match more than one context.</p>
    </section>
  );
}
