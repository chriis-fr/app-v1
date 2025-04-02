import { connectDB } from '../db';
import { UserModel } from '../models/user.model';

async function updateUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const users = await UserModel.find({});
    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      // Only update if the new fields don't exist
      if (!user.wallet) {
        user.wallet = {
          balance: 0,
          currency: 'USD',
          bankAccounts: []
        };
      }
      if (!user.legalDetails) {
        user.legalDetails = {
          taxId: '',
          businessType: '',
          registrationNumber: '',
          incorporationDate: ''
        };
      }
      if (!user.address) {
        user.address = {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          isBillingAddress: false,
          isShippingAddress: false
        };
      }

      await user.save();
      console.log(`Updated user: ${user.username}`);
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

updateUsers(); 