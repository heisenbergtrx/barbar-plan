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
        textColor: '#525252',
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
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
      crosshair: {
        vertLine: {
          color: '#f59e0b40',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#f59e0b40',
          width: 1,
          style: 2,
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b98180',
      wickDownColor: '#ef444480',
    });

    const formattedData = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    candleSeries.setData(formattedData);

    // Seviye çizgileri
    if (levels && levels.length > 0) {
      const lastPrice = formattedData[formattedData.length - 1].close;

      levels.forEach(lvl => {
        // %15'ten uzak seviyeleri çizme
        const distPercent = Math.abs((lastPrice - lvl.price) / lastPrice) * 100;
        if (distPercent > 15) return;

        // Renk belirleme
        let color;
        if (lvl.isConfluence) {
          color = '#fbbf24'; // Amber - Confluence
        } else if (lvl.type.includes('resistance')) {
          color = '#f87171'; // Red
        } else if (lvl.type.includes('support')) {
          color = '#34d399'; // Emerald
        } else if (lvl.type.includes('trap')) {
          color = '#fb923c'; // Orange
        } else {
          color = '#818cf8'; // Indigo
        }

        // Çizgi stili
        const isExtension = lvl.type.includes('extension');
        const lineStyle = (!isExtension || lvl.isConfluence) ? 0 : 2;
        const lineWidth = lvl.isConfluence ? 2 : 1;

        candleSeries.createPriceLine({
          price: lvl.price,
          color: color,
          lineWidth: lineWidth,
          lineStyle: lineStyle,
          axisLabelVisible: false,
          title: '',
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
    <div className="bg-[#0d0d0f] border border-neutral-800/50 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          CANLI FİYAT & SEVİYELER (4H)
        </div>
        <div className="flex items-center gap-3 text-[9px] text-neutral-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-red-400" /> RES
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-emerald-400" /> SUP
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400" /> CONF
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}
