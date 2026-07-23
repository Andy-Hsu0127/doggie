import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { authorizeAdmin } from '@/lib/auth-helpers'
import { SurveyService } from '@/services/survey.service'
import { createLogger } from '@/lib/logger'

const log = createLogger('api.admin.export')

export async function GET() {
  try {
    const admin = await authorizeAdmin()
    if (!admin) return NextResponse.json({ success: false, error: { message: '權限不足' } }, { status: 401 })

    const surveys = await SurveyService.getSatisfactionResponses()
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('滿意度調查紀錄')

    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '提交時間', key: 'time', width: 22 },
      { header: '接送場次', key: 'session', width: 18 },
      { header: '整體滿意度', key: 'ratingOverall', width: 20 },
      { header: '人員與司機滿意度', key: 'ratingStaff', width: 22 },
      { header: '狗狗狀況', key: 'dogCondition', width: 18 },
      { header: 'NPS 推薦分數', key: 'npsScore', width: 18 },
      { header: '回饋建議', key: 'feedback', width: 45 },
    ]

    const headerRow = ws.getRow(1)
    headerRow.height = 28
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } }
      cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = { top: { style: 'thin', color: { argb: 'FFC2410C' } }, bottom: { style: 'medium', color: { argb: 'FFC2410C' } } }
    })

    surveys.forEach((s, idx) => {
      const time = new Date(s.submittedAt).toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-')
      const condText = s.dogCondition === 'GREAT' ? '活蹦亂跳 🐶' : s.dogCondition === 'NORMAL' ? '健康正常 🐾' : '略顯疲倦 💤'
      const row = ws.addRow({
        id: s.id,
        time,
        session: s.sessionLabel,
        ratingOverall: `${s.ratingOverall} (${'⭐'.repeat(s.ratingOverall)})`,
        ratingStaff: `${s.ratingStaff} (${'⭐'.repeat(s.ratingStaff)})`,
        dogCondition: condText,
        npsScore: `${s.npsScore} 分`,
        feedback: s.feedback || '—',
      })
      row.height = 24
      const isEven = idx % 2 === 1

      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Microsoft JhengHei', size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: colNum === 8 ? 'left' : 'center' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFED7AA' } },
          bottom: { style: 'thin', color: { argb: 'FFFED7AA' } },
          left: { style: 'thin', color: { argb: 'FFFED7AA' } },
          right: { style: 'thin', color: { argb: 'FFFED7AA' } },
        }
        if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF6EE' } }

        if (colNum === 6) {
          const fg = s.dogCondition === 'GREAT' ? 'FFDCFCE7' : s.dogCondition === 'NORMAL' ? 'FFE0F2FE' : 'FFFEE2E2'
          const fontClr = s.dogCondition === 'GREAT' ? 'FF15803D' : s.dogCondition === 'NORMAL' ? 'FF0369A1' : 'FFB91C1C'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }
          cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fontClr }, size: 10 }
        }
        if (colNum === 7) {
          const fg = s.npsScore >= 9 ? 'FFDCFCE7' : s.npsScore >= 7 ? 'FFFEEFCE' : 'FFFEE2E2'
          const fontClr = s.npsScore >= 9 ? 'FF15803D' : s.npsScore >= 7 ? 'FFB45309' : 'FFB91C1C'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }
          cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fontClr }, size: 10 }
        }
      })
    })

    const buffer = await wb.xlsx.writeBuffer()
    const dateStr = new Date().toISOString().slice(0, 10)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=doggie_survey_export_${dateStr}.xlsx`,
      },
    })
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to export Excel')
    return NextResponse.json({ success: false, error: { message: '資料匯出失敗' } }, { status: 500 })
  }
}
