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

describe("Auth Module", () => {
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

  describe("GET /profile", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app).get("/profile").expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .get("/profile")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .get("/profile")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a successful profile data response", async () => {
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
        .get("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, {
          success: true,
          data: USER_OBJ,
        });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an authorization error in case the userId field from jwtPayload is null", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: null,
          role: "user",
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .get("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(403, {
          success: false,
          message: "It was not possible to retrieve user data",
        });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an authorization error if no user was found in the database", async () => {
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

      mockingoose(userModel).toReturn(null, "findOne");

      await request(app)
        .get("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(403, {
          success: false,
          message: "It was not possible to retrieve user data",
        });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an authorization error the user token is blacklisted in Redis", async () => {
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

      mockingoose(userModel).toReturn(null, "findOne");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      redisClient.get.mockImplementation(() => true);

      await request(app)
        .get("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(401, { success: false, message: "Account not logged in" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a successful profile data response, in case the access token is correct and Redis isn't ready (i.e., the token is not considered in blacklist)", async () => {
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      redisClient.isReady = false;

      await request(app)
        .get("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, { success: true, data: USER_OBJ });
    });
  });

  describe("PATCH /profile", () => {
    it("should return a successful profile data response after updating the user name", async () => {
      const UPDATED_USER = {
        name: "Updated Name",
        email: "updated@test.com",
        photo: "https://cdn.britannica.com/77/81277-050-2A6A35B2/Adelie-penguin.jpg",
        aboutMe: "Updated bio",
      };

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

      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          ...UPDATED_USER,
          __v: 0,
        },
        "findOneAndUpdate",
      );

      const userFound = await userModel.findOneAndUpdate({ _id: USER_ID });

      const resultUserObject = {
        ...UPDATED_USER,
      };

      expect(userFound).toMatchObject(resultUserObject);

      await request(app)
        .patch("/profile")
        .send({ ...UPDATED_USER, password: "123456", passwordConfirmation: "123456" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(200, {
          success: true,
          data: { ...UPDATED_USER, id: USER_ID },
        });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an error message in case the password and confirmation don't match", async () => {
      const UPDATED_USER = {
        name: "Updated Name",
        email: "updated@test.com",
        photo: "https://cdn.britannica.com/77/81277-050-2A6A35B2/Adelie-penguin.jpg",
        aboutMe: "Updated bio",
      };

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

      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          ...UPDATED_USER,
          __v: 0,
        },
        "findOneAndUpdate",
      );

      const userFound = await userModel.findOneAndUpdate({ _id: USER_ID });

      const resultUserObject = {
        ...UPDATED_USER,
      };

      expect(userFound).toMatchObject(resultUserObject);

      await request(app)
        .patch("/profile")
        .send({ ...UPDATED_USER, password: "123456", passwordConfirmation: "abcdef" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(422, { success: false, errors: [{ message: "Passwords do not match" }] });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return an internal server error in case an exception occurs accessing the database", async () => {
      const UPDATED_USER = {
        name: "Updated Name",
        email: "updated@test.com",
        photo: "https://cdn.britannica.com/77/81277-050-2A6A35B2/Adelie-penguin.jpg",
        aboutMe: "Updated bio",
      };

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

      mockingoose(userModel).toReturn(
        new Error("Error accessing the database"),
        "findOneAndUpdate",
      );

      await request(app)
        .patch("/profile")
        .send({ ...UPDATED_USER, password: "123456", passwordConfirmation: "123456" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(500, { success: false, message: "Error accessing the database" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a token decoding error when a null user id is retrieved", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jwt.verify.mockImplementation((_token, _secretOrPublicKey, _options, callback) => {
        callback(null, {
          id: null,
          role: "user",
          iat: IAT,
          exp: EXP,
        });
      });

      await request(app)
        .patch("/profile")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: "Invalid token" });
    });

    it("should return a bad request error if no user was found in the database during the update", async () => {
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

      mockingoose(userModel).toReturn(null, "findOneAndUpdate");

      await request(app)
        .patch("/profile")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .set("Cookie", [`refreshToken=${REFRESH_TOKEN}`])
        .expect(400, { success: false, message: "Unable to update user data" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });
  });
});
