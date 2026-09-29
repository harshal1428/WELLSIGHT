import { BookOpenCheck } from 'lucide-react';
import type { CalculatedRisk } from '../../utils/riskScoring';
import { Link } from 'react-router-dom';

interface Props {
  risks: CalculatedRisk[];
}

export function AlertPreview({ risks }: Props) {
  const category = [...risks].sort((a, b) => b.supportingCases.length - a.supportingCases.length)[0];
  if (!category || category.supportingCases.length === 0) return null;

  return (
    <section className="bg-surface-card border border-border-default rounded-xl overflow-hidden mt-6">
      <div className="bg-accent-500/10 border-b border-accent-500/20 px-5 py-3 flex items-center gap-2">
        <BookOpenCheck className="w-4 h-4 text-accent-400" />
        <h3 className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Historical evidence to review</h3>
      </div>
      <div className="p-5">
        <h4 className="text-sm font-bold text-white mb-2">Most represented category: {category.riskType}</h4>
        <p className="text-sm text-slate-400 mb-4">{category.supportingCases.length} matching records across {category.comparableWellsCount} offset wells. Review event details and recorded responses before drawing conclusions.</p>
        <Link to="/knowledge" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-navy-900 bg-accent-500 hover:bg-accent-400 rounded-lg transition-colors">Review historical records</Link>
      </div>
    </section>
  );
}
