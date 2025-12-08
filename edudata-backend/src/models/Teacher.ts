import mongoose, { Document } from "mongoose";

export interface ITeacher extends Document {
  user: mongoose.Types.ObjectId;
  institution?: mongoose.Types.ObjectId;
  department?: string;
}

const TeacherSchema = new mongoose.Schema<ITeacher>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    department: String
  },
  { timestamps: true }
);

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);
