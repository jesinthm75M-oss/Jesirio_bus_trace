import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiveBus, UserLocation, TransitRoute, BusStop, StopArrivalInfo } from '../types/transit';
import { BUS_STOPS, TRANSIT_ROUTES, INITIAL_BUSES, DEFAULT_MAP_CENTER } from '../data/transitData';
import { calculateDistanceKm, calculateBearing, playArrivalChime } from '../utils/geoUtils';

export function useLiveTransit() {
  const [buses, setBuses] = useState<LiveBus[]>(INITIAL_BUSES);
  const [routes] = useState<TransitRoute[]>(TRANSIT_ROUTES);
  const [stops] = useState<BusStop[]>(BUS_STOPS);

  // User location (default near Central Secretariat, can be updated via GPS or manual picker)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: DEFAULT_MAP_CENTER.lat,
    lng: DEFAULT_MAP_CENTER.lng,
    accuracyMeters: 12,
    addressName: 'Central Secretariat Gate 3 (Near Govt Central Hub)',
    isCustom: false,
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selected filters
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState<number>(2.5);
  const [filterBusType, setFilterBusType] = useState<string>('all');
  const [onlyWheelchair, setOnlyWheelchair] = useState<boolean>(false);
  const [onlyEv, setOnlyEv] = useState<boolean>(false);

  // Notification and tracked alerts
  const [trackedBusId, setTrackedBusId] = useState<string | null>(null);
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);

  // GPS Telemetry stats
  const [telemetryTick, setTelemetryTick] = useState<number>(0);
  const [satelliteCount] = useState<number>(12);
  const [lastFeedSync, setLastFeedSync] = useState<Date>(new Date());
  const [gpsUpdateRateSeconds, setGpsUpdateRateSeconds] = useState<number>(1.5);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);

  // Browser Geolocation integration
  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy || 10),
          addressName: 'Your Real-Time GPS Location',
          isCustom: true,
        });
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`GPS notice: ${err.message}. Using high-density transit demo area.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number, addressName?: string) => {
    setUserLocation({
      lat,
      lng,
      accuracyMeters: 8,
      addressName: addressName || `Custom Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      isCustom: true,
    });
  }, []);

  // Track waypoint indices for each bus
  const busWaypointState = useRef<Record<string, { currentIdx: number; direction: 1 | -1; dwellTime: number }>>({});

  // Initialize waypoint positions
  useEffect(() => {
    buses.forEach((b, idx) => {
      const route = routes.find((r) => r.id === b.routeId);
      if (route && route.pathWaypoints.length > 0) {
        if (!busWaypointState.current[b.id]) {
          const startIdx = Math.floor((idx / buses.length) * (route.pathWaypoints.length - 1));
          busWaypointState.current[b.id] = {
            currentIdx: startIdx,
            direction: 1,
            dwellTime: 0,
          };
        }
      }
    });
  }, [buses, routes]);

  // Real-time GPS Telemetry simulation loop (runs smoothly every interval)
  useEffect(() => {
    if (isSimulationPaused) return;

    const interval = setInterval(() => {
      setLastFeedSync(new Date());
      setTelemetryTick((prev) => prev + 1);

      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || route.pathWaypoints.length === 0) return bus;

          const state = busWaypointState.current[bus.id] || {
            currentIdx: 0,
            direction: 1,
            dwellTime: 0,
          };

          // If bus is dwelling at a stop, pause speed
          if (state.dwellTime > 0) {
            state.dwellTime -= 1;
            return {
              ...bus,
              speedKmh: 0,
              lastGpsPing: Date.now(),
            };
          }

          // Move along waypoints
          let nextIdx = state.currentIdx + state.direction;
          if (nextIdx >= route.pathWaypoints.length) {
            state.direction = -1;
            nextIdx = route.pathWaypoints.length - 2;
          } else if (nextIdx < 0) {
            state.direction = 1;
            nextIdx = 1;
          }
          state.currentIdx = nextIdx;

          const currentPoint = route.pathWaypoints[state.currentIdx];
          const lookAheadIdx = Math.min(
            Math.max(0, state.currentIdx + state.direction),
            route.pathWaypoints.length - 1
          );
          const nextPoint = route.pathWaypoints[lookAheadIdx];

          // Small GPS jitter for realism (±0.00003 deg ~ 3 meters)
          const jitterLat = (Math.random() - 0.5) * 0.00004;
          const jitterLng = (Math.random() - 0.5) * 0.00004;

          const newLat = currentPoint[0] + jitterLat;
          const newLng = currentPoint[1] + jitterLng;

          const bearing = calculateBearing(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]);

          // Realistic speed variation (25 to 48 km/h depending on traffic)
          const trafficModifier =
            bus.trafficLevel === 'congested' ? 0.6 : bus.trafficLevel === 'moderate' ? 0.85 : 1.0;
          const baseSpeed = 36 + (Math.random() * 10 - 5);
          const computedSpeed = Math.max(12, Math.round(baseSpeed * trafficModifier));

          // Find closest stop to determine nextStop
          let closestStopId = bus.nextStopId;
          let minStopDist = 99999;
          route.stops.forEach((rs) => {
            const stopObj = stops.find((s) => s.id === rs.stopId);
            if (stopObj) {
              const dist = calculateDistanceKm(newLat, newLng, stopObj.lat, stopObj.lng);
              if (dist < minStopDist) {
                minStopDist = dist;
                closestStopId = stopObj.id;
              }
            }
          });

          // If bus is within 70 meters of a stop, chance to dwell for passenger boarding
          if (minStopDist < 0.07 && Math.random() < 0.25) {
            state.dwellTime = 3; // 3 ticks dwell
          }

          // Dynamic passenger count change
          let passengerCount = bus.passengerCount;
          if (Math.random() < 0.15) {
            const delta = Math.floor(Math.random() * 7) - 3;
            passengerCount = Math.min(bus.capacity, Math.max(5, passengerCount + delta));
          }

          let occupancy: LiveBus['occupancy'] = 'low';
          const ratio = passengerCount / bus.capacity;
          if (ratio > 0.85) occupancy = 'full';
          else if (ratio > 0.6) occupancy = 'high';
          else if (ratio > 0.3) occupancy = 'medium';

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            bearing: Math.round(bearing),
            speedKmh: computedSpeed,
            nextStopId: closestStopId,
            passengerCount,
            occupancy,
            lastGpsPing: Date.now(),
            batteryOrFuelPercent: Math.max(10, bus.batteryOrFuelPercent - 0.02),
          };
        });
      });
    }, gpsUpdateRateSeconds * 1000);

    return () => clearInterval(interval);
  }, [gpsUpdateRateSeconds, isSimulationPaused, routes, stops]);

  // Compute Near-Me Stops (sorted by distance from user location)
  const nearbyStops = useMemo(() => {
    return stops
      .map((stop) => {
        const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, stop.lat, stop.lng);
        return {
          ...stop,
          distanceKm,
        };
      })
      .filter((s) => s.distanceKm <= nearMeRadiusKm * 2) // expand a bit for list view
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [stops, userLocation.lat, userLocation.lng, nearMeRadiusKm]);

  // Nearest stop to user
  const nearestUserStop = nearbyStops[0] || stops[0];

  // Compute arrival ETAs for all buses towards the nearest stop or any selected stop
  const targetStopId = selectedStopId || nearestUserStop?.id;
  const targetStop = stops.find((s) => s.id === targetStopId) || nearestUserStop;

  const arrivalsForTargetStop = useMemo((): StopArrivalInfo[] => {
    if (!targetStop) return [];

    const arrivals: StopArrivalInfo[] = [];

    buses.forEach((bus) => {
      const route = routes.find((r) => r.id === bus.routeId);
      if (!route) return;

      const stopIndexInRoute = route.stops.findIndex((s) => s.stopId === targetStop.id);
      if (stopIndexInRoute === -1) return; // Bus route does not pass through this stop

      // Physical distance from bus to target stop
      const directDistKm = calculateDistanceKm(bus.lat, bus.lng, targetStop.lat, targetStop.lng);

      // Average speed factoring traffic
      const avgSpeedKmh = Math.max(15, bus.speedKmh > 0 ? bus.speedKmh : 25);
      // Rough travel time + dwell time for remaining stops
      const travelHours = directDistKm / avgSpeedKmh;
      let etaSeconds = Math.round(travelHours * 3600);

      // Add delay
      if (bus.delayMinutes > 0) {
        etaSeconds += bus.delayMinutes * 60;
      }

      // If bus has already passed or is very far, still show realistic countdown
      arrivals.push({
        busId: bus.id,
        routeNumber: bus.routeNumber,
        routeType: bus.busType,
        vehicleNumber: bus.vehicleNumber,
        destination: route.destination,
        etaSeconds: Math.max(15, etaSeconds),
        distanceKm: directDistKm,
        occupancy: bus.occupancy,
        status: bus.status,
        delayMinutes: bus.delayMinutes,
        isEv: bus.isEv,
      });
    });

    return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
  }, [buses, routes, targetStop]);

  // Tracked Bus Approaching Check
  useEffect(() => {
    if (!trackedBusId || !targetStop) return;

    const arrival = arrivalsForTargetStop.find((a) => a.busId === trackedBusId);
    if (arrival) {
      // Alert when ETA < 2 minutes (120s) or distance < 300m
      if ((arrival.etaSeconds <= 120 || arrival.distanceKm <= 0.3) && !alarmTriggered) {
        setAlarmTriggered(true);
        if (soundAlertsEnabled) {
          playArrivalChime();
        }
      }
    }
  }, [trackedBusId, arrivalsForTargetStop, alarmTriggered, soundAlertsEnabled, targetStop]);

  // Filtered buses based on selection
  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      if (selectedRouteId !== 'all' && bus.routeId !== selectedRouteId) return false;
      if (filterBusType !== 'all' && bus.busType !== filterBusType) return false;
      if (onlyWheelchair && !bus.wheelchairAccessible) return false;
      if (onlyEv && !bus.isEv) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const route = routes.find((r) => r.id === bus.routeId);
        const matchNumber = bus.routeNumber.toLowerCase().includes(query);
        const matchVehicle = bus.vehicleNumber.toLowerCase().includes(query);
        const matchRouteName = route?.name.toLowerCase().includes(query);
        const matchDest = route?.destination.toLowerCase().includes(query);
        if (!matchNumber && !matchVehicle && !matchRouteName && !matchDest) {
          return false;
        }
      }

      return true;
    });
  }, [buses, selectedRouteId, filterBusType, onlyWheelchair, onlyEv, searchQuery, routes]);

  return {
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
    nearestUserStop,
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
    telemetryTick,
  };
}
