import { Document, Types } from "mongoose";
import createError from "http-errors";

import userTokenModel, { UserTokenModel } from "../database/model/userTokenModel";
import { UserToken } from "../types";
import { messages } from "../constants";

type UserTokenDoc = Document<unknown, NonNullable<unknown>, UserTokenModel> &
  Omit<
    UserTokenModel & {
      _id: Types.ObjectId;
    },
    never
  >;

const convertUserDocToUserToken = (userTokenDoc: UserTokenDoc) => {
  const userToken: UserToken = {
    userId: userTokenDoc.userId.toString(),
    token: userTokenDoc.token,
    createdAt: userTokenDoc.createdAt,
  };

  return userToken;
};

export const userTokenService = {
  create: async (userId: string, token: string): Promise<UserToken> => {
    const userTokenDoc = await userTokenModel.create({
      userId: new Types.ObjectId(userId),
      token,
    });

    if (!userTokenDoc) {
      throw createError(500, messages.APP_SERVER_ERROR);
    }

    return convertUserDocToUserToken(userTokenDoc);
  },

  findUserTokenById: async (userId: string) => {
    const userTokenDoc = await userTokenModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!userTokenDoc) {
      return null;
    }

    return convertUserDocToUserToken(userTokenDoc);
  },

  findUserTokenByToken: async (token: string) => {
    const userTokenDoc = await userTokenModel.findOne({ token }).exec();

    if (!userTokenDoc) {
      return null;
    }

    return convertUserDocToUserToken(userTokenDoc);
  },

  removeUserTokenById: async (userId: string) => {
    const userTokenDoc = await userTokenModel
      .findOneAndDelete({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!userTokenDoc) {
      return null;
    }

    return convertUserDocToUserToken(userTokenDoc);
  },

  removeUserTokenByToken: async (token: string) => {
    const userTokenDoc = await userTokenModel.findOneAndDelete({ token }).exec();

    if (!userTokenDoc) {
      return null;
    }

    return convertUserDocToUserToken(userTokenDoc);
  },

  removeAllUserTokensById: async (userId: string) => {
    await userTokenModel
      .deleteMany({
        userId: new Types.ObjectId(userId),
      })
      .exec();
  },
};
