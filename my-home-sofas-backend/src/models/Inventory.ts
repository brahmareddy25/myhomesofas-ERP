import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventory extends Document {
  storeId: mongoose.Types.ObjectId;
  
  itemName: string;
  category: 'Raw Material' | 'Finished Goods' | 'Tools' | 'Packaging' | 'Other';
  skuCode?: string;
  
  quantityInStock: number;
  unitOfMeasurement: 'Pieces' | 'Meters' | 'Kg' | 'Liters' | 'Rolls';
  reorderLevel: number; // Alert when stock falls below this
  
  unitCost: number;
  supplierName?: string;
  
  lastRestockedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Raw Material', 'Finished Goods', 'Tools', 'Packaging', 'Other'],
      required: true,
    },
    skuCode: { type: String, unique: true, sparse: true },
    
    quantityInStock: { type: Number, required: true, default: 0 },
    unitOfMeasurement: {
      type: String,
      enum: ['Pieces', 'Meters', 'Kg', 'Liters', 'Rolls'],
      required: true,
    },
    reorderLevel: { type: Number, required: true, default: 10 },
    
    unitCost: { type: Number, required: true },
    supplierName: String,
    
    lastRestockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
