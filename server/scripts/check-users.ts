import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Connected to MongoDB via Prisma');

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database:`);
    
    // Print user details
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });

    // Get all module access records
    const moduleAccess = await prisma.moduleAccess.findMany();
    console.log(`\nFound ${moduleAccess.length} module access records:`);
    
    // Print module access details
    moduleAccess.forEach(access => {
      console.log(`- User ${access.userId} has ${access.access} access to ${access.module}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 