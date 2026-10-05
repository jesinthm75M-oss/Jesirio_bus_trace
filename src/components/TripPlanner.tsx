import React, { useState, useMemo } from 'react';
import { BusStop, TransitRoute, LiveBus, TripPlanOption } from '../types/transit';
import { calculateDistanceKm, formatEta, formatDistance } from '../utils/geoUtils';
import { 
  Navigation, 
  MapPin, 
  ArrowRight, 
  Clock, 
  IndianRupee, 
  Bus, 
  ArrowUpDown, 
  Compass, 
  CheckCircle,
  Ticket,
  ChevronRight
} from 'lucide-react';

interface TripPlannerProps {
  stops: BusStop[];
  routes: TransitRoute[];
  buses: LiveBus[];
  nearestUserStop: BusStop;
  onSelectBusOnMap: (busId: string) => void;
  onOpenTicketForTrip: (route: TransitRoute, fromStop: BusStop, toStop: BusStop, fare: number) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  stops,
  routes,
  buses,
  nearestUserStop,
  onSelectBusOnMap,
  onOpenTicketForTrip,
}) => {
  const [fromStopId, setFromStopId] = useState<string>(nearestUserStop?.id || stops[0]?.id);
  const [toStopId, setToStopId] = useState<string>('stop-15'); // Cyber IT Tech Park by default

  const handleSwap = () => {
    const temp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(temp);
  };

  // Find matching transit route options
  const tripOptions = useMemo((): TripPlanOption[] => {
    const fromStop = stops.find((s) => s.id === fromStopId);
    const toStop = stops.find((s) => s.id === toStopId);
    if (!fromStop || !toStop || fromStop.id === toStop.id) return [];

    const options: TripPlanOption[] = [];

    routes.forEach((route) => {
      const fromIdx = route.stops.findIndex((s) => s.stopId === fromStop.id);
      const toIdx = route.stops.findIndex((s) => s.stopId === toStop.id);

      // Direct route going forward
      if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
        const intermediateStopsInfo = route.stops.slice(fromIdx, toIdx + 1);
        const stopsList = intermediateStopsInfo
          .map((si) => stops.find((s) => s.id === si.stopId)!)
          .filter(Boolean);

        const fromDist = route.stops[fromIdx].distanceFromStartKm;
        const toDist = route.stops[toIdx].distanceFromStartKm;
        const totalDistanceKm = Math.max(1, Number((toDist - fromDist).toFixed(1)));

        // Estimated transit duration
        const estimatedDurationMin = Math.round(totalDistanceKm * 2.8 + (stopsList.length * 0.8));

        // Find closest live bus on this route approaching 'fromStop'
        const candidateBuses = buses.filter((b) => b.routeId === route.id);
        let bestBus: LiveBus | null = null;
        let lowestEtaSeconds = 999999;

        candidateBuses.forEach((b) => {
          const distToFromStop = calculateDistanceKm(b.lat, b.lng, fromStop.lat, fromStop.lng);
          const etaSec = Math.round((distToFromStop / Math.max(18, b.speedKmh)) * 3600);
          if (etaSec < lowestEtaSeconds) {
            lowestEtaSeconds = etaSec;
            bestBus = b;
          }
        });

        // Compute proportional fare
        const fare = Math.round(Math.max(10, route.fareBase * (totalDistanceKm / 12)));

        options.push({
          id: `plan-${route.id}`,
          route,
          fromStop,
          toStop,
          totalDistanceKm,
          estimatedDurationMin,
          fare,
          liveBus: bestBus,
          etaMinutesToBoard: Math.round(lowestEtaSeconds / 60),
          stopsCount: stopsList.length,
          stopsList,
        });
      }
    });

    return options.sort((a, b) => a.etaMinutesToBoard - b.etaMinutesToBoard);
  }, [fromStopId, toStopId, stops, routes, buses]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Navigation className="w-4 h-4 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold">Govt Transit Trip Planner</h2>
        </div>
        <p className="text-xs text-slate-300">
          Find the fastest bus, live arrival time at boarding point, and govt ticket fare.
        </p>

        {/* Inputs */}
        <div className="mt-4 space-y-2.5 relative">
          {/* Origin */}
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <div className="flex-1">
              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Boarding Stop (Origin)
              </label>
              <select
                value={fromStopId}
                onChange={(e) => setFromStopId(e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer mt-0.5"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                    {s.name} ({s.code}) {s.id === nearestUserStop?.id ? '★ Near You' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="absolute right-4 top-[38px] -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition cursor-pointer z-10"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* Destination */}
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
            <div className="flex-1">
              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Destination Stop
              </label>
              <select
                value={toStopId}
                onChange={(e) => setToStopId(e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer mt-0.5"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Trip Results */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Direct Bus Options ({tripOptions.length})
          </span>
          <span>Ranked by quickest boarding ETA</span>
        </div>

        {tripOptions.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
            <Bus className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No direct bus connects these two stops</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Try choosing an interchange stop like Connaught Place or Central Secretariat.
            </p>
          </div>
        ) : (
          tripOptions.map((option) => (
            <div
              key={option.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-black text-white"
                    style={{ backgroundColor: option.route.color }}
                  >
                    {option.route.routeNumber}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {option.route.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {option.stopsCount} stops • {formatDistance(option.totalDistanceKm)} • ~{option.estimatedDurationMin} min ride
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-900">
                    ₹{option.fare}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Standard Fare</div>
                </div>
              </div>

              {/* Live Bus Boarding Info */}
              {option.liveBus ? (
                <div className="mt-3 p-2.5 bg-blue-50/70 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-700 font-medium">
                      Next Bus <strong className="text-slate-900 font-mono">{option.liveBus.vehicleNumber}</strong> arrives at your stop in:
                    </span>
                  </div>
                  <span className="font-bold text-blue-700 font-mono">
                    ~{option.etaMinutesToBoard} min
                  </span>
                </div>
              ) : (
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                  Scheduled every 6-8 minutes
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {option.liveBus && (
                  <button
                    onClick={() => onSelectBusOnMap(option.liveBus!.id)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track on Map</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    onOpenTicketForTrip(option.route, option.fromStop, option.toStop, option.fare)
                  }
                  className="ml-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 text-blue-300" />
                  <span>Get Digital Ticket</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
