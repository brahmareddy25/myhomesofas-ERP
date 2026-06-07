import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  storeId: mongoose.Types.ObjectId;
  
  firstName: string;
  lastName: string;
  designation: 'Manager' | 'Sales Executive' | 'Carpenter' | 'Tailor' | 'Delivery Staff' | 'Helper';
  
  contactNumber: string;
  address: string;
  dateOfJoining: Date;
  
  baseSalary: number;
  salaryType: 'Monthly' | 'Weekly' | 'Daily Wage';
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    designation: {
      type: String,
      enum: ['Manager', 'Sales Executive', 'Carpenter', 'Tailor', 'Delivery Staff', 'Helper'],
      required: true,
    },
    
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    
    baseSalary: { type: Number, required: true },
    salaryType: {
      type: String,
      enum: ['Monthly', 'Weekly', 'Daily Wage'],
      default: 'Monthly',
    },
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
