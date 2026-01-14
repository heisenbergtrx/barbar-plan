'use client';
import { Calendar, AlertCircle } from 'lucide-react';

// Demo Verisi (API bağlayana kadar placeholder)
const EVENTS = [
  { time: 'WED 22:00', event: 'FOMC Meeting Minutes', impact: 'HIGH' },
  { time: 'THU 16:30', event: 'CPI (Tüfe) Data', impact: 'HIGH' },
  { time: 'FRI 16:30', event: 'NFP (Tarım Dışı)', impact: 'HIGH' },
];

export default function EconomicCalendar() {
  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
        <Calendar size={14} className="text-red-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">VOLATILITY EVENTS</span>
      </div>

      <div className="space-y-2">
        {EVENTS.map((evt, i) => (
          <div key={i} className="flex justify-between items-center text-xs group hover:bg-white/5 p-1 rounded transition-colors cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-mono text-[10px]">{evt.time}</span>
              <span className="text-neutral-300 font-medium">{evt.event}</span>
            </div>
            <div className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[9px] text-neutral-600 italic text-center">
        *Sadece High Impact (Kırmızı) haberler listelenir.
      </div>
    </div>
  );
}