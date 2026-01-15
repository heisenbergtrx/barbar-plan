'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import LevelsTable from './components/LevelsTable';
import MarketVitals from './components/MarketVitals';
import TrendMonitor from './components/TrendMonitor';
import ProtocolDisplay from './components/ProtocolDisplay';
import YearlyFooter from './components/YearlyFooter';
import HTFLevels from './components/HTFLevels';
import OrderFlow from './components/OrderFlow';
import ProximityAlert from './components/ProximityAlert';
import EconomicCalendar from './components/EconomicCalendar';
import { BookOpen, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { getActiveSession, calculateSMA, EXTENSION_CONFIG } from '@/lib/utils';

const PriceChart = dynamic(() => import('./components/PriceChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-[#0d0d0f] rounded-lg border border-neutral-800/50 flex items-center justify-center">
      <div className="text-xs text-neutral-600 animate-pulse">Grafik Yükleniyor...</div>
    </div>
  )
});

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState({ name: 'LOADING...', color: 'text-neutral-500' });

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/market-data');
      if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
      const json = await res.json();
      if (json.price) setData(json);
      else throw new Error("Fiyat verisi alınamadı");
    } catch (e) {
      console.error("Veri hatası:", e);
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchData();
    setSession(getActiveSession());
    const interval = setInterval(() => {
      fetchData();
      setSession(getActiveSession());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Chart ve ProximityAlert için birleşik seviye hesaplama
  const chartLevels = useMemo(() => {
    if (!data) return [];

    const calculateRawLevels = (klines, timeframe) => {
      if (!klines || klines.length < 2) return [];
      const prev = klines[klines.length - 2];
      const h = parseFloat(prev[2]);
      const l = parseFloat(prev[3]);
      const r = h - l;

      return [
        { label: `${timeframe} EXT. II`, price: h + (r * EXTENSION_CONFIG.TREND.coeff), type: 'extension_trend_res' },
        { label: `${timeframe} EXT. I`, price: h + (r * EXTENSION_CONFIG.TRAP.coeff), type: 'extension_trap_res' },
        { label: `${timeframe} PWH/PMH`, price: h, type: 'resistance' },
        { label: `${timeframe} PWL/PML`, price: l, type: 'support' },
        { label: `${timeframe} EXT. I`, price: l - (r * EXTENSION_CONFIG.TRAP.coeff), type: 'extension_trap_sup' },
        { label: `${timeframe} EXT. II`, price: l - (r * EXTENSION_CONFIG.TREND.coeff), type: 'extension_trend_sup' },
      ];
    };

    const ma200d = calculateSMA(data.klines.daily, 200);
    const ma200w = calculateSMA(data.klines.weekly, 200);

    const maLevels = [];
    if (ma200d) maLevels.push({ label: '200D MA', price: ma200d, type: 'ma' });
    if (ma200w) maLevels.push({ label: '200W MA', price: ma200w, type: 'ma' });

    const wLevels = calculateRawLevels(data.klines.weekly, 'W');
    const mLevels = calculateRawLevels(data.klines.monthly, 'M');

    const all = [...wLevels, ...mLevels, ...maLevels];

    return all.map(lvl => {
      const isConfluence = all.some(o => o !== lvl && Math.abs((lvl.price - o.price) / lvl.price) < 0.005);
      return { ...lvl, isConfluence };
    });
  }, [data]);

  // Error State
  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">VERİ AKIŞI KESİLDİ</h2>
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg text-sm text-red-300 mb-6 max-w-md">
          {error}
        </div>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} /> TEKRAR DENE
        </button>
      </div>
    );
  }

  // Loading State
  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-amber-500 font-mono">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <span className="animate-pulse tracking-widest text-lg">BARBARIANS TERMINAL</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-400 font-sans pb-20">
      <Header price={data.price} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Chart + Proximity Alert Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <PriceChart data={data.klines.fourHour} levels={chartLevels} />
          </div>
          <div className="lg:col-span-1">
            <ProximityAlert levels={chartLevels} price={data.price} />
          </div>
        </div>

        {/* Levels Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} dailyData={data.klines.daily} />
          <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <OrderFlow data={data.orderflow} />
          <TrendMonitor fourHourData={data.klines.fourHour} />
          <MarketVitals dailyData={data.klines.daily} />
          <EconomicCalendar />
        </div>

        {/* Protocol Display */}
        <ProtocolDisplay />

        {/* Bottom Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <HTFLevels dailyData={data.klines.daily} weeklyData={data.klines.weekly} price={data.price} />

          {/* Sözlük */}
          <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800/50 pb-2">
              <BookOpen size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">SÖZLÜK (TR)</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 text-[10px]">
              <div className="flex flex-col">
                <span className="text-amber-500 font-bold">MONDAY RANGE</span>
                <span className="text-neutral-600">Haftaiçi likidite bölgeleri.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-amber-500 font-bold">CONFLUENCE</span>
                <span className="text-neutral-600">Seviye kesişim bölgesi.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-amber-500 font-bold">PWH / PWL</span>
                <span className="text-neutral-600">Önceki hafta yüksek/düşük (Likidite).</span>
              </div>
              <div className="flex flex-col">
                <span className="text-amber-500 font-bold">EXT. I (TRAP)</span>
                <span className="text-neutral-600">TRAP-SFP dikkat bölgesi.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-amber-500 font-bold">EXT. II (TREND)</span>
                <span className="text-neutral-600">Trend uzantı hedefi.</span>
              </div>
            </div>
          </div>

          {/* Session Monitor */}
          <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <Globe className="text-neutral-700 w-8 h-8 mb-2" />
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">SESSION MONITOR</div>
            <div className={`text-sm font-bold font-mono tracking-wider ${session.color}`}>
              {session.name}
            </div>
            <div className="mt-2 text-[10px] text-neutral-600 italic px-4 leading-tight">
              {session.desc}
            </div>
          </div>
        </div>
      </div>

      <YearlyFooter yearlyData={data.klines.yearly} price={data.price} />
    </main>
  );
}
