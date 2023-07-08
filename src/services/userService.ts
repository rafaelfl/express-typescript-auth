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
    photo: userDoc.photo,
    aboutMe: userDoc.aboutMe,
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

  findAllUsers: async () => {
    const userDoc = await userModel.find().exec();

    if (!userDoc) {
      return null;
    }

    return userDoc.map(doc => convertUserDocToUser(doc));
  },

  findUserById: async (id: string) => {
    const userDoc = await userModel.findOne({ _id: new Types.ObjectId(id) }).exec();

    if (!userDoc) {
      return null;
    }

    return convertUserDocToUser(userDoc);
  },

  findAndUpdateUserById: async (
    id: string,
    name: string | undefined,
    password: string | undefined,
    photo: string | undefined,
    aboutMe: string | undefined,
  ) => {
    const updateData: { [key: string]: string } = {};

    if (name) {
      updateData.name = name;
    }

    if (password) {
      updateData.password = password;
    }

    if (photo) {
      updateData.photo = photo;
    }

    if (aboutMe) {
      updateData.aboutMe = aboutMe;
    }

    if (name || password || photo || aboutMe) {
      const row = await userModel
        .findOneAndUpdate({ _id: new Types.ObjectId(id) }, updateData, { returnDocument: "after" })
        .exec();

      if (row) {
        return convertUserDocToUser(row);
      }
    }

    return null;
  },

  deleteUserById: async (id: string) => {
    const userDoc = await userModel.findOneAndDelete({ _id: new Types.ObjectId(id) }).exec();

    if (!userDoc) {
      return null;
    }

    return convertUserDocToUser(userDoc);
  },
};
