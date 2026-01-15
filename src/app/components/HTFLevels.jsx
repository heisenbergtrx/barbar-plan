'use client';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { calculateSMA, formatCurrency, calculateDistance } from '@/lib/utils';

export default function HTFLevels({ dailyData, weeklyData, price }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const levels = useMemo(() => {
    return [
      { 
        label: '200 Günlük (MA)', 
        value: calculateSMA(dailyData, 200), 
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        desc: 'Boğa/Ayı Ayrımı' 
      },
      { 
        label: '50 Haftalık (MA)', 
        value: calculateSMA(weeklyData, 50), 
        color: 'text-blue-400',
        bgColor: 'bg-blue-400',
        desc: 'Orta Vade Trend' 
      },
      { 
        label: '100 Haftalık (MA)', 
        value: calculateSMA(weeklyData, 100), 
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-400',
        desc: 'Majör Düzeltme' 
      },
      { 
        label: '200 Haftalık (MA)', 
        value: calculateSMA(weeklyData, 200), 
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
        desc: 'Cycle Bottom' 
      },
    ].filter(l => l.value !== null);
  }, [dailyData, weeklyData]);

  return (
    <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4 relative group">
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
            <strong className="text-amber-500 block mb-1">HTF Ortalamaları</strong>
            Kurumsal oyuncuların maliyetlendiği ana seviyelerdir.
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800/50 pb-2">
        <TrendingUp size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">HTF SEVİYELERİ</span>
      </div>

      {/* Levels */}
      <div className="space-y-3">
        {levels.length > 0 ? levels.map((lvl, i) => {
          const dist = price ? calculateDistance(price, lvl.value) : 0;
          const isAbove = dist < 0;
          
          return (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-8 rounded-full ${lvl.bgColor} opacity-50`} />
                <div className="flex flex-col">
                  <span className={`font-semibold text-xs ${lvl.color}`}>{lvl.label}</span>
                  <span className="text-[9px] text-neutral-600">{lvl.desc}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-neutral-300">
                  {formatCurrency(lvl.value, 0)}
                </div>
                <div className={`text-[9px] font-mono ${isAbove ? 'text-emerald-500' : 'text-red-500'}`}>
                  {dist > 0 ? '+' : ''}{dist.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center text-[10px] text-neutral-600 py-4">Veri Yükleniyor...</div>
        )}
      </div>
    </div>
  );
}
