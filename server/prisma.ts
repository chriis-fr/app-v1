import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use the root Prisma client that has all the models
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export default prisma 