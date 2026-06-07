import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  address: string;
  contactNumber: string;
  email?: string;
  gstNumber: string;
  managerName: string;
  isActive: boolean;
  city?: string;
  state?: string;
  pincode?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    gpsCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Mongoose from caching the old schema in Next.js development
if (mongoose.models.Store) {
  delete mongoose.models.Store;
}

const Store: Model<IStore> = mongoose.model<IStore>('Store', StoreSchema);

export default Store;
