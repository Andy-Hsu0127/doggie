import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL || 'file:./doggie.db'
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@doggie.com'
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('Seed: Super admin already exists.')
    return
  }

  const hashedPassword = await bcrypt.hash('admin123', 12)
  const user = await prisma.user.create({
    data: {
      email,
      name: '超級管理員',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`Seed: Super admin created successfully: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
