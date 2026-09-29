import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Well } from '../../types';

// Custom icons using Lucide/SVG or DivIcon for better styling
const createWellIcon = (isActive: boolean, relevanceScore: number) => {
  const bgColor = isActive ? 'bg-accent-500' : relevanceScore >= 75 ? 'bg-emerald-500' : relevanceScore >= 50 ? 'bg-amber-500' : 'bg-slate-400';
  const sizeClass = isActive ? 'w-6 h-6' : 'w-4 h-4';
  const html = `
    <div class="${sizeClass} rounded-full ${bgColor} border-2 border-navy-950 shadow-lg flex items-center justify-center text-white ${isActive ? 'pulse-dot' : ''}">
      ${isActive ? '★' : ''}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: isActive ? [24, 24] : [16, 16],
    iconAnchor: isActive ? [12, 12] : [8, 8],
    popupAnchor: [0, -10],
  });
};

// Component to handle map zooming to fit bounds
function MapBoundsUpdater({ activeWell, radius }: { activeWell: Well; radius: number }) {
  const map = useMap();
  useEffect(() => {
    // 1 km is roughly 0.009 degrees of latitude
    const latOffset = (radius / 111);
    const bounds = L.latLngBounds(
      [activeWell.latitude - latOffset, activeWell.longitude - latOffset],
      [activeWell.latitude + latOffset, activeWell.longitude + latOffset]
    );
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
  }, [map, activeWell, radius]);
  return null;
}

interface WellMapProps {
  activeWell: Well;
  nearbyWells: Well[];
  radius: number;
  selectedWellId: string | null;
  onWellSelect: (wellId: string) => void;
}

export function WellMap({ activeWell, nearbyWells, radius, onWellSelect }: WellMapProps) {
  const activeIcon = useMemo(() => createWellIcon(true, 100), []);
  
  return (
    <div className="w-full h-full bg-navy-900 rounded-lg overflow-hidden border border-border-default relative z-0">
      <MapContainer
        center={[activeWell.latitude, activeWell.longitude]}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        zoomControl={false}
      >
        {import.meta.env.VITE_CARTO_API_KEY ? (
          <TileLayer
            url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY}&v=2`}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
          />
        ) : (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded shadow-md z-[1000] text-xs font-bold">
              CARTO API Key missing. Displaying standard fallback map.
            </div>
          </>
        )}
        
        <MapBoundsUpdater activeWell={activeWell} radius={radius} />

        {/* Radius Circle */}
        <Circle
          center={[activeWell.latitude, activeWell.longitude]}
          radius={radius * 1000} // meters
          pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }}
        />

        {/* Active Well Marker */}
        <Marker 
          position={[activeWell.latitude, activeWell.longitude]} 
          icon={activeIcon}
          zIndexOffset={1000}
        >
          <Popup className="dark-popup">
            <div className="p-1">
              <p className="text-xs font-bold text-navy-950">{activeWell.id} (Active)</p>
              <p className="text-[10px] text-slate-600">Depth: {activeWell.currentDepth}m</p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Wells Markers */}
        {nearbyWells.map(well => (
          <Marker
            key={well.id}
            position={[well.latitude, well.longitude]}
            icon={createWellIcon(false, well.relevanceScore)}
            eventHandlers={{
              click: () => onWellSelect(well.id),
            }}
          >
            <Popup className="dark-popup">
              <div className="p-1">
                <p className="text-xs font-bold text-navy-950">{well.id}</p>
                <p className="text-[10px] text-slate-600">Rel: {well.relevanceScore}% | Dist: {well.distanceFromActiveWell}km</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
