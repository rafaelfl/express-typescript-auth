import mongoose from "mongoose";
import dotenv from "dotenv";

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
require("mockingoose");

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

jest.mock("redis", () => ({
  ...jest.requireActual("redis"),
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn((_event, callback) => callback()),
    ping: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    expireAt: jest.fn(),
    isReady: true,
  })),
}));

// Establish API mocking before all tests.
beforeAll(() => {
  dotenv.config({ path: ".env.test" });
});

afterAll(() => {
  mongoose.disconnect();
});
