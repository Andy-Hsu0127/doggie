import { NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/auth-helpers'
import { SurveyService } from '@/services/survey.service'
import { createLogger } from '@/lib/logger'
import { ApiResponse } from '@/types/api.types'
import { ERROR_CODES } from '@/constants/errors'

const log = createLogger('api.admin.export')

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

    const surveys = await SurveyService.getSatisfactionResponses()

    const csvHeaders =
      'ID,提交時間,接送場次,整體滿意度,人員與司機滿意度,狗狗狀況,NPS推薦分數,回饋建議\n'
    const csvRows = surveys
      .map((s) => {
        const time = new Date(s.submittedAt)
          .toLocaleString('zh-TW', { hour12: false })
          .replace(/\//g, '-')
        const cond =
          s.dogCondition === 'GREAT'
            ? '活蹦亂跳'
            : s.dogCondition === 'NORMAL'
              ? '健康正常'
              : '略顯疲倦'
        const feedback = s.feedback ? `"${s.feedback.replace(/"/g, '""')}"` : ''
        return `${s.id},${time},${s.sessionLabel},${s.ratingOverall},${s.ratingStaff},${cond},${s.npsScore},${feedback}`
      })
      .join('\n')

    const csvContent = '\ufeff' + csvHeaders + csvRows
    const dateStr = (() => {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=survey_satisfaction_export_${dateStr}.csv`,
      },
    })
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to export CSV')
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ERROR_CODES.DB_CONNECTION_FAILED,
        message: '資料匯出失敗，請稍後再試',
      },
    }
    return NextResponse.json(response, { status: 500 })
  }
}
