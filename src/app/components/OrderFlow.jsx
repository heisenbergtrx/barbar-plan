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
  
  // 24H Volume (OI Yerine Spot Hacmi)
  const volumeValue = data.dayVolume; 

  return (
    <div className="bg-[#111113] border border-white/5 rounded-lg p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group">
      {/* Hafif Gold Glow Efekti (Hover'da belirir) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex items-center gap-2 mb-4 text-zinc-500 border-b border-white/5 pb-2">
        <Activity size={14} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ORDERFLOW (SPOT)</span>
      </div>

      <div className="space-y-5">
        {/* VOLUME DELTA (Alıcı/Satıcı Dengesi) */}
        <div>
          <div className="flex justify-between text-[10px] text-zinc-400 mb-1.5 font-medium">
            <span>BUY/SELL RATIO (4H)</span>
            <span className={isBullishFlow ? 'text-emerald-400' : 'text-red-400'}>
              {buyRatio.toFixed(1)}% {isBullishFlow ? 'BULLS' : 'BEARS'}
            </span>
          </div>
          {/* Progress Bar - Minimalist ve Zarif */}
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden flex border border-white/5">
            <div 
              className="h-full bg-emerald-500/80 transition-all duration-500" 
              style={{ width: `${buyRatio}%` }}
            ></div>
            <div 
              className="h-full bg-red-500/80 transition-all duration-500" 
              style={{ width: `${100 - buyRatio}%` }}
            ></div>
          </div>
        </div>

        {/* 24H VOLUME */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Layers size={14} className="text-blue-400/80" />
             <span className="text-[10px] text-zinc-400 font-medium">24H VOLUME (USDT)</span>
           </div>
           <div className="text-sm font-mono font-bold text-zinc-200">
             {formatCompact(volumeValue)}
           </div>
        </div>
      </div>
    </div>
  );
}