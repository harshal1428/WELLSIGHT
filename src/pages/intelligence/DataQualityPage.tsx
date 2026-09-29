import { useMemo, useState } from 'react';
import { Database } from 'lucide-react';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases, sourceEvidence } from '../../data/intelligenceCasework';
import { IntelligenceFeatureLayout, Panel, SelectField, ValueCard } from '../../components/intelligence/IntelligenceUI';

const fields = [
  ['Measured depth', 'depth', 'm'], ['Rate of penetration', 'rop', 'm/hr'], ['Weight on bit', 'wob', 'klbf'], ['Rotary speed', 'rpm', 'rpm'], ['Torque', 'torque', 'kN·m'], ['Mud flow', 'mudFlow', 'L/min'], ['Mud weight', 'mudWeight', 'ppg'], ['Surface pressure', 'pressure', 'psi'], ['ECD', 'ecd', 'ppg'], ['Hook load', 'hookLoad', 'klbf'],
] as const;

export function DataQualityPage() {
  const { activeWell, currentParameters, nearbyWells } = useWellContext();
  const [referenceTime] = useState(() => Date.now());
  const cases = useMemo(() => collectCases([activeWell, ...nearbyWells]), [activeWell, nearbyWells]);
  const [selectedId, setSelectedId] = useState(cases[0]?.event.id ?? '');
  const selected = cases.find(({ event }) => event.id === selectedId) ?? cases[0];
  const present = fields.filter(([, key]) => Number.isFinite(currentParameters?.[key])).length;
  const dataDate = new Date(currentParameters?.timestamp ?? '');
  const ageHours = Number.isNaN(dataDate.getTime()) ? null : Math.max(0, (referenceTime - dataDate.getTime()) / 3600000);
  const freshness = ageHours === null ? 'Unavailable' : ageHours < 1 ? 'Under 1 hour' : ageHours < 24 ? 'Under 24 hours' : 'Stale · over 24 hours';
  const evidence = selected ? sourceEvidence(selected.event) : null;
  return <IntelligenceFeatureLayout featureId="quality" title="Data Quality & Confidence" summary="Separate data completeness, source freshness, historical provenance, and model confidence. Presence is not verification.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ValueCard label="Parameter fields present" value={`${present} / ${fields.length}`} help="Calculated from fields available for this well" /><ValueCard label="Reference timestamp age" value={freshness} help={currentParameters?.timestamp ?? 'No well-specific reading'} /><ValueCard label="Live source" value="Not connected" help="No sensor data is available" /><ValueCard label="Validated model confidence" value="Unavailable" help="No validated model configured" /></div>
    <Panel title="Current parameter quality" subtitle="Per-channel sensor freshness is unavailable." icon={Database}><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="border-b border-border-default text-slate-500"><tr><th className="py-2 pr-3">Parameter</th><th className="py-2 pr-3">Value</th><th className="py-2 pr-3">Presence</th><th className="py-2">Source quality</th></tr></thead><tbody className="divide-y divide-border-subtle">{fields.map(([label, key, unit]) => { const value = currentParameters?.[key]; const available = typeof value === 'number' && Number.isFinite(value); return <tr key={key} className="text-white"><td className="py-2 pr-3">{label}</td><td className="py-2 pr-3">{available ? `${value.toLocaleString()} ${unit}` : 'Unavailable'}</td><td className="py-2 pr-3">{available ? 'Present' : 'Missing'}</td><td className="py-2">{available ? 'Stored reference value · not sensor-verified' : 'No well-specific value'}</td></tr>; })}</tbody></table></div></Panel>
    <Panel title="Historical evidence quality" subtitle="Choose a case to inspect which provenance elements exist."><SelectField label="Historical case" value={selected?.event.id ?? ''} onChange={setSelectedId}>{cases.map(({ well, event }) => <option key={event.id} value={event.id}>{well.id} · {event.eventType} · {event.depth} m</option>)}</SelectField>{selected && <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ValueCard label="Record event depth" value={`${selected.event.depth} m · present`} /><ValueCard label="Formation" value={`${selected.event.formation} · present`} /><ValueCard label="Source reference" value={evidence?.reference ? 'Identifier present' : 'Unavailable'} /><ValueCard label="Original extracted passage" value={evidence?.text ? 'Attached · unverified' : 'Unavailable'} /></div>}<p className="mt-3 text-xs text-slate-500">Local records are not source-verified. Extraction confidence, page locator, and independent verification are not available, so evidence strength remains low and no model confidence is inferred.</p></Panel>
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-900"><b>Interpretation restriction:</b> the reference timestamp is not a connected source heartbeat. No live-risk conclusion is available from this data snapshot.</div>
  </IntelligenceFeatureLayout>;
}
