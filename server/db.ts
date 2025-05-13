import mongoose from 'mongoose';
import dotenv from "dotenv"
import prisma from './prisma';

dotenv.config()

const mongo_uri = process.env.MONGODB_URI as string

if (!mongo_uri) {
  throw new Error("MONGODB_URI must be set. Did you forget to provision a database?");
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDB() {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Connect Mongoose with SSL options
      await mongoose.connect(mongo_uri, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
        w: 'majority'
      });
      console.log('Connected to MongoDB via Mongoose');

      // Test Prisma connection
      await prisma.$connect();
      console.log('Connected to MongoDB via Prisma');
      return; // Successfully connected
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('IP whitelist')) {
          console.error('\nIP Whitelist Error:');
          console.error('Your current IP address is not whitelisted in MongoDB Atlas.');
          console.error('Please add your IP to the whitelist in MongoDB Atlas:');
          console.error('1. Go to MongoDB Atlas dashboard');
          console.error('2. Click "Network Access" in the left sidebar');
          console.error('3. Click "Add IP Address"');
          console.error('4. Add your current IP or 0.0.0.0/0 for development\n');
        }
      }

      if (retries === MAX_RETRIES) {
        console.error('Max retries reached. Could not connect to database.');
        throw error;
      }

      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      await wait(RETRY_DELAY);
    }
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
