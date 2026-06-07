import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransporter extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  vehicleTypes: string[]; // e.g., 'Mini Truck', 'Large Lorry'
  baseRatePerKm: number;
  isActive: boolean;
  gstNumber?: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransporterSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    vehicleTypes: [{ type: String }],
    baseRatePerKm: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    gstNumber: { type: String },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

const Transporter: Model<ITransporter> = mongoose.models.Transporter || mongoose.model<ITransporter>('Transporter', TransporterSchema);

export default Transporter;
