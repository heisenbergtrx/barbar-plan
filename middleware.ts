import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const allowedOrigins = [
    'https://pro.barbarianstrading.com',
    'https://barbarianstrading.com',
    'http://localhost:3000'
  ]

  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''

  const isAllowed = allowedOrigins.some(allowed => 
    referer.startsWith(allowed) || origin.startsWith(allowed)
  )

  if (!isAllowed) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    .container { padding: 40px; }
    h1 { color: #f59e0b; }
    a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Erisim Engellendi</h1>
    <p>Bu uygulama sadece Barbarians Portal uzerinden erisilebilir.</p>
    <p><a href="https://pro.barbarianstrading.com">Portal'a Git →</a></p>
  </div>
</body>
</html>`,
      {
        status: 403,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}