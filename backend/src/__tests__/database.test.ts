import mongoose from 'mongoose';

describe('Database Connection', () => {
  it('should connect to the test database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});