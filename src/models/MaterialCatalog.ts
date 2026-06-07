import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaterialColor {
  name: string;
  code: string;
}

export interface IMaterialCatalog extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  colors: IMaterialColor[];
  createdAt: Date;
  updatedAt: Date;
}

const MaterialCatalogSchema: Schema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true, trim: true },
    colors: [
      {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, trim: true },
      }
    ]
  },
  { timestamps: true }
);

MaterialCatalogSchema.index({ storeId: 1 });

if (mongoose.models.MaterialCatalog) {
  delete mongoose.models.MaterialCatalog;
}

const MaterialCatalog: Model<IMaterialCatalog> = mongoose.model<IMaterialCatalog>('MaterialCatalog', MaterialCatalogSchema);

export default MaterialCatalog;
