'use client';
import { Info, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function YearlyFooter({ yearlyData, price }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!yearlyData || yearlyData.length === 0) return null;

  // Yearly Open
  const currentYear = new Date().getFullYear();
  const januaryCandle = yearlyData.find(k => 
    new Date(k[0]).getFullYear() === currentYear && new Date(k[0]).getMonth() === 0
  );
  const yOpen = januaryCandle ? parseFloat(januaryCandle[1]) : parseFloat(yearlyData[0][1]);

  const isBullish = price > yOpen;
  const yearlyStatus = {
    text: isBullish ? 'BULLISH BIAS' : 'BEARISH BIAS',
    bg: isBullish ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30',
    color: isBullish ? 'text-emerald-400' : 'text-red-400'
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0b]/95 backdrop-blur-sm border-t border-neutral-800/50 z-50">
      <div className="max-w-7xl mx-auto px-4 h-12 flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center gap-4 relative">
          <div
            className="group cursor-help flex items-center h-full border-r border-neutral-800/50 pr-4"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
              YEARLY CONTEXT <Info size={10} />
            </span>

            {showTooltip && (
              <div className="absolute bottom-10 left-0 w-64 bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-2xl z-50 text-xs text-neutral-300">
                <h4 className="text-amber-500 font-bold mb-1">Yıllık Açılış Önemi</h4>
                <p>Kurumsal pivot seviyesi. Üstü alıcı (Boğa), altı satıcı (Ayı) kontrolü demektir.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-500 font-bold text-sm">
              {formatCurrency(yOpen, 0)}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${yearlyStatus.bg} ${yearlyStatus.color} font-bold flex items-center gap-1`}>
              {yearlyStatus.text}
              {isBullish ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            </span>
          </div>
        </div>

        {/* Right Side - Legend */}
        <div className="hidden md:flex items-center gap-5 text-[9px] font-mono text-neutral-600">
          <span className="flex items-center gap-1">
            <Flame size={10} className="text-purple-400" /> CONFLUENCE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> RES
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> SUP
          </span>
        </div>
      </div>
    </div>
  );
}
