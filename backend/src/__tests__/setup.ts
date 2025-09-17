import path from 'path';
import dotenv from 'dotenv';
import { setupTestDB, teardownTestDB, clearDatabase } from './utils/db';

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env.test')
});

// Extend timeout for slower CI environments
jest.setTimeout(30000);

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDB();
});

// Clean up database after each test
afterEach(async () => {
  await clearDatabase();
});

// Cleanup and close database connection after all tests
afterAll(async () => {
  await teardownTestDB();
});
});

afterAll(async () => {
  await mongoose.connection.close();
  await global.__MONGOD__.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

let mongod: MongoMemoryServer;

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout
jest.setTimeout(30000);

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