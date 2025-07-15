import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function removeWalletIndex() {
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

    // List all indexes to see what exists
    console.log('Current indexes on organizations collection:');
    const indexes = await organizationsCollection.indexes();
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if the problematic index exists
    const walletIndex = indexes.find(index => 
      index.name === 'organizations_walletAddress_key' || 
      Object.keys(index.key).includes('walletAddress')
    );

    if (walletIndex) {
      console.log(`\nFound wallet index: ${walletIndex.name}`);
      console.log('Removing unique index on walletAddress...');
      
      await organizationsCollection.dropIndex(walletIndex.name);
      console.log('✅ Successfully removed wallet index');
    } else {
      console.log('\nNo wallet index found');
    }

    // Verify the index was removed
    console.log('\nUpdated indexes:');
    const updatedIndexes = await organizationsCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

removeWalletIndex(); 