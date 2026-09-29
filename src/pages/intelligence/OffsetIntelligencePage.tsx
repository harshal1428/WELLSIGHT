import { useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases } from '../../data/intelligenceCasework';
import type { EventType } from '../../types';
import { IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

const eventOptions: (EventType | 'ALL')[] = ['ALL', 'Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'];

export function OffsetIntelligencePage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [depth, setDepth] = useState(activeWell.currentDepth ?? activeWell.totalDepth);
  const [windowMeters, setWindowMeters] = useState('200');
  const [eventType, setEventType] = useState<EventType | 'ALL'>('ALL');
  const candidates = useMemo(() => nearbyWells.map((well) => {
    const cases = collectCases([well]);
    const matching = cases.filter(({ event }) => Math.abs(event.depth - depth) <= Number(windowMeters) && event.formation === activeWell.formation && (eventType === 'ALL' || event.eventType === eventType));
    const nearest = cases.slice().sort((a, b) => Math.abs(a.event.depth - depth) - Math.abs(b.event.depth - depth))[0];
    return { well, cases, matching, nearest, formationMatch: !well.isUnresolved && well.formation === activeWell.formation };
  }).sort((a, b) => Number(b.formationMatch) - Number(a.formationMatch) || Number(b.matching.length > 0) - Number(a.matching.length > 0) || (Number.isFinite(a.well.distanceFromActiveWell) ? a.well.distanceFromActiveWell : Infinity) - (Number.isFinite(b.well.distanceFromActiveWell) ? b.well.distanceFromActiveWell : Infinity)), [nearbyWells, activeWell.formation, depth, windowMeters, eventType]);

  return <IntelligenceFeatureLayout featureId="offsets" title="Explainable Offset Intelligence" summary="Review why each offset is included. Factor matches are descriptive and are not calibrated probabilities.">
    <Panel title="Comparison context" subtitle={`${activeWell.id} · ${activeWell.formation} · ${depth.toLocaleString()} m`} icon={Compass}>
      <div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-medium text-slate-500">Depth comparison (m)<input type="number" min="0" value={depth} onChange={(event) => setDepth(Math.max(0, Number(event.target.value) || 0))} className="mt-1 block w-full rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-sm text-white" /></label><SelectField label="Depth window" value={windowMeters} onChange={setWindowMeters}><option value="50">±50 m</option><option value="100">±100 m</option><option value="200">±200 m</option><option value="500">±500 m</option></SelectField><SelectField label="Event context" value={eventType} onChange={(value) => setEventType(value as EventType | 'ALL')}>{eventOptions.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'All event types' : value}</option>)}</SelectField></div>
    </Panel>
    <Panel title="Offset explanation" subtitle="Sorted by formation match, matching event in the selected depth window, then recorded distance.">
      <div className="grid gap-3 xl:grid-cols-2">{candidates.map(({ well, cases, matching, nearest, formationMatch }) => <article key={well.id} className="rounded-lg border border-border-default bg-surface-elevated p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-white">{well.id}</h3><p className="text-xs text-slate-500">{well.name}</p></div><span className="rounded-full border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-slate-400">{Number.isFinite(well.distanceFromActiveWell) ? `${well.distanceFromActiveWell} km recorded distance` : 'Distance unavailable'}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Factor label="Geographic proximity" value={!Number.isFinite(well.distanceFromActiveWell) ? 'Unavailable · no location record' : well.distanceFromActiveWell <= 5 ? 'Near · ≤5 km' : well.distanceFromActiveWell <= 15 ? 'Regional · ≤15 km' : 'Far · >15 km'} /><Factor label="Formation" value={well.isUnresolved ? 'Unavailable · no well formation record' : formationMatch ? `Match · ${well.formation}` : `Different · ${well.formation}`} /><Factor label="Depth overlap" value={matching.length ? `${matching.length} matching event(s) in window` : 'No matching event in window'} /><Factor label="Trajectory similarity" value="Unavailable · no trajectory survey" /><Factor label="Historical evidence" value={`${cases.length} stored case(s)`} /><Factor label="Evidence type" value="Local case records" /></div>
        {nearest && <p className="mt-3 text-xs text-slate-500">Nearest stored event: {nearest.event.eventType} · {nearest.event.depth.toLocaleString()} m · {Math.abs(nearest.event.depth - depth)} m from comparison depth.</p>}
        {matching[0] && <Link to={`/intelligence/evidence?wellId=${encodeURIComponent(well.id)}&eventId=${encodeURIComponent(matching[0].event.id)}`} className="mt-3 inline-flex text-xs font-semibold text-accent-600 hover:text-accent-500">Inspect matching evidence →</Link>}
      </article>)}</div>
    </Panel>
    <p className="rounded-lg border border-border-default bg-surface-card px-4 py-3 text-xs text-slate-500">No trajectory values or verified operational similarity metrics are available; no trajectory score is calculated. Stored distances and case records belong to the local reference dataset.</p>
  </IntelligenceFeatureLayout>;
}

function Factor({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border-subtle bg-surface-card p-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xs font-medium text-white">{value}</p></div>; }
