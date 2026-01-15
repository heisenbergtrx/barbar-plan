// ═══════════════════════════════════════════════════════════════
// BARBARIANS TERMINAL - UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────────────────────────

export const formatCurrency = (val, decimals = 2) => {
  if (!val && val !== 0) return '---';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
};

export const formatCompact = (num) => {
  if (!num) return '---';
  return new Intl.NumberFormat('en-US', { 
    notation: "compact", 
    maximumFractionDigits: 1 
  }).format(num);
};

export const formatPercent = (val, decimals = 2) => {
  if (!val && val !== 0) return '---';
  return `${val >= 0 ? '+' : ''}${val.toFixed(decimals)}%`;
};

// ─────────────────────────────────────────────────────────────────
// SESSION DETECTION
// ─────────────────────────────────────────────────────────────────

export const getActiveSession = () => {
  const hour = new Date().getUTCHours();
  
  if (hour >= 0 && hour < 8) {
    return { 
      name: 'ASIA SESSION', 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      desc: 'Likidite Avı (Sweep)' 
    };
  }
  if (hour >= 8 && hour < 13) {
    return { 
      name: 'LONDON OPEN', 
      color: 'text-blue-400',
      bgColor: 'bg-blue-400',
      desc: 'Trend Başlangıcı' 
    };
  }
  if (hour >= 13 && hour < 16) {
    return { 
      name: 'NY & LDN OVERLAP', 
      color: 'text-purple-400',
      bgColor: 'bg-purple-400',
      desc: 'Yüksek Volatilite' 
    };
  }
  if (hour >= 16 && hour < 21) {
    return { 
      name: 'NY SESSION (PM)', 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400',
      desc: 'Kapanış Hareketleri' 
    };
  }
  return { 
    name: 'MARKET CLOSE', 
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-500',
    desc: 'Düşük Likidite' 
  };
};

// ─────────────────────────────────────────────────────────────────
// CALCULATIONS
// ─────────────────────────────────────────────────────────────────

export const calculateDistance = (current, target) => {
  if (!current || !target) return 0;
  return ((target - current) / current) * 100;
};

export const calculateAbsDistance = (current, target) => {
  if (!current || !target) return 0;
  return (Math.abs(current - target) / current) * 100;
};

export const calculateSMA = (candles, period) => {
  if (!candles || candles.length < period) return null;
  const slice = candles.slice(-period);
  const sum = slice.reduce((acc, c) => acc + parseFloat(c[4]), 0);
  return sum / period;
};

export const calculateEMA = (closes, period) => {
  if (!closes || closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] * k) + (ema * (1 - k));
  }
  return ema;
};

export const calculateATR = (candles, period = 14) => {
  if (!candles || candles.length <= period) return 0;
  let trs = [];
  for (let i = 1; i < candles.length; i++) {
    const high = parseFloat(candles[i][2]);
    const low = parseFloat(candles[i][3]);
    const prevClose = parseFloat(candles[i - 1][4]);
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const last14TR = trs.slice(-period);
  return last14TR.reduce((a, b) => a + b, 0) / period;
};

// ─────────────────────────────────────────────────────────────────
// EXTENSION CONFIG
// ─────────────────────────────────────────────────────────────────

export const EXTENSION_CONFIG = {
  TRAP: {
    coeff: 0.13,
    label: 'TRAP',
    description: 'SFP/Sweep Dikkat Bölgesi'
  },
  TREND: {
    coeff: 0.618,
    label: 'TREND',
    description: 'Fibonacci Extension'
  }
};

// ─────────────────────────────────────────────────────────────────
// PROXIMITY THRESHOLDS
// ─────────────────────────────────────────────────────────────────

export const PROXIMITY = {
  TOUCHED: 0.05,    // %0.05 - Dokundu
  IN_ZONE: 0.35,    // %0.35 - Bölgede
  WATCH: 1.5,       // %1.5  - İzleme
  APPROACHING: 3.0  // %3.0  - Yaklaşıyor
};

// ─────────────────────────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────────────────────────

export const getProximityStatus = (distance) => {
  const absDistance = Math.abs(distance);
  
  if (absDistance <= PROXIMITY.TOUCHED) {
    return {
      label: 'TOUCHED',
      severity: 'critical',
      color: 'amber',
      pulse: true
    };
  }
  if (absDistance <= PROXIMITY.IN_ZONE) {
    return {
      label: 'IN ZONE',
      severity: 'high',
      color: 'amber',
      pulse: true
    };
  }
  if (absDistance <= PROXIMITY.WATCH) {
    return {
      label: 'WATCH',
      severity: 'medium',
      color: 'yellow',
      pulse: false
    };
  }
  if (absDistance <= PROXIMITY.APPROACHING) {
    return {
      label: 'APPROACHING',
      severity: 'low',
      color: 'neutral',
      pulse: false
    };
  }
  return {
    label: 'IDLE',
    severity: 'none',
    color: 'neutral',
    pulse: false
  };
};

// ─────────────────────────────────────────────────────────────────
// LEVEL TYPE COLORS
// ─────────────────────────────────────────────────────────────────

export const getLevelColor = (type, isConfluence = false) => {
  if (isConfluence) return 'amber';
  if (type.includes('resistance')) return 'red';
  if (type.includes('support')) return 'emerald';
  if (type.includes('trap')) return 'orange';
  if (type.includes('trend')) return 'indigo';
  return 'neutral';
};
