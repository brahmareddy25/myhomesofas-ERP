import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    default: "global",
    unique: true
  },
  cgstRate: {
    type: Number,
    required: true,
    default: 9
  },
  sgstRate: {
    type: Number,
    required: true,
    default: 9
  },
  igstRate: {
    type: Number,
    required: true,
    default: 18
  },
  defaultTerms: {
    type: String,
    required: true,
    default: "Terms: 50% advance required. Balance before dispatch. Warranty covers manufacturing defects for 1 year."
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
