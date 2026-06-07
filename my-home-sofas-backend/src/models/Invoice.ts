import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  
  amountPaid: number;
  balanceDue: number;
  
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Card' | 'UPI';
  
  issuedDate: Date;
  dueDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    
    subtotal: { type: Number, required: true },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
    
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'UPI'],
    },
    
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
