import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuotation extends Document {
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  measurementId: mongoose.Types.ObjectId; // Link to the configured product
  
  quotationNumber: string;
  
  // Costing Details
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  totalCost: number;
  suggestedSellingPrice: number;
  finalSellingPrice: number;
  estimatedProfitMargin: number;

  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
  
  termsAndConditions: string;
  validUntil: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    measurementId: { type: Schema.Types.ObjectId, ref: 'Measurement', required: true },
    quotationNumber: { type: String, required: true, unique: true },
    
    estimatedMaterialCost: { type: Number, required: true },
    estimatedLaborCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    suggestedSellingPrice: { type: Number, required: true },
    finalSellingPrice: { type: Number, required: true },
    estimatedProfitMargin: { type: Number, required: true },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'],
      default: 'Draft',
    },
    
    termsAndConditions: { type: String, required: true },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

const Quotation: Model<IQuotation> = mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);

export default Quotation;
