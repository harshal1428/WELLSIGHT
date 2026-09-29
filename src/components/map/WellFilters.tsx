import { useState } from 'react';
import { Radar, Layers, Database, Filter, MapPin, AlertTriangle } from 'lucide-react';
import type { EventType, FormationId, ReservoirId } from '../../types';

export type RadiusOption = 5 | 10 | 20 | 50;
export type RelevanceFilter = 'ALL' | 'HIGH' | 'MEDIUM';

export interface WellFilterState {
  radius: RadiusOption;
  formation: FormationId | 'ALL';
  reservoir: ReservoirId | 'ALL';
  eventType: EventType | 'ALL';
  relevance: RelevanceFilter;
}

interface WellFiltersProps {
  filters: WellFilterState;
  onFiltersChange: (filters: WellFilterState) => void;
  totalWells: number;
  visibleWells: number;
  totalEvents: number;
  highRelevanceCount: number;
}

const radiusOptions: RadiusOption[] = [5, 10, 20, 50];

const formationOptions: (FormationId | 'ALL')[] = ['ALL', 'F1', 'F2', 'F3', 'F4', 'F5'];

const reservoirOptions: (ReservoirId | 'ALL')[] = ['ALL', 'R1', 'R2', 'R3'];

const eventOptions: (EventType | 'ALL')[] = [
  'ALL',
  'Mud Loss',
  'Stuck Pipe',
  'Kick',
  'Torque Spike',
  'Cementing Issue',
  'Fishing',
  'NPT',
];

const relevanceOptions: { value: RelevanceFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'HIGH', label: 'High (≥75%)' },
  { value: 'MEDIUM', label: 'Medium (≥50%)' },
];

export function WellFilters({
  filters,
  onFiltersChange,
  totalWells,
  visibleWells,
  totalEvents,
  highRelevanceCount,
}: WellFiltersProps) {
  const update = <K extends keyof WellFilterState>(key: K, val: WellFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: val });
  };

  return (
    <div className="w-full space-y-5">
      {/* ── Summary Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox icon={MapPin} label="Nearby Wells" value={visibleWells} accent="text-accent-400" />
        <StatBox icon={Filter} label="High Relevance" value={highRelevanceCount} accent="text-emerald-400" />
        <StatBox icon={AlertTriangle} label="Risk Events" value={totalEvents} accent="text-amber-400" />
        <StatBox icon={Radar} label="Radius" value={`${filters.radius} km`} accent="text-blue-400" />
      </div>

      <p className="text-[11px] text-slate-500">
        Showing <span className="text-white font-semibold">{visibleWells}</span> of{' '}
        <span className="text-white font-semibold">{totalWells}</span> wells
      </p>

      {/* ── Radius ───────────────────────────────────────── */}
      <FilterSection icon={Radar} label="Search Radius">
        <div className="space-y-1">
          {radiusOptions.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                filters.radius === r
                  ? 'bg-accent-500/10 text-accent-400'
                  : 'text-slate-400 hover:bg-navy-700/50 hover:text-white'
              }`}
            >
              <input
                type="radio"
                name="radius"
                checked={filters.radius === r}
                onChange={() => update('radius', r)}
                className="sr-only"
              />
              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                filters.radius === r ? 'border-accent-400' : 'border-slate-600'
              }`}>
                {filters.radius === r && <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />}
              </span>
              <span className="text-xs font-medium">{r} km</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── Formation ────────────────────────────────────── */}
      <FilterSection icon={Layers} label="Formation">
        <div className="flex flex-wrap gap-1.5">
          {formationOptions.map((f) => (
            <button
              key={f}
              onClick={() => update('formation', f)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filters.formation === f
                  ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                  : 'bg-navy-800/50 text-slate-400 border border-transparent hover:text-white hover:bg-navy-700'
              }`}
            >
              {f === 'ALL' ? 'All' : f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Reservoir ────────────────────────────────────── */}
      <FilterSection icon={Database} label="Reservoir">
        <div className="flex flex-wrap gap-1.5">
          {reservoirOptions.map((r) => (
            <button
              key={r}
              onClick={() => update('reservoir', r)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filters.reservoir === r
                  ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                  : 'bg-navy-800/50 text-slate-400 border border-transparent hover:text-white hover:bg-navy-700'
              }`}
            >
              {r === 'ALL' ? 'All' : r}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Historical Event ─────────────────────────────── */}
      <FilterSection icon={AlertTriangle} label="Historical Event">
        <div className="space-y-0.5">
          {eventOptions.map((e) => (
            <button
              key={e}
              onClick={() => update('eventType', e)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filters.eventType === e
                  ? 'bg-accent-500/10 text-accent-400'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              {e === 'ALL' ? 'All Events' : e}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Relevance ────────────────────────────────────── */}
      <FilterSection icon={Filter} label="Relevance">
        <div className="space-y-0.5">
          {relevanceOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => update('relevance', r.value)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filters.relevance === r.value
                  ? 'bg-accent-500/10 text-accent-400'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// ── Internal Helpers ─────────────────────────────────────────

function FilterSection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 cursor-pointer group w-full"
      >
        <Icon size={12} className="text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex-1 text-left">
          {label}
        </span>
        <span className={`text-slate-600 text-[10px] transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}>▼</span>
      </button>
      {open && children}
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-navy-800/40 rounded-lg p-2.5 text-center">
      <Icon size={12} className={`${accent} mx-auto mb-1`} />
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
