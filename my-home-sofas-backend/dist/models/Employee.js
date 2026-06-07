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
const EmployeeSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true },
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
}, { timestamps: true });
const Employee = mongoose_1.default.models.Employee || mongoose_1.default.model('Employee', EmployeeSchema);
exports.default = Employee;
