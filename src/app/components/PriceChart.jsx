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
        textColor: '#525252', // text-neutral-600
        fontFamily: "'Outfit', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#171717' }, // Çok silik ızgara
        horzLines: { color: '#171717' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#262626',
      },
      rightPriceScale: {
        borderColor: '#262626',
        scaleMargins: {
          top: 0.1, 
          bottom: 0.1,
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981', 
      downColor: '#ef4444', 
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const formattedData = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    candleSeries.setData(formattedData);

    // --- SEVİYE ÇİZİMİ (SADECE ÇİZGİLER) ---
    if (levels && levels.length > 0) {
        const lastPrice = formattedData[formattedData.length - 1].close;

        levels.forEach(lvl => {
            // 1. MESAFE FİLTRESİ:
            // Fiyata %15'ten daha uzak seviyeleri çizme
            const distPercent = Math.abs((lastPrice - lvl.price) / lastPrice) * 100;
            if (distPercent > 15) return;

            // Renk Mantığı (Tablo yazı renkleriyle birebir uyumlu)
            const color = lvl.type.includes('resistance') ? '#f87171' : // Red-400
                          lvl.type.includes('support') ? '#34d399' :    // Emerald-400
                          lvl.type.includes('trap') ? '#fb923c' :       // Orange-400
                          '#818cf8';                                    // Indigo-400

            // Çizgi Stili: Ana seviyeler veya Confluence ise DÜZ, Extensionlar KESİKLİ
            const isExtension = lvl.type.includes('extension');
            const lineStyle = (!isExtension || lvl.isConfluence) ? 0 : 2; 
            const lineWidth = lvl.isConfluence ? 2 : 1;

            candleSeries.createPriceLine({
                price: lvl.price,
                color: color,
                lineWidth: lineWidth,
                lineStyle: lineStyle, 
                axisLabelVisible: false, // ETİKETLER KAPATILDI (İstek üzerine)
                title: '',               // Başlık boş
            });
        });
    }

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
       <div className="flex justify-between items-center mb-2">
         <div className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            CANLI FİYAT & SEVİYELER (4H)
         </div>
         <div className="text-[9px] text-neutral-600 italic">
            *Çizgiler fiyata yakın destek/dirençleri temsil eder
         </div>
       </div>
       <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}