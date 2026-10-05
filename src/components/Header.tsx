import React from 'react';
import { 
  Navigation, 
  Bell, 
  BellOff, 
  Compass, 
  ShieldCheck, 
  MapPin, 
  Radio, 
  Ticket, 
  AlertTriangle, 
  Route, 
  AlertOctagon 
} from 'lucide-react';
import { UserLocation } from '../types/transit';

interface HeaderProps {
  userLocation: UserLocation;
  isLocating: boolean;
  onRequestLocation: () => void;
  soundAlertsEnabled: boolean;
  onToggleSoundAlerts: () => void;
  satelliteCount: number;
  lastFeedSync: Date;
  onOpenPresets: () => void;
  onOpenTripPlanner: () => void;
  onOpenAlerts: () => void;
  onOpenTicket: () => void;
  onOpenSOS: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userLocation,
  isLocating,
  onRequestLocation,
  soundAlertsEnabled,
  onToggleSoundAlerts,
  satelliteCount,
  lastFeedSync,
  onOpenPresets,
  onOpenTripPlanner,
  onOpenAlerts,
  onOpenTicket,
  onOpenSOS,
  activeAlertsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Govt Notice Ticker */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 px-4 py-1 text-[11px] font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="bg-white/20 text-white font-bold px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wide">
            Govt Official
          </span>
          <span className="truncate">
            Ministry of Transport & Public Transit • Live GPS Telemetry Network • GTFS-RT Feed Active
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-white/90 text-[10px] shrink-0 font-mono">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
            <span>GPS Satellites: {satelliteCount} locked</span>
          </span>
          <span>•</span>
          <span>Synced: {lastFeedSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10 shrink-0">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                TransitPulse
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE GPS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Near-Me Govt Bus Tracking & Real-Time ETAs
            </p>
          </div>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Trip Planner Shortcut */}
          <button
            onClick={onOpenTripPlanner}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Route className="w-3.5 h-3.5 text-blue-400" />
            <span>Plan Trip</span>
          </button>

          {/* Digital Ticket Shortcut */}
          <button
            onClick={onOpenTicket}
            className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Ticket</span>
          </button>

          {/* Service Alerts with Badge */}
          <button
            onClick={onOpenAlerts}
            className="relative flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5"></span>
            )}
          </button>

          {/* Safety SOS */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1 bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Emergency Police & Safety Hotline"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Location Picker */}
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left group"
            title="Change Location or Near-Me Radius"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="max-w-[100px] sm:max-w-[130px] truncate text-slate-300 font-medium">
              {userLocation.addressName?.split('(')[0] || 'Near Me'}
            </span>
          </button>

          {/* Locate Me Button */}
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Sound Alarm Toggle */}
          <button
            onClick={onToggleSoundAlerts}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              soundAlertsEnabled
                ? 'bg-indigo-900/60 border-indigo-700 text-indigo-300 hover:bg-indigo-800/70'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={soundAlertsEnabled ? 'Arrival chime is ON' : 'Arrival chime is OFF'}
          >
            {soundAlertsEnabled ? <Bell className="w-4 h-4 text-indigo-300" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

