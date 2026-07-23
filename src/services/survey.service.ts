import { db } from '@/lib/db'
import { SurveySatisfactionInput } from '@/types/survey.types'

export class SurveyService {
  static async createSatisfaction(input: SurveySatisfactionInput) {
    let base = input.sessionLabel.replace(/-/g, '')
    if (!/[A-Z]/.test(base)) base = `${base}-A`
    const count = await db.surveySatisfaction.count({
      where: { sessionLabel: { startsWith: base } },
    })
    const finalLabel = `${base}${String(count + 1).padStart(2, '0')}`
    return db.surveySatisfaction.create({
      data: {
        sessionLabel: finalLabel,
        ratingOverall: input.ratingOverall,
        ratingStaff: input.ratingStaff,
        dogCondition: input.dogCondition,
        npsScore: input.npsScore,
        feedback: input.feedback,
        consented: input.hasConsented,
      },
    })
  }

  static async getSatisfactionResponses() {
    return db.surveySatisfaction.findMany({ orderBy: { submittedAt: 'desc' } })
  }

  static async getSatisfactionStats() {
    const [agg, conditionGroups, allForCalc] = await Promise.all([
      db.surveySatisfaction.aggregate({
        _count: { id: true },
        _avg: { ratingOverall: true, ratingStaff: true },
      }),
      db.surveySatisfaction.groupBy({
        by: ['dogCondition'],
        _count: { id: true },
      }),
      db.surveySatisfaction.findMany({
        select: { npsScore: true, submittedAt: true },
      }),
    ])

    const totalCount = agg._count.id
    if (totalCount === 0) {
      return {
        totalCount: 0,
        avgOverall: 0,
        avgStaff: 0,
        npsScore: 0,
        dogConditions: { GREAT: 0, NORMAL: 0, CONCERN: 0 },
        weeklyTrends: [],
      }
    }

    const avgOverall = Number((agg._avg.ratingOverall ?? 0).toFixed(1))
    const avgStaff = Number((agg._avg.ratingStaff ?? 0).toFixed(1))
    const promoters = allForCalc.filter((s) => s.npsScore >= 9).length
    const detractors = allForCalc.filter((s) => s.npsScore <= 6).length
    const npsScore = Math.round(((promoters - detractors) / totalCount) * 100)

    const dogConditions = {
      GREAT: conditionGroups.find((g) => g.dogCondition === 'GREAT')?._count.id ?? 0,
      NORMAL: conditionGroups.find((g) => g.dogCondition === 'NORMAL')?._count.id ?? 0,
      CONCERN: conditionGroups.find((g) => g.dogCondition === 'CONCERN')?._count.id ?? 0,
    }

    const weeklyGroups: Record<string, typeof allForCalc> = {}
    allForCalc.forEach((s) => {
      const week = SurveyService.getWeekLabel(s.submittedAt)
      if (!weeklyGroups[week]) weeklyGroups[week] = []
      weeklyGroups[week].push(s)
    })

    const weeklyTrends = Object.keys(weeklyGroups)
      .sort()
      .slice(-8)
      .map((week) => {
        const list = weeklyGroups[week]
        const len = list.length
        const p = list.filter((s) => s.npsScore >= 9).length
        const d = list.filter((s) => s.npsScore <= 6).length
        return { week, nps: Math.round(((p - d) / len) * 100), avgRating: 0 }
      })

    return { totalCount, avgOverall, avgStaff, npsScore, dogConditions, weeklyTrends }
  }

  private static getWeekLabel(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const year = d.getUTCFullYear()
    const yearStart = new Date(Date.UTC(year, 0, 1))
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
    return `${year}-W${String(weekNo).padStart(2, '0')}`
  }
}
