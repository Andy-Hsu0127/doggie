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

  static async getSatisfactionStats() {
    const surveys = await db.surveySatisfaction.findMany()
    const totalCount = surveys.length

    if (totalCount === 0) {
      return { totalCount: 0, avgOverall: 0, avgStaff: 0, npsScore: 0 }
    }

    const avgOverall =
      surveys.reduce((acc, s) => acc + s.ratingOverall, 0) / totalCount
    const avgStaff =
      surveys.reduce((acc, s) => acc + s.ratingStaff, 0) / totalCount

    const promoters = surveys.filter((s) => s.npsScore >= 9).length
    const detractors = surveys.filter((s) => s.npsScore <= 6).length
    const npsScore = Math.round(((promoters - detractors) / totalCount) * 100)

    return {
      totalCount,
      avgOverall: Number(avgOverall.toFixed(1)),
      avgStaff: Number(avgStaff.toFixed(1)),
      npsScore,
    }
  }
}
