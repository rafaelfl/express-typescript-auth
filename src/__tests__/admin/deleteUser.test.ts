import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";

import redisClient from "../../redisDatabase";

import userTokenModel from "../../database/model/userTokenModel";

import { config } from "../../config";
import userModel from "../../database/model/userModel";

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

const USER_OBJ = {
  id: USER_ID,
  name: "Test User1",
  email: "test@test.com",
  role: "user",
  photo:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrFe_1bqd-KCl2sbFivhvyt4aZ65AyC8habg&usqp=CAU",
  aboutMe: "It's me, Mario!",
};

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

describe("Admin Module", () => {
  beforeAll(() => {
    config.accessTokenPrivateKey = "accesskey";
    config.refreshTokenPrivateKey = "refreshkey";
  });

  beforeEach(() => {
    // mock user model findOne
    mockingoose(userModel).toReturn(
      {
        _id: USER_ID,
        ...USER_OBJ,
        __v: 0,
      },
      "findOne",
    );

    // mock usertoken model findOne
    mockingoose(userTokenModel).toReturn(
      {
        _id: USERTOKEN_ID,
        userId: USER_ID,
        token: REFRESH_TOKEN,
        createdAt: new Date(),
      },
      "findOne",
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    redisClient.get.mockImplementation(() => false);
  });

  afterEach(() => {
    mockingoose.resetAll();
    spyRedisSet.mockClear();
    spyRedisExpireAt.mockClear();
    spyRedisGet.mockClear();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    redisClient.isReady = true;
  });

  describe("DELETE /api/v1/admin/user/:userId", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return an access denied error when using a user profile access token", async () => {
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
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(403, { success: false, message: "Access denied! ❌" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a bad request error when no data is deleted from the database", async () => {
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

      mockingoose(userModel).toReturn(null, "findOneAndDelete");

      mockingoose(userTokenModel).toReturn({}, "deleteMany");

      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(400, { success: false, message: "Unable to delete user data" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a bad request message when no data is deleted from the database", async () => {
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

      mockingoose(userModel).toReturn(null, "findOneAndDelete");

      mockingoose(userTokenModel).toReturn({}, "deleteMany");

      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(400, { success: false, message: "Unable to delete user data" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an authorization error message in case an error happens when accessing the database", async () => {
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

      mockingoose(userModel).toReturn(
        new Error("Error accessing the database"),
        "findOneAndDelete",
      );

      mockingoose(userTokenModel).toReturn({}, "deleteMany");

      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .send({
          name: "Testing User",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
          role: "user",
        })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(500, { success: false, message: "Error accessing the database" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a conflict error message in case an user tries to delete its own user", async () => {
      const userId = "64a4cc19309c4295cb58f998";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: userId,
          role: "admin",
          iat: IAT,
          exp: EXP,
        });
      });

      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          ...USER_OBJ,
          __v: 0,
        },
        "findOneAndDelete",
      );

      await request(app)
        .delete(`/api/v1/admin/user/${userId}`)
        .send({
          name: "Testing User",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
          role: "user",
        })
        .set({ Authorization: `Bearer ${userId}`, Accept: "application/json" })
        .expect(409, { success: false, message: "You cannot delete your own user" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${userId}`);
    });

    it("should return a successful delete response if the user is deleted from the database", async () => {
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

      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          ...USER_OBJ,
          __v: 0,
        },
        "findOneAndDelete",
      );

      await request(app)
        .delete("/api/v1/admin/user/64a4cc19309c4295cb58f998")
        .send({
          name: "Testing User",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
          role: "user",
        })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(200, {
          success: true,
          data: {
            id: "507f191e810c19729de860ea",
            name: "Test User1",
            email: "test@test.com",
            role: "user",
            photo:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrFe_1bqd-KCl2sbFivhvyt4aZ65AyC8habg&usqp=CAU",
            aboutMe: "It's me, Mario!",
          },
        });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });
  });
});
