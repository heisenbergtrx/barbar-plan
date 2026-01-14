import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
const API_BASE = 'https://data-api.binance.vision/api/v3';

// Next.js Cache Ayarı: Bu route'un cevabını 10 saniye boyunca sakla.
// 1000 kullanıcı aynı anda girse bile Binance'e 10 saniyede sadece 1 istek gider.
export const revalidate = 10; 

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    // Cache ayarını 'force-cache' yapıyoruz veya next: { revalidate } kullanıyoruz.
    // Ancak route segment config (yukarıdaki export const revalidate) en temizidir.
    const fetchOptions = { 
      headers
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

    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Veri kaynağına ulaşılamadı' }, { status: 500 });
  }
}