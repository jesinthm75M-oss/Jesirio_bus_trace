import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LiveBus, TransitRoute, BusStop, UserLocation } from '../types/transit';

interface TransitMapProps {
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

export const TransitMap: React.FC<TransitMapProps> = ({
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const stopMarkersRef = useRef<Record<string, L.Marker>>({});
  const busMarkersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
    });

    // CartoDB Positron / Voyager high quality clean vector-like map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group for route polylines
    routeLayersRef.current = L.layerGroup().addTo(map);

    // Map click for custom location pinning
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickSetLocation(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = routeLayersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    routes.forEach((route) => {
      const isSelected = selectedRouteId === 'all' || selectedRouteId === route.id;
      const opacity = isSelected ? (selectedRouteId === route.id ? 0.95 : 0.6) : 0.15;
      const weight = isSelected ? (selectedRouteId === route.id ? 5 : 3.5) : 2;

      const polyline = L.polyline(route.pathWaypoints, {
        color: route.color,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.type === 'Airport Shuttle' ? '6, 8' : undefined,
      });

      polyline.bindTooltip(
        `<div class="font-bold text-xs">${route.routeNumber}</div><div class="text-[11px] text-gray-600">${route.name}</div>`,
        { sticky: true }
      );

      polyline.addTo(group);
    });
  }, [routes, selectedRouteId]);

  // Update Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    stops.forEach((stop) => {
      const isSelected = selectedStopId === stop.id;

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-10'
          }">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 ${
              isSelected ? 'bg-indigo-600 border-white ring-4 ring-indigo-300' : 'bg-white border-slate-700 hover:border-indigo-600'
            }">
              <div class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-700'}"></div>
            </div>
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${stop.code}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (!stopMarkersRef.current[stop.id]) {
        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectStop(stop.id);
        });
        marker.addTo(map);
        stopMarkersRef.current[stop.id] = marker;
      } else {
        stopMarkersRef.current[stop.id].setIcon(stopIcon);
        stopMarkersRef.current[stop.id].setLatLng([stop.lat, stop.lng]);
      }
    });
  }, [stops, selectedStopId, onSelectStop]);

  // Update User Location Marker & Proximity Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-3 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarkerRef.current.bindTooltip(
        `<div class="font-bold text-xs text-blue-600">You Are Here</div><div class="text-[10px] text-gray-500">Live GPS Near Me</div>`,
        { direction: 'top', offset: [0, -10] }
      );
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }

    // Proximity radius circle
    if (!userCircleRef.current) {
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: nearMeRadiusKm * 1000,
        color: '#3b82f6',
        weight: 1.5,
        fillColor: '#60a5fa',
        fillOpacity: 0.08,
        dashArray: '4, 6',
      }).addTo(map);
    } else {
      userCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userCircleRef.current.setRadius(nearMeRadiusKm * 1000);
    }
  }, [userLocation, nearMeRadiusKm]);

  // Update Live Bus Markers with Bearing Rotation & Speed Badge
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentBusIds = new Set(buses.map((b) => b.id));

    // Remove any destroyed buses
    Object.keys(busMarkersRef.current).forEach((busId) => {
      if (!currentBusIds.has(busId)) {
        busMarkersRef.current[busId].remove();
        delete busMarkersRef.current[busId];
      }
    });

    buses.forEach((bus) => {
      const isSelected = selectedBusId === bus.id;
      const route = routes.find((r) => r.id === bus.routeId);
      const routeColor = route?.color || '#0284c7';

      // HTML template for moving bus with bearing arrow and live speed badge
      const busHtml = `
        <div class="relative group cursor-pointer transition-all duration-300 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-115 z-40'
        }">
          <!-- Heading direction indicator -->
          <div 
            class="absolute -inset-1.5 flex items-center justify-center transition-transform duration-500 pointer-events-none"
            style="transform: rotate(${bus.bearing}deg);"
          >
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-900 -translate-y-4"></div>
          </div>

          <!-- Main Bus Badge -->
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-white shadow-lg border-2 border-white transition-all"
               style="background-color: ${routeColor}; box-shadow: 0 4px 12px ${routeColor}66;">
            <!-- Bus SVG Icon -->
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.2-.7-.8-1.2-1.6-1.2H4.2c-.8 0-1.4.5-1.6 1.2l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>

            <!-- Route Number -->
            <span class="font-black text-[11px] tracking-tight leading-none">${bus.routeNumber}</span>

            <!-- Speed indicator -->
            <span class="text-[9px] font-mono px-1 py-0.2 bg-black/30 rounded-full font-bold">
              ${bus.speedKmh > 0 ? `${bus.speedKmh}` : 'STOP'}
            </span>
          </div>

          <!-- EV indicator pill -->
          ${
            bus.isEv
              ? `<div class="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white text-[8px] font-black leading-none">⚡</div>`
              : ''
          }
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busHtml,
        iconSize: [80, 32],
        iconAnchor: [40, 16],
      });

      if (!busMarkersRef.current[bus.id]) {
        const marker = L.marker([bus.lat, bus.lng], {
          icon: busIcon,
          zIndexOffset: isSelected ? 500 : 200,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectBus(bus.id);
        });

        marker.addTo(map);
        busMarkersRef.current[bus.id] = marker;
      } else {
        const marker = busMarkersRef.current[bus.id];
        marker.setIcon(busIcon);
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setZIndexOffset(isSelected ? 600 : 200);
      }
    });
  }, [buses, routes, selectedBusId, onSelectBus]);

  // Center on selected bus when clicked
  useEffect(() => {
    if (!selectedBusId || !mapInstanceRef.current) return;
    const bus = buses.find((b) => b.id === selectedBusId);
    if (bus) {
      mapInstanceRef.current.panTo([bus.lat, bus.lng], { animate: true, duration: 0.6 });
    }
  }, [selectedBusId]);

  // Center on selected stop
  useEffect(() => {
    if (!selectedStopId || !mapInstanceRef.current) return;
    const stop = stops.find((s) => s.id === selectedStopId);
    if (stop) {
      mapInstanceRef.current.panTo([stop.lat, stop.lng], { animate: true, duration: 0.6 });
    }
  }, [selectedStopId]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Overlay Controls / Badges */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none flex flex-col gap-2">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold">Live GPS Feed</span>
          <span className="text-slate-400 font-mono text-[11px]">• {buses.length} Govt Buses Tracked</span>
        </div>
      </div>

      {/* Quick Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-[11px] text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
          <span>You (Near Me)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-800"></span>
          <span>Govt Bus Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-indigo-600"></span>
          <span>Active Bus</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          (Click map to set location)
        </div>
      </div>
    </div>
  );
};
