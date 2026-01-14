'use client';
import { Activity, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

const formatCompact = (num) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

export default function OrderFlow({ data }) {
  if (!data) return null;

  // Taker Buy Ratio (Agresif Alıcı Oranı)
  // %50 üstü alıcı baskın, altı satıcı baskın
  const buyRatio = (data.volBuy / data.volTotal) * 100;
  const isBullishFlow = buyRatio > 50;
  
  // OI (Open Interest) Gösterimi (Basitleştirilmiş)
  // Gerçek değişim için historical data gerekir, şimdilik anlık snapshot
  const oiValue = data.oi; 

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
        <Activity size={14} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">ORDERFLOW (FUTURES)</span>
      </div>

      <div className="space-y-4">
        {/* VOLUME DELTA PROXY */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>TAKER BUY/SELL RATIO</span>
            <span className={isBullishFlow ? 'text-emerald-500' : 'text-red-500'}>
              {buyRatio.toFixed(1)}% {isBullishFlow ? 'BULLS' : 'BEARS'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-600 transition-all duration-500" 
              style={{ width: `${buyRatio}%` }}
            ></div>
            <div 
              className="h-full bg-red-600 transition-all duration-500" 
              style={{ width: `${100 - buyRatio}%` }}
            ></div>
          </div>
        </div>

        {/* OPEN INTEREST */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Layers size={14} className="text-blue-400" />
             <span className="text-[10px] text-neutral-400">OPEN INTEREST (USDT)</span>
           </div>
           <div className="text-sm font-mono font-bold text-neutral-200">
             {formatCompact(oiValue)}
           </div>
        </div>
      </div>
    </div>
  );
}