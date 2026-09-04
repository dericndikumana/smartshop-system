import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from './src/lib/auth.config'

const { auth: middleware } = NextAuth(authConfig)

export default middleware((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/') && !req.nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

  // Let API Auth routes pass
  if (isApiAuthRoute) return NextResponse.next()

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Redirect authenticated users from login to dashboard
  if (isLoggedIn && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  if (isLoggedIn && req.auth) {
    const user: any = req.auth.user
    
    // Global block check
    if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
      return NextResponse.redirect(new URL('/api/auth/signout', req.nextUrl))
    }

    // Role-based protection: Super Admin
    if (req.nextUrl.pathname.startsWith('/superadmin') && user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    // Role-based protection: Shop Admin (prevent Cashier from accessing settings, staff, inventory, and reports)
    if ((
      req.nextUrl.pathname.startsWith('/settings') || 
      req.nextUrl.pathname.startsWith('/staff') ||
      req.nextUrl.pathname.startsWith('/inventory') ||
      req.nextUrl.pathname.startsWith('/reports')
    ) && user.role === 'CASHIER') {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
