import React from 'react';
import { POPULAR_LOCATIONS } from '../data/transitData';
import { UserLocation } from '../types/transit';
import { X, MapPin, Compass, Sliders, Play, Pause, Radio } from 'lucide-react';

interface LocationPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onSelectPreset: (lat: number, lng: number, name: string) => void;
  onRequestBrowserLocation: () => void;
  isLocating: boolean;
  nearMeRadiusKm: number;
  onSetRadius: (radius: number) => void;
  gpsUpdateRateSeconds: number;
  onSetUpdateRate: (rate: number) => void;
  isSimulationPaused: boolean;
  onTogglePause: () => void;
}

export const LocationPresetsModal: React.FC<LocationPresetsModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSelectPreset,
  onRequestBrowserLocation,
  isLocating,
  nearMeRadiusKm,
  onSetRadius,
  gpsUpdateRateSeconds,
  onSetUpdateRate,
  isSimulationPaused,
  onTogglePause,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Near-Me Location & GPS Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Real Device Location Action */}
          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Device Geolocation</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Pin to your exact phone / browser GPS coordinates
              </p>
            </div>
            <button
              onClick={() => {
                onRequestBrowserLocation();
                onClose();
              }}
              disabled={isLocating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer shrink-0"
            >
              {isLocating ? 'Locating...' : 'Use My GPS'}
            </button>
          </div>

          {/* Quick Hub Presets */}
          <div>
            <label className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
              Or Jump to Major Transit Hub:
            </label>
            <div className="space-y-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelectPreset(loc.lat, loc.lng, loc.name);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer group"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-blue-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 pl-5">
                    {loc.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Near-Me Search Radius */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">Near-Me Radius</span>
              <span className="font-mono font-bold text-blue-600">{nearMeRadiusKm} km</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2.5, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => onSetRadius(r)}
                  className={`py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                    nearMeRadiusKm === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r >= 1 ? `${r} km` : `${r * 1000} m`}
                </button>
              ))}
            </div>
          </div>

          {/* GPS Simulation Controls */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">GPS Ping Rate</span>
              <span className="font-mono text-slate-500">{gpsUpdateRateSeconds}s intervals</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 1.5, 3].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onSetUpdateRate(sec)}
                  className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    gpsUpdateRateSeconds === sec
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sec}s Live
                </button>
              ))}
            </div>
          </div>

          {/* Pause / Resume Simulation */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-700">Live GPS Telemetry</span>
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                isSimulationPaused
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              {isSimulationPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Live Feed</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Feed</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
