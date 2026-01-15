'use client';
import { Layers, Wifi } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatCurrency, getActiveSession } from '@/lib/utils';

export default function Header({ price }) {
  const [session, setSession] = useState({ name: 'LOADING...', color: 'text-neutral-500' });
  const [priceDirection, setPriceDirection] = useState(null); // 'up', 'down', null
  const prevPriceRef = useRef(null);

  useEffect(() => {
    setSession(getActiveSession());
    const interval = setInterval(() => setSession(getActiveSession()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fiyat değişim yönünü takip et
  useEffect(() => {
    if (prevPriceRef.current !== null && price !== prevPriceRef.current) {
      setPriceDirection(price > prevPriceRef.current ? 'up' : 'down');
      
      // 1 saniye sonra sıfırla
      const timeout = setTimeout(() => setPriceDirection(null), 1000);
      return () => clearTimeout(timeout);
    }
    prevPriceRef.current = price;
  }, [price]);

  const getPriceClasses = () => {
    if (priceDirection === 'up') return 'text-emerald-400 transition-colors duration-200';
    if (priceDirection === 'down') return 'text-red-400 transition-colors duration-200';
    return 'text-neutral-100 transition-colors duration-200';
  };

  return (
    <header className="border-b border-neutral-800/50 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <Layers className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-100 tracking-tight leading-none">
              BARBAR<span className="text-amber-500">.</span>PLAN
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi size={10} className="text-emerald-500/70" />
              </div>
              <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                LIVE <span className="text-neutral-700">•</span> <span className={session.color}>{session.name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-0.5">
            <span className="text-[10px] text-neutral-500 font-bold tracking-widest">BTCUSDT</span>
            <span className="text-[9px] text-neutral-700">SPOT</span>
          </div>
          <div className="flex items-center gap-2">
            {priceDirection && (
              <span className={`text-lg ${priceDirection === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {priceDirection === 'up' ? '▲' : '▼'}
              </span>
            )}
            <span className={`text-2xl font-mono font-bold tabular-nums ${getPriceClasses()}`}>
              {formatCurrency(price)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
