import type { FormationId, ReservoirId, EventType, EventSeverity } from '../../types';
import { SlidersHorizontal, X } from 'lucide-react';

export interface KnowledgeFilterState {
  searchQuery: string;
  eventType: EventType | 'ALL';
  formation: FormationId | 'ALL';
  reservoir: ReservoirId | 'ALL';
  severity: EventSeverity | 'ALL';
  distance: number | 'ALL';
  sortBy: 'Relevance' | 'Depth' | 'Distance' | 'Severity';
}

interface KnowledgeFiltersProps {
  filters: KnowledgeFilterState;
  onFiltersChange: (newFilters: KnowledgeFilterState) => void;
  onClearFilters: () => void;
}

export function KnowledgeFilters({ filters, onFiltersChange, onClearFilters }: KnowledgeFiltersProps) {
  const handleFilterChange = (key: keyof KnowledgeFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.eventType !== 'ALL' || 
    filters.formation !== 'ALL' || 
    filters.reservoir !== 'ALL' || 
    filters.severity !== 'ALL' || 
    filters.distance !== 'ALL';

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-4 shadow-sm h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent-400" /> Filters
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Clear <X size={12} />
          </button>
        )}
      </div>

      <div className="space-y-5">
        
        {/* Event Type Filter */}
        <FilterGroup label="Event Type">
          <select 
            value={filters.eventType}
            onChange={e => handleFilterChange('eventType', e.target.value)}
            className="w-full bg-navy-900 border border-border-subtle rounded-md text-xs text-slate-300 p-2 focus:outline-none focus:border-accent-500/50"
          >
            <option value="ALL">All Events</option>
            <option value="Mud Loss">Mud Loss</option>
            <option value="Stuck Pipe">Stuck Pipe</option>
            <option value="Kick">Kick</option>
            <option value="Torque Spike">Torque Spike</option>
            <option value="Cementing Issue">Cementing Issue</option>
            <option value="Fishing">Fishing</option>
            <option value="NPT">NPT</option>
          </select>
        </FilterGroup>

        {/* Formation Filter */}
        <FilterGroup label="Formation">
          <select 
            value={filters.formation}
            onChange={e => handleFilterChange('formation', e.target.value)}
            className="w-full bg-navy-900 border border-border-subtle rounded-md text-xs text-slate-300 p-2 focus:outline-none focus:border-accent-500/50"
          >
            <option value="ALL">All Formations</option>
            <option value="F1">F1</option>
            <option value="F2">F2</option>
            <option value="F3">F3</option>
            <option value="F4">F4</option>
            <option value="F5">F5</option>
          </select>
        </FilterGroup>

        {/* Reservoir Filter */}
        <FilterGroup label="Reservoir">
          <select 
            value={filters.reservoir}
            onChange={e => handleFilterChange('reservoir', e.target.value)}
            className="w-full bg-navy-900 border border-border-subtle rounded-md text-xs text-slate-300 p-2 focus:outline-none focus:border-accent-500/50"
          >
            <option value="ALL">All Reservoirs</option>
            <option value="R1">R1</option>
            <option value="R2">R2</option>
            <option value="R3">R3</option>
          </select>
        </FilterGroup>

        {/* Severity Filter */}
        <FilterGroup label="Severity">
          <select 
            value={filters.severity}
            onChange={e => handleFilterChange('severity', e.target.value)}
            className="w-full bg-navy-900 border border-border-subtle rounded-md text-xs text-slate-300 p-2 focus:outline-none focus:border-accent-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </FilterGroup>

        {/* Distance Filter */}
        <FilterGroup label="Distance">
          <select 
            value={filters.distance}
            onChange={e => handleFilterChange('distance', e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="w-full bg-navy-900 border border-border-subtle rounded-md text-xs text-slate-300 p-2 focus:outline-none focus:border-accent-500/50"
          >
            <option value="ALL">Any Distance</option>
            <option value="5">{'<'} 5 km</option>
            <option value="10">{'<'} 10 km</option>
            <option value="20">{'<'} 20 km</option>
            <option value="50">{'<'} 50 km</option>
          </select>
        </FilterGroup>

        {/* Sort By Filter */}
        <FilterGroup label="Sort By">
           <div className="flex flex-col gap-2">
             {['Relevance', 'Depth', 'Distance', 'Severity'].map(sortOption => (
               <label key={sortOption} className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${filters.sortBy === sortOption ? 'border-accent-500 bg-accent-500/20' : 'border-slate-500 group-hover:border-slate-400'}`}>
                   {filters.sortBy === sortOption && <div className="w-1.5 h-1.5 rounded-full bg-accent-400"></div>}
                 </div>
                 <span className={`text-xs ${filters.sortBy === sortOption ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{sortOption}</span>
               </label>
             ))}
           </div>
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
      {children}
    </div>
  );
}
