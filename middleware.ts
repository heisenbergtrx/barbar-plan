import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // İzin verilen domainler
  const allowedOrigins = [
    'https://pro.barbarianstrading.com',
    'https://barbarianstrading.com',
    'http://localhost:3000' // Geliştirme için
  ]

  // Referer veya Origin header'ını kontrol et
  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''

  // İzin verilen domain'den mi geliyor?
  const isAllowed = allowedOrigins.some(allowed => 
    referer.startsWith(allowed) || origin.startsWith(allowed)
  )

  // Doğrudan erişim engelle (iframe dışından)
  if (!isAllowed) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erişim Engellendi</title>
          <style>
            body {
              background: #0a0a0b;
              color: #fafafa;
              font-family: system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              padding: 40px;
            }
            h1 { color: #f59e0b; }
            a {
              color: #f59e0b;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Erişim Engellendi</h1>
            <p>Bu uygulama sadece Barbarians Portal üzerinden erişilebilir.</p>
            <p><a href="https://pro.barbarianstrading.com">Portal'a Git →</a></p>
          </div>
        </body>
      </html>
      `,
      {
        status: 403,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }

  return NextResponse.next()
}

// Hangi path'lere uygulanacak
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}