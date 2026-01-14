'use client';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import LevelsTable from './components/LevelsTable';
import MarketVitals from './components/MarketVitals';
// ... diğer importlar

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Kendi yazdığımız API'ye istek atıyoruz
    const fetchData = async () => {
      const res = await fetch('/api/market-data');
      const json = await res.json();
      setData(json);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-black text-neutral-400">
      <Header price={data.price} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* Verileri prop olarak bileşenlere dağıt */}
        <LevelsTable timeframe="Weekly" klines={data.klines.weekly} price={data.price} />
        <LevelsTable timeframe="Monthly" klines={data.klines.monthly} price={data.price} />
      </div>
      <MarketVitals dailyData={data.klines.daily} />
      {/* ... */}
    </main>
  );
}