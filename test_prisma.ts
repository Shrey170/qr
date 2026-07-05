import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    await prisma.staffUser.findUnique({ where: { email: 'test' } })
  } catch (e) {
    console.log(e.message)
  }
}
main()
