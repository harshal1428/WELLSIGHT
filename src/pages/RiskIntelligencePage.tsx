import { useState, useMemo } from 'react';
import { ShieldAlert, BookOpen, Map, Navigation, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { 
  RiskSummary, 
  RiskCategoryCard, 
  RiskDetailDrawer, 
  RiskTimeline, 
  AlertPreview, 
  RiskMatrix 
} from '../components/risk';
import { calculateRiskForType, RISK_CATEGORIES } from '../utils/riskScoring';
import { RiskAnalyticsCharts } from '../components/risk/RiskAnalyticsCharts';


export function RiskIntelligencePage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [selectedRiskType, setSelectedRiskType] = useState<string | null>(null);

  const calculatedRisks = useMemo(() => {
    return RISK_CATEGORIES.map(riskType => calculateRiskForType(riskType, activeWell, nearbyWells));
  }, [activeWell, nearbyWells]);

  const selectedRisk = useMemo(() => {
    return calculatedRisks.find(r => r.riskType === selectedRiskType) || null;
  }, [calculatedRisks, selectedRiskType]);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 relative">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader
          title="Risk Intelligence"
          subtitle="Context-aware historical risk intelligence for the active well."
          icon={ShieldAlert}
        />
      </div>

      <div className="flex items-center gap-3 bg-surface-card border border-border-default rounded-xl p-4">
        <div className="text-xs text-slate-400 font-mono">ACTIVE WELL</div>
        <div className="text-sm font-semibold text-white">{activeWell.name}</div>
        <div className="text-xs text-slate-400 ml-4">Current Depth: <span className="text-white">{activeWell.currentDepth || activeWell.totalDepth} m</span></div>
        <div className="text-xs text-slate-400">Formation: <span className="text-white">{activeWell.formation}</span></div>
        <div className="text-xs text-slate-400">Reservoir: <span className="text-white">{activeWell.reservoir}</span></div>
        <div className="text-xs text-slate-400">Status: <span className="text-accent-400">{activeWell.status}</span></div>
        <div className="ml-auto bg-navy-800 text-[10px] text-slate-400 uppercase tracking-widest px-2 py-1 rounded">
          Prototype risk assessment
        </div>
      </div>

      <RiskSummary activeWell={activeWell} risks={calculatedRisks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculatedRisks.map(risk => (
              <RiskCategoryCard 
                key={risk.riskType} 
                risk={risk} 
                onClick={() => setSelectedRiskType(risk.riskType)} 
              />
            ))}
          </div>

          <RiskAnalyticsCharts risks={calculatedRisks} />
          <RiskTimeline activeWell={activeWell} risks={calculatedRisks} />
          <AlertPreview risks={calculatedRisks} />
        </div>

        <div className="space-y-6">
          <RiskMatrix risks={calculatedRisks} />

          {/* Navigation Links */}
          <div className="bg-surface-card border border-border-default rounded-xl p-5">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Related Intelligence</h3>
            <div className="space-y-2">
              <Link to="/knowledge" className="flex items-center justify-between p-3 rounded-lg bg-navy-900 border border-border-subtle hover:border-accent-500/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Historical Knowledge</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-400" />
              </Link>
              <Link to="/correlation" className="flex items-center justify-between p-3 rounded-lg bg-navy-900 border border-border-subtle hover:border-accent-500/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Depth Correlation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-400" />
              </Link>
              <Link to="/nearby-wells" className="flex items-center justify-between p-3 rounded-lg bg-navy-900 border border-border-subtle hover:border-accent-500/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Map className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Nearby Wells</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-400" />
              </Link>
            </div>
          </div>

          <div className="bg-surface-card border border-border-default rounded-xl p-5">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Prototype Intelligence Sources</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• {nearbyWells.length} Nearby wells analyzed</li>
              <li>• Current active-well context applied</li>
              <li>• Synthetic historical knowledge records</li>
              <li className="italic text-slate-500 mt-4 border-t border-border-subtle pt-2">Note: This is a decision support prototype, not a production prediction system. Data is synthetic.</li>
            </ul>
          </div>
        </div>
      </div>

      <RiskDetailDrawer 
        risk={selectedRisk} 
        activeWell={activeWell} 
        onClose={() => setSelectedRiskType(null)} 
      />
    </div>
  );
}
