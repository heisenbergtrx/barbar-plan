import { NextResponse } from 'next/server';

const SYMBOL = 'BTCUSDT';
// Spot verileri için Vision, Futures için fapi (dikkat: fapi US IP'lerini bloklayabilir, 
// Vercel region ayarı gerekebilir ama şimdilik standart fapi deniyoruz)
const SPOT_API = 'https://data-api.binance.vision/api/v3';
const FUTURES_API = 'https://fapi.binance.com/fapi/v1'; 

export const revalidate = 10; 

export async function GET() {
  try {
    const headers = { 'Cache-Control': 'no-store' };
    const fetchOptions = { headers, next: { revalidate: 0 } };

    // Paralel Veri Çekimi (Spot + Futures)
    const [weekly, monthly, yearly, daily, fourHour, ticker, oiData, takerVol] = await Promise.all([
      // Spot Klines (Mevcut)
      fetch(`${SPOT_API}/klines?symbol=${SYMBOL}&interval=1w&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${SPOT_API}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${SPOT_API}/klines?symbol=${SYMBOL}&interval=1M&limit=12`, fetchOptions).then(r => r.json()),
      fetch(`${SPOT_API}/klines?symbol=${SYMBOL}&interval=1d&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${SPOT_API}/klines?symbol=${SYMBOL}&interval=4h&limit=250`, fetchOptions).then(r => r.json()),
      fetch(`${SPOT_API}/ticker/price?symbol=${SYMBOL}`, fetchOptions).then(r => r.json()),
      
      // Futures Verileri (Yeni)
      // Open Interest
      fetch(`${FUTURES_API}/openInterest?symbol=${SYMBOL}`, fetchOptions).then(r => r.json()).catch(() => ({ openInterest: 0 })),
      // Taker Buy/Sell Volume (Son 24s)
      fetch(`${FUTURES_API}/ticker/24hr?symbol=${SYMBOL}`, fetchOptions).then(r => r.json()).catch(() => ({ lastPrice: 0 }))
    ]);

    // Hata Kontrolü
    if (weekly.code || ticker.code) {
      throw new Error(`API Hatası: ${weekly.msg || ticker.msg}`);
    }

    return NextResponse.json({
      price: parseFloat(ticker.price),
      klines: { weekly, monthly, yearly, daily, fourHour },
      orderflow: {
        oi: parseFloat(oiData.openInterest || 0),
        // Taker Volume hesaplaması için ham veri yerine quote volume kullanıyoruz
        volBuy: parseFloat(takerVol.takerBuyQuoteVolume || 0),
        volTotal: parseFloat(takerVol.quoteVolume || 1) // 0'a bölünme hatası olmasın
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Veri kaynağına ulaşılamadı' }, { status: 500 });
  }
}