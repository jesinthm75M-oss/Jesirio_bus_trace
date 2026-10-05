import React from 'react';
import { LiveBus, TransitRoute, BusStop } from '../types/transit';
import { X, MapPin, CheckCircle2, Clock, Zap, Shield, IndianRupee, CreditCard, ChevronRight } from 'lucide-react';
import { calculateDistanceKm, formatEta } from '../utils/geoUtils';

interface RouteDetailsModalProps {
  bus: LiveBus | null;
  route: TransitRoute | null;
  stops: BusStop[];
  onClose: () => void;
  onSelectStop: (stopId: string) => void;
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({
  bus,
  route,
  stops,
  onClose,
  onSelectStop,
}) => {
  if (!bus || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="p-5 text-white flex items-center justify-between relative overflow-hidden"
          style={{ backgroundColor: route.color }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white text-slate-900 font-black text-sm px-2.5 py-0.5 rounded-md shadow-xs">
                {bus.routeNumber}
              </span>
              <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                {bus.busType}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {route.source} ➔ {route.destination}
            </h3>
            <p className="text-xs text-white/80 font-mono mt-0.5">
              Plate: {bus.vehicleNumber} • Depot: {bus.depot}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Telemetry Info Bar */}
        <div className="bg-slate-900 text-white p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">GPS Speed</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {bus.speedKmh > 0 ? `${bus.speedKmh} km/h` : 'At Bus Stop'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Occupancy</div>
            <div className="text-sm font-bold text-blue-300">
              {bus.passengerCount} / {bus.capacity} seats
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Driver Rating</div>
            <div className="text-sm font-bold text-amber-400">
              ★ {bus.driverRating} / 5.0
            </div>
          </div>
        </div>

        {/* Route Stops Timeline */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Route Stops Timeline ({route.stops.length} Stops)
            </h4>
            <span className="text-[11px] text-slate-400">Click stop to inspect arrivals</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {route.stops.map((stopItem, index) => {
              const stop = stops.find((s) => s.id === stopItem.stopId);
              if (!stop) return null;

              const isPassed = index < bus.currentStopIndex;
              const isCurrent = stop.id === bus.nextStopId;
              const distFromBusKm = calculateDistanceKm(bus.lat, bus.lng, stop.lat, stop.lng);
              const estSeconds = Math.round((distFromBusKm / Math.max(20, bus.speedKmh)) * 3600);

              return (
                <div
                  key={stop.id}
                  onClick={() => onSelectStop(stop.id)}
                  className={`relative flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 border border-blue-200 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      isCurrent
                        ? 'bg-blue-600 border-white ring-4 ring-blue-200'
                        : isPassed
                        ? 'bg-emerald-500 border-white'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{stop.name}</span>
                      <span className="text-[10px] font-mono px-1 bg-slate-100 text-slate-600 rounded">
                        {stop.code}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Approaching next stop
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {isPassed ? (
                      <span className="text-[10px] font-semibold text-emerald-600">Departed</span>
                    ) : (
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-700">
                          {formatEta(estSeconds)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {distFromBusKm.toFixed(1)} km
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Govt Fare Calculator Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-4 text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Govt Standard Fares for {route.routeNumber}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">General Adult</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">
                  ₹{route.fareBase}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Student Pass</div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">
                  ₹{Math.max(5, Math.round(route.fareBase * 0.5))}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">All-Day Pass</div>
                <div className="text-sm font-black text-indigo-600 mt-0.5">
                  ₹50
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
