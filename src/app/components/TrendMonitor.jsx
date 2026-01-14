'use client';
import { BarChart2, HelpCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

const calculateEMA = (closes, period) => {
  if (!closes || closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] * k) + (ema * (1 - k));
  }
  return ema;
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

export default function TrendMonitor({ fourHourData }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trend = useMemo(() => {
    if (!fourHourData || fourHourData.length < 200) return { ema200: null, bias: 'NÖTR' };
    const closes = fourHourData.map(c => parseFloat(c[4]));
    const ema200 = calculateEMA(closes, 200);
    const lastPrice = closes[closes.length - 1];
    return { ema200, bias: lastPrice > ema200 ? 'YÜKSELİŞ (BULL)' : 'DÜŞÜŞ (BEAR)' };
  }, [fourHourData]);

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center relative group">
       <div 
           className="absolute top-2 right-2 cursor-help"
           onMouseEnter={() => setShowTooltip(true)}
           onMouseLeave={() => setShowTooltip(false)}
           onClick={() => setShowTooltip(!showTooltip)}
       >
         <HelpCircle className="w-3 h-3 text-neutral-600 hover:text-amber-500" />
         {showTooltip && (
           <div className="absolute bottom-full right-0 mb-2 w-64 bg-neutral-900 border border-neutral-700 rounded p-2 text-[10px] text-neutral-300 shadow-xl z-50 text-left">
             <strong className="text-amber-500 block mb-1">Dinamik Trend (EMA 200)</strong>
             Fiyatın ortalamaya göre konumu, piyasanın "en az direnç yolunu" gösterir.
           </div>
         )}
       </div>

       <BarChart2 className="text-neutral-600 w-8 h-8 mb-2" />
       <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">4H TREND BIAS (EMA 200)</div>
       <div className={`text-xl font-bold font-mono tracking-wider ${trend.bias === 'YÜKSELİŞ (BULL)' ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend.bias}
       </div>
       <div className="mt-2 text-[10px] text-neutral-600 font-mono">
          EMA 200: {trend.ema200 ? formatCurrency(trend.ema200) : 'HESAPLANIYOR...'}
       </div>
    </div>
  );
}
