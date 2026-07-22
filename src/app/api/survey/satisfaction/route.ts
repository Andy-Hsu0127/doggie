import { NextResponse } from 'next/server'
import { SurveySatisfactionSchema } from '@/types/survey.types'
import { SurveyService } from '@/services/survey.service'
import { createLogger } from '@/lib/logger'
import { ApiResponse } from '@/types/api.types'
import { ERROR_CODES } from '@/constants/errors'

const log = createLogger('api.survey.satisfaction')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SurveySatisfactionSchema.safeParse(body)

    if (!parsed.success) {
      log.warn({ errors: parsed.error.format() }, 'Invalid survey data format')
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATE_INVALID_FORMAT,
          message: parsed.error.issues[0]?.message || '輸入資料格式不正確',
        },
      }
      return NextResponse.json(response, { status: 400 })
    }

    const newSurvey = await SurveyService.createSatisfaction(parsed.data)
    log.info(
      { surveyId: newSurvey.id },
      'Survey satisfaction recorded successfully'
    )

    const response: ApiResponse<{ id: number; submittedAt: Date }> = {
      success: true,
      data: {
        id: newSurvey.id,
        submittedAt: newSurvey.submittedAt,
      },
    }
    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to submit survey satisfaction')
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ERROR_CODES.DB_CONNECTION_FAILED,
        message: '資料庫寫入失敗，請稍後再試',
        detail:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    }
    return NextResponse.json(response, { status: 500 })
  }
}
