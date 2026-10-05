import React from 'react';
import { X, ShieldCheck, PhoneCall, AlertOctagon, Video, Radio, HeartPulse } from 'lucide-react';
import { LiveBus } from '../types/transit';

interface SafetySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBus?: LiveBus | null;
}

export const SafetySOSModal: React.FC<SafetySOSModalProps> = ({
  isOpen,
  onClose,
  activeBus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-200" />
            <div>
              <h3 className="font-bold text-sm">Govt Transit Passenger Safety & SOS</h3>
              <p className="text-[10px] text-rose-100">National Emergency Response Support System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {/* Active Bus Security Certification */}
          {activeBus && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Tracked Bus</div>
                <div className="font-mono font-bold text-slate-800">{activeBus.vehicleNumber} ({activeBus.routeNumber})</div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  AIS-140 GPS & Panic System Active
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          )}

          {/* Safety Features Deployed on all Govt Buses */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Video className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">3x CCTV IP Cameras</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Front, passenger aisle, and rear doors monitored 24/7 by Govt Central Transit Command.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Radio className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Physical SOS Panic Buttons</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Located near every window seat. Instantly alerts Police control room with live bus coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Emergency Call Numbers */}
          <div>
            <label className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
              Emergency Hotlines (Toll-Free):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 font-bold transition text-xs"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <div>
                  <div className="text-[9px] uppercase text-rose-600">Police SOS</div>
                  <div>Dial 112</div>
                </div>
              </a>

              <a
                href="tel:1091"
                className="p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl flex items-center gap-2 text-pink-800 font-bold transition text-xs"
              >
                <HeartPulse className="w-4 h-4 text-pink-600" />
                <div>
                  <div className="text-[9px] uppercase text-pink-600">Women Helpline</div>
                  <div>Dial 1091</div>
                </div>
              </a>
            </div>
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
