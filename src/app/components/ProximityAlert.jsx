'use client';
import { AlertTriangle, Target, TrendingUp, TrendingDown, Zap, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrency, calculateDistance, getProximityStatus, PROXIMITY } from '@/lib/utils';

export default function ProximityAlert({ levels, price }) {
  // En yakın seviyeleri bul (yukarı ve aşağı)
  const nearestLevels = useMemo(() => {
    if (!levels || !price) return { above: null, below: null };

    const sorted = [...levels].sort((a, b) => a.price - b.price);
    
    let above = null;
    let below = null;

    for (const lvl of sorted) {
      if (lvl.price > price && !above) {
        above = { ...lvl, distance: calculateDistance(price, lvl.price) };
      }
      if (lvl.price <= price) {
        below = { ...lvl, distance: calculateDistance(price, lvl.price) };
      }
    }

    return { above, below };
  }, [levels, price]);

  // Alert gösterilmeli mi? (En az biri WATCH veya daha yakın)
  const shouldShowAlert = useMemo(() => {
    const aboveDist = nearestLevels.above ? Math.abs(nearestLevels.above.distance) : Infinity;
    const belowDist = nearestLevels.below ? Math.abs(nearestLevels.below.distance) : Infinity;
    return Math.min(aboveDist, belowDist) <= PROXIMITY.WATCH;
  }, [nearestLevels]);

  // En kritik seviyeyi belirle
  const criticalLevel = useMemo(() => {
    const aboveDist = nearestLevels.above ? Math.abs(nearestLevels.above.distance) : Infinity;
    const belowDist = nearestLevels.below ? Math.abs(nearestLevels.below.distance) : Infinity;
    
    if (aboveDist < belowDist) return { ...nearestLevels.above, direction: 'up' };
    if (belowDist < aboveDist) return { ...nearestLevels.below, direction: 'down' };
    return null;
  }, [nearestLevels]);

  if (!shouldShowAlert || !criticalLevel) {
    return (
      <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-neutral-600">
          <Target size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">PROXIMITY ALERT</span>
        </div>
        <div className="mt-3 text-center py-4">
          <div className="text-neutral-700 text-xs">Yakın seviye yok</div>
          <div className="text-neutral-600 text-[10px] mt-1">Fiyat açık bölgede</div>
        </div>
      </div>
    );
  }

  const status = getProximityStatus(criticalLevel.distance);
  const dollarDistance = Math.abs(price - criticalLevel.price);
  const isUp = criticalLevel.direction === 'up';

  // Renk ve stil belirleme
  const getStatusStyles = () => {
    switch (status.severity) {
      case 'critical':
        return {
          container: 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
          header: 'text-amber-500',
          glow: 'animate-pulse',
          bar: 'bg-amber-500',
          badge: 'bg-amber-500 text-black'
        };
      case 'high':
        return {
          container: 'bg-amber-500/5 border-amber-500/30',
          header: 'text-amber-400',
          glow: 'animate-pulse',
          bar: 'bg-amber-500',
          badge: 'bg-amber-500/80 text-black'
        };
      case 'medium':
        return {
          container: 'bg-yellow-500/5 border-yellow-500/20',
          header: 'text-yellow-500',
          glow: '',
          bar: 'bg-yellow-500/70',
          badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        };
      default:
        return {
          container: 'bg-neutral-900/30 border-neutral-800/50',
          header: 'text-neutral-500',
          glow: '',
          bar: 'bg-neutral-600',
          badge: 'bg-neutral-800 text-neutral-400'
        };
    }
  };

  const styles = getStatusStyles();
  const progressPercent = Math.max(0, 100 - (Math.abs(criticalLevel.distance) / PROXIMITY.WATCH) * 100);

  return (
    <div className={`rounded-lg p-4 transition-all duration-500 ${styles.container} ${styles.glow}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 ${styles.header}`}>
        <div className="flex items-center gap-2">
          <Zap size={14} className={status.pulse ? 'animate-pulse' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-widest">PROXIMITY ALERT</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${styles.badge}`}>
          {status.label}
        </span>
      </div>

      {/* Ana İçerik */}
      <div className="space-y-3">
        {/* Seviye Bilgisi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUp ? (
              <TrendingUp size={16} className="text-red-400" />
            ) : (
              <TrendingDown size={16} className="text-emerald-400" />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-sm ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {criticalLevel.label}
                </span>
                {criticalLevel.isConfluence && (
                  <span className="bg-purple-500/20 text-purple-300 text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
                    <Flame size={8} /> CONF
                  </span>
                )}
              </div>
              <div className="text-[9px] text-neutral-500 uppercase">
                {isUp ? 'Resistance Above' : 'Support Below'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-neutral-200">
              {formatCurrency(criticalLevel.price)}
            </div>
            <div className={`text-[10px] font-mono ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
              {isUp ? '↑' : '↓'} ${dollarDistance.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-[9px] text-neutral-500 mb-1">
            <span>DISTANCE</span>
            <span className="font-mono">%{Math.abs(criticalLevel.distance).toFixed(2)}</span>
          </div>
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${styles.bar} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Alt ve Üst Seviyeler */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/50">
          {nearestLevels.above && (
            <div className="text-center">
              <div className="text-[9px] text-neutral-600 mb-0.5">▲ RESISTANCE</div>
              <div className="text-[10px] font-mono text-red-400/80">
                {formatCurrency(nearestLevels.above.price, 0)}
              </div>
              <div className="text-[9px] text-neutral-600">
                +{Math.abs(nearestLevels.above.distance).toFixed(2)}%
              </div>
            </div>
          )}
          {nearestLevels.below && (
            <div className="text-center">
              <div className="text-[9px] text-neutral-600 mb-0.5">▼ SUPPORT</div>
              <div className="text-[10px] font-mono text-emerald-400/80">
                {formatCurrency(nearestLevels.below.price, 0)}
              </div>
              <div className="text-[9px] text-neutral-600">
                {nearestLevels.below.distance.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kritik Uyarı */}
      {status.severity === 'critical' && (
        <div className="mt-3 pt-2 border-t border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 text-[10px]">
            <AlertTriangle size={12} className="animate-pulse" />
            <span className="font-medium">SEVİYE TEMASİ - ORDERFLOW KONTROL ET</span>
          </div>
        </div>
      )}
    </div>
  );
}
