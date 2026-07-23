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

    // ── Sheet 1: 📊 經營總覽與關鍵分析 ──
    const ws1 = wb.addWorksheet('📊 經營總覽與關鍵分析')
    ws1.columns = [{ width: 14 }, { width: 22 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 40 }]
    ws1.mergeCells('A1:H1'); ws1.getCell('A1').value = '🐾 Doggie 毛孩照護 — 服務滿意度調查經營分析報告'; ws1.getCell('A1').font = { name: 'Microsoft JhengHei', bold: true, size: 13, color: { argb: 'FF0F5132' } }; ws1.getRow(1).height = 30
    ws1.mergeCells('A2:H2'); ws1.getCell('A2').value = `匯出時間：${new Date().toLocaleString('zh-TW')}  |  匯出者：${admin.email}`; ws1.getCell('A2').font = { name: 'Microsoft JhengHei', size: 9, color: { argb: 'FF6C757D' } }; ws1.getRow(2).height = 18

    const kpis = [{ range: 'A4:B4', vRange: 'A5:B5', title: '總回應數', val: `${stats.totalCount} 筆`, c: 'FF0F5132' }, { range: 'C4:D4', vRange: 'C5:D5', title: '整體平均滿意度', val: `${stats.avgOverall} / 5.0 ⭐`, c: 'FF0F5132' }, { range: 'E4:F4', vRange: 'E5:F5', title: '人員與司機平均', val: `${stats.avgStaff} / 5.0 ⭐`, c: 'FF0F5132' }, { range: 'G4:H4', vRange: 'G5:H5', title: 'NPS 推薦指數', val: `${stats.npsScore}%`, c: stats.npsScore >= 80 ? 'FF0F5132' : 'FFB45309' }]
    ws1.getRow(4).height = 18; ws1.getRow(5).height = 26
    kpis.forEach((k) => {
      ws1.mergeCells(k.range); ws1.mergeCells(k.vRange)
      const t = ws1.getCell(k.range.split(':')[0]), v = ws1.getCell(k.vRange.split(':')[0])
      t.value = k.title; t.font = { name: 'Microsoft JhengHei', size: 9, color: { argb: 'FF6C757D' } }; t.alignment = { vertical: 'middle', horizontal: 'center' }; t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }
      v.value = k.val; v.font = { name: 'Microsoft JhengHei', bold: true, size: 12, color: { argb: k.c } }; v.alignment = { vertical: 'middle', horizontal: 'center' }; v.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }
    })

    ws1.mergeCells('A7:H7'); ws1.getCell('A7').value = '【 狗狗照護狀態分布 】'; ws1.getCell('A7').font = { name: 'Microsoft JhengHei', bold: true, size: 11, color: { argb: 'FF0F5132' } }
    const condData = [
      ['活蹦亂跳 🐶', `${stats.dogConditions.GREAT} 隻`, stats.totalCount ? `${Math.round((stats.dogConditions.GREAT / stats.totalCount) * 100)}%` : '0%'],
      ['健康正常 🐾', `${stats.dogConditions.NORMAL} 隻`, stats.totalCount ? `${Math.round((stats.dogConditions.NORMAL / stats.totalCount) * 100)}%` : '0%'],
      ['略顯疲倦 💤', `${stats.dogConditions.CONCERN} 隻`, stats.totalCount ? `${Math.round((stats.dogConditions.CONCERN / stats.totalCount) * 100)}%` : '0%'],
    ]
    const cHead = ws1.addRow(['狀態', '數量', '占比']); cHead.font = { name: 'Microsoft JhengHei', bold: true, size: 9.5 }; cHead.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
    condData.forEach((cd) => { const r = ws1.addRow(cd); r.font = { name: 'Microsoft JhengHei', size: 9.5 } })

    const lowSurveys = surveys.filter((s) => s.ratingOverall <= 3 || s.ratingStaff <= 3)
    ws1.addRow([]); const alertHead = ws1.addRow([`【 低分警示名單 (共 ${lowSurveys.length} 筆需關注) 】`]); alertHead.font = { name: 'Microsoft JhengHei', bold: true, size: 11, color: { argb: 'FF842029' } }
    const ahRow = ws1.addRow(['ID', '提交時間', '場次', '整體滿意', '人員滿意', '狗狗狀況', 'NPS', '回饋建議'])
    ahRow.font = { name: 'Microsoft JhengHei', bold: true, size: 9.5, color: { argb: 'FFFFFFFF' } }; ahRow.eachCell((c) => (c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF842029' } }))
    lowSurveys.forEach((s) => {
      const r = ws1.addRow([s.id, new Date(s.submittedAt).toLocaleString('zh-TW', { hour12: false }), s.sessionLabel, `${s.ratingOverall} ⭐`, `${s.ratingStaff} ⭐`, s.dogCondition, `${s.npsScore}分`, s.feedback || '—'])
      r.eachCell((c) => { c.font = { name: 'Microsoft JhengHei', size: 9.5 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } } })
    })

    // ── Sheet 2: 📋 滿意度問卷全量明細 ──
    const ws2 = wb.addWorksheet('📋 滿意度問卷全量明細')
    ws2.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    ws2.columns = [{ width: 10 }, { width: 22 }, { width: 18 }, { width: 20 }, { width: 22 }, { width: 18 }, { width: 18 }, { width: 45 }]
    ws2.mergeCells('A1:H1'); ws2.getCell('A1').value = '📋 Doggie 滿意度問卷全量數據與動態篩選表'; ws2.getCell('A1').font = { name: 'Microsoft JhengHei', bold: true, size: 12, color: { argb: 'FF0F5132' } }; ws2.getRow(1).height = 28
    ws2.mergeCells('A2:H2'); ws2.getCell('A2').value = '提示：點選第 4 列標題右側箭頭可進行動態條件篩選'; ws2.getCell('A2').font = { name: 'Microsoft JhengHei', size: 9, color: { argb: 'FF6C757D' } }; ws2.getRow(2).height = 18

    const hRow2 = ws2.getRow(4); hRow2.height = 26
    ;['ID', '提交時間', '接送場次', '整體滿意度', '人員與司機滿意度', '狗狗狀況', 'NPS 推薦分數', '回饋建議'].forEach((h, i) => {
      const c = hRow2.getCell(i + 1); c.value = h; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F5132' } }
      c.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }; c.alignment = { vertical: 'middle', horizontal: 'center' }; c.border = { bottom: { style: 'medium', color: { argb: 'FF198754' } } }
    })
    ws2.autoFilter = 'A4:H4'

    surveys.forEach((s, idx) => {
      const time = new Date(s.submittedAt).toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-')
      const condText = s.dogCondition === 'GREAT' ? '活蹦亂跳 🐶' : s.dogCondition === 'NORMAL' ? '健康正常 🐾' : '略顯疲倦 💤'
      const row = ws2.addRow([s.id, time, s.sessionLabel, s.ratingOverall, s.ratingStaff, condText, s.npsScore, s.feedback || '—'])
      row.height = 24
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Microsoft JhengHei', size: 9.5 }; cell.alignment = { vertical: 'middle', horizontal: colNum === 8 ? 'left' : 'center' }
        cell.border = { top: { style: 'thin', color: { argb: 'FFE0E0E0' } }, bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }, left: { style: 'thin', color: { argb: 'FFE0E0E0' } }, right: { style: 'thin', color: { argb: 'FFE0E0E0' } } }
        if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }
        if (colNum === 3) cell.font = { name: 'Consolas', bold: true, color: { argb: 'FF0F5132' }, size: 9.5 }
        if (colNum === 4 || colNum === 5) cell.value = `${cell.value} (${'⭐'.repeat(Number(cell.value))})`
        if (colNum === 6) {
          const fg = s.dogCondition === 'GREAT' ? 'FFD1E7DD' : s.dogCondition === 'NORMAL' ? 'FFCFF4FC' : 'FFF8D7DA', fc = s.dogCondition === 'GREAT' ? 'FF0F5132' : s.dogCondition === 'NORMAL' ? 'FF055160' : 'FF842029'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }; cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fc }, size: 9.5 }
        }
        if (colNum === 7) {
          const fg = s.npsScore >= 9 ? 'FFD1E7DD' : s.npsScore >= 7 ? 'FFF8F9FA' : 'FFF8D7DA', fc = s.npsScore >= 9 ? 'FF0F5132' : s.npsScore >= 7 ? 'FF495057' : 'FF842029'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }; cell.font = { name: 'Microsoft JhengHei', bold: true, color: { argb: fc }, size: 9.5 }; cell.value = `${cell.value} 分`
        }
      })
    })

    const lastRow = 4 + surveys.length
    const sumRow = ws2.addRow(['動態平均統計', '—', '—', { formula: `AVERAGE(D5:D${lastRow})`, result: stats.avgOverall }, { formula: `AVERAGE(E5:E${lastRow})`, result: stats.avgStaff }, { formula: `COUNTA(F5:F${lastRow})`, result: surveys.length }, { formula: `AVERAGE(G5:G${lastRow})`, result: stats.npsScore }, '註：點選與編輯 Excel 資料時，此列公式將自動連動重新計算'])
    sumRow.height = 26
    sumRow.eachCell((cell, colNum) => {
      cell.font = { name: 'Microsoft JhengHei', bold: true, size: 10, color: { argb: 'FF0F5132' } }; cell.alignment = { vertical: 'middle', horizontal: colNum === 8 ? 'left' : 'center' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }; cell.border = { top: { style: 'medium', color: { argb: 'FF0F5132' } }, bottom: { style: 'double', color: { argb: 'FF0F5132' } } }
    })

    const buffer = await wb.xlsx.writeBuffer()
    const dateStr = new Date().toISOString().slice(0, 10)
    return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename=doggie_executive_report_${dateStr}.xlsx` } })
  } catch { return NextResponse.json({ success: false, error: { message: '資料匯出失敗' } }, { status: 500 }) }
}
