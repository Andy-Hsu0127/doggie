import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface DecodedToken {
  userId: number
  email: string
  role: string
  exp: number
}

function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as DecodedToken
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    if (token) {
      const payload = decodeJwt(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname === '/admin') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = decodeJwt(token)
    if (!payload || payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
