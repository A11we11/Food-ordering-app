// jest.setup.js
import dotenv from "dotenv";

import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "6.0.6" }, // stable version for most OS
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

// Load environment variables for testing
dotenv.config({ path: ".env.test" });

// Set default environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/test-db";
process.env.NODE_ENV = "test";

// Global test setup
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
});

// Suppress console.log during tests unless needed
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  // Uncomment these lines if you want to suppress console output during tests
  // console.log = jest.fn();
  // console.error = jest.fn();
  // console.warn = jest.fn();
});

afterEach(() => {
  // Restore original console methods
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;

  // Clear all mocks after each test
  jest.clearAllMocks();
});
