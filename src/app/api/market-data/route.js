import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
// Binance Public Data API (ABD IP'lerine açık, Vercel dostu)
const API_BASE = 'https://data-api.binance.vision/api/v3';

export async function GET() {
  try {
    // Tarayıcı taklidi yapan headerlar ve önbellek kapatma
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Cache-Control': 'no-store'
    };

    const fetchOptions = { 
      headers, 
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js önbelleğini tamamen kapat
    };

    // Tüm verileri paralel çek
    const [weekly, monthly, yearly, daily, fourHour, ticker] = await Promise.all([
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1w&limit=2`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=2`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1d&limit=30`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=4h&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/ticker/price?symbol=${SYMBOL}`, fetchOptions).then(r => r.json())
    ]);

    // Hata Kontrolü (Binance bazen JSON içinde hata kodu döner)
    if (weekly.code || ticker.code) {
      console.error('Binance Yanıt Hatası:', weekly.msg || ticker.msg);
      throw new Error(`Binance API Reddedildi: ${weekly.msg || ticker.msg}`);
    }

    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      timestamp: new Date().toISOString()
    }, { 
      status: 200, 
      headers: { 'Cache-Control': 'no-store, max-age=0' } 
    });

  } catch (error) {
    console.error('API Route Kritik Hata:', error);
    return NextResponse.json({ error: error.message || 'Binance Bağlantı Hatası' }, { status: 500 });
  }
}