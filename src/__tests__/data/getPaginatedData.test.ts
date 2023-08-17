import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";

import redisClient from "../../redisDatabase";

import userTokenModel from "../../database/model/userTokenModel";

import { config } from "../../config";
import userModel from "../../database/model/userModel";
import airbnbDataModel from "../../database/model/airbnbDataModel";

import { airbnbMockDataInput, airbnbMockDataOutput } from "../../mocks";

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

describe("Data Module", () => {
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

  describe("GET /api/v1/data", () => {
    it("should return a no auth token error when no access token is sent", async () => {
      await request(app)
        .get("/api/v1/data")
        .expect(401, { success: false, message: "No auth token" });
    });

    it("should return a token decoding error when an invalid access token is sent", async () => {
      await request(app)
        .get("/api/v1/data")
        .set({ Authorization: "Bearer wrong_token", Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return a token decoding error when a null jwt payload is retrieved", async () => {
      await request(app)
        .get("/api/v1/data")
        .set({ Authorization: `Bearer ${NULL_RESULT_ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(401, { success: false, message: DECODING_TOKEN_ERROR_MESSAGE });
    });

    it("should return an error message if an error occurs when accessing the database", async () => {
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

      mockingoose(airbnbDataModel).toReturn(new Error("Error accessing the database"), "find");

      await request(app)
        .get("/api/v1/data")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(500, { success: false, message: "Error accessing the database" });

      expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
    });

    it("should return a validation error message if non numerical values are passed", async () => {
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

      mockingoose(airbnbDataModel).toReturn(airbnbMockDataInput, "find");

      await request(app)
        .get("/api/v1/data")
        .query({ page: "stringval1", size: "stringval2" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .expect(422, {
          success: false,
          errors: [
            { message: "'page' must have a numerical value greater than 0" },
            { message: "'size' must have a numerical value greater than 0" },
          ],
        });
    });

    it("should return a successful message if no query parameter is passed", async () => {
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

      mockingoose(airbnbDataModel).toReturn(airbnbMockDataInput, "find");

      await request(app)
        .get("/api/v1/data")
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .then(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toMatchObject({ success: true, data: airbnbMockDataOutput });

          expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
        });
    });

    it("should return a successful message with some empty attributes if an array of empty objects are returned", async () => {
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

      mockingoose(airbnbDataModel).toReturn([{}], "find");

      await request(app)
        .get("/api/v1/data")
        .query({ page: "1", size: "10" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .then(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toMatchObject({
            success: true,
            data: [
              {
                price: 0,
                reviews: [],
                security_deposit: 0,
                weekly_price: 0,
                monthly_price: 0,
                address: {},
                amenities: [],
                bathrooms: 0,
                cleaning_fee: 0,
                extra_people: 0,
                guests_included: 0,
                host: {},
                images: {},
              },
            ],
          });

          expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
        });
    });

    it("should return a successful message with an empty array in case the database don't return any airbnb data", async () => {
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

      mockingoose(airbnbDataModel).toReturn(null, "find");

      await request(app)
        .get("/api/v1/data")
        .query({ page: "1", size: "10" })
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}`, Accept: "application/json" })
        .then(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toMatchObject({
            success: true,
            data: [],
          });

          expect(redisClient.get).toHaveBeenCalledWith(`bl_${ACCESS_TOKEN}`);
        });
    });
  });
});
