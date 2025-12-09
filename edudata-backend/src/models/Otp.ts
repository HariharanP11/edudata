import mongoose, { Document } from "mongoose";

export interface IOtp extends Document {
  token: string;       // random session token (not the numeric code)
  userId?: mongoose.Types.ObjectId | null;
  contact: string;     // phone or email used to send OTP
  code: string;        // numeric OTP code, stored as a bcrypt hash
  expiresAt: Date;
  used: boolean;
}

const OtpSchema = new mongoose.Schema<IOtp>({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  contact: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

// Index to allow cleanup of expired OTPs efficiently
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>("Otp", OtpSchema);
