import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";

import logger from "../../helpers/logger";

import userModel from "../../database/model/userModel";
import userTokenModel from "../../database/model/userTokenModel";

import { config } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require("mockingoose");

jest.mock("../../helpers/logger");

const USER_ID = "507f191e810c19729de860ea";
const REFRESH_TOKEN = "refresh_507f191e810c19729de860ea";
const ACCESS_TOKEN = "access_507f191e810c19729de860ea";

const USERTOKEN_ID = "8ca4af76384306089c1c30ba";

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  sign: jest.fn((_payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret) => {
    if (secretOrPrivateKey === "accesskey") {
      return ACCESS_TOKEN;
    }

    if (secretOrPrivateKey === "refreshkey") {
      return REFRESH_TOKEN;
    }

    return "default_token";
  }),
}));

const loggerWarn = jest.spyOn(logger, "warn");

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
        name: "Test User1",
        email: "test@test.com",
        password: "$2b$10$ZjSd31GubvnILeh8bqIcTuumQhzH4Z/P2i4zXX3dlMb/3fyThFGzG",
        role: "user",
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

    // mock user model findOne
    mockingoose(userTokenModel).toReturn(
      {
        _id: USERTOKEN_ID,
        userId: USER_ID,
        token: REFRESH_TOKEN,
        createdAt: new Date(),
      },
      "$save",
    );
  });

  afterEach(() => {
    mockingoose.resetAll();
  });

  describe("POST /login", () => {
    it("should return a missing email and password validation error when no data is sent", async () => {
      await request(app)
        .post("/login")
        .expect(422, {
          success: false,
          errors: [
            { msg: "Invalid email address" },
            { msg: "'password' is required and must exceed 5 characters" },
          ],
        });
    });

    it("should return a short length password validation error", async () => {
      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "123" })
        .expect(422, {
          success: false,
          errors: [{ msg: "'password' is required and must exceed 5 characters" }],
        });
    });

    it("should return an invalid email/password because the user email doesn't exist", async () => {
      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "wrongpassword" })
        .expect(401, { success: false, message: "Invalid email or password" });
    });

    it("should return an invalid email/password because the password doesn't match", async () => {
      mockingoose(userModel).toReturn(
        {
          _id: USER_ID,
          name: "Test User",
          email: "test@test.com",
          password: "wrong not encoded hash",
          role: "user",
          __v: 0,
        },
        "findOne",
      );

      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(401, { success: false, message: "Invalid email or password" });
    });

    it("should return a successful sign-in message containing both refresh and access tokens, and no refresh token is sent", async () => {
      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(201, { success: true, data: { token: ACCESS_TOKEN } })
        .expect(
          "set-cookie",
          new RegExp(
            `refreshToken=${REFRESH_TOKEN}; Max-Age=86400; Domain=localhost; Path=/`,
            "gi",
          ),
        )
        .expect("set-cookie", /HttpOnly; Secure; SameSite=None/);

      expect(loggerWarn).not.toHaveBeenCalled();
    });

    it("should return a successful sign-in message, rotating the refresh token and returning the access token, if an existing refresh token is sent", async () => {
      const docReturnedAndDeleted = {
        _id: USERTOKEN_ID,
        userId: USER_ID,
        token: "MyCurrentRefreshToken",
        createdAt: new Date(),
      };

      mockingoose(userTokenModel).toReturn(docReturnedAndDeleted, "findOne");
      mockingoose(userTokenModel).toReturn(docReturnedAndDeleted, "findOneAndDelete");

      await request(app)
        .post("/login")
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(201, { success: true, data: { token: ACCESS_TOKEN } })
        .expect(
          "set-cookie",
          new RegExp(
            `refreshToken=${REFRESH_TOKEN}; Max-Age=86400; Domain=localhost; Path=/`,
            "gi",
          ),
        )
        .expect("set-cookie", /HttpOnly; Secure; SameSite=None/);

      expect(loggerWarn).not.toHaveBeenCalled();
    });

    it("should return a successful sign-in message, rotating the refresh token and returning the access token, even in case the existing token is not successfully deleted", async () => {
      const docReturnedAndDeleted = {
        _id: USERTOKEN_ID,
        userId: USER_ID,
        token: "MyCurrentRefreshToken",
        createdAt: new Date(),
      };

      mockingoose(userTokenModel).toReturn(docReturnedAndDeleted, "findOne");
      mockingoose(userTokenModel).toReturn(null, "findOneAndDelete");

      await request(app)
        .post("/login")
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(201, { success: true, data: { token: ACCESS_TOKEN } })
        .expect(
          "set-cookie",
          new RegExp(
            `refreshToken=${REFRESH_TOKEN}; Max-Age=86400; Domain=localhost; Path=/`,
            "gi",
          ),
        )
        .expect("set-cookie", /HttpOnly; Secure; SameSite=None/);

      expect(loggerWarn).not.toHaveBeenCalled();
    });

    it("should return a successful sign-in message if correct credentials are used, but must clear existing credentials in case an old valid refresh token is sent", async () => {
      mockingoose(userTokenModel).toReturn(null, "findOne");
      mockingoose(userTokenModel).toReturn(
        {
          acknowledged: true,
          deletedCount: 1,
        },
        "deleteMany",
      );

      await request(app)
        .post("/login")
        .set("Cookie", ["refreshToken=MyCurrentRefreshToken"])
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(201, { success: true, data: { token: ACCESS_TOKEN } })
        .expect(
          "set-cookie",
          new RegExp(
            `refreshToken=${REFRESH_TOKEN}; Max-Age=86400; Domain=localhost; Path=/`,
            "gi",
          ),
        )
        .expect("set-cookie", /HttpOnly; Secure; SameSite=None/);

      expect(loggerWarn).toHaveBeenCalledWith(
        `The refresh token sent from ${USER_ID} was used in another device. All devices were signed out`,
      );
    });

    it("should return an error response because no database user matches the credentials", async () => {
      mockingoose(userModel).toReturn(null, "findOne");

      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(401, { success: false, message: "Invalid email or password" });
    });

    it("should return an error response because the database access throwed an exception", async () => {
      mockingoose(userModel).toReturn(new Error("Error accessing the database"), "findOne");

      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(500, { success: false, message: "Error accessing the database" });
    });

    it("should return an error response because a 'No auth token' exception was thrown during the login", async () => {
      mockingoose(userTokenModel).toReturn(new Error("No auth token"), "$save");

      await request(app)
        .post("/login")
        .send({ email: "test@test.com", password: "mypassword" })
        .expect(401, { success: false, message: "No auth token" });
    });
  });
});
