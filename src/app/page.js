'use client';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import LevelsTable from './components/LevelsTable';
import MarketVitals from './components/MarketVitals';
import TrendMonitor from './components/TrendMonitor';
import ProtocolDisplay from './components/ProtocolDisplay';
import YearlyFooter from './components/YearlyFooter';
import HTFLevels from './components/HTFLevels'; // Yeni eklenen bileşen
import { BookOpen, Globe, AlertTriangle, RefreshCw } from 'lucide-react';

// Oturum Hesaplama Fonksiyonu
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
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Hatası: ${res.status} - ${errorText.slice(0, 50)}`);
      }

      const json = await res.json();
      
      if(json.price) {
        setData(json);
      } else {
        throw new Error("Veri formatı hatalı (Fiyat bulunamadı)");
      }
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

  // HATA EKRANI
  if (error && !data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">VERİ AKIŞI KESİLDİ</h2>
        <div className="bg-red-900/20 border border-red-800 p-4 rounded text-sm text-red-300 mb-6 max-w-lg break-all">
          {error}
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors">
          <RefreshCw size={18} /> TEKRAR DENE
        </button>
    </div>
  );

  // YÜKLEME EKRANI
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
        {/* ÜST BÖLÜM: HAFTALIK VE AYLIK TABLOLAR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} dailyData={data.klines.daily} />
          <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
        </div>

        {/* PROTOKOL UYARISI */}
        <ProtocolDisplay />

        {/* ALT BÖLÜM: ANALİTİK KARTLARI (Grid 5 sütuna çıkarıldı) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* 1. YENİ EKLENEN: HTF SEVİYELERİ */}
          <HTFLevels dailyData={data.klines.daily} weeklyData={data.klines.weekly} price={data.price} />

          {/* 2. SÖZLÜK */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
             <div className="flex items-center gap-2 mb-3 text-neutral-500 border-b border-neutral-800 pb-2">
                <BookOpen size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">SÖZLÜK (TR)</span>
             </div>
             <div className="grid grid-cols-1 gap-2 text-[10px]">
               <div className="flex justify-between"><span className="text-amber-500 font-bold">MONDAY RANGE</span> <span className="text-neutral-500 text-right">Haftalık Yön (Bias). Pivot.</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">CONFLUENCE</span> <span className="text-neutral-500 text-right">Kesişim. Yüksek Olasılık.</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">PWH/PWL</span> <span className="text-neutral-500 text-right">Likidite Havuzları.</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">EXT. I (TRAP)</span> <span className="text-neutral-500 text-right">Tuzak Bölgesi (SFP).</span></div>
               <div className="flex justify-between"><span className="text-amber-500 font-bold">EXT. II (TREND)</span> <span className="text-neutral-500 text-right">Trend Hedefi.</span></div>
             </div>
          </div>

          {/* 3. SESSION MONITOR */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
             <Globe className="text-neutral-600 w-8 h-8 mb-2" />
             <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">SESSION MONITOR</div>
             <div className={`text-sm font-bold font-mono tracking-wider ${session.color}`}>{session.name}</div>
             <div className="mt-2 text-[10px] text-neutral-600 italic px-4 leading-tight">
               {session.desc}
             </div>
          </div>

          {/* 4. TREND MONITOR */}
          <TrendMonitor fourHourData={data.klines.fourHour} />
          
          {/* 5. MARKET VITALS */}
          <MarketVitals dailyData={data.klines.daily} />
        </div>
      </div>

      <YearlyFooter yearlyData={data.klines.yearly} price={data.price} />
    </main>
  );
}