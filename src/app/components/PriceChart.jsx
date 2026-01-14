'use client';
import { createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function PriceChart({ data, levels }) {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#737373',
      },
      grid: {
        vertLines: { color: '#171717' },
        horzLines: { color: '#171717' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Mum Grafiği
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981', // Emerald-500
      downColor: '#ef4444', // Red-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Veriyi TradingView formatına çevir (Time, Open, High, Low, Close)
    const formattedData = data.map(d => ({
      time: d[0] / 1000, // Unix Timestamp (saniye)
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    candleSeries.setData(formattedData);

    // SEVİYELERİ ÇİZ (PWH, PWL, EXTENSIONS)
    if (levels) {
        levels.forEach(lvl => {
            const color = lvl.type.includes('resistance') ? '#f87171' : // Red-400
                          lvl.type.includes('support') ? '#34d399' :    // Emerald-400
                          lvl.type.includes('trap') ? '#fb923c' :       // Orange-400
                          '#818cf8';                                    // Indigo-400 (Trend)
            
            const lineStyle = lvl.isConfluence ? 0 : 2; // Confluence ise düz, değilse kesikli çizgi
            const lineWidth = lvl.isConfluence ? 2 : 1;

            candleSeries.createPriceLine({
                price: lvl.price,
                color: color,
                lineWidth: lineWidth,
                lineStyle: lineStyle, 
                axisLabelVisible: true,
                title: lvl.label,
            });
        });
    }

    // Responsive Ayarı
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, levels]);

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4 mb-6">
       <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          CANLI FİYAT & SEVİYELER (4H)
       </div>
       <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}