import { Info, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

export default function YearlyFooter({ yearlyData, price }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!yearlyData || yearlyData.length === 0) return null;

  // Yearly Open Bul
  const currentYear = new Date().getFullYear();
  const januaryCandle = yearlyData.find(k => new Date(k[0]).getFullYear() === currentYear && new Date(k[0]).getMonth() === 0);
  const yOpen = januaryCandle ? parseFloat(januaryCandle[1]) : parseFloat(yearlyData[0][1]);
  
  const isBullish = price > yOpen;
  const yearlyStatus = {
    text: isBullish ? 'BULLISH BIAS' : 'BEARISH BIAS',
    bg: isBullish ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
    color: isBullish ? 'text-emerald-500' : 'text-red-500'
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 z-50">
      <div className="max-w-7xl mx-auto px-4 h-12 flex justify-between items-center">
         <div className="flex items-center gap-4 relative">
            <div 
              className="group cursor-help flex items-center h-full border-r border-neutral-800 pr-4"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                YEARLY CONTEXT (TR) <Info size={10} />
              </span>
              
              {showTooltip && (
                <div className="absolute bottom-10 left-0 w-72 bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-2xl z-50 text-xs text-neutral-300">
                  <h4 className="text-amber-500 font-bold mb-1">Yıllık Açılış Önemi</h4>
                  <p>Kurumsal pivot seviyesi. Üstü alıcı (Boğa), altı satıcı (Ayı) kontrolü demektir.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-500 font-bold">{formatCurrency(yOpen)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${yearlyStatus.bg} ${yearlyStatus.color} font-bold flex items-center gap-1`}>
                {yearlyStatus.text}
                {isBullish ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              </span>
            </div>
         </div>
         
         <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-neutral-600">
            <span className="flex items-center gap-1"><Flame size={10} className="text-purple-400"/> CONFLUENCE</span>
            <span>R: RESISTANCE</span>
            <span>S: SUPPORT</span>
         </div>
      </div>
    </div>
  );
}
