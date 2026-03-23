process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

/**
 * Connect to the in-memory database before any tests run.
 */
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Close any existing connection if it exists
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

/**
 * Clean up the database after all tests are finished.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

/**
 * Clear all data from collections after each test case.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
