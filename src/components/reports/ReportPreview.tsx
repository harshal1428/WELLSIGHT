import { useMemo } from 'react';
import { useWellContext } from '../../hooks/useWellContext';
import { calculateRiskForType, getHighestRecordedSeverity, RISK_CATEGORIES } from '../../utils/riskScoring';

interface Props {
  notesOverride?: { notes: string; observations: string; actions: string; status: string; reviewer: string };
}

export function ReportPreview({ notesOverride }: Props) {
  const { activeWell, nearbyWells, alerts, reportNotes } = useWellContext();
  const notes = notesOverride || reportNotes[activeWell.id] || { notes: '', observations: '', actions: '', status: 'Pending review', reviewer: '' };
  const offsets = useMemo(() => nearbyWells.filter((well) => well.id !== activeWell.id), [activeWell.id, nearbyWells]);
  const risks = useMemo(() => RISK_CATEGORIES.map((type) => calculateRiskForType(type, activeWell, offsets)), [activeWell, offsets]);
  const cases = Array.from(new Map(risks.flatMap((risk) => risk.supportingCases).map((event) => [event.id, event])).values());
  const wellAlerts = alerts.filter((alert) => alert.wellId === activeWell.id);
  const maxEventCount = Math.max(1, ...risks.map((risk) => risk.supportingCases.length));

  return (
    <article id="report-preview" className="bg-[#ffffff] text-[#111827] max-w-[850px] mx-auto shadow-lg print:shadow-none font-sans">
      <style>{`
        #report-preview { background-color: #ffffff !important; color: #111827 !important; }
        #report-preview.bg-white, #report-preview .bg-white { background-color: #ffffff !important; }
        #report-preview .bg-slate-50 { background-color: #f8fafc !important; }
        #report-preview .bg-slate-100 { background-color: #f1f5f9 !important; }
        #report-preview .bg-slate-200 { background-color: #e2e8f0 !important; }
        #report-preview .border-slate-200 { border-color: #e2e8f0 !important; }
        #report-preview .border-slate-300 { border-color: #cbd5e1 !important; }
        #report-preview .border-slate-800 { border-color: #1e293b !important; }
        #report-preview .text-slate-900 { color: #111827 !important; }
        #report-preview .text-slate-800 { color: #1f2937 !important; }
        #report-preview .text-slate-700 { color: #334155 !important; }
        #report-preview .text-slate-600 { color: #475569 !important; }
        #report-preview .text-slate-500 { color: #64748b !important; }
        #report-preview .text-slate-400 { color: #64748b !important; }
        @media print { #report-preview { box-shadow: none !important; } }
      `}</style>
      <header className="bg-[#ffffff] text-[#111827] px-7 py-8 sm:px-10 sm:py-10 border-b-4 border-slate-800">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">OffsetIQ · Well intelligence</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-3 tracking-tight">Engineering Review</h1>
            <p className="text-sm text-slate-600 mt-2">Historical context and decision support</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-flex px-2.5 py-1 rounded border border-slate-300 bg-slate-50 text-slate-700 text-[10px] uppercase tracking-wider">{notes.status}</span>
            <p className="text-[10px] text-slate-500 mt-3">REPORT REF</p>
            <p className="text-xs font-mono text-slate-700">{activeWell.id}-{new Date().toISOString().slice(0, 10)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[
            ['Well', activeWell.id],
            ['Depth', `${activeWell.currentDepth || activeWell.totalDepth} m`],
            ['Formation', activeWell.formation],
            ['Status', activeWell.status],
          ].map(([label, value]) => <div key={label} className="rounded-lg bg-[#ffffff] border border-slate-200 px-3 py-2.5"><p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p><p className="text-sm font-semibold text-slate-900 mt-1">{value}</p></div>)}
        </div>
      </header>

      <div className="px-7 py-7 sm:px-10 sm:py-9 space-y-8">
        <section>
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
            <div><p className="text-[10px] uppercase tracking-[0.16em] font-bold text-cyan-700">01 · Evidence summary</p><h2 className="text-lg font-bold mt-1">Recorded events by category</h2></div>
            <p className="text-[10px] text-slate-500 text-right">Event counts from<br />available offset records</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {risks.map((risk) => <div key={risk.riskType}>
              <div className="flex justify-between gap-3 text-xs mb-1.5"><span className="font-semibold">{risk.riskType}</span><span className="text-slate-600">{risk.supportingCases.length} events · {getHighestRecordedSeverity(risk.supportingCases) || 'No records'}</span></div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-cyan-700" style={{ width: `${risk.supportingCases.length / maxEventCount * 100}%` }} /></div>
              <p className="text-[10px] text-slate-500 mt-1">{risk.comparableWellsCount} offset wells with a matching event</p>
            </div>)}
          </div>
          <p className="text-[10px] text-slate-500 mt-4 border-l-2 border-cyan-600 pl-2">Counts are event records found in available offsets. They do not represent likelihood or operational risk ratings.</p>
        </section>

        <section>
          <div className="border-b border-slate-200 pb-3 mb-4"><p className="text-[10px] uppercase tracking-[0.16em] font-bold text-cyan-700">02 · Evidence</p><h2 className="text-lg font-bold mt-1">Historical cases <span className="text-slate-400 font-medium">({cases.length})</span></h2></div>
          {cases.length ? <div className="overflow-x-auto"><table className="w-full text-xs text-left border-collapse"><thead><tr className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[9px]"><th className="py-2 px-2">Event</th><th className="py-2 px-2">Depth / formation</th><th className="py-2 px-2">Severity</th><th className="py-2 px-2">Source</th></tr></thead><tbody>{cases.map((event) => <tr key={event.id} className="border-t border-slate-200 align-top"><td className="py-2.5 px-2"><p className="font-semibold">{event.eventType}</p><p className="text-slate-500 mt-1 max-w-xs">{event.description}</p>{event.mitigation && <p className="text-slate-500 mt-1"><strong>Response:</strong> {event.mitigation}</p>}</td><td className="py-2.5 px-2 whitespace-nowrap">{event.depth} m · {event.formation}</td><td className="py-2.5 px-2">{event.severity}</td><td className="py-2.5 px-2 text-slate-500">{event.sourceDocument}</td></tr>)}</tbody></table></div> : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No historical cases are available for this well context.</p>}
        </section>

        <section>
          <div className="border-b border-slate-200 pb-3 mb-4"><p className="text-[10px] uppercase tracking-[0.16em] font-bold text-cyan-700">03 · Area context</p><h2 className="text-lg font-bold mt-1">Offset wells <span className="text-slate-400 font-medium">({offsets.length})</span></h2></div>
          {offsets.length ? <div className="grid sm:grid-cols-2 gap-2">{offsets.map((well) => <div key={well.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><div className="min-w-0"><p className="text-xs font-semibold truncate">{well.id} <span className="font-normal text-slate-500">· {well.name}</span></p><p className="text-[10px] text-slate-500 mt-1">{well.formation} · {well.status}</p></div><p className="text-xs font-semibold whitespace-nowrap">{well.distanceFromActiveWell} km</p></div>)}</div> : <p className="text-sm text-slate-500">No offset wells available.</p>}
        </section>

        <section>
          <div className="border-b border-slate-200 pb-3 mb-4"><p className="text-[10px] uppercase tracking-[0.16em] font-bold text-cyan-700">04 · Follow-up</p><h2 className="text-lg font-bold mt-1">Alerts and review</h2></div>
          {wellAlerts.length ? <div className="space-y-2 mb-5">{wellAlerts.map((alert) => <div key={alert.id} className="flex gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3"><span className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0" /><div><p className="text-xs font-semibold">{alert.title} <span className="font-normal text-slate-500">· {alert.priority} · {alert.status}</span></p><p className="text-xs text-slate-600 mt-1">{alert.message}</p></div></div>)}</div> : <p className="text-sm text-slate-500 mb-5">No alerts recorded for this well.</p>}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {([['Engineer observations', notes.observations], ['Context and notes', notes.notes], ['Follow-up actions', notes.actions], ['Reviewer', notes.reviewer]] as const).map(([label, value]) => <div key={label} className="min-h-16 rounded-lg border border-slate-200 p-3"><p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{label}</p><p className="mt-1.5 whitespace-pre-wrap">{value || <span className="text-slate-400 italic">Not provided</span>}</p></div>)}
          </div>
        </section>
      </div>

      <footer className="mx-7 sm:mx-10 py-4 border-t border-slate-200 flex justify-between gap-3 text-[9px] text-slate-500"><span>Generated {new Date().toLocaleString()}</span><span>For engineering review · Validate against source records</span></footer>
    </article>
  );
}
