import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";

import redisClient from "../../redisDatabase";

import userTokenModel from "../../database/model/userTokenModel";

import { config } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require("mockingoose");

jest.mock("../../helpers/logger");

const USER_ID = "507f191e810c19729de860ea";
const REFRESH_TOKEN = "refresh_507f191e810c19729de860ea";
const ACCESS_TOKEN = "access_507f191e810c19729de860ea";

const NULL_RESULT_ACCESS_TOKEN = "null_access_token";

const USERTOKEN_ID = "8ca4af76384306089c1c30ba";

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

describe("Auth Module", () => {
  beforeAll(() => {
    config.accessTokenPrivateKey = "accesskey";
    config.refreshTokenPrivateKey = "refreshkey";
  });

  afterEach(() => {
    mockingoose.resetAll();
    spyRedisSet.mockClear();
    spyRedisExpireAt.mockClear();
  });

  describe("POST /logout", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app).post("/logout").expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .post("/logout")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .post("/logout")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return successful redirection in case no error occurs on logout", async () => {
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

      mockingoose(userTokenModel).toReturn(
        {
          _id: USERTOKEN_ID,
          userId: USER_ID,
          token: REFRESH_TOKEN,
          createdAt: new Date(),
        },
        "findOneAndDelete",
      );

      await request(app)
        .post("/logout")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .expect(303)
        .expect("Location", "/");

      expect(redisClient.set).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`, ACCESS_TOKEN);
      expect(redisClient.expireAt).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`, EXP);
    });

    it("should return successful redirection with the default 10 seconds access token config in case the exp field is not available and no error occurs on logout", async () => {
      config.accessTokenExpiration = "10s";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: USER_ID,
          role: "user",
          iat: 1688925811,
        });
      });

      mockingoose(userTokenModel).toReturn(
        {
          _id: USERTOKEN_ID,
          userId: USER_ID,
          token: REFRESH_TOKEN,
          createdAt: new Date(),
        },
        "findOneAndDelete",
      );

      await request(app)
        .post("/logout")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .expect(303)
        .expect("Location", "/");

      expect(redisClient.set).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`, ACCESS_TOKEN);
      expect(redisClient.expireAt).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`, 10000); // 10s
    });

    it("should return an error message in case an error occurs accessing the database", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: USER_ID,
          role: "user",
          iat: 1688925811,
          exp: 1688926411,
        });
      });

      mockingoose(userTokenModel).toReturn(
        new Error("Error accessing database"),
        "findOneAndDelete",
      );

      await request(app)
        .post("/logout")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .expect(403, { success: false, message: "Error accessing database" });
    });
  });
});
