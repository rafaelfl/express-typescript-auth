import request from "supertest";

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

  describe("POST /register", () => {
    it("should return a missing fields validation error when no data is sent", async () => {
      await request(app)
        .post("/register")
        .expect(422, {
          success: false,
          errors: [
            { msg: "'name' is required and must exceed 5 characters" },
            { msg: "Invalid email address" },
            { msg: "'password' is required and must exceed 5 characters" },
          ],
        });
    });

    it("should return a short length password validation error", async () => {
      await request(app)
        .post("/register")
        .send({ name: "rafael", email: "test@test.com", password: "123" })
        .expect(422, {
          success: false,
          errors: [
            { msg: "'password' is required and must exceed 5 characters" },
            { msg: "Passwords do not match" },
          ],
        });
    });

    it("should return a validation error because the passwords don't match", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "rafael",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "abcdef",
        })
        .expect(422, { success: false, errors: [{ msg: "Passwords do not match" }] });
    });

    it("should return an existing email error message when the email already exists in the database", async () => {
      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          name: "Test User",
          email: "test1@test.com",
          password: "wrong not encoded hash",
          role: "user",
          __v: 0,
        },
        "findOne",
      );

      await request(app)
        .post("/register")
        .send({
          name: "rafael",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
        })
        .expect(409, { success: false, message: "User with given email already exists" });
    });

    it("should return an error message when an error occurs when accessing the database", async () => {
      mockingoose(userModel).toReturn(new Error("Error accessing the database"), "findOne");

      await request(app)
        .post("/register")
        .send({
          name: "rafael",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
        })
        .expect(500, { success: false, message: "Error accessing the database" });
    });

    it("should return a successful creation message in case there isn't an user with the informed email", async () => {
      mockingoose(userModel).toReturn(null, "findOne");

      await request(app)
        .post("/register")
        .send({
          name: "rafael",
          email: "test@test.com",
          password: "123456",
          passwordConfirmation: "123456",
        })
        .expect(201, { success: true, data: "Account registered sucessfully" });
    });
  });
});
