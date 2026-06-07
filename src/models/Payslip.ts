import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayslip extends Document {
  employeeId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  paymentDate: Date;
  status: 'Paid' | 'Pending';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
    remarks: { type: String }
  },
  { timestamps: true }
);

if (mongoose.models.Payslip) {
  delete mongoose.models.Payslip;
}

const Payslip: Model<IPayslip> = mongoose.model<IPayslip>('Payslip', PayslipSchema);

export default Payslip;
