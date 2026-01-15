'use client';
import { BarChart2, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { calculateEMA, formatCurrency } from '@/lib/utils';

export default function TrendMonitor({ fourHourData }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trend = useMemo(() => {
    if (!fourHourData || fourHourData.length < 200) return { ema200: null, bias: 'NÖTR', isBullish: null };
    const closes = fourHourData.map(c => parseFloat(c[4]));
    const ema200 = calculateEMA(closes, 200);
    const lastPrice = closes[closes.length - 1];
    const isBullish = lastPrice > ema200;
    return { 
      ema200, 
      bias: isBullish ? 'BULLISH' : 'BEARISH',
      isBullish
    };
  }, [fourHourData]);

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
            <strong className="text-amber-500 block mb-1">Dinamik Trend (EMA 200)</strong>
            Fiyatın ortalamaya göre konumu, piyasanın "en az direnç yolunu" gösterir.
          </div>
        )}
      </div>

      <BarChart2 className="text-neutral-700 w-8 h-8 mb-2" />
      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">4H TREND BIAS</div>
      
      <div className={`flex items-center gap-2 text-lg font-bold font-mono tracking-wider ${
        trend.isBullish === null ? 'text-neutral-500' : 
        trend.isBullish ? 'text-emerald-500' : 'text-red-500'
      }`}>
        {trend.isBullish !== null && (
          trend.isBullish ? <TrendingUp size={18} /> : <TrendingDown size={18} />
        )}
        {trend.bias}
      </div>
      
      <div className="mt-2 pt-2 border-t border-neutral-800/50 w-full">
        <div className="text-[9px] text-neutral-600 mb-0.5">EMA 200 (4H)</div>
        <div className="text-xs text-neutral-400 font-mono">
          {trend.ema200 ? formatCurrency(trend.ema200) : 'HESAPLANIYOR...'}
        </div>
      </div>
    </div>
  );
}
