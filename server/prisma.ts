import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create a new PrismaClient instance with logging enabled
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export default prisma 