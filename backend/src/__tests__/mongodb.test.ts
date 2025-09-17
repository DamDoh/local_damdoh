import { setupTestDB, teardownTestDB } from './utils/db';
import mongoose from 'mongoose';

describe('MongoDB Connection', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('should successfully connect to MongoDB', async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it('should be able to perform basic operations', async () => {
    // Create a test model
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    }));

    // Create a document
    const doc = await TestModel.create({ name: 'test' });
    expect(doc.name).toBe('test');

    // Retrieve the document
    const found = await TestModel.findById(doc._id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe('test');

    // Update the document
    await TestModel.updateOne({ _id: doc._id }, { name: 'updated' });
    const updated = await TestModel.findById(doc._id);
    expect(updated?.name).toBe('updated');

    // Delete the document
    await TestModel.deleteOne({ _id: doc._id });
    const deleted = await TestModel.findById(doc._id);
    expect(deleted).toBeNull();
  });
});