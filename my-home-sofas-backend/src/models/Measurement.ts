import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeasurement extends Document {
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  
  // Basic Product Info
  productType: 'Straight Sofa' | 'L Shape Sofa' | 'U Shape Sofa' | 'Sectional Sofa' | 'Recliner Sofa' | 'Single Chair' | 'Dining Chair' | 'Bed' | 'Mattress' | 'Tea Table' | 'Center Table' | 'Custom Furniture';
  
  // Catalog / Fabric Selection
  catalogId?: mongoose.Types.ObjectId; // Reference to Catalog
  
  // Generic Dimensions (cm)
  length?: number;
  width?: number;
  height?: number;

  // Sofa Specific
  seatWidth?: number;
  seatDepth?: number;
  seatHeight?: number;
  backrestHeight?: number;
  cushionThickness?: number;
  numberOfSeats?: number;
  numberOfArmrests?: number;
  armrestDimensions?: string;
  legHeight?: number;
  
  // L Shape / U Shape specifics (stored as string/JSON for simplicity if multiple sides)
  sideDimensions?: any;

  // Recliner Specific
  reclinerType?: string;
  numberOfReclinerSeats?: number;
  isMotorized?: boolean;

  // Bed Specific
  headboardHeight?: number;
  hasStorage?: boolean;
  
  // Table Specific
  material?: string;

  // Product Configuration
  cushionType?: string;
  cushionDensity?: string;
  legMaterial?: string;
  legDesign?: string;
  woodFinish?: string;
  hasHeadrest?: boolean;
  hasAdjustableHeadrest?: boolean;
  hasCupHolder?: boolean;
  hasUsbCharging?: boolean;
  premiumAddons?: string[];

  // Mandatory Notes & Attachments
  specialNotes: string;
  attachments?: string[]; // Array of file paths or URLs
  previewImages?: {
    isometric?: string;
    top?: string;
    front?: string;
  };
  unit?: string;
  colorCode?: string;
  catalog?: string;
  legType?: string;
  handleType?: string;
  armrestWidth?: number;

  createdAt: Date;
  updatedAt: Date;
}

const MeasurementSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    productType: { type: String, required: true },
    catalogId: { type: Schema.Types.ObjectId, ref: 'Catalog' },
    
    // Dimensions
    length: Number,
    width: Number,
    height: Number,
    seatWidth: Number,
    seatDepth: Number,
    seatHeight: Number,
    backrestHeight: Number,
    cushionThickness: Number,
    numberOfSeats: Number,
    numberOfArmrests: Number,
    armrestDimensions: String,
    legHeight: Number,
    sideDimensions: Schema.Types.Mixed,

    // Recliner
    reclinerType: String,
    numberOfReclinerSeats: Number,
    isMotorized: Boolean,

    // Bed
    headboardHeight: Number,
    hasStorage: Boolean,

    // Table
    material: String,

    // Config
    cushionType: String,
    cushionDensity: String,
    legMaterial: String,
    legDesign: String,
    woodFinish: String,
    hasHeadrest: Boolean,
    hasAdjustableHeadrest: Boolean,
    hasCupHolder: Boolean,
    hasUsbCharging: Boolean,
    premiumAddons: [String],

    unit: { type: String, default: 'cm' },
    colorCode: String,
    catalog: String,
    legType: String,
    handleType: String,
    armrestWidth: Number,

    // Notes
    specialNotes: { type: String, required: true },
    attachments: [String],
    previewImages: {
      isometric: String,
      top: String,
      front: String
    }
  },
  { timestamps: true }
);

// Prevent Mongoose from caching the old schema in Next.js development
if (mongoose.models.Measurement) {
  delete mongoose.models.Measurement;
}

const Measurement: Model<IMeasurement> = mongoose.model<IMeasurement>('Measurement', MeasurementSchema);

export default Measurement;
