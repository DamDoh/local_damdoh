import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Database Connection', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should connect to the database', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should be able to save and retrieve data', async () => {
    // Create a test collection
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    
    // Clear any existing data
    await TestModel.deleteMany({});

    // Create a test document
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();

    // Retrieve the document
    const found = await TestModel.findOne({ name: 'test' });
    expect(found?.name).toBe('test');
  });
});