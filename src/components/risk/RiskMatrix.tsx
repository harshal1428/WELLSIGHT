import type { CalculatedRisk } from '../../utils/riskScoring';

interface Props {
  risks: CalculatedRisk[];
}

export function RiskMatrix({ risks }: Props) {
  // A simple 3x3 matrix based on Frequency (0, 1-2, 3+) and Relevance/Score (<40, 40-70, >70)
  
  const getCellPosition = (risk: CalculatedRisk) => {
    const freq = risk.supportingCases.length;
    let x = 0; // Frequency
    if (freq > 0 && freq <= 2) x = 1;
    if (freq > 2) x = 2;
    
    let y = 0; // Score
    if (risk.score >= 40 && risk.score < 70) y = 1;
    if (risk.score >= 70) y = 2;
    
    return { x, y };
  };

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-5 mt-6">
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Prototype Risk Matrix</h3>
      <p className="text-[10px] text-slate-500 mb-6">Visualizes synthetic scoring. Not an operational risk standard.</p>
      
      <div className="relative aspect-square max-w-[300px] mx-auto bg-navy-900 border border-border-subtle rounded-lg grid grid-cols-3 grid-rows-3 overflow-hidden">
        {/* Background Grid */}
        <div className="col-start-1 row-start-3 bg-emerald-500/10 border-r border-t border-border-subtle/50"></div>
        <div className="col-start-2 row-start-3 bg-emerald-500/10 border-r border-t border-border-subtle/50"></div>
        <div className="col-start-3 row-start-3 bg-amber-500/10 border-t border-border-subtle/50"></div>
        
        <div className="col-start-1 row-start-2 bg-emerald-500/10 border-r border-t border-border-subtle/50"></div>
        <div className="col-start-2 row-start-2 bg-amber-500/10 border-r border-t border-border-subtle/50"></div>
        <div className="col-start-3 row-start-2 bg-red-500/10 border-t border-border-subtle/50"></div>
        
        <div className="col-start-1 row-start-1 bg-amber-500/10 border-r border-border-subtle/50"></div>
        <div className="col-start-2 row-start-1 bg-red-500/10 border-r border-border-subtle/50"></div>
        <div className="col-start-3 row-start-1 bg-red-500/20"></div>

        {/* Labels */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-500 tracking-widest uppercase">Score</div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 tracking-widest uppercase">Frequency</div>

        {/* Data Points */}
        {risks.map((risk) => {
          if (risk.score === 0) return null;
          const { x, y } = getCellPosition(risk);
          
          return (
            <div 
              key={risk.riskType}
              className="absolute w-4 h-4 rounded-full bg-accent-500 border-2 border-navy-900 shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-help group"
              style={{
                left: `calc(${(x + 0.5) * (100/3)}%)`,
                top: `calc(${((2 - y) + 0.5) * (100/3)}%)`
              }}
            >
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-navy-900 border border-border-subtle rounded text-[10px] text-white z-10">
                {risk.riskType}: {risk.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
