import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  quotationId: mongoose.Types.ObjectId;
  
  orderNumber: string;
  
  status: 'Order Confirmed' | 'Material Procurement' | 'Production Started' | 'Manufacturing' | 'Quality Check' | 'Packing' | 'Ready For Dispatch' | 'Out For Delivery' | 'Delivered' | 'Completed';
  
  productionStartDate?: Date;
  estimatedCompletionDate: Date;
  actualCompletionDate?: Date;
  
  assignedTeam?: string;
  progressPercentage: number;
  delayReason?: string;

  // Timestamps for tracking every stage
  timeline: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
    
    orderNumber: { type: String, required: true, unique: true },
    
    status: {
      type: String,
      enum: ['Order Confirmed', 'Material Procurement', 'Production Started', 'Manufacturing', 'Quality Check', 'Packing', 'Ready For Dispatch', 'Out For Delivery', 'Delivered', 'Completed'],
      default: 'Order Confirmed',
    },
    
    productionStartDate: Date,
    estimatedCompletionDate: { type: Date, required: true },
    actualCompletionDate: Date,
    
    assignedTeam: String,
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    delayReason: String,

    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ]
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
