import request from "supertest";
import mongoose from "mongoose";

import app from "../../app";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("mockingoose");

jest.mock("../../helpers/logger");

describe("Hello Module", () => {
  afterAll(() => {
    mongoose.disconnect();
  });

  describe("GET /", () => {
    it("should return a hello message", async () => {
      await request(app)
        .get("/")
        .expect(200, { success: true, data: { msg: "Hello world" } });
    });
  });
});
