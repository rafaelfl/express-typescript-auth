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

const IAT = 1688925811;
const EXP = 1688926411;

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

  sign: jest.fn((_payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret) => {
    if (secretOrPrivateKey === "accesskey") {
      return `refreshed_${ACCESS_TOKEN}`;
    }

    if (secretOrPrivateKey === "refreshkey") {
      return `refreshed_${REFRESH_TOKEN}`;
    }

    return "default_token";
  }),
}));

const spyRedisSet = jest.spyOn(redisClient, "set");
const spyRedisExpireAt = jest.spyOn(redisClient, "expireAt");

describe("Auth Module", () => {
  beforeAll(() => {
    config.accessTokenPrivateKey = "accesskey";
    config.refreshTokenPrivateKey = "refreshkey";
    config.accessTokenExpiration = "10m";
    config.refreshTokenExpiration = "24h";
  });

  afterEach(() => {
    mockingoose.resetAll();
    spyRedisSet.mockClear();
    spyRedisExpireAt.mockClear();
  });

  describe("POST /refresh", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app).post("/refresh").expect(403, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .post("/refresh")
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .expect(403, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .post("/refresh")
        .set("Cookie", [`refreshToken=${NULL_RESULT_ACCESS_TOKEN}`])
        .expect(403, { success: false, message: "Invalid token" });
    });

    it("should return an error message in case an invalid jwt was sent", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: null,
          role: null,
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .post("/refresh")
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(403, {
          success: false,
          message: "It was not possible to retrieve user data",
        });
    });

    it("should return an error message in case an error occurs when accessing the database", async () => {
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

      mockingoose(userTokenModel).toReturn(null, "findOne");

      mockingoose(userTokenModel).toReturn(
        {
          acknowledged: true,
          deletedCount: 1,
        },
        "deleteMany",
      );

      await request(app)
        .post("/refresh")
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(403, {
          success: false,
          message: "Refresh token unavailable. You need to perform the sign in again.",
        });
    });

    it("should return new refresh and access tokens on successful refreshing", async () => {
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

      mockingoose(userTokenModel).toReturn(
        {
          _id: USERTOKEN_ID,
          userId: USER_ID,
          token: REFRESH_TOKEN,
          createdAt: new Date(),
        },
        "findOne",
      );

      await request(app)
        .post("/refresh")
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, {
          success: true,
          data: { token: `refreshed_${ACCESS_TOKEN}` },
        })
        .expect(
          "set-cookie",
          new RegExp(
            `refreshToken=refreshed_${REFRESH_TOKEN}; Max-Age=86400; Domain=localhost; Path=/`,
            "gi",
          ),
        )
        .expect("set-cookie", /HttpOnly; Secure; SameSite=None/);
    });
  });
});
