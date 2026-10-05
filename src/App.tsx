import React, { useState, useEffect } from 'react';
import { useLiveTransit } from './hooks/useLiveTransit';
import { Header } from './components/Header';
import { TransitMap } from './components/TransitMap';
import { GoogleTransitMap } from './components/GoogleTransitMap';
import { NearMeDepartures } from './components/NearMeDepartures';
import { BusList } from './components/BusList';
import { RouteDetailsModal } from './components/RouteDetailsModal';
import { LocationPresetsModal } from './components/LocationPresetsModal';
import { TripPlanner } from './components/TripPlanner';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { ServiceAlertsModal } from './components/ServiceAlertsModal';
import { SeatAvailabilityModal } from './components/SeatAvailabilityModal';
import { SafetySOSModal } from './components/SafetySOSModal';
import { FavoritesBar } from './components/FavoritesBar';
import { GOVERNMENT_SERVICE_ALERTS } from './data/serviceAlerts';
import { LiveBus, TransitRoute, BusStop } from './types/transit';
import { 
  Bus, 
  MapPin, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Compass, 
  Sparkles,
  Info,
  Route,
  Ticket,
  Layers
} from 'lucide-react';

export default function App() {
  const {
    buses,
    filteredBuses,
    routes,
    stops,
    userLocation,
    isLocating,
    locationError,
    requestCurrentLocation,
    setManualLocation,
    selectedRouteId,
    setSelectedRouteId,
    selectedBusId,
    setSelectedBusId,
    selectedStopId,
    setSelectedStopId,
    searchQuery,
    setSearchQuery,
    nearMeRadiusKm,
    setNearMeRadiusKm,
    filterBusType,
    setFilterBusType,
    onlyWheelchair,
    setOnlyWheelchair,
    onlyEv,
    setOnlyEv,
    nearbyStops,
    targetStop,
    arrivalsForTargetStop,
    trackedBusId,
    setTrackedBusId,
    alarmTriggered,
    setAlarmTriggered,
    soundAlertsEnabled,
    setSoundAlertsEnabled,
    satelliteCount,
    lastFeedSync,
    gpsUpdateRateSeconds,
    setGpsUpdateRateSeconds,
    isSimulationPaused,
    setIsSimulationPaused,
  } = useLiveTransit();

  // Active view tab in sidebar: 'nearMe' | 'allBuses' | 'tripPlanner'
  const [activeTab, setActiveTab] = useState<'nearMe' | 'allBuses' | 'tripPlanner'>('nearMe');
  // Map Engine Toggle: 'google' | 'leaflet'
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');

  // Google Maps Quota Handling
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);
  const [seatBus, setSeatBus] = useState<LiveBus | null>(null);

  // Digital Ticket parameters
  const [ticketRoute, setTicketRoute] = useState<TransitRoute | null>(null);
  const [ticketFromStop, setTicketFromStop] = useState<BusStop | null>(null);
  const [ticketToStop, setTicketToStop] = useState<BusStop | null>(null);
  const [ticketFare, setTicketFare] = useState<number>(20);

  // Favorites state
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<string[]>(['route-502', 'route-720']);
  const [favoriteStopIds, setFavoriteStopIds] = useState<string[]>(['stop-1']);

  // Selected bus object for modal
  const selectedBusObj = buses.find((b) => b.id === selectedBusId) || null;
  const selectedBusRoute = selectedBusObj
    ? routes.find((r) => r.id === selectedBusObj.routeId) || null
    : null;

  const handleSelectBus = (busId: string | null) => {
    setSelectedBusId(busId);
    if (busId) {
      setIsRouteModalOpen(true);
    }
  };

  const handleTrackBusOnMap = (busId: string) => {
    setSelectedBusId(busId);
    setActiveTab('allBuses');
  };

  const handleToggleTrackAlarm = (busId: string) => {
    if (trackedBusId === busId) {
      setTrackedBusId(null);
      setAlarmTriggered(false);
    } else {
      setTrackedBusId(busId);
      setAlarmTriggered(false);
    }
  };

  const handleOpenSeatLayout = (bus: LiveBus) => {
    setSeatBus(bus);
  };

  const handleOpenSeatLayoutForBusId = (busId: string) => {
    const b = buses.find((item) => item.id === busId);
    if (b) {
      setSeatBus(b);
    }
  };

  const handleQuickTicketForBusId = (busId: string) => {
    const b = buses.find((item) => item.id === busId);
    const r = routes.find((item) => item.id === b?.routeId);
    if (r) {
      setTicketRoute(r);
      setTicketFromStop(targetStop || stops[0]);
      setTicketToStop(stops.find((s) => s.name.includes(r.destination)) || stops[stops.length - 1]);
      setTicketFare(r.fareBase);
      setIsTicketOpen(true);
    }
  };

  const handleTripPlanTicket = (route: TransitRoute, fromStop: BusStop, toStop: BusStop, fare: number) => {
    setTicketRoute(route);
    setTicketFromStop(fromStop);
    setTicketToStop(toStop);
    setTicketFare(fare);
    setIsTicketOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-900 overflow-hidden font-sans">
      {/* Required Google Maps Platform Quota Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Header */}
      <Header
        userLocation={userLocation}
        isLocating={isLocating}
        onRequestLocation={requestCurrentLocation}
        soundAlertsEnabled={soundAlertsEnabled}
        onToggleSoundAlerts={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
        satelliteCount={satelliteCount}
        lastFeedSync={lastFeedSync}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenTripPlanner={() => setActiveTab('tripPlanner')}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenTicket={() => {
          setTicketRoute(routes[0]);
          setTicketFromStop(targetStop || stops[0]);
          setTicketToStop(stops[3]);
          setTicketFare(25);
          setIsTicketOpen(true);
        }}
        onOpenSOS={() => setIsSOSOpen(true)}
        activeAlertsCount={GOVERNMENT_SERVICE_ALERTS.length}
      />

      {/* Favorites / Daily Commute Bar */}
      <FavoritesBar
        favoriteRouteIds={favoriteRouteIds}
        favoriteStopIds={favoriteStopIds}
        routes={routes}
        stops={stops}
        onSelectRoute={(routeId) => {
          setSelectedRouteId(routeId);
          setActiveTab('allBuses');
        }}
        onSelectStop={(stopId) => {
          setSelectedStopId(stopId);
          setActiveTab('nearMe');
        }}
        onRemoveFavoriteRoute={(routeId) =>
          setFavoriteRouteIds((prev) => prev.filter((id) => id !== routeId))
        }
        onRemoveFavoriteStop={(stopId) =>
          setFavoriteStopIds((prev) => prev.filter((id) => id !== stopId))
        }
      />

      {/* Geolocation Notice or Error banner */}
      {locationError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Near-Me Arrivals, Trip Planner & Fleet Inspector */}
        <div className="w-full md:w-[460px] lg:w-[500px] flex flex-col bg-slate-100 border-r border-slate-200 z-10 shrink-0 overflow-hidden h-[45vh] md:h-full shadow-lg">
          {/* View Mode Switcher Tabs */}
          <div className="p-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('nearMe')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'nearMe'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Near Me</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {arrivalsForTargetStop.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('allBuses')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'allBuses'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>All Buses</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {filteredBuses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tripPlanner')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'tripPlanner'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Trip Planner</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Fleet: <strong className="text-slate-800">{buses.length} Live</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>EV: <strong className="text-slate-800">71%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>On-Time: <strong className="text-slate-800">92%</strong></span>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTab === 'nearMe' && (
              <NearMeDepartures
                targetStop={targetStop}
                nearbyStops={nearbyStops}
                arrivals={arrivalsForTargetStop}
                selectedStopId={selectedStopId}
                onSelectStop={(stopId) => setSelectedStopId(stopId)}
                onTrackBusOnMap={handleTrackBusOnMap}
                trackedBusId={trackedBusId}
                onToggleTrackBus={handleToggleTrackAlarm}
                alarmTriggered={alarmTriggered}
                onDismissAlarm={() => setAlarmTriggered(false)}
                onOpenSeatLayoutForBus={handleOpenSeatLayoutForBusId}
                onQuickTicketForBus={handleQuickTicketForBusId}
              />
            )}

            {activeTab === 'allBuses' && (
              <BusList
                buses={filteredBuses}
                routes={routes}
                stops={stops}
                selectedBusId={selectedBusId}
                selectedRouteId={selectedRouteId}
                filterBusType={filterBusType}
                searchQuery={searchQuery}
                onlyWheelchair={onlyWheelchair}
                onlyEv={onlyEv}
                onSelectBus={handleSelectBus}
                onSelectRoute={(routeId) => setSelectedRouteId(routeId)}
                onFilterBusType={(type) => setFilterBusType(type)}
                onSearchChange={(q) => setSearchQuery(q)}
                onToggleWheelchair={() => setOnlyWheelchair(!onlyWheelchair)}
                onToggleEv={() => setOnlyEv(!onlyEv)}
                onOpenSeatLayout={handleOpenSeatLayout}
              />
            )}

            {activeTab === 'tripPlanner' && (
              <TripPlanner
                stops={stops}
                routes={routes}
                buses={buses}
                nearestUserStop={targetStop || stops[0]}
                onSelectBusOnMap={handleTrackBusOnMap}
                onOpenTicketForTrip={handleTripPlanTicket}
              />
            )}
          </div>
        </div>

        {/* Right Section: Real-Time Interactive Map Viewport */}
        <div className="flex-1 relative h-[55vh] md:h-full bg-slate-200">
          {/* Map Engine Toggle floating control */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMapEngine('google')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapEngine('leaflet')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mapEngine === 'leaflet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Vector Tile</span>
            </button>
          </div>

          {mapEngine === 'google' ? (
            <GoogleTransitMap
              buses={filteredBuses}
              routes={routes}
              stops={stops}
              userLocation={userLocation}
              selectedBusId={selectedBusId}
              selectedRouteId={selectedRouteId}
              selectedStopId={selectedStopId}
              nearMeRadiusKm={nearMeRadiusKm}
              onSelectBus={handleSelectBus}
              onSelectStop={(stopId) => {
                setSelectedStopId(stopId);
                setActiveTab('nearMe');
              }}
              onMapClickSetLocation={(lat, lng) => {
                setManualLocation(lat, lng);
              }}
            />
          ) : (
            <TransitMap
              buses={filteredBuses}
              routes={routes}
              stops={stops}
              userLocation={userLocation}
              selectedBusId={selectedBusId}
              selectedRouteId={selectedRouteId}
              selectedStopId={selectedStopId}
              nearMeRadiusKm={nearMeRadiusKm}
              onSelectBus={handleSelectBus}
              onSelectStop={(stopId) => {
                setSelectedStopId(stopId);
                setActiveTab('nearMe');
              }}
              onMapClickSetLocation={(lat, lng) => {
                setManualLocation(lat, lng);
              }}
            />
          )}

          {/* Floating Selected Bus Quick Card */}
          {selectedBusObj && (
            <div className="absolute top-14 right-4 z-20 max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 transition-all">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-black text-white"
                    style={{ backgroundColor: selectedBusRoute?.color || '#0284c7' }}
                  >
                    {selectedBusObj.routeNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {selectedBusObj.vehicleNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBusId(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600 mb-2 truncate">
                To: <strong className="text-slate-900">{selectedBusRoute?.destination}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg mb-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Speed</span>
                  <span className="font-bold font-mono text-slate-800">
                    {selectedBusObj.speedKmh > 0 ? `${selectedBusObj.speedKmh} km/h` : 'At Stop'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Occupancy</span>
                  <span className="font-bold text-slate-800">
                    {selectedBusObj.passengerCount} / {selectedBusObj.capacity}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsRouteModalOpen(true)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer text-center"
                >
                  Inspect Route
                </button>
                <button
                  onClick={() => handleOpenSeatLayout(selectedBusObj)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                >
                  Seats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Timeline and Fare Modal */}
      {isRouteModalOpen && selectedBusObj && selectedBusRoute && (
        <RouteDetailsModal
          bus={selectedBusObj}
          route={selectedBusRoute}
          stops={stops}
          onClose={() => setIsRouteModalOpen(false)}
          onSelectStop={(stopId) => {
            setSelectedStopId(stopId);
            setIsRouteModalOpen(false);
            setActiveTab('nearMe');
          }}
        />
      )}

      {/* Location Presets & Telemetry Settings Modal */}
      <LocationPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        userLocation={userLocation}
        onSelectPreset={(lat, lng, name) => setManualLocation(lat, lng, name)}
        onRequestBrowserLocation={requestCurrentLocation}
        isLocating={isLocating}
        nearMeRadiusKm={nearMeRadiusKm}
        onSetRadius={(r) => setNearMeRadiusKm(r)}
        gpsUpdateRateSeconds={gpsUpdateRateSeconds}
        onSetUpdateRate={(rate) => setGpsUpdateRateSeconds(rate)}
        isSimulationPaused={isSimulationPaused}
        onTogglePause={() => setIsSimulationPaused(!isSimulationPaused)}
      />

      {/* Digital QR Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        initialRoute={ticketRoute}
        initialFromStop={ticketFromStop}
        initialToStop={ticketToStop}
        initialFare={ticketFare}
      />

      {/* Service Advisories & Timetables Modal */}
      <ServiceAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* Seat Availability & Crowding Modal */}
      {seatBus && (
        <SeatAvailabilityModal
          bus={seatBus}
          route={routes.find((r) => r.id === seatBus.routeId) || null}
          isOpen={Boolean(seatBus)}
          onClose={() => setSeatBus(null)}
        />
      )}

      {/* Safety & SOS Modal */}
      <SafetySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        activeBus={selectedBusObj}
      />
    </div>
  );
}

