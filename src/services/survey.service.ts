import { db } from '@/lib/db'
import { SurveySatisfactionInput } from '@/types/survey.types'

export class SurveyService {
  static async createSatisfaction(input: SurveySatisfactionInput) {
    const {
      sessionLabel,
      ratingOverall,
      ratingStaff,
      dogCondition,
      npsScore,
      feedback,
      hasConsented,
    } = input

    return db.surveySatisfaction.create({
      data: {
        sessionLabel,
        ratingOverall,
        ratingStaff,
        dogCondition,
        npsScore,
        feedback,
        consented: hasConsented,
      },
    })
  }

  static async getSatisfactionResponses() {
    return db.surveySatisfaction.findMany({
      orderBy: { submittedAt: 'desc' },
    })
  }

  static async getSatisfactionStats() {
    const surveys = await db.surveySatisfaction.findMany()
    const totalCount = surveys.length

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

    const avgOverall = Number(
      (
        surveys.reduce((acc, s) => acc + s.ratingOverall, 0) / totalCount
      ).toFixed(1)
    )
    const avgStaff = Number(
      (
        surveys.reduce((acc, s) => acc + s.ratingStaff, 0) / totalCount
      ).toFixed(1)
    )
    const promoters = surveys.filter((s) => s.npsScore >= 9).length
    const detractors = surveys.filter((s) => s.npsScore <= 6).length
    const npsScore = Math.round(((promoters - detractors) / totalCount) * 100)

    const dogConditions = {
      GREAT: surveys.filter((s) => s.dogCondition === 'GREAT').length,
      NORMAL: surveys.filter((s) => s.dogCondition === 'NORMAL').length,
      CONCERN: surveys.filter((s) => s.dogCondition === 'CONCERN').length,
    }

    const weeklyGroups: Record<string, typeof surveys> = {}
    surveys.forEach((s) => {
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
        const nps = Math.round(((p - d) / len) * 100)
        const avgRating = Number(
          (list.reduce((acc, s) => acc + s.ratingOverall, 0) / len).toFixed(1)
        )
        return { week, nps, avgRating }
      })

    return {
      totalCount,
      avgOverall,
      avgStaff,
      npsScore,
      dogConditions,
      weeklyTrends,
    }
  }

  private static getWeekLabel(date: Date): string {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    )
    return `W${weekNo}`
  }
}
