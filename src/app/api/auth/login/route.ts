import { NextResponse } from 'next/server'
import { LoginSchema } from '@/types/auth.types'
import { AuthService } from '@/services/auth.service'
import { signToken } from '@/lib/auth'
import { createLogger } from '@/lib/logger'
import { ERROR_CODES } from '@/constants/errors'
import { ApiResponse } from '@/types/api.types'

const log = createLogger('api.auth.login')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATE_INVALID_FORMAT,
          message: parsed.error.issues[0]?.message || '格式驗證失敗',
        },
      }
      return NextResponse.json(response, { status: 400 })
    }

    const user = await AuthService.verifyUser(parsed.data)
    if (!user) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: '帳號或密碼輸入錯誤',
        },
      }
      return NextResponse.json(response, { status: 401 })
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    log.info({ userId: user.id }, 'User logged in successfully')

    const response: ApiResponse<{ name: string; email: string; role: string }> =
      {
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }

    const nextResponse = NextResponse.json(response, { status: 200 })
    nextResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return nextResponse
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to login user')
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ERROR_CODES.DB_CONNECTION_FAILED,
        message: '登入程序發生系統錯誤，請稍後再試',
      },
    }
    return NextResponse.json(response, { status: 500 })
  }
}
