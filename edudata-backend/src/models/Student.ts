import mongoose, { Document } from "mongoose";

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  institution?: mongoose.Types.ObjectId;
  rollNumber?: string;
  dob?: Date;
}

const StudentSchema = new mongoose.Schema<IStudent>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    rollNumber: String,
    dob: Date
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);
