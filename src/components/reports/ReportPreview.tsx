import { useWellContext } from '../../hooks/useWellContext';
import { calculateRiskForType, RISK_CATEGORIES } from '../../utils/riskScoring';
import { useMemo } from 'react';

export function ReportPreview() {
  const { activeWell, nearbyWells, alerts, reportNotes } = useWellContext();
  const notes = reportNotes[activeWell.id] || { notes: '', observations: '', actions: '', status: 'Pending review', reviewer: '' };

  const calculatedRisks = useMemo(() => {
    return RISK_CATEGORIES.map(riskType => calculateRiskForType(riskType, activeWell, nearbyWells));
  }, [activeWell, nearbyWells]);

  const relevantRisks = calculatedRisks.filter(r => r.score >= 30);
  const relevantAlerts = alerts.filter(a => a.wellId === activeWell.id);

  // Collect unique supporting cases from relevant risks
  const historicalCases = Array.from(
    new Map(
      calculatedRisks.flatMap(r => r.supportingCases).map(c => [c.id, c])
    ).values()
  );

  return (
    <div id="report-preview" className="bg-white text-slate-900 p-8 rounded-xl max-w-[800px] mx-auto shadow-sm print:shadow-none print:p-0">
      
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">Nearby Wells Intelligence — Engineering Review</h1>
        <div className="flex justify-between text-sm text-slate-600 font-mono">
          <span>Ref: REP-{activeWell.id}-{new Date().toISOString().split('T')[0]}</span>
          <span>Generated (Demo): {new Date().toLocaleString('en-IN')}</span>
        </div>
        <div className="mt-4 p-2 bg-amber-100 border border-amber-300 text-amber-800 text-xs rounded">
          <strong>Disclaimer:</strong> Prototype decision-support report using synthetic/demo data. Not an operational drilling instruction or confirmed incident record.
        </div>
      </div>

      {/* Active Well Context */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1">1. Active Well Context</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Well ID:</strong> {activeWell.id}</div>
          <div><strong>Name:</strong> {activeWell.name}</div>
          <div><strong>Current Depth:</strong> {activeWell.currentDepth || activeWell.totalDepth} m</div>
          <div><strong>Formation:</strong> {activeWell.formation}</div>
          <div><strong>Status:</strong> {activeWell.status}</div>
          <div><strong>Reservoir:</strong> {activeWell.reservoir}</div>
        </div>
      </section>

      {/* Nearby Wells */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1">2. Nearby Offset Wells</h2>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300">
              <th className="py-2 px-2">Well ID</th>
              <th className="py-2 px-2">Distance (km)</th>
              <th className="py-2 px-2">Formation</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {nearbyWells.map(w => (
              <tr key={w.id} className="border-b border-slate-200">
                <td className="py-2 px-2 font-medium">{w.id}</td>
                <td className="py-2 px-2">{w.distanceFromActiveWell}</td>
                <td className="py-2 px-2">{w.formation}</td>
                <td className="py-2 px-2">{w.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Risk Intelligence */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1">3. Risk Intelligence (Prototype Scores)</h2>
        {relevantRisks.length > 0 ? (
          <div className="space-y-4">
            {relevantRisks.map(risk => (
              <div key={risk.riskType} className="bg-slate-50 p-3 border border-slate-200 rounded">
                <div className="flex justify-between font-bold mb-1">
                  <span>{risk.riskType}</span>
                  <span>Score: {risk.score}/100 ({risk.level})</span>
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  Factors: {risk.factors.filter(f => f.matched).map(f => f.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No elevated risks identified in prototype scoring.</p>
        )}
      </section>

      {/* Historical Evidence & Depth Correlation */}
      <section className="mb-6">
        <div className="flex items-center justify-between border-b border-slate-300 mb-3 pb-1">
          <h2 className="text-lg font-bold">4. Depth Correlation & Historical Cases</h2>
          <span className="text-xs text-blue-600 underline print:hidden cursor-pointer">
            <a href="/correlation">View Correlation Page</a>
          </span>
        </div>
        {historicalCases.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 mb-2">The following events from offset wells correlate with the current formation and depth zone:</p>
            {historicalCases.map(ev => (
              <div key={ev.id} className="text-sm border-l-2 border-slate-400 pl-3">
                <div className="font-semibold">{ev.eventType} <span className="text-slate-500 font-normal">at {ev.depth}m (Fm: {ev.formation})</span></div>
                <div className="text-slate-700 mt-1">{ev.description}</div>
                {ev.mitigation && <div className="text-slate-600 italic mt-1">Mitigation: {ev.mitigation}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No supporting historical cases found for current correlation context.</p>
        )}
      </section>

      {/* Prototype Alerts */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1">5. Prototype Alerts Workflow</h2>
        {relevantAlerts.length > 0 ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300">
                <th className="py-2 px-2">Alert</th>
                <th className="py-2 px-2">Priority</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {relevantAlerts.map(a => (
                <tr key={a.id} className="border-b border-slate-200">
                  <td className="py-2 px-2 font-medium">{a.title}</td>
                  <td className="py-2 px-2">{a.priority}</td>
                  <td className="py-2 px-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-600">No prototype alerts generated.</p>
        )}
      </section>

      {/* Engineer Review */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1">6. Engineer Review</h2>
        <div className="space-y-4 text-sm">
          <div>
            <strong className="block mb-1">Observations:</strong>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded min-h-[60px] whitespace-pre-wrap">
              {notes.observations || <span className="text-slate-400 italic">None recorded</span>}
            </div>
          </div>
          <div>
            <strong className="block mb-1">General Notes:</strong>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded min-h-[60px] whitespace-pre-wrap">
              {notes.notes || <span className="text-slate-400 italic">None recorded</span>}
            </div>
          </div>
          <div>
            <strong className="block mb-1">Follow-up Actions:</strong>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded min-h-[60px] whitespace-pre-wrap">
              {notes.actions || <span className="text-slate-400 italic">None recorded</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><strong>Review Status:</strong> {notes.status}</div>
            <div><strong>Reviewer:</strong> {notes.reviewer || 'Not specified'}</div>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center text-xs text-slate-500 font-mono">
        *** END OF PROTOTYPE REPORT ***
      </div>
    </div>
  );
}
