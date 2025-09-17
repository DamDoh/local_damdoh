import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const setupTestDB = async () => {
  try {
    // Ensure there are no existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri, {
      autoCreate: true,
      autoIndex: true
    });
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

export const teardownTestDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};