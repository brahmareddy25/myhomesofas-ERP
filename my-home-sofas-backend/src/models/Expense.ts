import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  storeId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId; // User who submitted it
  
  category: 'Rent' | 'Electricity' | 'Water' | 'Maintenance' | 'Logistics' | 'Marketing' | 'Office Supplies' | 'Other';
  description: string;
  amount: number;
  
  dateIncurred: Date;
  
  receiptImage?: string; // URL or path to uploaded receipt
  
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    category: {
      type: String,
      enum: ['Rent', 'Electricity', 'Water', 'Maintenance', 'Logistics', 'Marketing', 'Office Supplies', 'Other'],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    
    dateIncurred: { type: Date, required: true },
    
    receiptImage: String,
    
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending Approval',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
  },
  { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
