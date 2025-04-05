import { connectDB } from '../db';
import { User } from '../mongodb/models';
import { availableModules } from '@shared/schema';

async function migrateModuleAccess() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Update the User schema to include moduleAccess
    const userSchema = User.schema;
    if (!userSchema.path('moduleAccess')) {
      userSchema.add({
        moduleAccess: {
          type: [String],
          enum: availableModules,
          default: []
        }
      });
      console.log('Added moduleAccess field to User schema');
    }

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Update each user
    for (const user of users) {
      // Initialize moduleAccess if it doesn't exist
      if (!user.moduleAccess) {
        user.moduleAccess = [];
        await user.save();
        console.log(`Updated user ${user.username} with empty moduleAccess array`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateModuleAccess(); 