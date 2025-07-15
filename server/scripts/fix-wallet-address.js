import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function fixWalletAddress() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const organizationsCollection = db.collection('organizations');

    // Find organizations with empty walletAddress
    const organizationsWithEmptyWallet = await organizationsCollection.find({
      walletAddress: ""
    }).toArray();

    console.log(`Found ${organizationsWithEmptyWallet.length} organizations with empty walletAddress`);

    if (organizationsWithEmptyWallet.length > 0) {
      console.log('Updating organizations with empty walletAddress to null...');
      
      const result = await organizationsCollection.updateMany(
        { walletAddress: "" },
        { $unset: { walletAddress: "" } }
      );

      console.log(`✅ Updated ${result.modifiedCount} organizations`);
    }

    // Verify the changes
    const remainingEmptyWallets = await organizationsCollection.find({
      walletAddress: ""
    }).toArray();

    console.log(`Remaining organizations with empty walletAddress: ${remainingEmptyWallets.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixWalletAddress(); 