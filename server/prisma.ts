import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create a new PrismaClient instance with logging enabled
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: "mongodb+srv://caspianodhis:caspianodhis@chains.y7dhi.mongodb.net/chains?retryWrites=true&w=majority&appName=chains"
    }
  }
})

export default prisma 