import React from 'react';
import { BusStop, StopArrivalInfo } from '../types/transit';
import { formatEta, formatDistance } from '../utils/geoUtils';
import { Clock, Navigation2, Users, Bell, BellRing, Sparkles, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface NearMeDeparturesProps {
  targetStop: BusStop | undefined;
  nearbyStops: (BusStop & { distanceKm: number })[];
  arrivals: StopArrivalInfo[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onTrackBusOnMap: (busId: string) => void;
  trackedBusId: string | null;
  onToggleTrackBus: (busId: string) => void;
  alarmTriggered: boolean;
  onDismissAlarm: () => void;
  onOpenSeatLayoutForBus: (busId: string) => void;
  onQuickTicketForBus: (busId: string) => void;
}

export const NearMeDepartures: React.FC<NearMeDeparturesProps> = ({
  targetStop,
  nearbyStops,
  arrivals,
  selectedStopId,
  onSelectStop,
  onTrackBusOnMap,
  trackedBusId,
  onToggleTrackBus,
  alarmTriggered,
  onDismissAlarm,
  onOpenSeatLayoutForBus,
  onQuickTicketForBus,
}) => {
  if (!targetStop) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>No bus stop found near your location.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Alarm Banner if triggered */}
      {alarmTriggered && (
        <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 animate-spin" />
            <span className="font-bold text-sm">
              Your tracked bus is arriving now! Head to the boarding queue.
            </span>
          </div>
          <button
            onClick={onDismissAlarm}
            className="bg-black/30 hover:bg-black/50 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stop Header & Switcher */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              {targetStop.code}
            </span>
            <span className="text-xs text-indigo-300 font-medium">Nearest Govt Boarding Point</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-Time Radar</span>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2">
          {targetStop.name}
        </h2>

        {/* Nearby Stops Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] shrink-0 font-medium">Nearby Stops:</span>
          {nearbyStops.slice(0, 4).map((stop) => {
            const isCurrent = targetStop.id === stop.id;
            return (
              <button
                key={stop.id}
                onClick={() => onSelectStop(stop.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {stop.code} ({formatDistance(stop.distanceKm)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Arrivals Feed */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Live Incoming Buses ({arrivals.length})
          </h3>
          <span className="text-[11px] text-slate-400">Updates live via bus GPS</span>
        </div>

        {arrivals.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700">No scheduled buses at this moment</p>
            <p className="text-xs text-slate-500 mt-1">
              Select another route or try another stop from the nearby pills above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {arrivals.map((arrival) => {
              const isTracked = trackedBusId === arrival.busId;
              const isImminent = arrival.etaSeconds <= 90;

              return (
                <div
                  key={arrival.busId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isTracked
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                      : isImminent
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Bus Route Pill & Destination */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-12 h-10 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-black leading-none">{arrival.routeNumber}</span>
                        <span className="text-[8px] uppercase text-blue-300 font-bold mt-0.5">
                          {arrival.isEv ? 'EV AC' : 'GOVT'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            To {arrival.destination}
                          </span>
                          {arrival.isEv && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              ⚡ 100% Electric
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-600 font-semibold">{arrival.vehicleNumber}</span>
                          <span>•</span>
                          <span>{formatDistance(arrival.distanceKm)} away</span>
                          <span>•</span>
                          {/* Occupancy */}
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              arrival.occupancy === 'low'
                                ? 'text-emerald-600'
                                : arrival.occupancy === 'medium'
                                ? 'text-blue-600'
                                : arrival.occupancy === 'high'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            {arrival.occupancy === 'low'
                              ? 'Seats Available'
                              : arrival.occupancy === 'medium'
                              ? 'Standing Room'
                              : arrival.occupancy === 'high'
                              ? 'Crowded'
                              : 'Packed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ETA Countdown Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-black tracking-tight ${
                          isImminent ? 'text-amber-600 animate-pulse' : 'text-indigo-600'
                        }`}
                      >
                        {formatEta(arrival.etaSeconds)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {arrival.status === 'on-time' ? (
                          <span className="text-emerald-600">On Time</span>
                        ) : arrival.status === 'early' ? (
                          <span className="text-blue-600">Early</span>
                        ) : (
                          <span className="text-amber-600">+{arrival.delayMinutes}m delay</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrival Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isImminent ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(8, 100 - (arrival.etaSeconds / 600) * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Actions: Track on Map & Arrival Alarm & Quick Ticket */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTrackBusOnMap(arrival.busId)}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer transition text-[11px]"
                      >
                        <Navigation2 className="w-3 h-3" />
                        <span>Track</span>
                      </button>

                      <button
                        onClick={() => onOpenSeatLayoutForBus(arrival.busId)}
                        className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer transition text-[11px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded"
                      >
                        <span>💺 Seats</span>
                      </button>

                      <button
                        onClick={() => onQuickTicketForBus(arrival.busId)}
                        className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer transition text-[11px] bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded"
                      >
                        <span>🎟️ Ticket</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onToggleTrackBus(arrival.busId)}
                      className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded transition cursor-pointer text-[11px] ${
                        isTracked
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isTracked ? (
                        <>
                          <BellRing className="w-3 h-3 text-white" />
                          <span>Alarm Active</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3 h-3 text-slate-500" />
                          <span>Notify Arrival</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
