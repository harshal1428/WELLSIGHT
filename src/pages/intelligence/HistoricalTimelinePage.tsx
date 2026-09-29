import { useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases } from '../../data/intelligenceCasework';
import type { EventType } from '../../types';
import { EmptyNotice, IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

const events: (EventType | 'ALL')[] = ['ALL', 'Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'];

export function HistoricalTimelinePage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [depth, setDepth] = useState(activeWell.currentDepth ?? activeWell.totalDepth);
  const [windowMeters, setWindowMeters] = useState('200');
  const [eventType, setEventType] = useState<EventType | 'ALL'>('ALL');
  const [wellId, setWellId] = useState('ALL');
  const cases = useMemo(() => collectCases([activeWell, ...nearbyWells]).filter(({ well, event }) => Math.abs(event.depth - depth) <= Number(windowMeters) && (wellId === 'ALL' || well.id === wellId) && (eventType === 'ALL' || event.eventType === eventType)).sort((a, b) => a.event.depth - b.event.depth), [activeWell, nearbyWells, depth, windowMeters, eventType, wellId]);
  return <IntelligenceFeatureLayout featureId="timeline" title="Depth-Based Historical Timeline" summary="Align recorded offset events around a comparison depth, filter context, and open the selected case evidence.">
    <Panel title="Timeline controls" subtitle={`Active well ${activeWell.id} · current formation ${activeWell.formation}`} icon={History}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-medium text-slate-500">Comparison depth · {depth.toLocaleString()} m<input type="range" min="0" max={activeWell.totalDepth} step="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} className="mt-3 block w-full accent-cyan-700" /></label><SelectField label="Depth window" value={windowMeters} onChange={setWindowMeters}><option value="50">±50 m</option><option value="100">±100 m</option><option value="200">±200 m</option><option value="500">±500 m</option></SelectField><SelectField label="Historical well" value={wellId} onChange={setWellId}><option value="ALL">All selected wells</option><option value={activeWell.id}>{activeWell.id} (active well)</option>{nearbyWells.map((well) => <option key={well.id} value={well.id}>{well.id}</option>)}</SelectField><SelectField label="Event type" value={eventType} onChange={(value) => setEventType(value as EventType | 'ALL')}>{events.map((event) => <option key={event} value={event}>{event === 'ALL' ? 'All events' : event}</option>)}</SelectField></div></Panel>
    <Panel title="Events by measured depth" subtitle={`${cases.length} record(s) in the selected interval. Event positions reflect record depths, not a trajectory projection.`}>
      {cases.length ? <div className="relative ml-4 space-y-3 border-l-2 border-accent-500/30 pl-5">{cases.map(({ well, event }) => <article key={event.id} className="relative rounded-lg border border-border-default bg-surface-elevated p-4"><span className="absolute -left-[1.67rem] top-5 h-3 w-3 rounded-full border-2 border-accent-600 bg-surface-card"/><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-white">{event.depth.toLocaleString()} m · {event.eventType}</p><p className="mt-1 text-xs text-slate-500">{well.id} · {event.formation} · {event.severity}</p></div><Link to={`/intelligence/evidence?wellId=${encodeURIComponent(well.id)}&eventId=${encodeURIComponent(event.id)}`} className="text-xs font-semibold text-accent-600 hover:underline">Open case and source →</Link></div><p className="mt-3 text-xs leading-relaxed text-slate-500">{event.description}</p><p className="mt-2 text-[10px] text-slate-400">{event.depth < depth ? `${depth - event.depth} m shallower` : `${event.depth - depth} m deeper`} than comparison depth · stored record</p></article>)}</div> : <EmptyNotice>No events recorded inside this interval. This is not evidence that operations were normal.</EmptyNotice>}
    </Panel>
  </IntelligenceFeatureLayout>;
}
