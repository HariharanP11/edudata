import mongoose, { Document } from "mongoose";

export interface IScheme extends Document {
  title: string;
  description?: string;
  eligibility?: string;
}

const SchemeSchema = new mongoose.Schema<IScheme>(
  {
    title: { type: String, required: true },
    description: String,
    eligibility: String
  },
  { timestamps: true }
);

export default mongoose.model<IScheme>("Scheme", SchemeSchema);
