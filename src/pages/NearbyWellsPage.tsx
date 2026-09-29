import { useState, useMemo } from 'react';
import { useWellContext } from '../hooks/useWellContext';
import { WellFilters, type WellFilterState } from '../components/map/WellFilters';
import { WellMap } from '../components/map/WellMap';
import { WellIntelligencePanel } from '../components/map/WellIntelligencePanel';
import { WellComparisonModal } from '../components/map/WellComparisonModal';


export function NearbyWellsPage() {
  const { activeWell, nearbyWells } = useWellContext();

  const [filters, setFilters] = useState<WellFilterState>({
    radius: 10,
    formation: 'ALL',
    reservoir: 'ALL',
    eventType: 'ALL',
    relevance: 'ALL',
  });

  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Filter nearby wells
  const filteredWells = useMemo(() => {
    return nearbyWells.filter(well => {
      // Radius
      if (well.distanceFromActiveWell > filters.radius) return false;
      
      // Formation
      if (filters.formation !== 'ALL' && well.formation !== filters.formation) return false;
      
      // Reservoir
      if (filters.reservoir !== 'ALL' && well.reservoir !== filters.reservoir) return false;
      
      // Event Type
      if (filters.eventType !== 'ALL') {
        const hasEvent = well.historicalEvents.some(e => e.eventType === filters.eventType);
        if (!hasEvent) return false;
      }
      
      // Relevance
      if (filters.relevance === 'HIGH' && well.relevanceScore < 75) return false;
      if (filters.relevance === 'MEDIUM' && well.relevanceScore < 50) return false;
      
      return true;
    });
  }, [nearbyWells, filters]);

  // Derived stats
  const totalEvents = filteredWells.reduce((acc, well) => acc + well.historicalEvents.length, 0);
  const highRelevanceCount = filteredWells.filter(w => w.relevanceScore >= 75).length;

  const selectedWell = useMemo(() => {
    if (!selectedWellId) return null;
    return nearbyWells.find(w => w.id === selectedWellId) || null;
  }, [selectedWellId, nearbyWells]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Filters */}
        <div className="w-[280px] shrink-0 bg-surface-card border-r border-border-default flex flex-col overflow-y-auto p-4 custom-scrollbar">
          <h2 className="text-sm font-bold text-white mb-4">Nearby Wells Intelligence</h2>
          <WellFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalWells={nearbyWells.length}
            visibleWells={filteredWells.length}
            totalEvents={totalEvents}
            highRelevanceCount={highRelevanceCount}
          />
        </div>

        {/* Center Column: Map */}
        <div className="flex-1 relative bg-navy-950 p-4 pb-0 flex flex-col">
          <div className="flex-1 rounded-t-xl overflow-hidden border border-border-default border-b-0 shadow-lg relative">
             <WellMap 
                activeWell={activeWell}
                nearbyWells={filteredWells}
                radius={filters.radius}
                selectedWellId={selectedWellId}
                onWellSelect={setSelectedWellId}
             />
          </div>
        </div>

        {/* Right Column: Intelligence Panel (Appears when well is selected) */}
        {selectedWell && (
          <div className="w-[340px] shrink-0 h-full transform transition-transform duration-300">
             <WellIntelligencePanel 
                well={selectedWell} 
                activeWell={activeWell}
                onClose={() => setSelectedWellId(null)} 
                onCompare={() => setShowComparison(true)}
             />
          </div>
        )}

      </div>

      {/* Comparison Modal */}
      {showComparison && selectedWell && (
        <WellComparisonModal 
           activeWell={activeWell}
           offsetWell={selectedWell}
           onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
