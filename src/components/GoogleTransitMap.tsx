/// <reference types="@types/google.maps" />
import React, { useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMap, 
  useMapsLibrary,
  MapMouseEvent 
} from '@vis.gl/react-google-maps';
import { LiveBus, TransitRoute, BusStop, UserLocation } from '../types/transit';

interface GoogleTransitMapProps {
  buses: LiveBus[];
  routes: TransitRoute[];
  stops: BusStop[];
  userLocation: UserLocation;
  selectedBusId: string | null;
  selectedRouteId: string;
  selectedStopId: string | null;
  nearMeRadiusKm: number;
  onSelectBus: (busId: string | null) => void;
  onSelectStop: (stopId: string | null) => void;
  onMapClickSetLocation: (lat: number, lng: number) => void;
}

// Inner helper component to draw Google Maps polylines
const RoutePolyline: React.FC<{
  path: [number, number][];
  color: string;
  isSelected: boolean;
}> = ({ path, color, isSelected }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib || typeof google === 'undefined') return;

    const polyline = new google.maps.Polyline({
      path: path.map(([lat, lng]) => ({ lat, lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: isSelected ? 0.95 : 0.4,
      strokeWeight: isSelected ? 5 : 3,
      map: map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, path, color, isSelected]);

  return null;
};

// Inner helper component for User Proximity Circle
const UserProximityCircle: React.FC<{
  center: { lat: number; lng: number };
  radiusKm: number;
}> = ({ center, radiusKm }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib || typeof google === 'undefined') return;

    const circle = new google.maps.Circle({
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#60a5fa',
      fillOpacity: 0.12,
      map: map,
      center: center,
      radius: radiusKm * 1000,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, mapsLib, center.lat, center.lng, radiusKm]);

  return null;
};

// Inner controller to pan map smoothly when selection changes
const MapPanController: React.FC<{
  targetLocation: { lat: number; lng: number } | null;
}> = ({ targetLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo(targetLocation);
  }, [map, targetLocation?.lat, targetLocation?.lng]);

  return null;
};

export const GoogleTransitMap: React.FC<GoogleTransitMapProps> = ({
  buses,
  routes,
  stops,
  userLocation,
  selectedBusId,
  selectedRouteId,
  selectedStopId,
  nearMeRadiusKm,
  onSelectBus,
  onSelectStop,
  onMapClickSetLocation,
}) => {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Determine pan target
  const selectedBus = buses.find((b) => b.id === selectedBusId);
  const selectedStop = stops.find((s) => s.id === selectedStopId);
  const panTarget = selectedBus
    ? { lat: selectedBus.lat, lng: selectedBus.lng }
    : selectedStop
    ? { lat: selectedStop.lat, lng: selectedStop.lng }
    : null;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full h-full min-h-[380px] bg-slate-100 overflow-hidden">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          onClick={(e: MapMouseEvent) => {
            if (e.detail.latLng) {
              onMapClickSetLocation(e.detail.latLng.lat, e.detail.latLng.lng);
            }
          }}
        >
          {/* Pan Controller */}
          <MapPanController targetLocation={panTarget} />

          {/* User Proximity Radius Circle */}
          <UserProximityCircle
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            radiusKm={nearMeRadiusKm}
          />

          {/* Route Polylines */}
          {routes.map((route) => {
            const isSelected = selectedRouteId === 'all' || selectedRouteId === route.id;
            return (
              <RoutePolyline
                key={route.id}
                path={route.pathWaypoints}
                color={route.color}
                isSelected={isSelected}
              />
            );
          })}

          {/* User Location Marker ("You are here / Near Me") */}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            zIndex={1000}
            title="You Are Here (Near Me)"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            </div>
          </AdvancedMarker>

          {/* Bus Stop Markers */}
          {stops.map((stop) => {
            const isSelected = selectedStopId === stop.id;
            return (
              <AdvancedMarker
                key={stop.id}
                position={{ lat: stop.lat, lng: stop.lng }}
                zIndex={isSelected ? 500 : 100}
                onClick={() => onSelectStop(stop.id)}
                title={`${stop.name} (${stop.code})`}
              >
                <div
                  className={`group relative cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 ${
                      isSelected
                        ? 'bg-indigo-600 border-white ring-4 ring-indigo-300'
                        : 'bg-white border-slate-700 hover:border-indigo-600'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-700'}`}
                    />
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {stop.code}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Live Government Buses with Bearing Arrow & Speed */}
          {buses.map((bus) => {
            const isSelected = selectedBusId === bus.id;
            const route = routes.find((r) => r.id === bus.routeId);
            const routeColor = route?.color || '#0284c7';

            return (
              <AdvancedMarker
                key={bus.id}
                position={{ lat: bus.lat, lng: bus.lng }}
                zIndex={isSelected ? 900 : 300}
                onClick={() => onSelectBus(bus.id)}
                title={`${bus.routeNumber} - ${bus.vehicleNumber}`}
              >
                <div
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                >
                  {/* Heading direction arrow */}
                  <div
                    className="absolute -inset-1.5 flex items-center justify-center pointer-events-none"
                    style={{ transform: `rotate(${bus.bearing}deg)` }}
                  >
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-900 -translate-y-4"></div>
                  </div>

                  {/* Main Bus Badge */}
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-white shadow-lg border-2 border-white transition-all"
                    style={{
                      backgroundColor: routeColor,
                      boxShadow: `0 4px 12px ${routeColor}66`,
                    }}
                  >
                    {/* Bus Icon */}
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 6v6" />
                      <path d="M15 6v6" />
                      <path d="M2 12h19.6" />
                      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.2-.7-.8-1.2-1.6-1.2H4.2c-.8 0-1.4.5-1.6 1.2l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
                      <circle cx="7" cy="18" r="2" />
                      <path d="M9 18h5" />
                      <circle cx="16" cy="18" r="2" />
                    </svg>

                    {/* Route Number */}
                    <span className="font-black text-[11px] tracking-tight leading-none">
                      {bus.routeNumber}
                    </span>

                    {/* Speed indicator */}
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-black/30 rounded-full font-bold">
                      {bus.speedKmh > 0 ? `${bus.speedKmh}` : 'STOP'}
                    </span>
                  </div>

                  {/* EV Pill */}
                  {bus.isEv && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white text-[8px] font-black leading-none">
                      ⚡
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Google Maps Live GPS</span>
            <span className="text-slate-400 font-mono text-[11px]">
              • {buses.length} Govt Buses Near Me
            </span>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};
