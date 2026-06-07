import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICatalog extends Document {
  bookName: string; // e.g., "Premium Velvet Collection"
  fabricName: string;
  colorName: string;
  colorCode: string; // Hex code for preview
  fabricGrade: string; // e.g., "Grade A", "Grade B"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogSchema: Schema = new Schema(
  {
    bookName: { type: String, required: true, trim: true },
    fabricName: { type: String, required: true, trim: true },
    colorName: { type: String, required: true, trim: true },
    colorCode: { type: String, required: true },
    fabricGrade: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Catalog: Model<ICatalog> = mongoose.models.Catalog || mongoose.model<ICatalog>('Catalog', CatalogSchema);

export default Catalog;
