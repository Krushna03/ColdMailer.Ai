import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set required env BEFORE any app/model/config module is imported by a test file.
// (dotenv in the app does not override already-set process.env values.)
process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
process.env.ACCESS_TOKEN_EXPIRY = "1d";
process.env.REFRESH_TOKEN_EXPIRY = "10d";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GEMINIAPIKEY = "test-gemini-key";
process.env.CLIENT_URL = "http://localhost:5173";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
