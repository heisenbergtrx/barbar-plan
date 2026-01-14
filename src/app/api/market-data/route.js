import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
const API_BASE = 'https://data-api.binance.vision/api/v3';

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Cache-Control': 'no-store'
    };

    const fetchOptions = { 
      headers, 
      cache: 'no-store',
      next: { revalidate: 0 }
    };

    // HTF Ortalamaları için limitleri 250'ye çıkardık
    const [weekly, monthly, yearly, daily, fourHour, ticker] = await Promise.all([
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1w&limit=250`, fetchOptions).then(r => r.json()), // 2 -> 250
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()), // Yearly open için
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1d&limit=250`, fetchOptions).then(r => r.json()), // 30 -> 250
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=4h&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${API_BASE}/ticker/price?symbol=${SYMBOL}`, fetchOptions).then(r => r.json())
    ]);

    if (weekly.code || ticker.code) {
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