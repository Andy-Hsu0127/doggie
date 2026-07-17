import { db } from '@/lib/db'
import { LoginInput } from '@/types/auth.types'
import bcrypt from 'bcryptjs'

export class AuthService {
  static async verifyUser(input: LoginInput) {
    const { email, password } = input

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return null

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async createUser(email: string, name: string, plainPassword: string) {
    const hashedPassword = await bcrypt.hash(plainPassword, 12)
    return db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    })
  }
}
