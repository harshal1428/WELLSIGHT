import { useMemo, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import type { DrillingEvent, EventType, Well } from '../../types';
import { IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

const eventTypes: (EventType | 'ALL')[] = ['ALL', 'Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'];

export function CounterfactualPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [depth, setDepth] = useState(activeWell.currentDepth ?? 0);
  const [windowMeters, setWindowMeters] = useState('200');
  const [formation, setFormation] = useState('ALL');
  const [eventType, setEventType] = useState<EventType | 'ALL'>('ALL');
  const groups = useMemo(() => nearbyWells.filter((well) => formation === 'ALL' || well.formation === formation).map((well) => {
    const events = well.historicalEvents.filter((event) => Math.abs(event.depth - depth) <= Number(windowMeters) && (eventType === 'ALL' || event.eventType === eventType));
    return { well, events };
  }), [nearbyWells, formation, depth, windowMeters, eventType]);
  const withEvents = groups.filter((row) => row.events.length > 0);
  const withoutEvents = groups.filter((row) => row.events.length === 0);
  return <IntelligenceFeatureLayout featureId="counterfactual" title="Counterfactual Historical Comparison" summary="Compare records that contain the selected event with wells where no such event is recorded in the same depth window.">
    <Panel title="Set the comparison interval" subtitle={`Context well ${activeWell.id} · formation ${activeWell.formation}`} icon={GitCompareArrows}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-medium text-slate-500">Comparison depth · {depth.toLocaleString()} m<input type="range" min="0" max={activeWell.totalDepth} step="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} className="mt-3 block w-full accent-cyan-700" /></label><SelectField label="Window" value={windowMeters} onChange={setWindowMeters}><option value="50">±50 m</option><option value="100">±100 m</option><option value="200">±200 m</option><option value="500">±500 m</option></SelectField><SelectField label="Formation" value={formation} onChange={setFormation}><option value="ALL">All formations</option>{['F1','F2','F3','F4','F5'].map((item) => <option key={item} value={item}>{item}</option>)}</SelectField><SelectField label="Event type" value={eventType} onChange={(value) => setEventType(value as EventType | 'ALL')}>{eventTypes.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All events' : item}</option>)}</SelectField></div></Panel>
    <div className="grid gap-4 xl:grid-cols-2"><Group title="Event recorded in interval" tone="amber" rows={withEvents} eventType={eventType} /><Group title="No matching event recorded" tone="neutral" rows={withoutEvents} eventType={eventType} /></div>
    <div className="rounded-lg border border-border-default bg-surface-card p-4 text-xs leading-relaxed text-slate-500">“No matching event recorded” means only that the available historical records has no matching entry for this well, event type, and interval. It is not proof of normal drilling, complete reporting, or a future outcome. Historical comparisons do not predict what will happen in {activeWell.id}.</div>
  </IntelligenceFeatureLayout>;
}

function Group({ title, tone, rows, eventType }: { title: string; tone: 'amber' | 'neutral'; rows: { well: Well; events: DrillingEvent[] }[]; eventType: EventType | 'ALL' }) {
  return <Panel title={title} subtitle={`${rows.length} offset well(s) in this group`}><div className="space-y-2">{rows.map(({ well, events }) => <article key={well.id} className={`rounded-lg border p-3 ${tone === 'amber' ? 'border-amber-300 bg-amber-50' : 'border-border-default bg-surface-elevated'}`}><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-white">{well.id} · {well.formation} · {well.distanceFromActiveWell} km</p><span className="text-[10px] text-slate-500">{events.length} matching event(s)</span></div>{events.length ? events.map((event) => <div key={event.id} className="mt-2 border-t border-border-default pt-2"><p className="text-xs text-white">{event.eventType} · {event.depth} m · {event.severity}</p><p className="mt-1 text-[11px] text-slate-500">{event.description}</p><Link to={`/intelligence/evidence?wellId=${encodeURIComponent(well.id)}&eventId=${encodeURIComponent(event.id)}`} className="mt-1 inline-flex text-[10px] font-semibold text-accent-600">Open evidence →</Link></div>) : <p className="mt-1 text-[11px] text-slate-500">No {eventType === 'ALL' ? 'event' : eventType} record found in this interval; completeness of the well history is unverified.</p>}</article>)}</div></Panel>;
}
