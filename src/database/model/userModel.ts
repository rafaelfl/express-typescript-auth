import mongoose, { Document } from "mongoose";

import { USER_ROLES, UserRoles } from "../../types";

const { Schema } = mongoose;

export interface UserModel extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoles;
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
});

export default mongoose.model<UserModel>("Users", UserSchema);
