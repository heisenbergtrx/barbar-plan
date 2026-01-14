import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
const API_BASE = '[https://api.binance.com/api/v3](https://api.binance.com/api/v3)';

export async function GET() {
  try {
    // Tüm verileri paralel çek
    const [weekly, monthly, yearly, daily, fourHour] = await Promise.all([
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1w&limit=2`).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=2`).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1M&limit=12`).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=1d&limit=30`).then(r => r.json()),
      fetch(`${API_BASE}/klines?symbol=${SYMBOL}&interval=4h&limit=250`).then(r => r.json())
    ]);

    // Fiyat bilgisini de ekleyelim
    const ticker = await fetch(`${API_BASE}/ticker/price?symbol=${SYMBOL}`).then(r => r.json());

    // Veriyi paketle ve frontend'e gönder
    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Binance API Hatası' }, { status: 500 });
  }
}