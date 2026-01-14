'use client';
import { Layers } from 'lucide-react';
import { useState, useEffect } from 'react';

const formatCurrency = (value) => {
  if (!value) return '---';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
};

const getActiveSession = () => {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return { name: 'ASIA SESSION', color: 'text-yellow-500' };
  if (hour >= 8 && hour < 13) return { name: 'LONDON OPEN', color: 'text-blue-400' };
  if (hour >= 13 && hour < 16) return { name: 'NY & LONDON OVERLAP', color: 'text-purple-400' };
  if (hour >= 16 && hour < 21) return { name: 'NY SESSION (PM)', color: 'text-emerald-400' };
  return { name: 'MARKET CLOSE/THIN', color: 'text-neutral-500' };
};

export default function Header({ price }) {
  const [session, setSession] = useState({ name: 'LOADING...', color: 'text-neutral-500' });

  useEffect(() => {
    setSession(getActiveSession());
    const interval = setInterval(() => setSession(getActiveSession()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20">
            <Layers className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-200 tracking-tight leading-none">BARBAR<span className="text-amber-500">.</span>PLAN</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-neutral-600 font-mono tracking-wider">LIVE FEED • <span className={session.color}>{session.name}</span></span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-neutral-500 font-bold tracking-widest mb-0.5">BTCUSDT</div>
          <div className="text-2xl font-mono font-bold text-neutral-200">
            {formatCurrency(price)}
          </div>
        </div>
      </div>
    </header>
  );
}