import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env.test')
});

// Set test environment
process.env.NODE_ENV = 'test';

// Extend timeout for slower CI environments
jest.setTimeout(30000);

let mongod: MongoMemoryServer;

// Connect to in-memory database before running tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear all data after each test
afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Close database connection after all tests
afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

// Add a simple test to satisfy Jest's requirement
describe('Test Environment', () => {
  it('should connect to the test database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});