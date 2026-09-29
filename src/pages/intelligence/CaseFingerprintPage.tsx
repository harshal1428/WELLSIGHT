import { useMemo, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases } from '../../data/intelligenceCasework';
import { IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

export function CaseFingerprintPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [searchParams] = useSearchParams();
  const cases = useMemo(() => collectCases([activeWell, ...nearbyWells]), [activeWell, nearbyWells]);
  const [caseId, setCaseId] = useState(searchParams.get('eventId') ?? cases[0]?.event.id ?? '');
  const [depthWindow, setDepthWindow] = useState('200');
  const selected = cases.find(({ event }) => event.id === caseId) ?? cases[0];
  const depth = activeWell.currentDepth ?? 0;
  const factors = selected ? [
    ['Formation similarity', selected.well.isUnresolved ? 'Unavailable · well formation is not recorded' : selected.event.formation === activeWell.formation ? `High · same formation ${activeWell.formation}` : `Different · ${selected.event.formation} vs ${activeWell.formation}`],
    ['Depth similarity', Math.abs(selected.event.depth - depth) <= Number(depthWindow) ? `Within ±${depthWindow} m` : `Outside ±${depthWindow} m`],
    ['Geographic proximity', !Number.isFinite(selected.well.distanceFromActiveWell) ? 'Unavailable · well location is not recorded' : selected.well.distanceFromActiveWell <= 5 ? 'Near · ≤5 km' : selected.well.distanceFromActiveWell <= 15 ? 'Regional · ≤15 km' : 'Far · >15 km'],
    ['Trajectory similarity', 'Unavailable · no trajectory survey'],
    ['Event context', `${selected.event.eventType} · historical record`],
    ['Evidence quality', selected.event.sourceMetadata?.extractedText ? 'Passage attached · unverified' : 'Low · source document unavailable'],
  ] : [];
  return <IntelligenceFeatureLayout featureId="fingerprint" title="Historical Case Fingerprint" summary="A qualitative case summary from defined, visible comparison factors. No uncalibrated probability or similarity percentage is shown.">
    <Panel title="Case and comparison settings" subtitle={`${activeWell.id} · ${activeWell.formation} · ${depth} m`} icon={Fingerprint}><div className="grid gap-3 md:grid-cols-2"><SelectField label="Historical case" value={selected?.event.id ?? ''} onChange={setCaseId}>{cases.map(({ well, event }) => <option key={event.id} value={event.id}>{well.id} · {event.eventType} · {event.depth} m · {event.id}</option>)}</SelectField><SelectField label="Depth comparison tolerance" value={depthWindow} onChange={setDepthWindow}><option value="50">±50 m</option><option value="100">±100 m</option><option value="200">±200 m</option><option value="500">±500 m</option></SelectField></div></Panel>
    {selected && <Panel title={`${selected.event.id} · ${selected.well.id}`} subtitle={`${selected.event.eventType} at ${selected.event.depth.toLocaleString()} m · ${selected.event.formation}`}>
      <div className="grid gap-3 lg:grid-cols-2">{factors.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 rounded-lg border border-border-default bg-surface-elevated p-3"><div><p className="text-xs font-semibold text-white">{label}</p><p className="mt-1 text-xs text-slate-500">{value}</p></div><span className="rounded-full border border-border-default bg-surface-card px-2 py-1 text-[9px] font-bold uppercase text-slate-500">Factor</span></div>)}</div>
      <div className="mt-4 rounded-lg border border-border-default bg-surface-card p-4"><p className="text-xs font-semibold text-white">Historical case fingerprint</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{selected.event.description}</p><p className="mt-2 text-[10px] text-slate-500">Stored historical record · source verification unavailable · comparison is not predictive.</p></div>
      <Link to={`/intelligence/evidence?wellId=${encodeURIComponent(selected.well.id)}&eventId=${encodeURIComponent(selected.event.id)}`} className="mt-4 inline-flex text-xs font-semibold text-accent-600 hover:underline">Open evidence chain →</Link>
    </Panel>}
  </IntelligenceFeatureLayout>;
}
