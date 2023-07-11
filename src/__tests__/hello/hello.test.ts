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

    it("should return a 404 error in case the path doesn't exist", async () => {
      await request(app).get("/dontexist").expect(404, {
        success: false,
        message: "Not Found. Try using /api/v1 to access the api resource",
      });
    });
  });
});
