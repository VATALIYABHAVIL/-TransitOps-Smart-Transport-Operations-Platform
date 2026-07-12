import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname === '/register'
  
  // Define API paths that don't require auth
  const isPublicApi = pathname === '/api/auth/login' || pathname === '/api/auth/register'

  // If it's a public API path, let it pass
  if (isPublicApi) {
    return NextResponse.next()
  }

  // If trying to access API and no token, return 401 Unauthorized
  if (pathname.startsWith('/api/') && !token) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized: No token provided' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  // If user has token and tries to access login/register, redirect to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user has no token and tries to access protected UI path, redirect to login
  if (!token && !isPublicPath && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
