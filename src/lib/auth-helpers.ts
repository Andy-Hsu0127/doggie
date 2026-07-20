import { cookies } from 'next/headers'
import { verifyToken, JwtPayload } from '@/lib/auth'

export async function getSessionUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function authorizeAdmin(): Promise<JwtPayload | null> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ANALYST')) {
    return null
  }
  return user
}
