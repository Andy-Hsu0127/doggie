import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('verifyUser', () => {
    it('should return null if user does not exist', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)
      const result = await AuthService.verifyUser({
        email: 'x@x.com',
        password: '123',
      })
      expect(result).toBeNull()
    })

    it('should return null if password does not match', async () => {
      const mockUser = {
        id: 1,
        email: 'x@x.com',
        password: 'hashed_password',
        role: 'SUPER_ADMIN' as const,
        name: 'Admin',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt: new Date(),
      }
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)

      const compareSpy = vi
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(false as never)

      const result = await AuthService.verifyUser({
        email: 'x@x.com',
        password: 'wrong_password',
      })
      expect(result).toBeNull()
      expect(compareSpy).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password'
      )
    })

    it('should return user without password if credentials match', async () => {
      const mockUser = {
        id: 1,
        email: 'x@x.com',
        password: 'hashed_password',
        role: 'SUPER_ADMIN' as const,
        name: 'Admin',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt: new Date(),
      }
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)

      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)

      const result = await AuthService.verifyUser({
        email: 'x@x.com',
        password: 'correct_password',
      })
      expect(result).toEqual({
        id: 1,
        email: 'x@x.com',
        role: 'SUPER_ADMIN',
        name: 'Admin',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt: mockUser.createdAt,
      })
    })
  })
})
