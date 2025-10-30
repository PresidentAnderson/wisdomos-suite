import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip middleware for static files and API routes that don't need tenant context
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico' ||
    url.pathname.startsWith('/api/public') ||
    url.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // For now, just pass through all requests to avoid middleware errors
  // TODO: Implement proper tenant middleware when database is stable
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};