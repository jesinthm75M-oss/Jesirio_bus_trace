import React from 'react';
import { LiveBus, TransitRoute, BusStop } from '../types/transit';
import { Search, Filter, Bus, Zap, Shield, Gauge, Check, MapPin, ChevronRight, User } from 'lucide-react';

interface BusListProps {
  buses: LiveBus[];
  routes: TransitRoute[];
  stops: BusStop[];
  selectedBusId: string | null;
  selectedRouteId: string;
  filterBusType: string;
  searchQuery: string;
  onlyWheelchair: boolean;
  onlyEv: boolean;
  onSelectBus: (busId: string | null) => void;
  onSelectRoute: (routeId: string) => void;
  onFilterBusType: (type: string) => void;
  onSearchChange: (query: string) => void;
  onToggleWheelchair: () => void;
  onToggleEv: () => void;
  onOpenSeatLayout: (bus: LiveBus) => void;
}

export const BusList: React.FC<BusListProps> = ({
  buses,
  routes,
  stops,
  selectedBusId,
  selectedRouteId,
  filterBusType,
  searchQuery,
  onlyWheelchair,
  onlyEv,
  onSelectBus,
  onSelectRoute,
  onFilterBusType,
  onSearchChange,
  onToggleWheelchair,
  onToggleEv,
  onOpenSeatLayout,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route (e.g. 502, Airport), bus plate, or stop..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Route Selector Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectRoute('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
              selectedRouteId === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Routes ({routes.length})
          </button>
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                selectedRouteId === route.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              <span>{route.routeNumber}</span>
            </button>
          ))}
        </div>

        {/* Extra Toggles: EV & Wheelchair */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
          <button
            onClick={onToggleEv}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              onlyEv
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Electric Buses Only</span>
          </button>

          <button
            onClick={onToggleWheelchair}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              onlyWheelchair
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Accessible Low Floor</span>
          </button>
        </div>
      </div>

      {/* Bus Cards List */}
      <div className="p-3 overflow-y-auto space-y-2.5 max-h-[500px]">
        {buses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No live buses match the current filter criteria.
          </div>
        ) : (
          buses.map((bus) => {
            const isSelected = selectedBusId === bus.id;
            const route = routes.find((r) => r.id === bus.routeId);
            const nextStop = stops.find((s) => s.id === bus.nextStopId);

            return (
              <div
                key={bus.id}
                onClick={() => onSelectBus(isSelected ? null : bus.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Header: Route Number, Vehicle Plate, Speed */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded font-black text-xs text-white shadow-xs"
                      style={{ backgroundColor: route?.color || '#0284c7' }}
                    >
                      {bus.routeNumber}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {bus.vehicleNumber}
                    </span>
                    {bus.isEv && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" /> EV
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-bold text-slate-700">
                      {bus.speedKmh > 0 ? `${bus.speedKmh} km/h` : 'At Stop'}
                    </span>
                  </div>
                </div>

                {/* Route Direction & Depot */}
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {route ? `${route.source} ➔ ${route.destination}` : 'City Transit Corridor'}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">Approaching: <strong className="text-slate-700">{nextStop?.name || 'Upcoming Stop'}</strong></span>
                  </div>
                </div>

                {/* Driver, Battery & Status Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{bus.driverName}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-medium">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSeatLayout(bus);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[10px] transition cursor-pointer"
                    >
                      💺 Seats Layout
                    </button>
                    <span className="text-slate-600 font-mono">
                      {bus.isEv ? `⚡ ${Math.round(bus.batteryOrFuelPercent)}%` : `⛽ ${Math.round(bus.batteryOrFuelPercent)}%`}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        bus.status === 'on-time'
                          ? 'bg-emerald-50 text-emerald-700'
                          : bus.status === 'early'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {bus.status === 'on-time' ? 'On-Time' : bus.status === 'early' ? 'Early' : `+${bus.delayMinutes}m`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
