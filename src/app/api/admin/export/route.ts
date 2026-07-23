import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { authorizeAdmin } from '@/lib/auth-helpers'
import { SurveyService } from '@/services/survey.service'

export async function GET() {
  try {
    const admin = await authorizeAdmin()
    if (!admin) return NextResponse.json({ success: false, error: { message: '權限不足' } }, { status: 401 })

    const [surveys, stats] = await Promise.all([SurveyService.getSatisfactionResponses(), SurveyService.getSatisfactionStats()])
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('滿意度調查分析')
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }]
    ws.columns = [{ width: 10 }, { width: 22 }, { width: 18 }, { width: 20 }, { width: 22 }, { width: 18 }, { width: 18 }, { width: 45 }]

    ws.mergeCells('A1:H1')
    ws.getCell('A1').value = '🐾 Doggie 毛孩照護 — 服務滿意度調查分析報表'
    ws.getCell('A1').font = { name: 'Microsoft JhengHei', bold: true, size: 13, color: { argb: 'FFD97706' } }
    ws.getRow(1).height = 30

    ws.mergeCells('A2:H2')
    ws.getCell('A2').value = `匯出時間：${new Date().toLocaleString('zh-TW')}  |  產出者：${admin.email}`
    ws.getCell('A2').font = { name: 'Microsoft JhengHei', size: 9, color: { argb: 'FF737373' } }
    ws.getRow(2).height = 18

    const kpis = [
      { range: 'A4:B4', vRange: 'A5:B5', title: '總回應數', val: `${stats.totalCount} 筆`, color: 'FF262626' },
      { range: 'C4:D4', vRange: 'C5:D5', title: '整體平均分數', val: `${stats.avgOverall} / 5.0 ⭐`, color: 'FFD97706' },
      { range: 'E4:F4', vRange: 'E5:F5', title: '人員與司機平均', val: `${stats.avgStaff} / 5.0 ⭐`, color: 'FFD97706' },
      { range: 'G4:H4', vRange: 'G5:H5', title: 'NPS 推薦指數', val: `${stats.npsScore}%`, color: stats.npsScore >= 80 ? 'FF15803D' : 'FFB45309' },
    ]
    ws.getRow(4).height = 18; ws.getRow(5).height = 26
    kpis.forEach((k) => {
      ws.mergeCells(k.range); ws.mergeCells(k.vRange)
      const tCell = ws.getCell(k.range.split(':')[0]), vCell = ws.getCell(k.vRange.split(':')[0])
      tCell.value = k.title; tCell.font = { name: 'Microsoft JhengHei', size: 9, color: { argb: 'FF737373' } }; tCell.alignment = { vertical: 'middle', horizontal: 'center' }; tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } }
      vCell.value = k.val; vCell.font = { name: 'Microsoft JhengHei', bold: true, size: 12, color: { argb: k.color } }; vCell.alignment = { vertical: 'middle', horizontal: 'center' }; vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } }
    })

    const headers = ['ID', '提交時間', '接送場次', '整體滿意度', '人員與司機滿意度', '狗狗狀況', 'NPS 推薦分數', '回饋建議']
    const hRow = ws.getRow(7); hRow.height = 26
    headers.forEach((h, i) => {
      const cell = hRow.getCell(i + 1)
      cell.value = h; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF262626' } }; cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }; cell.alignment = { vertical: 'middle', horizontal: 'center' }; cell.border = { bottom: { style: 'medium', color: { argb: 'FFD97706' } } }
    })

    surveys.forEach((s, idx) => {
      const time = new Date(s.submittedAt).toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-')
      const condText = s.dogCondition === 'GREAT' ? '活蹦亂跳 🐶' : s.dogCondition === 'NORMAL' ? '健康正常 🐾' : '略顯疲倦 💤'
      const row = ws.addRow([s.id, time, s.sessionLabel, `${s.ratingOverall} (${'⭐'.repeat(s.ratingOverall)})`, `${s.ratingStaff} (${'⭐'.repeat(s.ratingStaff)})`, condText, `${s.npsScore} 分`, s.feedback || '—'])
      row.height = 24
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Microsoft JhengHei', size: 9.5 }; cell.alignment = { vertical: 'middle', horizontal: colNum === 8 ? 'left' : 'center' }
        cell.border = { top: { style: 'thin', color: { argb: 'FFE5E5E5' } }, bottom: { style: 'thin', color: { argb: 'FFE5E5E5' } }, left: { style: 'thin', color: { argb: 'FFE5E5E5' } }, right: { style: 'thin', color: { argb: 'FFE5E5E5' } } }
        if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }
        if (colNum === 3) cell.font = { name: 'Consolas', bold: true, color: { argb: 'FFD97706' }, size: 9.5 }
        if (colNum === 6) {
          const fg = s.dogCondition === 'GREAT' ? 'FFDCFCE7' : s.dogCondition === 'NORMAL' ? 'FFE0F2FE' : 'FFFEE2E2', fc = s.dogCondition === 'GREAT' ? 'FF15803D' : s.dogCondition === 'NORMAL' ? 'FF0369A1' : 'FFB91C1C'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }; cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fc }, size: 9.5 }
        }
        if (colNum === 7) {
          const fg = s.npsScore >= 9 ? 'FFDCFCE7' : s.npsScore >= 7 ? 'FFFEEFCE' : 'FFFEE2E2', fc = s.npsScore >= 9 ? 'FF15803D' : s.npsScore >= 7 ? 'FFB45309' : 'FFB91C1C'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }; cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fc }, size: 9.5 }
        }
      })
    })

    const buffer = await wb.xlsx.writeBuffer()
    const dateStr = new Date().toISOString().slice(0, 10)
    return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename=doggie_survey_export_${dateStr}.xlsx` } })
  } catch { return NextResponse.json({ success: false, error: { message: '資料匯出失敗' } }, { status: 500 }) }
}
