import mongoose, { Document } from "mongoose";

import { USER_ROLES, UserRoles } from "../../types";
import userTokenModel from "./userTokenModel";

const { Schema } = mongoose;

export interface UserModel extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoles;
  photo?: string;
  aboutMe?: string;
}

const UserSchema = new Schema<UserModel>({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minLength: 5,
  },
  role: {
    type: String,
    required: true,
    enum: USER_ROLES,
  },
  photo: {
    type: String,
  },
  aboutMe: {
    type: String,
  },
});

/* istanbul ignore next */
UserSchema.pre("findOneAndDelete", { document: true, query: true }, function middleware(next) {
  const id = this.getQuery()._id;
  userTokenModel.deleteMany({ userId: id }).exec();
  next();
});

export default mongoose.model<UserModel>("Users", UserSchema);
