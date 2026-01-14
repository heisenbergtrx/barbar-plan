import { NextResponse } from 'next/server';

// BU SATIR KRİTİK: Next.js'e bu rotanın dinamik olduğunu söylüyoruz (Build hatasını çözer)
export const dynamic = 'force-dynamic'; 

const SYMBOL = 'BTCUSDT';
const API_BASE = 'https://data-api.binance.vision/api/v3';

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    // Rate Limit Koruması:
    // next: { revalidate: 10 } -> Veriyi 10 saniye boyunca hafızada tutar.
    // 1000 kişi aynı anda girse bile Binance'e 10 saniyede sadece 1 istek gider.
    const fetchOptions = { 
      headers,
      next: { revalidate: 10 } 
    };

    const [weekly, monthly, yearly, daily, fourHour, ticker] = await Promise.all([
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1w&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1d&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=4h&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/ticker/price?symbol=${SYMBOL}`, fetchOptions).then(r => r.json())
    ]);

    if (weekly.code || ticker.code) {
      throw new Error(`Binance API Hatası: ${weekly.msg || ticker.msg}`);
    }

    // --- ORDERFLOW HESAPLAMA (SPOT DELTA) ---
    const lastCandle = fourHour[fourHour.length - 1];
    const buyVol = parseFloat(lastCandle[10]); // Taker buy quote volume
    const totalVol = parseFloat(lastCandle[7]); // Quote volume
    
    // Günlük Hacim
    const lastDaily = daily[daily.length - 1];
    const dayVol = parseFloat(lastDaily[7]);

    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      orderflow: {
        volBuy: buyVol,
        volTotal: totalVol,
        dayVolume: dayVol
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('API Route Hatası:', error);
    return NextResponse.json({ error: error.message || 'Veri kaynağına ulaşılamadı' }, { status: 500 });
  }
}