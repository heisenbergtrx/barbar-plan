'use client';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import LevelsTable from './components/LevelsTable';
import MarketVitals from './components/MarketVitals';
import TrendMonitor from './components/TrendMonitor';
import ProtocolDisplay from './components/ProtocolDisplay';
import YearlyFooter from './components/YearlyFooter';
import { BookOpen, Globe } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/market-data');
        const json = await res.json();
        if(json.price) setData(json);
      } catch (e) { console.error(e); }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-mono animate-pulse">TERMINAL LOADING...</div>;

  return (
    <main className="min-h-screen bg-black text-neutral-400 font-sans pb-32">
      <Header price={data.price} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} dailyData={data.klines.daily} />
          <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
        </div>

        <ProtocolDisplay />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
             <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
                <BookOpen size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">GLOSSARY (TR)</span>
             </div>
             <div className="text-[11px] text-neutral-500 space-y-1">
               <p><span className="text-amber-500 font-bold">EXT. I (TRAP):</span> Tuzak Bölgesi (SFP).</p>
               <p><span className="text-amber-500 font-bold">EXT. II (TREND):</span> Trend Hedefi.</p>
             </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
             <Globe className="text-neutral-600 w-8 h-8 mb-2" />
             <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">SESSION MONITOR</div>
             <div className="text-xs text-neutral-500">Auto-Detecting...</div>
          </div>

          <TrendMonitor fourHourData={data.klines.fourHour} />
          <MarketVitals dailyData={data.klines.daily} />
        </div>
      </div>

      <YearlyFooter yearlyData={data.klines.yearly} price={data.price} />
    </main>
  );
}
