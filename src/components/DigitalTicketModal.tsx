import React, { useState } from 'react';
import { DigitalTicket, TransitRoute, BusStop } from '../types/transit';
import { X, QrCode, CheckCircle2, ShieldCheck, Ticket, Download, Clock, IndianRupee } from 'lucide-react';

interface DigitalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoute?: TransitRoute | null;
  initialFromStop?: BusStop | null;
  initialToStop?: BusStop | null;
  initialFare?: number;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  isOpen,
  onClose,
  initialRoute,
  initialFromStop,
  initialToStop,
  initialFare,
}) => {
  const [ticketType, setTicketType] = useState<'Adult Single' | 'Student Concession' | 'Daily Pass' | 'Senior Citizen'>('Adult Single');
  const [passengerName, setPassengerName] = useState('Govt Commuter (Verified)');
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen) return null;

  const baseFare = initialFare || initialRoute?.fareBase || 20;
  const fare =
    ticketType === 'Student Concession'
      ? Math.max(5, Math.round(baseFare * 0.5))
      : ticketType === 'Senior Citizen'
      ? Math.max(5, Math.round(baseFare * 0.6))
      : ticketType === 'Daily Pass'
      ? 50
      : baseFare;

  const ticketId = `DL-TRANSIT-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const validUntil = new Date(now.getTime() + (ticketType === 'Daily Pass' ? 24 * 3600000 : 2 * 3600000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Govt Transit Digital Ticket</h3>
              <p className="text-[10px] text-emerald-100">National Common Mobility Standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {!isGenerated ? (
            <>
              {/* Route Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Route & Transit Line</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {initialRoute ? `${initialRoute.routeNumber} - ${initialRoute.name}` : 'General City Transit'}
                </div>
                {initialFromStop && initialToStop && (
                  <div className="text-[11px] text-slate-600 mt-1">
                    {initialFromStop.name} ➔ {initialToStop.name}
                  </div>
                )}
              </div>

              {/* Pass / Fare Category Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1.5">
                  Concession / Ticket Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'Adult Single', label: 'Adult Standard' },
                    { type: 'Student Concession', label: 'Student (50% Off)' },
                    { type: 'Senior Citizen', label: 'Senior (40% Off)' },
                    { type: 'Daily Pass', label: 'All-Day Pass (₹50)' },
                  ].map((cat) => (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setTicketType(cat.type as any)}
                      className={`p-2 rounded-xl text-left border font-semibold text-xs transition cursor-pointer ${
                        ticketType === cat.type
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare Total Box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Fare Payable</span>
                  <span className="text-xs text-emerald-700">Subsidized Govt Public Transit</span>
                </div>
                <div className="text-xl font-black text-emerald-900">
                  ₹{fare}
                </div>
              </div>

              <button
                onClick={() => setIsGenerated(true)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Generate Verified E-Ticket</span>
              </button>
            </>
          ) : (
            /* Generated E-Ticket View with QR Watermark */
            <div className="space-y-3">
              {/* Ticket Card */}
              <div className="border-2 border-dashed border-emerald-500 rounded-2xl p-4 bg-emerald-50/40 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                      Active Govt Transit E-Pass
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                    {ticketId}
                  </span>
                </div>

                {/* Simulated QR Code Canvas */}
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative">
                  <QrCode className="w-28 h-28 text-slate-900" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-emerald-600 text-white font-black text-[9px] px-1 py-0.5 rounded shadow">
                      GOVT SECURE
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2.5">
                  <div className="font-mono text-[11px] text-slate-500">Scan on Conductor ETM Machine</div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {initialRoute ? initialRoute.routeNumber : 'ALL-LINE PASS'} • ₹{fare}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {ticketType}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-emerald-200 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Issued:</span>
                    <span className="font-mono text-slate-700">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {validUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsGenerated(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Change Options
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
