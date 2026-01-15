'use client';
import { Gauge, HelpCircle, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { calculateATR } from '@/lib/utils';

export default function MarketVitals({ dailyData }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const vitals = useMemo(() => {
    if (!dailyData || dailyData.length < 15) return { rangePercent: 0, rvol: 0 };

    const atr = calculateATR(dailyData, 14);
    const currentCandle = dailyData[dailyData.length - 1];
    const currentRange = parseFloat(currentCandle[2]) - parseFloat(currentCandle[3]);
    const rangePercent = (currentRange / atr) * 100;

    const currentVol = parseFloat(currentCandle[5]);
    const avgVol = dailyData.slice(dailyData.length - 11, dailyData.length - 1)
      .reduce((acc, c) => acc + parseFloat(c[5]), 0) / 10;

    return { rangePercent, rvol: currentVol / avgVol };
  }, [dailyData]);

  const isExtended = vitals.rangePercent > 100;
  const isWarning = vitals.rangePercent > 80;
  const rangeColor = isExtended ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-emerald-500';
  const rvolColor = vitals.rvol > 1.5 ? 'text-amber-500' : 'text-neutral-400';

  return (
    <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center relative group">
      {/* Tooltip */}
      <div
        className="absolute top-2 right-2 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <HelpCircle className="w-3 h-3 text-neutral-600 hover:text-amber-500 transition-colors" />
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-[10px] text-neutral-300 shadow-xl z-50 text-left">
            <strong className="text-amber-500 block mb-1">Menzil & Hacim (TR)</strong>
            Günlük menzil (ATR) %100'ü aştıysa hareketin "şiştiği" (overextended) anlamına gelebilir.
          </div>
        )}
      </div>

      <Gauge className="text-neutral-700 w-8 h-8 mb-2" />
      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">MARKET VITALS</div>

      <div className="flex justify-between w-full px-2 border-t border-neutral-800/50 pt-3">
        <div className="text-left">
          <div className="text-[9px] text-neutral-600 mb-0.5">DAILY RANGE</div>
          <div className={`font-mono font-bold text-sm ${rangeColor} ${isExtended ? 'animate-pulse' : ''}`}>
            %{vitals.rangePercent.toFixed(0)}
            <span className="text-[9px] text-neutral-600 ml-1">/ ATR</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] text-neutral-600 mb-0.5">RVOL</div>
          <div className={`font-mono font-bold text-sm ${rvolColor}`}>
            {vitals.rvol.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-3 pt-2 border-t border-neutral-800/50 w-full">
        {isExtended ? (
          <div className="flex items-center justify-center gap-1.5 text-red-400 text-[10px]">
            <AlertTriangle size={10} className="animate-pulse" />
            <span>Range Extended - Divergence ara</span>
          </div>
        ) : (
          <div className="text-[10px] text-neutral-600">Range Available</div>
        )}
      </div>
    </div>
  );
}
