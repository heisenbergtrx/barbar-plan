'use client';
import { Gauge, HelpCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

const calculateATR = (candles, period = 14) => {
  if (!candles || candles.length <= period) return 0;
  let trs = [];
  for(let i = 1; i < candles.length; i++) {
    const high = parseFloat(candles[i][2]);
    const low = parseFloat(candles[i][3]);
    const prevClose = parseFloat(candles[i-1][4]);
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const last14TR = trs.slice(-period);
  return last14TR.reduce((a, b) => a + b, 0) / period;
};

export default function MarketVitals({ dailyData }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const vitals = useMemo(() => {
    if (!dailyData || dailyData.length < 15) return { rangePercent: 0, rvol: 0 };
    
    const atr = calculateATR(dailyData, 14);
    const currentCandle = dailyData[dailyData.length - 1];
    const currentRange = parseFloat(currentCandle[2]) - parseFloat(currentCandle[3]);
    const rangePercent = (currentRange / atr) * 100;

    const currentVol = parseFloat(currentCandle[5]);
    const avgVol = dailyData.slice(dailyData.length - 11, dailyData.length - 1).reduce((acc, c) => acc + parseFloat(c[5]), 0) / 10;
    
    return { rangePercent, rvol: currentVol / avgVol };
  }, [dailyData]);

  const rangeColor = vitals.rangePercent > 100 ? 'text-red-500 animate-pulse' : vitals.rangePercent > 80 ? 'text-yellow-500' : 'text-emerald-500';
  const rvolColor = vitals.rvol > 1.5 ? 'text-amber-500' : 'text-neutral-500';

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
             <strong className="text-amber-500 block mb-1">Menzil & Hacim (TR)</strong>
             Günlük menzil (ATR) %100'ü aştıysa hareketin "şiştiği" (overextended) anlamına gelebilir.
           </div>
         )}
       </div>

       <Gauge className="text-neutral-600 w-8 h-8 mb-2" />
       <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">MARKET VITALS</div>
       
       <div className="flex justify-between w-full px-2 mt-2 border-t border-neutral-800/50 pt-2">
         <div className="text-left">
           <div className="text-[9px] text-neutral-600">DAILY RANGE</div>
           <div className={`font-mono font-bold text-sm ${rangeColor}`}>
             %{vitals.rangePercent.toFixed(0)} <span className="text-[9px] text-neutral-600">/ ATR</span>
           </div>
         </div>
         
         <div className="text-right">
           <div className="text-[9px] text-neutral-600">RVOL</div>
           <div className={`font-mono font-bold text-sm ${rvolColor}`}>
             {vitals.rvol.toFixed(2)}x
           </div>
         </div>
       </div>
       
       <div className="mt-2 text-[9px] text-neutral-600 italic px-2">
         {vitals.rangePercent > 100 ? '⚠️ Range Extended. Divergence ara.' : 'Range Available.'}
       </div>
    </div>
  );
}