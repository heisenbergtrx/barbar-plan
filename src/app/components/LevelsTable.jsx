'use client';
import { Zap, Box, Flame, Target, Skull, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrency, calculateAbsDistance, EXTENSION_CONFIG, PROXIMITY } from '@/lib/utils';

const getStatusStyles = (distance, type, isConfluence) => {
  let styles = {
    rowBorder: 'border-l-2 border-transparent hover:bg-white/[0.02]',
    badge: 'text-neutral-600 font-normal',
    text: 'text-neutral-500',
    label: 'IDLE',
    barColor: 'bg-neutral-800'
  };

  // Seviye tipi renkler
  if (isConfluence) {
    styles.text = 'text-amber-200 font-bold';
    styles.confluenceBadge = 'bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 rounded text-[8px] ml-2';
  } else if (type.includes('resistance')) {
    styles.text = 'text-red-400';
  } else if (type.includes('support')) {
    styles.text = 'text-emerald-400';
  } else if (type.includes('trap')) {
    styles.text = 'text-orange-400';
  } else {
    styles.text = 'text-indigo-400';
  }

  // Proximity durumu
  if (distance <= PROXIMITY.TOUCHED) {
    return {
      ...styles,
      rowBorder: 'border-l-2 border-amber-500 bg-amber-500/10',
      badge: 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      label: '⚡ TOUCHED',
      barColor: 'bg-amber-500'
    };
  } else if (distance <= PROXIMITY.IN_ZONE) {
    return {
      ...styles,
      rowBorder: 'border-l-2 border-amber-500 bg-amber-500/5',
      badge: 'bg-amber-500/90 text-black font-bold animate-pulse',
      label: '⚡ IN ZONE',
      barColor: 'bg-amber-500'
    };
  } else if (distance <= PROXIMITY.WATCH) {
    return {
      ...styles,
      rowBorder: 'border-l-2 border-yellow-500/50 bg-yellow-500/5',
      badge: 'bg-neutral-800 text-yellow-400 border border-yellow-500/30',
      label: '👁️ WATCH',
      barColor: 'bg-yellow-500/60'
    };
  }
  
  return styles;
};

export default function LevelsTable({ timeframe, klines, price, dailyData }) {
  const levels = useMemo(() => {
    if (!klines || klines.length < 2) return [];

    const prevCandle = klines[klines.length - 2];
    const high = parseFloat(prevCandle[2]);
    const low = parseFloat(prevCandle[3]);
    const range = high - low;

    let rawLevels = [
      { id: 'ext_trend_res', label: 'EXT. II (TREND)', price: high + (range * EXTENSION_CONFIG.TREND.coeff), type: 'extension_trend_res' },
      { id: 'ext_trap_res', label: 'EXT. I (TRAP)', price: high + (range * EXTENSION_CONFIG.TRAP.coeff), type: 'extension_trap_res' },
      { id: 'high', label: timeframe === 'Weekly' ? 'PWH (HIGH)' : 'PMH (HIGH)', price: high, type: 'resistance' },
      { id: 'low', label: timeframe === 'Weekly' ? 'PWL (LOW)' : 'PML (LOW)', price: low, type: 'support' },
      { id: 'ext_trap_sup', label: 'EXT. I (TRAP)', price: low - (range * EXTENSION_CONFIG.TRAP.coeff), type: 'extension_trap_sup' },
      { id: 'ext_trend_sup', label: 'EXT. II (TREND)', price: low - (range * EXTENSION_CONFIG.TREND.coeff), type: 'extension_trend_sup' },
    ];

    // Monday Range (Weekly için)
    if (timeframe === 'Weekly' && dailyData) {
      for (let i = dailyData.length - 1; i >= 0; i--) {
        const d = new Date(dailyData[i][0]);
        if (d.getDay() === 1) {
          rawLevels.push(
            { id: 'mon_high', label: 'MONDAY HIGH', price: parseFloat(dailyData[i][2]), type: 'resistance' },
            { id: 'mon_low', label: 'MONDAY LOW', price: parseFloat(dailyData[i][3]), type: 'support' }
          );
          break;
        }
      }
    }

    // Confluence kontrolü
    return rawLevels.map(lvl => {
      const isConfluence = rawLevels.some(other => 
        other.id !== lvl.id && Math.abs((lvl.price - other.price) / lvl.price) < 0.003
      );
      return { ...lvl, isConfluence };
    }).sort((a, b) => b.price - a.price);

  }, [klines, timeframe, dailyData]);

  const icon = timeframe === 'Weekly' ? <Zap size={14} /> : <Box size={14} />;

  return (
    <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-black/30 px-4 py-3 border-b border-neutral-800/50 flex items-center justify-between">
        <h2 className="text-amber-500 font-bold tracking-wider flex items-center gap-2 text-sm">
          {icon} {timeframe.toUpperCase()} PLAN
        </h2>
        <span className="text-[9px] text-neutral-600 font-mono bg-neutral-900/50 px-2 py-0.5 rounded">
          {timeframe === 'Weekly' ? 'W1' : 'M1'}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-neutral-600 text-[9px] uppercase tracking-widest border-b border-neutral-800/50">
              <th className="px-4 py-2.5 font-medium">Level</th>
              <th className="px-4 py-2.5 font-medium text-right">Price</th>
              <th className="px-4 py-2.5 font-medium text-center">Dist.</th>
              <th className="px-4 py-2.5 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/30">
            {levels.map((lvl) => {
              const distance = calculateAbsDistance(price, lvl.price);
              const status = getStatusStyles(distance, lvl.type, lvl.isConfluence);
              const isMainLevel = ['high', 'low', 'mon_high', 'mon_low'].some(id => lvl.id.includes(id));

              return (
                <tr key={lvl.id} className={`transition-all duration-300 ${status.rowBorder}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-xs ${status.text}`}>{lvl.label}</span>
                        {lvl.type.includes('trap') && <Skull size={10} className="text-orange-500/60" />}
                        {lvl.type.includes('trend') && <Target size={10} className="text-indigo-500/60" />}
                        {lvl.isConfluence && (
                          <span className={status.confluenceBadge}>
                            <Flame size={8} className="inline" /> CONF
                          </span>
                        )}
                      </div>
                      {isMainLevel && (
                        <span className="text-[9px] text-neutral-600 mt-0.5">
                          {lvl.id.includes('mon') ? 'WEEKLY PIVOT' : 'LIQUIDITY POOL'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono text-xs ${lvl.isConfluence ? 'text-neutral-100' : 'text-neutral-300'}`}>
                      {formatCurrency(lvl.price)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-14 h-1 bg-neutral-800/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${status.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(0, 100 - distance * 15)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500">
                        %{distance.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] tracking-wide ${status.badge}`}>
                      {status.label}
                    </span>
                    {distance <= PROXIMITY.TOUCHED && (
                      <div className="text-[8px] text-amber-500 mt-1 flex justify-end items-center gap-1">
                        <Clock size={8} /> ACTIVE
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
