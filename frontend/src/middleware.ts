import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_SITE = process.env.NEXT_PUBLIC_SITE === 'admin'

// Admin-only paths (when on admin site, only these are allowed)
const ADMIN_PATH_PREFIXES = ['/admin', '/auth/admin']

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ADMIN_SITE) {
    // Admin site (port 3001): only admin login and admin dashboard
    if (isAdminPath(pathname)) return NextResponse.next()
    // Everything else → admin login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/admin/signin'
    return NextResponse.redirect(url)
  }

  // User site (port 3000): no admin UI
  if (isAdminPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and api
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
