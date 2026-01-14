import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
// Sadece Spot API kullanıyoruz (Vercel Dostu)
const API_BASE = 'https://data-api.binance.vision/api/v3';

export const revalidate = 10; 

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    const fetchOptions = { headers, next: { revalidate: 0 } };

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
    // Son 4 Saatlik mumun içindeki alıcı/satıcı verisini çekiyoruz.
    // Index 10: Taker buy quote asset volume (Alıcıların Hacmi)
    // Index 7: Quote asset volume (Toplam Hacim)
    const lastCandle = fourHour[fourHour.length - 1];
    const buyVol = parseFloat(lastCandle[10]);
    const totalVol = parseFloat(lastCandle[7]);
    
    // Futures OI verisi alamadığımız için 24s Hacmi kullanıyoruz
    // 24s Hacim için son 6 adet 4H mumunu toplayabiliriz veya basitçe son mumu scale edebiliriz.
    // Daha doğru olması için günlük mumun hacmini alalım.
    const lastDaily = daily[daily.length - 1];
    const dayVol = parseFloat(lastDaily[7]);

    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      orderflow: {
        volBuy: buyVol,
        volTotal: totalVol,
        dayVolume: dayVol // OI yerine kullanılacak
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Veri kaynağına ulaşılamadı' }, { status: 500 });
  }
}