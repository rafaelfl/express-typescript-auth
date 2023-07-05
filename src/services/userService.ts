import { Document, Types } from "mongoose";
import createError from "http-errors";

import userModel, { UserModel } from "../database/model/userModel";
import { User, UserRoles } from "../types";
import { messages } from "../constants";

type UserDoc = Document<unknown, NonNullable<unknown>, UserModel> &
  Omit<
    UserModel & {
      _id: Types.ObjectId;
    },
    never
  >;

const convertUserDocToUser = (userDoc: UserDoc) => {
  const user: User = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    password: userDoc.password,
    role: userDoc.role,
  };

  return user;
};

export const userService = {
  create: async (
    name: string,
    email: string,
    hashPassword: string,
    role: UserRoles,
  ): Promise<User> => {
    const userDoc = await userModel.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    if (!userDoc) {
      throw createError(500, messages.APP_SERVER_ERROR);
    }

    return convertUserDocToUser(userDoc);
  },

  findUserByEmail: async (email: string) => {
    const userDoc = await userModel.findOne({ email }).select("+password").exec();

    if (!userDoc) {
      return null;
    }

    return convertUserDocToUser(userDoc);
  },

  findUserById: async (id: string) => {
    const userDoc = await userModel.findOne({ _id: new Types.ObjectId(id) }).exec();

    if (!userDoc) {
      return null;
    }

    return convertUserDocToUser(userDoc);
  },
};
