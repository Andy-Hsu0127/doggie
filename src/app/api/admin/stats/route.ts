import { NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/auth-helpers'
import { SurveyService } from '@/services/survey.service'
import { createLogger } from '@/lib/logger'
import { ApiResponse } from '@/types/api.types'
import { ERROR_CODES } from '@/constants/errors'

const log = createLogger('api.admin.stats')

export async function GET() {
  try {
    const admin = await authorizeAdmin()
    if (!admin) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ERROR_CODES.AUTH_INSUFFICIENT_ROLE,
          message: '權限不足，請登入管理員帳號',
        },
      }
      return NextResponse.json(response, { status: 401 })
    }

    const stats = await SurveyService.getSatisfactionStats()
    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    }
    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch admin stats')
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ERROR_CODES.DB_CONNECTION_FAILED,
        message: '無法獲取統計資料，請稍後再試',
      },
    }
    return NextResponse.json(response, { status: 500 })
  }
}
