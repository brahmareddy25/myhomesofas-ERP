"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MeasurementSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true },
    productType: { type: String, required: true },
    catalogId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Catalog' },
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
    sideDimensions: mongoose_1.Schema.Types.Mixed,
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
}, { timestamps: true });
// Prevent Mongoose from caching the old schema in Next.js development
if (mongoose_1.default.models.Measurement) {
    delete mongoose_1.default.models.Measurement;
}
const Measurement = mongoose_1.default.model('Measurement', MeasurementSchema);
exports.default = Measurement;
