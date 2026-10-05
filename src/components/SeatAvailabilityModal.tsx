import React, { useState } from 'react';
import { LiveBus, TransitRoute } from '../types/transit';
import { X, Users, Check, ShieldCheck, HeartHandshake, ThumbsUp, Sparkles } from 'lucide-react';

interface SeatAvailabilityModalProps {
  bus: LiveBus | null;
  route: TransitRoute | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SeatAvailabilityModal: React.FC<SeatAvailabilityModalProps> = ({
  bus,
  route,
  isOpen,
  onClose,
}) => {
  const [userReport, setUserReport] = useState<string | null>(null);

  if (!isOpen || !bus) return null;

  const totalSeats = 36;
  const occupiedSeats = Math.min(totalSeats, Math.round((bus.passengerCount / bus.capacity) * totalSeats));
  const standingCount = Math.max(0, bus.passengerCount - totalSeats);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">
                Seat Availability & Crowding • {bus.routeNumber}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Plate: {bus.vehicleNumber} • Driver: {bus.driverName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Seats</span>
              <span className="text-base font-black text-emerald-600">
                {Math.max(0, totalSeats - occupiedSeats)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Standing Area</span>
              <span className="text-base font-black text-blue-600">
                {standingCount > 0 ? `${standingCount} People` : 'Empty'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Crowd Index</span>
              <span
                className={`text-base font-black ${
                  bus.occupancy === 'low'
                    ? 'text-emerald-600'
                    : bus.occupancy === 'medium'
                    ? 'text-blue-600'
                    : bus.occupancy === 'high'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {bus.occupancy === 'low'
                  ? 'Low'
                  : bus.occupancy === 'medium'
                  ? 'Moderate'
                  : bus.occupancy === 'high'
                  ? 'Heavy'
                  : 'Full'}
              </span>
            </div>
          </div>

          {/* Coach Seat Floor Plan Diagram */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 text-xs">Bus Layout (Front to Rear)</span>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Free
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Taken
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-pink-400"></span> Women Priority
                </span>
              </div>
            </div>

            {/* Simplified 4x9 seating grid */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <div className="text-[10px] text-center text-slate-400 font-bold mb-2">
                ⬆ DRIVER CABIN & ENTRY DOOR
              </div>
              <div className="grid grid-cols-5 gap-1.5 max-w-[260px] mx-auto">
                {Array.from({ length: 9 }).map((_, rowIndex) => {
                  const seat1 = rowIndex * 4;
                  const seat2 = rowIndex * 4 + 1;
                  const seat3 = rowIndex * 4 + 2;
                  const seat4 = rowIndex * 4 + 3;

                  const isWomenRow = rowIndex < 2;

                  return (
                    <React.Fragment key={rowIndex}>
                      {/* Left Side (2 seats) */}
                      <div
                        className={`h-6 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                          seat1 < occupiedSeats
                            ? 'bg-slate-300 text-slate-500'
                            : isWomenRow
                            ? 'bg-pink-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {seat1 + 1}
                      </div>
                      <div
                        className={`h-6 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                          seat2 < occupiedSeats
                            ? 'bg-slate-300 text-slate-500'
                            : isWomenRow
                            ? 'bg-pink-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {seat2 + 1}
                      </div>

                      {/* Aisle */}
                      <div className="text-[8px] text-slate-300 flex items-center justify-center">
                        •
                      </div>

                      {/* Right Side (2 seats) */}
                      <div
                        className={`h-6 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                          seat3 < occupiedSeats
                            ? 'bg-slate-300 text-slate-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {seat3 + 1}
                      </div>
                      <div
                        className={`h-6 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                          seat4 < occupiedSeats
                            ? 'bg-slate-300 text-slate-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {seat4 + 1}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="text-[10px] text-center text-slate-400 font-bold mt-2">
                ⬇ REAR EMERGENCY EXIT
              </div>
            </div>
          </div>

          {/* Crowdsourced Passenger Feedback */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="font-bold text-slate-800 text-xs block mb-1">
              Are you currently on this bus?
            </span>
            <p className="text-[11px] text-slate-600 mb-2">
              Help fellow citizens by confirming the real-time crowd status:
            </p>
            {userReport ? (
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your live report ({userReport}) updated the transit map.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUserReport('Many Empty Seats')}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg font-medium text-[11px] transition cursor-pointer"
                >
                  🟢 Many Seats Free
                </button>
                <button
                  onClick={() => setUserReport('Standing Only')}
                  className="py-1.5 px-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-lg font-medium text-[11px] transition cursor-pointer"
                >
                  🟡 Standing Only
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
