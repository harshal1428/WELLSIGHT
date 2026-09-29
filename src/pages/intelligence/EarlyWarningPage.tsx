import { useMemo } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { useScenarioStream } from '../../hooks/useScenarioStream';
import { parameterTimeSeries } from '../../data/mockData';
import { IntelligenceFeatureLayout, Panel, ValueCard } from '../../components/intelligence/IntelligenceUI';

export function EarlyWarningPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const { reading, label } = useScenarioStream();
  const historicalTorque = parameterTimeSeries.map((point) => point.torque);
  const baseline = Math.max(...historicalTorque.slice(-3));
  const scenarioSignal = reading.torque > baseline;
  const contextEvents = useMemo(() => nearbyWells.flatMap((well) => well.historicalEvents.filter((event) => Math.abs(event.depth - reading.depth) <= 100).map((event) => ({ well, event }))), [nearbyWells, reading.depth]);
  return <IntelligenceFeatureLayout featureId="warnings" title="Contextual Early Warning" summary="Separate scenario signals from diagnosis and display historical context and data quality beside every indicator.">
    <Panel title="Current reference indicators" subtitle={`${label} · ${reading.timestamp.toLocaleTimeString()} · local reference values`} icon={ShieldAlert}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ValueCard label="Torque scenario" value={`${reading.torque} kN·m`} help={`Compared with trailing seed samples (reference high ${baseline} kN·m)`} /><ValueCard label="ROP scenario" value={`${reading.rop} m/hr`} /><ValueCard label="Pressure scenario" value={`${reading.pressure} psi`} /><ValueCard label="Depth / formation" value={`${reading.depth} m · ${activeWell.formation}`} /></div>
      <div className={`mt-4 rounded-xl border p-4 ${scenarioSignal ? 'border-amber-300 bg-amber-50' : 'border-border-default bg-surface-elevated'}`}><p className={`flex items-center gap-2 text-sm font-semibold ${scenarioSignal ? 'text-amber-900' : 'text-white'}`}><AlertTriangle size={16} />{scenarioSignal ? 'POTENTIAL ABNORMAL PATTERN · REVIEW REQUIRED' : 'NO SCENARIO INDICATOR ABOVE THE SELECTED REFERENCE'}</p><p className={`mt-2 text-xs ${scenarioSignal ? 'text-amber-950' : 'text-slate-500'}`}>{scenarioSignal ? 'Torque is above the highest of the last three stored seed samples. This is a UI scenario comparison only, not a validated threshold, sensor anomaly, or diagnosis.' : 'The current local scenario value does not exceed the selected historical sample reference.'}</p></div>
    </Panel>
    <div className="grid gap-4 xl:grid-cols-2"><Panel title="Historical context" subtitle="Nearby event records around the current scenario depth.">{contextEvents.length ? <div className="space-y-2">{contextEvents.map(({ well, event }) => <Link key={event.id} to={`/intelligence/evidence?wellId=${encodeURIComponent(well.id)}&eventId=${encodeURIComponent(event.id)}`} className="block rounded-lg border border-border-default bg-surface-elevated p-3 hover:border-accent-500/40"><p className="text-xs font-semibold text-white">{well.id} · {event.eventType} · {event.depth} m</p><p className="mt-1 text-xs text-slate-500">{event.description}</p></Link>)}</div> : <p className="text-xs text-slate-500">No stored event falls within ±100 m of {reading.depth} m. This does not establish that operations are normal.</p>}</Panel><Panel title="Data quality gate" subtitle="The scenario is not connected to sensors."><ul className="space-y-2 text-xs text-slate-500"><li>● Displayed values: local reference playback</li><li>● Sensor source and per-channel heartbeat: unavailable</li><li>● Historical evidence: local case records</li><li>● Model validation: unavailable</li><li>● Diagnosis: not provided</li></ul><div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900"><b>Decision boundary:</b> no operating instructions are issued. Review verified measurements and historical source evidence with a qualified drilling engineer.</div><Link to="/intelligence/quality" className="mt-3 inline-flex text-xs font-semibold text-accent-600">Open data quality page →</Link></Panel></div>
  </IntelligenceFeatureLayout>;
}
