import React from 'react';
import { Star, Bus, MapPin, X } from 'lucide-react';
import { TransitRoute, BusStop } from '../types/transit';

interface FavoritesBarProps {
  favoriteRouteIds: string[];
  favoriteStopIds: string[];
  routes: TransitRoute[];
  stops: BusStop[];
  onSelectRoute: (routeId: string) => void;
  onSelectStop: (stopId: string) => void;
  onRemoveFavoriteRoute: (routeId: string) => void;
  onRemoveFavoriteStop: (stopId: string) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favoriteRouteIds,
  favoriteStopIds,
  routes,
  stops,
  onSelectRoute,
  onSelectStop,
  onRemoveFavoriteRoute,
  onRemoveFavoriteStop,
}) => {
  if (favoriteRouteIds.length === 0 && favoriteStopIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
      <div className="flex items-center gap-1 text-amber-900 font-bold shrink-0 text-[11px]">
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
        <span>My Daily Commute:</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {favoriteRouteIds.map((rId) => {
          const route = routes.find((r) => r.id === rId);
          if (!route) return null;
          return (
            <div
              key={rId}
              className="flex items-center gap-1 bg-white border border-amber-300 rounded-lg px-2 py-0.5 shadow-2xs"
            >
              <button
                onClick={() => onSelectRoute(rId)}
                className="font-bold text-slate-800 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
              >
                <Bus className="w-3 h-3 text-amber-600" />
                <span>{route.routeNumber}</span>
              </button>
              <button
                onClick={() => onRemoveFavoriteRoute(rId)}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {favoriteStopIds.map((sId) => {
          const stop = stops.find((s) => s.id === sId);
          if (!stop) return null;
          return (
            <div
              key={sId}
              className="flex items-center gap-1 bg-white border border-amber-300 rounded-lg px-2 py-0.5 shadow-2xs"
            >
              <button
                onClick={() => onSelectStop(sId)}
                className="font-bold text-slate-800 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer truncate max-w-[140px]"
              >
                <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">{stop.name}</span>
              </button>
              <button
                onClick={() => onRemoveFavoriteStop(sId)}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
