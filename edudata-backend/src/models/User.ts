// src/models/User.ts
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  loginId?: string;          // student id / adhhaar / custom id (optional)
  name: string;
  role: "student" | "teacher" | "institution" | "government" | "admin" | string;
  email: string;
  phone?: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    loginId: { type: String, unique: true, sparse: true }, // sparse so it won't conflict when missing
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "institution", "government", "admin"],
      default: "student",
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// ensure indexes created
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", UserSchema);
