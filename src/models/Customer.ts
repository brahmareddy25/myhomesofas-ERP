import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  customerName: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailAddress?: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  storeId: mongoose.Types.ObjectId; // Which store created this customer
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    alternateMobileNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    gpsCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ storeId: 1, createdAt: -1 });
CustomerSchema.index({ customerName: 1 });
CustomerSchema.index({ mobileNumber: 1 });
CustomerSchema.index({ city: 1 });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
