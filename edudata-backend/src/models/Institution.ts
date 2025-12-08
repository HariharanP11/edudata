import mongoose, { Document } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  address?: string;
  description?: string;
  contactEmail?: string;
}

const InstitutionSchema = new mongoose.Schema<IInstitution>(
  {
    name: { type: String, required: true },
    address: String,
    description: String,
    contactEmail: String
  },
  { timestamps: true }
);

export default mongoose.model<IInstitution>("Institution", InstitutionSchema);
