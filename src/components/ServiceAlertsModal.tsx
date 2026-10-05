import React, { useState } from 'react';
import { GOVERNMENT_SERVICE_ALERTS, ROUTE_TIMETABLES } from '../data/serviceAlerts';
import { X, AlertTriangle, Info, Clock, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ServiceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceAlertsModal: React.FC<ServiceAlertsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'alerts' | 'timetables'>('alerts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Govt Transit Advisories & Timetables</h3>
              <p className="text-[10px] text-slate-400">Department of Transport Official Bulletin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setTab('alerts')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'alerts'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Service Alerts ({GOVERNMENT_SERVICE_ALERTS.length})</span>
          </button>
          <button
            onClick={() => setTab('timetables')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'timetables'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>First / Last Bus Timetables</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
          {tab === 'alerts' ? (
            GOVERNMENT_SERVICE_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border ${
                  alert.severity === 'warning'
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-blue-200 bg-blue-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'warning'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-blue-200 text-blue-900'
                    }`}
                  >
                    {alert.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Valid: {alert.effectiveUntil}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {alert.description}
                </p>
              </div>
            ))
          ) : (
            <div className="space-y-2.5">
              {Object.values(ROUTE_TIMETABLES).map((tt) => (
                <div
                  key={tt.routeNumber}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {tt.routeNumber}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      {tt.operatingDays}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-700 mt-1">
                    To {tt.destination}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">First Bus / Last Bus</span>
                      <span className="font-bold font-mono text-slate-800">
                        {tt.firstBus} ➔ {tt.lastBus}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Frequency</span>
                      <span className="font-bold text-blue-600">
                        Every {tt.peakFrequencyMins}m (Peak) / {tt.offPeakFrequencyMins}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
