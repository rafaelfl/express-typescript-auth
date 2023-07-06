import dotenv from "dotenv";

// const fetchMock = require('jest-fetch-mock');
// fetchMock.enableMocks();

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Establish API mocking before all tests.
beforeAll(() => {
  dotenv.config({ path: ".env.test" });
});
