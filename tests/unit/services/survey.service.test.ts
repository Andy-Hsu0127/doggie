import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SurveyService } from '@/services/survey.service'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    surveySatisfaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('SurveyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSatisfaction', () => {
    it('should call db.surveySatisfaction.create with mapped data', async () => {
      const input = {
        sessionLabel: '2026-07-17',
        ratingOverall: 5,
        ratingStaff: 5,
        dogCondition: 'GREAT' as const,
        npsScore: 10,
        feedback: 'Good',
        hasConsented: true as const,
      }

      await SurveyService.createSatisfaction(input)

      expect(db.surveySatisfaction.create).toHaveBeenCalledWith({
        data: {
          sessionLabel: '2026-07-17',
          ratingOverall: 5,
          ratingStaff: 5,
          dogCondition: 'GREAT',
          npsScore: 10,
          feedback: 'Good',
          consented: true,
        },
      })
    })
  })

  describe('getSatisfactionStats', () => {
    it('should return default stats when no surveys exist', async () => {
      vi.mocked(db.surveySatisfaction.findMany).mockResolvedValue([])

      const stats = await SurveyService.getSatisfactionStats()
      expect(stats).toEqual({
        totalCount: 0,
        avgOverall: 0,
        avgStaff: 0,
        npsScore: 0,
        dogConditions: { GREAT: 0, NORMAL: 0, CONCERN: 0 },
        weeklyTrends: [],
      })
    })

    it('should calculate averages and NPS score correctly', async () => {
      const mockSurveys = [
        {
          id: 1,
          ratingOverall: 5,
          ratingStaff: 4,
          npsScore: 10,
          dogCondition: 'GREAT',
          consented: true,
          sessionLabel: '1',
          clientId: null,
          submittedAt: new Date(),
        },
        {
          id: 2,
          ratingOverall: 4,
          ratingStaff: 4,
          npsScore: 8,
          dogCondition: 'NORMAL',
          consented: true,
          sessionLabel: '1',
          clientId: null,
          submittedAt: new Date(),
        },
        {
          id: 3,
          ratingOverall: 3,
          ratingStaff: 2,
          npsScore: 5,
          dogCondition: 'CONCERN',
          consented: true,
          sessionLabel: '1',
          clientId: null,
          submittedAt: new Date(),
        },
      ]
      vi.mocked(db.surveySatisfaction.findMany).mockResolvedValue(mockSurveys)

      const stats = await SurveyService.getSatisfactionStats()

      expect(stats.totalCount).toBe(3)
      expect(stats.avgOverall).toBe(4.0)
      expect(stats.avgStaff).toBe(3.3)
      expect(stats.npsScore).toBe(0)
    })
  })
})
