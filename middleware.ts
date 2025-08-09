import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect Supabase auth callbacks for email change to our handler page
  const url = request.nextUrl.clone()
  const hasToken = url.searchParams.has('token') || url.searchParams.has('token_hash')
  const type = url.searchParams.get('type')
  if (hasToken && type === 'email_change' && url.pathname !== '/auth/callback') {
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  // Create response
  const response = NextResponse.next()

  // Add security headers for auth pages
  if (request.nextUrl.pathname.startsWith('/forgot-password') || 
      request.nextUrl.pathname.startsWith('/reset-password') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    
    // Prevent caching of sensitive pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // CSP for auth pages
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    )
  }

  return response
}

export const config = {
  matcher: [
    '/forgot-password/:path*',
    '/reset-password/:path*',
    '/admin/:path*',
    '/api/auth/:path*',
    // Also run on root to catch callbacks that land on '/'
    '/',
    '/auth/:path*'
  ]
}
