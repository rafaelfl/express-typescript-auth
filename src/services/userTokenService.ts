import createError from "http-errors";

import database from "../database/fakeDB";
import { UserToken } from "../types";
import { messages } from "../constants";

export const userTokenService = {
  create: async (userId: string, token: string): Promise<UserToken> => {
    const result = await database.create("token", {
      id: userId,
      token,
    });

    if (!result) {
      throw createError(500, messages.APP_SERVER_ERROR);
    }

    const userToken = result as UserToken;

    return userToken;
  },

  findUserTokenById: async (userId: string) => {
    const result = await database.findOne("token", { id: userId });

    if (!result) {
      return null;
    }

    return result as UserToken;
  },

  findUserTokenByToken: async (token: string) => {
    const result = await database.findOne("token", { token });

    if (!result) {
      return null;
    }

    return result as UserToken;
  },

  removeUserTokenById: async (userId: string) => {
    const result = await database.remove("token", { id: userId });

    return result as UserToken | null;
  },

  removeUserTokenByToken: async (token: string) => {
    const result = await database.remove("token", { token });

    return result as UserToken | null;
  },
};
