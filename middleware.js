import { NextResponse } from 'next/server'

// Rate limiting storage
const rateLimit = new Map()

export function middleware(request) {
  const response = NextResponse.next()
  const hostname = request.nextUrl.hostname || ''
  const isDevHost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP Header for XSS protection
  const scriptSrc = isDevHost
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'"

  response.headers.set('Content-Security-Policy',
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
      "frame-ancestors 'none'"
    ].join('; ')
  )

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('X-Forwarded-For') || 'anonymous'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = 100 // requests per minute
    
    const requestData = rateLimit.get(key) || { count: 0, resetTime: now + windowMs }
    
    if (now > requestData.resetTime) {
      requestData.count = 1
      requestData.resetTime = now + windowMs
    } else {
      requestData.count++
    }
    
    rateLimit.set(key, requestData)
    
    if (requestData.count > maxRequests) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString()
        }
      })
    }
  }

  // Block suspicious patterns
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /acunetix/i,
    /w3af/i,
    /burp/i,
    /python-requests/i,
    /curl\/.*$/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|android-chrome|apple-touch|favicon|mstile).*)',
  ],
}
