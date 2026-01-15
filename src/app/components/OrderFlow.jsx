'use client';
import { Activity, Layers } from 'lucide-react';
import { formatCompact } from '@/lib/utils';

export default function OrderFlow({ data }) {
  if (!data) return null;

  const totalVol = data.volTotal || 1;
  const buyRatio = (data.volBuy / totalVol) * 100;
  const isBullishFlow = buyRatio > 50;
  const volumeValue = data.dayVolume;

  return (
    <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
      {/* Hover Glow */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-neutral-500 border-b border-neutral-800/50 pb-2">
        <Activity size={14} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">ORDERFLOW (SPOT)</span>
      </div>

      <div className="space-y-4">
        {/* Buy/Sell Ratio */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5">
            <span>BUY/SELL RATIO (4H)</span>
            <span className={isBullishFlow ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
              {buyRatio.toFixed(1)}% {isBullishFlow ? 'BULLS' : 'BEARS'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500/80 transition-all duration-500"
              style={{ width: `${buyRatio}%` }}
            />
            <div
              className="h-full bg-red-500/80 transition-all duration-500"
              style={{ width: `${100 - buyRatio}%` }}
            />
          </div>
        </div>

        {/* 24H Volume */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/30">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-blue-400/70" />
            <span className="text-[10px] text-neutral-500">24H VOLUME</span>
          </div>
          <div className="text-sm font-mono font-bold text-neutral-200">
            {formatCompact(volumeValue)}
          </div>
        </div>
      </div>
    </div>
  );
}
