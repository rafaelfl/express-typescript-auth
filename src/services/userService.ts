import createError from "http-errors";

import database from "../database/fakeDB";
import { User, UserRoles } from "../types";
import { messages } from "../constants";

export const userService = {
  create: async (name: string, email: string, password: string, role: UserRoles): Promise<User> => {
    const result = await database.create("user", {
      name,
      email,
      password,
      role,
    });

    if (!result) {
      throw createError(500, messages.APP_SERVER_ERROR);
    }

    const user = result as User;

    return user;
  },

  findUserByEmail: async (email: string) => {
    const result = await database.findOne("user", { email });

    if (!result) {
      return null;
    }

    return result as User;
  },

  findUserById: async (id: string) => {
    const result = await database.findOne("user", { id });

    if (!result) {
      return null;
    }

    return result as User;
  },
};
