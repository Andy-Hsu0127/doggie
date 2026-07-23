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
      const res: ApiResponse<never> = { success: false, error: { code: ERROR_CODES.AUTH_INSUFFICIENT_ROLE, message: '權限不足' } }
      return NextResponse.json(res, { status: 401 })
    }

    const surveys = await SurveyService.getSatisfactionResponses()
    const rowsHtml = surveys.map((s, idx) => {
      const time = new Date(s.submittedAt).toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-')
      const condBg = s.dogCondition === 'GREAT' ? '#dcfce7;color:#15803d' : s.dogCondition === 'NORMAL' ? '#e0f2fe;color:#0369a1' : '#fee2e2;color:#b91c1c'
      const condText = s.dogCondition === 'GREAT' ? '活蹦亂跳 🐶' : s.dogCondition === 'NORMAL' ? '健康正常 🐾' : '略顯疲倦 💤'
      const stars = '⭐'.repeat(s.ratingOverall)
      const staffStars = '⭐'.repeat(s.ratingStaff)
      const npsBg = s.npsScore >= 9 ? '#dcfce7;color:#15803d' : s.npsScore >= 7 ? '#fef3c7;color:#b45309' : '#fee2e2;color:#b91c1c'
      const bg = idx % 2 === 1 ? 'background-color:#fff7ed;' : ''
      const feedback = s.feedback ? s.feedback.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '—'
      return `<tr style="${bg}">
        <td style="text-align:center;font-weight:bold;">${s.id}</td>
        <td style="text-align:center;">${time}</td>
        <td style="text-align:center;font-family:monospace;font-weight:bold;color:#c2410c;">${s.sessionLabel}</td>
        <td style="text-align:center;">${s.ratingOverall} (${stars})</td>
        <td style="text-align:center;">${s.ratingStaff} (${staffStars})</td>
        <td style="text-align:center;background-color:${condBg};font-weight:bold;">${condText}</td>
        <td style="text-align:center;background-color:${npsBg};font-weight:bold;">${s.npsScore} 分</td>
        <td>${feedback}</td>
      </tr>`
    }).join('')

    const excelXml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>滿意度調查紀錄</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: "Microsoft JhengHei", "Segoe UI", sans-serif; font-size: 11pt; }
  th { background-color: #ea580c; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #c2410c; padding: 10px 18px; white-space: nowrap; }
  td { border: 1px solid #fed7aa; padding: 8px 14px; vertical-align: middle; white-space: nowrap; }
</style></head>
<body><table><thead><tr>
  <th>ID</th><th>提交時間</th><th>接送場次</th><th>整體滿意度</th><th>人員與司機滿意度</th><th>狗狗狀況</th><th>NPS 推薦分數</th><th>回饋建議</th>
</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`

    const dateStr = new Date().toISOString().slice(0, 10)
    return new Response('\ufeff' + excelXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename=doggie_survey_export_${dateStr}.xls`,
      },
    })
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to export Excel')
    const res: ApiResponse<never> = { success: false, error: { code: ERROR_CODES.DB_CONNECTION_FAILED, message: '資料匯出失敗' } }
    return NextResponse.json(res, { status: 500 })
  }
}
