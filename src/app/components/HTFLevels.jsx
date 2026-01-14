'use client';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

const calculateSMA = (candles, period) => {
  if (!candles || candles.length < period) return null;
  // Son 'period' kadar mumu al
  const slice = candles.slice(-period);
  // Kapanış fiyatlarını topla (index 4 = close)
  const sum = slice.reduce((acc, c) => acc + parseFloat(c[4]), 0);
  return sum / period;
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

export default function HTFLevels({ dailyData, weeklyData, price }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const levels = useMemo(() => {
    return [
      { label: '200 Günlük (MA)', value: calculateSMA(dailyData, 200), color: 'text-orange-500', desc: 'Boğa/Ayı Ayrımı (Daily Trend)' },
      { label: '50 Haftalık (MA)', value: calculateSMA(weeklyData, 50), color: 'text-blue-400', desc: 'Orta Vade Trend Desteği' },
      { label: '100 Haftalık (MA)', value: calculateSMA(weeklyData, 100), color: 'text-indigo-400', desc: 'Majör Düzeltme Seviyesi' },
      { label: '200 Haftalık (MA)', value: calculateSMA(weeklyData, 200), color: 'text-purple-500', desc: 'Tarihsel "Cycle Bottom" (Dip)' },
    ].filter(l => l.value !== null);
  }, [dailyData, weeklyData]);

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 relative group">
       <div 
           className="absolute top-2 right-2 cursor-help"
           onMouseEnter={() => setShowTooltip(true)}
           onMouseLeave={() => setShowTooltip(false)}
           onClick={() => setShowTooltip(!showTooltip)}
       >
         <HelpCircle className="w-3 h-3 text-neutral-600 hover:text-amber-500" />
         {showTooltip && (
           <div className="absolute bottom-full right-0 mb-2 w-64 bg-neutral-900 border border-neutral-700 rounded p-2 text-[10px] text-neutral-300 shadow-xl z-50 text-left">
             <strong className="text-amber-500 block mb-1">HTF Ortalamaları</strong>
             Kurumsal oyuncuların maliyetlendiği ana seviyelerdir. Fiyatın bu seviyelere yaklaşması güçlü tepki (Re-test) fırsatı doğurur.
           </div>
         )}
       </div>

       <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
          <TrendingUp size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">HTF SEVİYELERİ</span>
       </div>

       <div className="space-y-3">
         {levels.length > 0 ? levels.map((lvl, i) => {
           const dist = price ? ((price - lvl.value) / price) * 100 : 0;
           return (
             <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className={`font-bold ${lvl.color}`}>{lvl.label}</span>
                  <span className="text-[9px] text-neutral-600">{lvl.desc}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-neutral-300">{formatCurrency(lvl.value)}</div>
                  <div className={`text-[9px] ${dist > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {dist > 0 ? '+' : ''}{dist.toFixed(1)}%
                  </div>
                </div>
             </div>
           )
         }) : (
           <div className="text-center text-[10px] text-neutral-600 py-4">Veri Yükleniyor...</div>
         )}
       </div>
    </div>
  );
}