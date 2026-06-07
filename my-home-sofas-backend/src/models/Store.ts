import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  address: string;
  contactNumber: string;
  email?: string;
  gstNumber: string;
  managerName: string;
  isActive: boolean;
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
    gpsCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);

export default Store;
