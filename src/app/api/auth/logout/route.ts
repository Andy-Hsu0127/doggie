import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/api.types'

export async function POST() {
  const response: ApiResponse<null> = {
    success: true,
  }
  const nextResponse = NextResponse.json(response, { status: 200 })
  nextResponse.cookies.set('token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return nextResponse
}
