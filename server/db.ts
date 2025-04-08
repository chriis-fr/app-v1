import mongoose from 'mongoose';
import dotenv from "dotenv"
import prisma from './prisma';

dotenv.config()

const mongo_uri = process.env.MONGODB_URI as string

if (!mongo_uri) {
  throw new Error("MONGODB_URI must be set. Did you forget to provision a database?");
}

export async function connectDB() {
  try {
    // Connect Mongoose
    await mongoose.connect(mongo_uri);
    console.log('Connected to MongoDB via Mongoose');

    // Test Prisma connection
    await prisma.$connect();
    console.log('Connected to MongoDB via Prisma');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Cleanup function for graceful shutdown
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    await prisma.$disconnect();
    console.log('Disconnected from databases');
  } catch (error) {
    console.error('Error disconnecting from databases:', error);
    throw error;
  }
}

// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";
// import dotenv from "dotenv";

// dotenv.config()

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });
