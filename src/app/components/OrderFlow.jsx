'use client';
import { Activity, Layers } from 'lucide-react';

const formatCompact = (num) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

export default function OrderFlow({ data }) {
  if (!data) return null;

  // Spot Delta Ratio (Alıcı Baskısı)
  // Eğer veri yoksa veya 0 ise hata vermesin diye önlem
  const totalVol = data.volTotal || 1; 
  const buyRatio = (data.volBuy / totalVol) * 100;
  const isBullishFlow = buyRatio > 50;
  
  // 24H Volume (OI Yerine Spot Hacmi kullanıyoruz)
  const volumeValue = data.dayVolume; 

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
        <Activity size={14} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">ORDERFLOW (SPOT DELTA)</span>
      </div>

      <div className="space-y-4">
        {/* VOLUME DELTA (Alıcı/Satıcı Dengesi) */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>BUY/SELL RATIO (4H)</span>
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

        {/* 24H VOLUME */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Layers size={14} className="text-blue-400" />
             <span className="text-[10px] text-neutral-400">24H VOLUME (USDT)</span>
           </div>
           <div className="text-sm font-mono font-bold text-neutral-200">
             {formatCompact(volumeValue)}
           </div>
        </div>
      </div>
    </div>
  );
}