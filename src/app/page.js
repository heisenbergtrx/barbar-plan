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
import OrderFlow from './components/OrderFlow'; // Yeni
import EconomicCalendar from './components/EconomicCalendar'; // Yeni
import { BookOpen, Globe, AlertTriangle, RefreshCw } from 'lucide-react';

const PriceChart = dynamic(() => import('./components/PriceChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-neutral-900/30 animate-pulse rounded-lg border border-neutral-800/50 flex items-center justify-center text-xs text-neutral-600">Grafik Yükleniyor...</div>
});

const getActiveSession = () => {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return { name: 'ASIA SESSION', color: 'text-yellow-500', desc: 'Likidite Avı (Sweep)' };
  if (hour >= 8 && hour < 13) return { name: 'LONDON OPEN', color: 'text-blue-400', desc: 'Trend Başlangıcı' };
  if (hour >= 13 && hour < 16) return { name: 'NY & LDN OVERLAP', color: 'text-purple-400', desc: 'Yüksek Volatilite' };
  if (hour >= 16 && hour < 21) return { name: 'NY SESSION (PM)', color: 'text-emerald-400', desc: 'Kapanış Hareketleri' };
  return { name: 'MARKET CLOSE', color: 'text-neutral-500', desc: 'Düşük Likidite' };
};

// Basit MA Hesaplama
const calculateSMA = (candles, period) => {
  if (!candles || candles.length < period) return null;
  const slice = candles.slice(-period);
  const sum = slice.reduce((acc, c) => acc + parseFloat(c[4]), 0);
  return sum / period;
};

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

  // --- DYNAMIC CONFLUENCE ENGINE ---
  const chartLevels = useMemo(() => {
    if (!data) return [];
    
    // 1. Standart Seviyeleri Hesapla
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

    // 2. MA Seviyelerini Hesapla (HTF Confluence için)
    const ma200d = calculateSMA(data.klines.daily, 200);
    const ma200w = calculateSMA(data.klines.weekly, 200);
    
    const maLevels = [];
    if(ma200d) maLevels.push({ label: '200D MA', price: ma200d, type: 'ma' });
    if(ma200w) maLevels.push({ label: '200W MA', price: ma200w, type: 'ma' });

    const wLevels = calculateRawLevels(data.klines.weekly, 'W');
    const mLevels = calculateRawLevels(data.klines.monthly, 'M');
    
    // 3. Hepsini Birleştir ve Kesişimleri (Confluence) Bul
    const all = [...wLevels, ...mLevels, ...maLevels];
    
    return all.map(lvl => {
        // %0.5'ten daha yakın başka bir seviye var mı?
        const isConfluence = all.some(o => o !== lvl && Math.abs((lvl.price - o.price)/lvl.price) < 0.005);
        return { ...lvl, isConfluence };
    });
  }, [data]);

  // HATA EKRANI
  if (error && !data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">VERİ AKIŞI KESİLDİ</h2>
        <div className="bg-red-900/20 border border-red-800 p-4 rounded text-sm text-red-300 mb-6">{error}</div>
        <button onClick={fetchData} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors flex items-center gap-2"><RefreshCw size={18}/> TEKRAR DENE</button>
    </div>
  );

  // YÜKLEME EKRANI
  if (!data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-amber-500 font-mono">
      <RefreshCw className="w-12 h-12 animate-spin mb-4" />
      <span className="animate-pulse tracking-widest text-lg">BARBARIANS TERMINAL</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-neutral-400 font-sans pb-32">
      <Header price={data.price} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 1. GRAFİK (Price Chart) */}
        <PriceChart data={data.klines.fourHour} levels={chartLevels} />

        {/* 2. TABLOLAR (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} dailyData={data.klines.daily} />
          <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
        </div>

        {/* 3. KURUMSAL PANEL (Grid 4 Sütun) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           {/* OrderFlow (YENİ) */}
           <OrderFlow data={data.orderflow} />
           
           {/* Trend Monitor */}
           <TrendMonitor fourHourData={data.klines.fourHour} />
           
           {/* Market Vitals */}
           <MarketVitals dailyData={data.klines.daily} />

           {/* Economic Calendar (YENİ) */}
           <EconomicCalendar />
        </div>

        <ProtocolDisplay />

        {/* 4. ALT ANALİTİK (Grid 3 Sütun) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
             </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
             <Globe className="text-neutral-600 w-8 h-8 mb-2" />
             <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">SESSION MONITOR</div>
             <div className={`text-sm font-bold font-mono tracking-wider ${session.color}`}>{session.name}</div>
             <div className="mt-2 text-[10px] text-neutral-600 italic px-4 leading-tight">{session.desc}</div>
          </div>
        </div>
      </div>

      <YearlyFooter yearlyData={data.klines.yearly} price={data.price} />
    </main>
  );
}