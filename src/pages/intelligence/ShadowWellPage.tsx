import { useMemo, useState } from 'react';
import { Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { WellMap } from '../../components/map/WellMap';
import { IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';
import type { EventType } from '../../types';

const eventTypes: (EventType | 'ALL')[] = ['ALL', 'Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'];

export function ShadowWellPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [radius, setRadius] = useState('10');
  const [formation, setFormation] = useState('ALL');
  const [eventType, setEventType] = useState<EventType | 'ALL'>('ALL');
  const [depth, setDepth] = useState(activeWell.currentDepth ?? 0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapWells = useMemo(() => nearbyWells.filter((well) => !well.name.startsWith('Unresolved Reference:') && well.distanceFromActiveWell <= Number(radius) && (formation === 'ALL' || well.formation === formation) && (eventType === 'ALL' || well.historicalEvents.some((event) => event.eventType === eventType && Math.abs(event.depth - depth) <= 300))), [nearbyWells, radius, formation, eventType, depth]);
  const selected = mapWells.find((well) => well.id === selectedId) ?? null;
  return <IntelligenceFeatureLayout featureId="shadow-well" title="Historical Projection · Shadow Well" summary="Compare stored well locations and depth/event context. No trajectory is drawn when trajectory surveys are absent.">
    <Panel title="Map comparison filters" subtitle="Filter displayed offset wells; historical event markers are not projected because no survey trajectories are available." icon={Map}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SelectField label="Map radius" value={radius} onChange={setRadius}><option value="5">5 km</option><option value="10">10 km</option><option value="20">20 km</option><option value="50">50 km</option></SelectField><SelectField label="Formation" value={formation} onChange={setFormation}><option value="ALL">All formations</option>{['F1','F2','F3','F4','F5'].map((item) => <option key={item} value={item}>{item}</option>)}</SelectField><SelectField label="Event type" value={eventType} onChange={(value) => setEventType(value as EventType | 'ALL')}>{eventTypes.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All events' : item}</option>)}</SelectField><label className="text-xs font-medium text-slate-500">Depth context · {depth.toLocaleString()} m<input type="range" min="0" max={activeWell.totalDepth} step="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} className="mt-3 block w-full accent-cyan-700" /></label></div></Panel>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="h-[520px] overflow-hidden rounded-xl border border-border-default bg-surface-card p-2"><WellMap activeWell={activeWell} nearbyWells={mapWells} radius={Number(radius)} selectedWellId={selectedId} onWellSelect={setSelectedId} /></div><Panel title="Selected offset" subtitle={`${mapWells.length} offset well(s) visible`} className="h-fit">{selected ? <><h3 className="text-sm font-semibold text-white">{selected.id}</h3><p className="mt-1 text-xs text-slate-500">{selected.name}</p><div className="mt-3 space-y-2 text-xs text-slate-500"><p>Stored location coordinates are used by the map.</p><p>Formation: {selected.formation}</p><p>Stored well depth: {selected.totalDepth.toLocaleString()} m</p><p>Events within comparison depth: {selected.historicalEvents.filter((event) => Math.abs(event.depth - depth) <= 300).length}</p></div><Link to={`/intelligence/offsets?wellId=${encodeURIComponent(selected.id)}`} className="mt-4 inline-flex text-xs font-semibold text-accent-600">View explainable factors →</Link></> : <p className="text-xs text-slate-500">Select an offset marker on the map. No trajectory or event coordinates are available to draw a shadow-well path.</p>}</Panel></div>
    <p className="rounded-lg border border-border-default bg-surface-card p-3 text-xs text-slate-500">Map locations come from the stored well records. This view does not extrapolate subsurface paths from surface coordinates or event depths.</p>
  </IntelligenceFeatureLayout>;
}
