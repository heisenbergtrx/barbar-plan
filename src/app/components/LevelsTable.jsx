import { Zap, Box, Flame, Target, Skull, Clock } from 'lucide-react';
import { useMemo } from 'react';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

const calculateDistance = (current, target) => {
  if (!current || !target) return 0;
  return (Math.abs(current - target) / current) * 100;
};

const getStatusStyles = (distance, type, isConfluence) => {
  let styles = {
    rowBorder: 'border-l-2 border-transparent hover:bg-neutral-900/30',
    badge: 'text-neutral-600 font-normal',
    text: 'text-neutral-500',
    label: 'IDLE',
    barColor: 'bg-neutral-800'
  };

  if (isConfluence) {
    styles.text = 'text-amber-200 font-bold'; 
    styles.confluenceBadge = 'bg-purple-900/50 text-purple-200 border border-purple-500/30 px-1.5 rounded text-[9px] ml-2 animate-pulse';
  } else if (type.includes('resistance')) {
    styles.text = 'text-red-400';
  } else if (type.includes('support')) {
    styles.text = 'text-emerald-400';
  } else if (type.includes('trap')) {
    styles.text = 'text-orange-400';
  } else {
    styles.text = 'text-indigo-400';
  }

  if (distance < 0.35) {
    return {
      ...styles,
      rowBorder: 'border-l-2 border-amber-500 bg-amber-500/10',
      badge: 'bg-amber-500 text-black animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      label: '⚡ IN ZONE',
      barColor: 'bg-amber-500'
    };
  } else if (distance < 1.5) {
    return {
      ...styles,
      rowBorder: 'border-l-2 border-neutral-700 bg-neutral-900/50',
      badge: 'bg-neutral-800 text-amber-200 border border-amber-500/30',
      label: '👁️ WATCH',
      barColor: 'bg-amber-500/50'
    };
  } 
  return styles;
};

export default function LevelsTable({ timeframe, klines, price, dailyData }) {
  const levels = useMemo(() => {
    if (!klines || klines.length < 2) return [];

    const prevCandle = klines[klines.length - 2]; // Önceki periyot
    const high = parseFloat(prevCandle[2]);
    const low = parseFloat(prevCandle[3]);
    const range = high - low;

    // Gizli Katsayılar
    const COEFF_TRAP = 0.13;
    const COEFF_TREND = 0.618;

    let rawLevels = [
      { id: 'ext_trend_res', label: 'EXT. II (TREND)', price: high + (range * COEFF_TREND), type: 'extension_trend_res' },
      { id: 'ext_trap_res', label: 'EXT. I (TRAP)', price: high + (range * COEFF_TRAP), type: 'extension_trap_res' },
      { id: 'high', label: timeframe === 'Weekly' ? 'PWH (HIGH)' : 'PMH (HIGH)', price: high, type: 'resistance' },
      { id: 'low', label: timeframe === 'Weekly' ? 'PWL (LOW)' : 'PML (LOW)', price: low, type: 'support' },
      { id: 'ext_trap_sup', label: 'EXT. I (TRAP)', price: low - (range * COEFF_TRAP), type: 'extension_trap_sup' },
      { id: 'ext_trend_sup', label: 'EXT. II (TREND)', price: low - (range * COEFF_TREND), type: 'extension_trend_sup' },
    ];

    // Pazartesi Range Ekleme (Sadece Weekly için)
    if (timeframe === 'Weekly' && dailyData) {
       // Pazartesiyi bulma mantığı
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

    // Confluence Kontrolü
    return rawLevels.map(lvl => {
      const isConfluence = rawLevels.some(other => other.id !== lvl.id && Math.abs((lvl.price - other.price) / lvl.price) < 0.003);
      return { ...lvl, isConfluence };
    }).sort((a, b) => b.price - a.price);

  }, [klines, timeframe, dailyData]);

  const icon = timeframe === 'Weekly' ? <Zap size={16} /> : <Box size={16} />;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl h-full flex flex-col">
      <div className="bg-black/50 p-4 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-amber-500 font-bold tracking-wider flex items-center gap-2 text-sm md:text-base">
          {icon} {timeframe.toUpperCase()} PLAN
        </h2>
        <span className="text-[10px] text-neutral-500 font-mono">FRAME: {timeframe}</span>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-neutral-600 text-[10px] uppercase tracking-widest border-b border-neutral-900">
              <th className="p-3 font-medium">Level</th>
              <th className="p-3 font-medium text-right">Price</th>
              <th className="p-3 font-medium text-center">Dist.</th>
              <th className="p-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {levels.map((lvl) => {
              const distance = calculateDistance(price, lvl.price);
              const status = getStatusStyles(distance, lvl.type, lvl.isConfluence);
              const isMainLevel = ['high', 'low', 'mon_high', 'mon_low'].some(id => lvl.id.includes(id));

              return (
                <tr key={lvl.id} className={`transition-all duration-300 ${status.rowBorder}`}>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${status.text}`}>{lvl.label}</span>
                        {lvl.type.includes('trap') && <Skull size={10} className="text-orange-500 opacity-70"/>}
                        {lvl.type.includes('trend') && <Target size={10} className="text-indigo-500 opacity-70"/>}
                        {lvl.isConfluence && <span className={status.confluenceBadge}><Flame size={8} /></span>}
                      </div>
                      {isMainLevel && <span className="text-[9px] text-neutral-600 tracking-tight mt-0.5">{lvl.id.includes('mon') ? 'WEEKLY PIVOT' : 'LIQUIDITY POOL'}</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`font-mono text-sm ${lvl.isConfluence ? 'text-white' : 'text-neutral-300'}`}>{formatCurrency(lvl.price)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${status.barColor}`} style={{ width: `${Math.max(0, 100 - distance * 10)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">%{distance.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${status.badge}`}>{status.label}</span>
                    {distance < 0.05 && <div className="text-[9px] text-amber-500 mt-1 flex justify-end items-center gap-1"><Clock size={8}/> TOUCHED</div>}
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