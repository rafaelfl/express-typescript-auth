import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";

import redisClient from "../../redisDatabase";

import { config } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require("mockingoose");

jest.mock("../../helpers/logger");

const USER_ID = "507f191e810c19729de860ea";
const REFRESH_TOKEN = "refresh_507f191e810c19729de860ea";
const ACCESS_TOKEN = "access_507f191e810c19729de860ea";

const NULL_RESULT_ACCESS_TOKEN = "null_access_token";

const DECODING_TOKEN_ERROR_MESSAGE = "Error decoding access token";

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn((token, _secretOrPublicKey, _options, callback) => {
    if (token === ACCESS_TOKEN) {
      callback(null, {
        id: USER_ID,
        role: "user",
        iat: 1688925811,
        exp: 1688926411,
      });
    }

    // jwt payload null
    if (token === NULL_RESULT_ACCESS_TOKEN) {
      callback(null, null);
    }

    callback(new Error(DECODING_TOKEN_ERROR_MESSAGE));
  }),
}));

const spyRedisSet = jest.spyOn(redisClient, "set");
const spyRedisExpireAt = jest.spyOn(redisClient, "expireAt");
const spyRedisGet = jest.spyOn(redisClient, "get");
const spyJwtVerify = jest.spyOn(jwt, "verify");

describe("Auth Module", () => {
  beforeAll(() => {
    config.accessTokenPrivateKey = "accesskey";
    config.refreshTokenPrivateKey = "refreshkey";
  });

  afterEach(() => {
    mockingoose.resetAll();
    spyRedisSet.mockClear();
    spyRedisExpireAt.mockClear();
    spyRedisGet.mockClear();
    spyJwtVerify.mockClear();
  });

  describe("GET /api/v1/protected", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app)
        .get("/api/v1/protected")
        .expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .get("/api/v1/protected")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .get("/api/v1/protected")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should access a protected route if a valid token is sent", async () => {
      const IAT = 1688925811;
      const EXP = 1688926411;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: USER_ID,
          role: "user",
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .get("/api/v1/protected")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, { success: true, data: { msg: "Accessing a protected route!" } });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });
  });

  describe("GET /api/v1/adminProtected", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app)
        .get("/api/v1/adminProtected")
        .expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(new Error(DECODING_TOKEN_ERROR_MESSAGE));
      });

      await request(app)
        .get("/api/v1/adminProtected")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .get("/api/v1/adminProtected")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: "Error decoding access token" });
    });

    it("should access an admin protected route if a valid token is sent", async () => {
      const IAT = 1688925811;
      const EXP = 1688926411;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: USER_ID,
          role: "admin",
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .get("/api/v1/adminProtected")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, { success: true, data: { msg: "Accessing an admin protected route!" } });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an access denied error when accessing an admin protected route without the admin role", async () => {
      const IAT = 1688925811;
      const EXP = 1688926411;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: USER_ID,
          role: "user",
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .get("/api/v1/adminProtected")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(403, { success: false, message: "Access denied! ❌" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });
  });
});
