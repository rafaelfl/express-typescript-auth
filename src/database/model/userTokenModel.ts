import mongoose, { Document, ObjectId } from "mongoose";

const { Schema } = mongoose;

export interface UserTokenModel extends Document {
  userId: ObjectId;
  token: string;
  createdAt: Date;
}

const UserTokenSchema = new Schema<UserTokenModel>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<UserTokenModel>("UserTokens", UserTokenSchema);
