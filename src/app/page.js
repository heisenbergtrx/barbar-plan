'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic'; // Dynamic import için gerekli
import Header from './components/Header';
import LevelsTable from './components/LevelsTable';
import MarketVitals from './components/MarketVitals';
import TrendMonitor from './components/TrendMonitor';
import ProtocolDisplay from './components/ProtocolDisplay';
import YearlyFooter from './components/YearlyFooter';
import HTFLevels from './components/HTFLevels';
import { BookOpen, Globe, AlertTriangle, RefreshCw } from 'lucide-react';

// PriceChart'ı sunucu tarafında (SSR) devre dışı bırakarak çağırıyoruz
const PriceChart = dynamic(() => import('./components/PriceChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-neutral-900/30 animate-pulse rounded-lg border border-neutral-800/50 flex items-center justify-center text-xs text-neutral-600">Grafik Yükleniyor...</div>
});

// Oturum Hesaplama
const getActiveSession = () => {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return { name: 'ASIA SESSION', color: 'text-yellow-500', desc: 'Yatay range ve likidite avı (Sweep) yaygındır.' };
  if (hour >= 8 && hour < 13) return { name: 'LONDON OPEN', color: 'text-blue-400', desc: 'Hacim artar, günün trendi belirlenmeye başlar.' };
  if (hour >= 13 && hour < 16) return { name: 'NY & LONDON OVERLAP', color: 'text-purple-400', desc: 'Volatilite zirve yapar. Ana hareketler buradadır.' };
  if (hour >= 16 && hour < 21) return { name: 'NY SESSION (PM)', color: 'text-emerald-400', desc: 'Trend devamı veya gün sonu kapanış hareketleri.' };
  return { name: 'MARKET CLOSE/THIN', color: 'text-neutral-500', desc: 'Düşük likidite, spread açılabilir.' };
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState({ name: 'LOADING...', color: 'text-neutral-500', desc: '' });

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/market-data');
      if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
      const json = await res.json();
      if(json.price) setData(json);
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

  // --- GRAFİK İÇİN SEVİYE HESAPLAMA (Memoized) ---
  const chartLevels = useMemo(() => {
    if (!data) return [];
    
    const calculateRawLevels = (klines, timeframe) => {
        if (!klines || klines.length < 2) return [];
        const prev = klines[klines.length - 2];
        const h = parseFloat(prev[2]);
        const l = parseFloat(prev[3]);
        const r = h - l;
        const COEFF_TRAP = 0.13;
        const COEFF_TREND = 0.618;

        return [
            { label: `${timeframe} EXT. II`, price: h + (r * COEFF_TREND), type: 'extension_trend_res' },
            { label: `${timeframe} EXT. I`, price: h + (r * COEFF_TRAP), type: 'extension_trap_res' },
            { label: `${timeframe} PWH/PMH`, price: h, type: 'resistance' },
            { label: `${timeframe} PWL/PML`, price: l, type: 'support' },
            { label: `${timeframe} EXT. I`, price: l - (r * COEFF_TRAP), type: 'extension_trap_sup' },
            { label: `${timeframe} EXT. II`, price: l - (r * COEFF_TREND), type: 'extension_trend_sup' },
        ];
    };

    const wLevels = calculateRawLevels(data.klines.weekly, 'W');
    const mLevels = calculateRawLevels(data.klines.monthly, 'M');
    
    // Confluence Kontrolü
    const all = [...wLevels, ...mLevels];
    return all.map(lvl => {
        const isConfluence = all.some(o => o !== lvl && Math.abs((lvl.price - o.price)/lvl.price) < 0.003);
        return { ...lvl, isConfluence };
    });
  }, [data]);

  // Yükleme ve Hata Ekranları
  if (error && !data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">VERİ AKIŞI KESİLDİ</h2>
        <div className="bg-red-900/20 border border-red-800 p-4 rounded text-sm text-red-300 mb-6">{error}</div>
        <button onClick={fetchData} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors flex items-center gap-2"><RefreshCw size={18}/> TEKRAR DENE</button>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-amber-500 font-mono">
      <RefreshCw className="w-12 h-12 animate-spin mb-4" />
      <span className="animate-pulse tracking-widest text-lg">TERMINAL LOADING...</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-neutral-400 font-sans pb-32">
      <Header price={data.price} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 1. GRAFİK (Price Chart) - Client Side Only */}
        <PriceChart data={data.klines.fourHour} levels={chartLevels} />

        {/* 2. TABLOLAR (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} dailyData={data.klines.daily} />
          <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
        </div>

        {/* 3. PROTOKOL */}
        <ProtocolDisplay />

        {/* 4. ANALİTİK KARTLARI */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <HTFLevels dailyData={data.klines.daily} weeklyData={data.klines.weekly} price={data.price} />
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
             <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
                <BookOpen size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">SÖZLÜK (TR)</span>
             </div>
             <div className="grid grid-cols-1 gap-2 text-[10px]">
               <div className="flex justify-between"><span className="text-amber-500 font-bold">MONDAY RANGE</span> <span className="text-neutral-500 text-right">Haftalık Yön.</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">CONFLUENCE</span> <span className="text-neutral-500 text-right">Kesişim.</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">PWH/PWL</span> <span className="text-neutral-500 text-right">Likidite (Sweep).</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">EXT. I (TRAP)</span> <span className="text-neutral-500 text-right">Tuzak (SFP).</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">EXT. II (TREND)</span> <span className="text-neutral-500 text-right">Trend Hedefi.</span></div>
             </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
             <Globe className="text-neutral-600 w-8 h-8 mb-2" />
             <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">SESSION MONITOR</div>
             <div className={`text-sm font-bold font-mono tracking-wider ${session.color}`}>{session.name}</div>
             <div className="mt-2 text-[10px] text-neutral-600 italic px-4 leading-tight">{session.desc}</div>
          </div>

          <TrendMonitor fourHourData={data.klines.fourHour} />
          <MarketVitals dailyData={data.klines.daily} />
        </div>
      </div>

      <YearlyFooter yearlyData={data.klines.yearly} price={data.price} />
    </main>
  );
}